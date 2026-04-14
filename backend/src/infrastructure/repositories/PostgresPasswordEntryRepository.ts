import { PasswordEntry } from '../../domain/entities/PasswordEntry';
import { CreatePasswordEntryInput, IPasswordEntryRepository, UpdatePasswordEntryInput } from '../../domain/repositories/IPasswordEntryRepository';
import { pool } from '../db/pool';

interface EntryRow {
  id: string;
  owner_id: string;
  site_name: string;
  site_url: string;
  username: string;
  encrypted_password: string
  notes: string;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date
}

const toEntry = (row: EntryRow): PasswordEntry =>
  new PasswordEntry({
    id: row.id,
    ownerId: row.owner_id,
    siteName: row.site_name,
    siteUrl: row.site_url,
    username: row.username,
    encryptedPassword: row.encrypted_password,
    notes: row.notes,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  })

export class PostgresPasswordEntryRepository implements IPasswordEntryRepository {

  async create(input: CreatePasswordEntryInput): Promise<PasswordEntry> {
    const { rows } = await pool.query<EntryRow>(
      `INSERT INTO password_entries (owner_id, site_name, site_url, username, encrypted_password, notes, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [input.ownerId, input.siteName, input.siteUrl, input.username, input.encryptedPassword, input.notes, input.expiresAt ?? null]
    )
    return toEntry(rows[0])
  }

  async findById(id: string, ownerId: string): Promise<PasswordEntry | null> {
    const { rows } = await pool.query<EntryRow>(
      `SELECT * FROM password_entries WHERE id = $1 AND owner_id = $2`,
      [id, ownerId]
    )
    return rows.length > 0 ? toEntry(rows[0]) : null
  }

  async listByOwner(ownerId: string): Promise<PasswordEntry[]> {
    const { rows } = await pool.query<EntryRow>(
      `SELECT * FROM password_entries WHERE owner_id = $1 ORDER BY site_name ASC`,
      [ownerId]
    )
    return rows.map(toEntry)
  }

  async update(id: string, ownerId: string, input: UpdatePasswordEntryInput): Promise<PasswordEntry | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    if (input.siteName !== undefined) { fields.push(`site_name = $${idx++}`); values.push(input.siteName) }
    if (input.siteUrl !== undefined) { fields.push(`site_url = $${idx++}`); values.push(input.siteUrl) }
    if (input.username !== undefined) { fields.push(`username = $${idx++}`); values.push(input.username) }
    if (input.encryptedPassword !== undefined) { fields.push(`encrypted_password = $${idx++}`); values.push(input.encryptedPassword) }
    if (input.notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(input.notes) }
    if (input.expiresAt !== undefined) { fields.push(`expires_at = $${idx++}`); values.push(input.expiresAt) }

    if (fields.length === 0) return this.findById(id, ownerId)

    fields.push(`updated_at = NOW()`)
    values.push(id, ownerId)

    const { rows } = await pool.query<EntryRow>(
      `UPDATE password_entries SET ${fields.join(', ')} WHERE id = $${idx++} AND owner_id = $${idx} RETURNING *`,
      values
    )
    return rows.length > 0 ? toEntry(rows[0]) : null
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const r = await pool.query(`DELETE FROM password_entries WHERE id = $1 AND owner_id = $2`, [id, ownerId])
    return (r.rowCount ?? 0) > 0
  }
}
