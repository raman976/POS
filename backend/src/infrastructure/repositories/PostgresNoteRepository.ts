import { Note } from '../../domain/entities/Note';
import {
  CreateNoteInput,
  INoteRepository,
  UpdateNoteInput,
} from '../../domain/repositories/INoteRepository';
import { pool } from '../db/pool';

interface NoteRow {
  id: string;
  owner_id: string;
  title: string;
  body: string;
  created_at: Date;
  updated_at: Date;
}

const toNote = (row: NoteRow): Note =>
  new Note({
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });

export class PostgresNoteRepository implements INoteRepository {
  public async create(input: CreateNoteInput): Promise<Note> {
    const { rows } = await pool.query<NoteRow>(
      `
      INSERT INTO notes (owner_id, title, body)
      VALUES ($1, $2, $3)
      RETURNING id, owner_id, title, body, created_at, updated_at
      `,
      [input.ownerId, input.title, input.body],
    );

    return toNote(rows[0]);
  }

  public async listByOwner(ownerId: string): Promise<Note[]> {
    const { rows } = await pool.query<NoteRow>(
      `
      SELECT id, owner_id, title, body, created_at, updated_at
      FROM notes
      WHERE owner_id = $1
      ORDER BY created_at DESC
      `,
      [ownerId],
    );

    return rows.map(toNote);
  }

  public async findById(id: string, ownerId: string): Promise<Note | null> {
    const { rows } = await pool.query<NoteRow>(
      `
      SELECT id, owner_id, title, body, created_at, updated_at
      FROM notes
      WHERE id = $1 AND owner_id = $2
      LIMIT 1
      `,
      [id, ownerId],
    );

    return rows[0] ? toNote(rows[0]) : null;
  }

  public async update(id: string, ownerId: string, input: UpdateNoteInput): Promise<Note | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(input.title);
    }
    if (input.body !== undefined) {
      fields.push(`body = $${idx++}`);
      values.push(input.body);
    }

    if (fields.length === 0) {
      return this.findById(id, ownerId);
    }

    fields.push('updated_at = NOW()');
    values.push(id, ownerId);

    const { rows } = await pool.query<NoteRow>(
      `
      UPDATE notes
      SET ${fields.join(', ')}
      WHERE id = $${idx++} AND owner_id = $${idx}
      RETURNING id, owner_id, title, body, created_at, updated_at
      `,
      values,
    );

    return rows[0] ? toNote(rows[0]) : null;
  }

  public async delete(id: string, ownerId: string): Promise<boolean> {
    const result = await pool.query(
      `
      DELETE FROM notes
      WHERE id = $1 AND owner_id = $2
      `,
      [id, ownerId],
    );

    return (result.rowCount ?? 0) > 0;
  }
}
