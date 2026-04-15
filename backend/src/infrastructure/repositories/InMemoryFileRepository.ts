import { randomUUID } from 'crypto'
import { FileEntry } from '../../domain/entities/FileEntry'
import { CreateFileInput, IFileRepository } from '../../domain/repositories/IFileRepository'

export class InMemoryFileRepository implements IFileRepository {
  private readonly items: FileEntry[] = []

  async create(input: CreateFileInput): Promise<FileEntry> {
    const entry = new FileEntry({
      id: randomUUID(),
      ownerId: input.ownerId,
      filename: input.filename,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storagePath: input.storagePath,
      folder: input.folder ?? '/',
      isFolder: input.isFolder ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    this.items.unshift(entry)
    return entry
  }

  async findById(id: string, ownerId: string): Promise<FileEntry | null> {
    const found = this.items.find(item => item.id === id && item.ownerId === ownerId)
    return found ?? null
  }

  async listByOwner(ownerId: string, folder?: string): Promise<FileEntry[]> {
    return this.items.filter(item => item.ownerId === ownerId && (folder ? item.folder === folder : true))
  }

  async deleteByFolderPath(ownerId: string, folderPath: string): Promise<number> {
    const normalized = folderPath.endsWith('/') ? folderPath : `${folderPath}/`
    const before = this.items.length
    for (let idx = this.items.length - 1; idx >= 0; idx -= 1) {
      const item = this.items[idx]
      if (item.ownerId !== ownerId) continue

      const ownPath = item.folder === '/' ? `/${item.filename}` : `${item.folder}/${item.filename}`
      const shouldDelete = item.isFolder
        ? ownPath === folderPath || ownPath.startsWith(normalized)
        : item.folder === folderPath || item.folder.startsWith(normalized)

      if (shouldDelete) {
        this.items.splice(idx, 1)
      }
    }

    return before - this.items.length
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const idx = this.items.findIndex(item => item.id === id && item.ownerId === ownerId)
    if (idx < 0) return false
    this.items.splice(idx, 1)
    return true
  }
}
