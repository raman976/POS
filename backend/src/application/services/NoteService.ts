import { z } from 'zod';
import { Note } from '../../domain/entities/Note';
import { INoteRepository } from '../../domain/repositories/INoteRepository';

const createNoteSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1),
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
}
