import { Note } from '../../domain/entities/Note';
import {
  CreateNoteInput,
  INoteRepository,
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
}
