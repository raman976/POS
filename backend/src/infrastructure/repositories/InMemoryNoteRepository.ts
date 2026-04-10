import { randomUUID } from 'crypto';
import { Note } from '../../domain/entities/Note';
import {
  CreateNoteInput,
  INoteRepository,
  UpdateNoteInput,
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

  public async findById(id: string, ownerId: string): Promise<Note | null> {
    const note = this.notes.find((item) => item.id === id && item.ownerId === ownerId);
    return note ?? null;
  }

  public async update(id: string, ownerId: string, input: UpdateNoteInput): Promise<Note | null> {
    const idx = this.notes.findIndex((item) => item.id === id && item.ownerId === ownerId);
    if (idx < 0) return null;

    const current = this.notes[idx];
    const next = new Note({
      id: current.id,
      ownerId: current.ownerId,
      title: input.title ?? current.title,
      body: input.body ?? current.body,
      createdAt: current.createdAt,
      updatedAt: new Date(),
    });

    this.notes[idx] = next;
    return next;
  }

  public async delete(id: string, ownerId: string): Promise<boolean> {
    const idx = this.notes.findIndex((item) => item.id === id && item.ownerId === ownerId);
    if (idx < 0) return false;
    this.notes.splice(idx, 1);
    return true;
  }
}
