import path from 'path';
import fs from 'fs/promises';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FileEntry } from '../../domain/entities/FileEntry';
import { IFileRepository } from '../../domain/repositories/IFileRepository';

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const normalizeFolder = (folder?: string): string => {
  const raw = (folder ?? '/').trim();
  if (!raw || raw === '/') return '/';
  const cleaned = raw.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\/+|\/+$/g, '');
  return cleaned ? `/${cleaned}` : '/';
}

const splitFolder = (folderPath: string): { parentFolder: string; folderName: string } => {
  const normalized = normalizeFolder(folderPath);
  if (normalized === '/') {
    return { parentFolder: '/', folderName: 'root' };
  }
  const chunks = normalized.slice(1).split('/');
  const folderName = chunks[chunks.length - 1] ?? 'folder';
  const parent = chunks.length > 1 ? `/${chunks.slice(0, -1).join('/')}` : '/';
  return { parentFolder: parent, folderName };
}

export class FileService {
  private readonly supabase: SupabaseClient | null;

  constructor(
    private readonly repo: IFileRepository,
    private readonly options: {
      uploadDir: string;
      supabaseUrl?: string;
      supabaseServiceRoleKey?: string;
      supabaseStorageBucket?: string;
    }
  ) {
    if (options.supabaseUrl && options.supabaseServiceRoleKey) {
      this.supabase = createClient(options.supabaseUrl, options.supabaseServiceRoleKey, {
        auth: { persistSession: false },
      });
    } else {
      this.supabase = null;
    }
  }

  private get bucketName(): string {
    return this.options.supabaseStorageBucket ?? 'pos-files';
  }

  async saveFile(
    ownerId: string,
    originalName: string,
    mimeType: string,
    buffer: Buffer,
    folder?: string
  ): Promise<FileEntry> {
    if (buffer.byteLength > MAX_FILE_SIZE) {
      throw new Error('File too large. Maximum size is 5 MB')
    }

    const normalizedFolder = normalizeFolder(folder)

    const ext = path.extname(originalName)
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    let storagePath: string

    if (this.supabase) {
      const objectPath = `${ownerId}/${safeName}`
      const uploadResult = await this.supabase.storage
        .from(this.bucketName)
        .upload(objectPath, buffer, { contentType: mimeType, upsert: false })

      if (uploadResult.error) {
        throw new Error(`Failed to upload file to cloud storage: ${uploadResult.error.message}`)
      }

      storagePath = `supabase:${objectPath}`
    } else {
      await fs.mkdir(this.options.uploadDir, { recursive: true })
      storagePath = path.join(this.options.uploadDir, safeName)
      await fs.writeFile(storagePath, buffer)
    }

    return this.repo.create({
      ownerId,
      filename: originalName,
      mimeType,
      sizeBytes: buffer.byteLength,
      storagePath,
      folder: normalizedFolder
    })
  }

  async listFiles(ownerId: string, folder?: string): Promise<FileEntry[]> {
    return this.repo.listByOwner(ownerId, normalizeFolder(folder))
  }

  async createFolder(ownerId: string, folderPath: string): Promise<FileEntry> {
    const normalized = normalizeFolder(folderPath)
    if (normalized === '/') {
      throw new Error('Root folder already exists')
    }

    const { parentFolder, folderName } = splitFolder(normalized)
    const existing = await this.repo.listByOwner(ownerId, parentFolder)
    const duplicate = existing.find(item => item.isFolder && item.filename.toLowerCase() === folderName.toLowerCase())
    if (duplicate) {
      return duplicate
    }

    return this.repo.create({
      ownerId,
      filename: folderName,
      mimeType: 'inode/directory',
      sizeBytes: 0,
      storagePath: '',
      folder: parentFolder,
      isFolder: true,
    })
  }

  async getFile(ownerId: string, fileId: string): Promise<{ entry: FileEntry; buffer: Buffer } | null> {
    const entry = await this.repo.findById(fileId, ownerId)
    if (!entry) return null
    if (entry.isFolder) return null

    let buffer: Buffer

    if (entry.storagePath.startsWith('supabase:')) {
      if (!this.supabase) {
        throw new Error('Cloud storage is not configured')
      }

      const objectPath = entry.storagePath.replace('supabase:', '')
      const downloadResult = await this.supabase.storage.from(this.bucketName).download(objectPath)
      if (downloadResult.error || !downloadResult.data) {
        throw new Error(`Failed to download file from cloud storage: ${downloadResult.error?.message ?? 'Unknown error'}`)
      }
      const arrayBuffer = await downloadResult.data.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } else {
      buffer = await fs.readFile(entry.storagePath)
    }

    return { entry, buffer }
  }

  async deleteFile(ownerId: string, fileId: string): Promise<boolean> {
    const entry = await this.repo.findById(fileId, ownerId)
    if (!entry) return false

    if (entry.isFolder) {
      const fullPath = normalizeFolder(entry.folder === '/' ? `/${entry.filename}` : `${entry.folder}/${entry.filename}`)
      await this.repo.deleteByFolderPath(ownerId, fullPath)
      return this.repo.delete(fileId, ownerId)
    }

    try {
      if (entry.storagePath.startsWith('supabase:')) {
        if (this.supabase) {
          const objectPath = entry.storagePath.replace('supabase:', '')
          await this.supabase.storage.from(this.bucketName).remove([objectPath])
        }
      } else {
        await fs.unlink(entry.storagePath)
      }
    } catch {
    }

    return this.repo.delete(fileId, ownerId)
  }
}
