import { FileEntry } from '../../domain/entities/FileEntry';
import { CreateFileInput, IFileRepository } from '../../domain/repositories/IFileRepository';
import { pool } from '../db/pool';

interface FileRow {
  id: string;
  owner_id: string;
  filename: string;
  mime_type: string
  size_bytes: number;
  storage_path: string;
  folder: string;
  is_folder: boolean;
  created_at: Date;
  updated_at: Date;
}

const toFileEntry = (row: FileRow): FileEntry =>
  new FileEntry({
    id: row.id,
    ownerId: row.owner_id,
    filename: row.filename,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    storagePath: row.storage_path,
    folder: row.folder,
    isFolder: row.is_folder,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  })

export class PostgresFileRepository implements IFileRepository {

  async create(input: CreateFileInput): Promise<FileEntry> {
    const { rows } = await pool.query<FileRow>(
      `INSERT INTO files (owner_id, filename, mime_type, size_bytes, storage_path, folder, is_folder)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [input.ownerId, input.filename, input.mimeType, input.sizeBytes, input.storagePath, input.folder ?? '/', input.isFolder ?? false]
    )
    return toFileEntry(rows[0])
  }

  async findById(id: string, ownerId: string): Promise<FileEntry | null> {
    const { rows } = await pool.query<FileRow>(
      `SELECT * FROM files WHERE id = $1 AND owner_id = $2`,
      [id, ownerId]
    )
    return rows.length > 0 ? toFileEntry(rows[0]) : null
  }

  async listByOwner(ownerId: string, folder?: string): Promise<FileEntry[]> {
    let query = `SELECT * FROM files WHERE owner_id = $1`
    const params: unknown[] = [ownerId]

    if (folder && folder !== '/') {
      query += ` AND folder = $2`
      params.push(folder)
    } else {
      query += ` AND folder = '/'`
    }

    query += ` ORDER BY created_at DESC`
    const { rows } = await pool.query<FileRow>(query, params)
    return rows.map(toFileEntry)
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const r = await pool.query(`DELETE FROM files WHERE id = $1 AND owner_id = $2`, [id, ownerId])
    return (r.rowCount ?? 0) > 0
  }

  async deleteByFolderPath(ownerId: string, folderPath: string): Promise<number> {
    const normalized = folderPath.endsWith('/') ? folderPath : `${folderPath}/`
    const result = await pool.query(
      `DELETE FROM files
       WHERE owner_id = $1
       AND (
         (is_folder = true AND (folder = $2 OR (folder || '/' || filename) = $2 OR (folder || '/' || filename) LIKE $3))
         OR
         (is_folder = false AND (folder = $2 OR folder LIKE $3))
       )`,
      [ownerId, folderPath, `${normalized}%`]
    )
    return result.rowCount ?? 0
  }
}
