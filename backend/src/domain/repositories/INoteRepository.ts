import { Note } from '../entities/Note';

export interface CreateNoteInput {
  ownerId: string;
  title: string;
  body: string;
}

export interface UpdateNoteInput {
  title?: string;
  body?: string;
}

export interface INoteRepository {
  create(input: CreateNoteInput): Promise<Note>;
  findById(id: string, ownerId: string): Promise<Note | null>;
  listByOwner(ownerId: string): Promise<Note[]>;
  update(id: string, ownerId: string, input: UpdateNoteInput): Promise<Note | null>;
  delete(id: string, ownerId: string): Promise<boolean>;
}
