import { z } from 'zod';
import { Note } from '../../domain/entities/Note';
import { INoteRepository } from '../../domain/repositories/INoteRepository';

const createNoteSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1),
});

const updateNoteSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  body: z.string().min(1).optional(),
});

export class NoteService {
  constructor(private readonly notes: INoteRepository) {}

  public async createNote(ownerId: string, input: { title: string; body: string }): Promise<Note> {
    const data = createNoteSchema.parse(input);

    return this.notes.create({
      ownerId,
      title: data.title,
      body: data.body,
    });
  }

  public async listNotes(ownerId: string): Promise<Note[]> {
    return this.notes.listByOwner(ownerId);
  }

  public async updateNote(ownerId: string, noteId: string, input: unknown): Promise<Note | null> {
    const data = updateNoteSchema.parse(input);
    return this.notes.update(noteId, ownerId, data);
  }

  public async deleteNote(ownerId: string, noteId: string): Promise<boolean> {
    return this.notes.delete(noteId, ownerId);
  }
}
