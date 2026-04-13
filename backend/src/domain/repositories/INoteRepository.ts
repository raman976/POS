import { Note } from '../entities/Note';

export interface CreateNoteInput {
  ownerId: string;
  title: string;
  body: string;
}

export interface INoteRepository {
  create(input: CreateNoteInput): Promise<Note>;
  listByOwner(ownerId: string): Promise<Note[]>;
}
