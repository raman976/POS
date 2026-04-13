import { randomUUID } from 'crypto';
import { Note } from '../../domain/entities/Note';
import {
  CreateNoteInput,
  INoteRepository,
} from '../../domain/repositories/INoteRepository';

export class InMemoryNoteRepository implements INoteRepository {
  private readonly notes: Note[] = [];

  public async create(input: CreateNoteInput): Promise<Note> {
    const note = new Note({
      id: randomUUID(),
      ownerId: input.ownerId,
      title: input.title,
      body: input.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.notes.unshift(note);
    return note;
  }

  public async listByOwner(ownerId: string): Promise<Note[]> {
    return this.notes.filter((item) => item.ownerId === ownerId);
  }
}
