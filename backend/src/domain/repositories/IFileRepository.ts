import { FileEntry } from '../entities/FileEntry';

export interface CreateFileInput {
  ownerId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number
  storagePath: string;
  folder?: string;
  isFolder?: boolean;
}

export interface IFileRepository {
  create(input: CreateFileInput): Promise<FileEntry>
  findById(id: string, ownerId: string): Promise<FileEntry | null>
  listByOwner(ownerId: string, folder?: string): Promise<FileEntry[]>
  deleteByFolderPath(ownerId: string, folderPath: string): Promise<number>
  delete(id: string, ownerId: string): Promise<boolean>
}
