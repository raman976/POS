import { PasswordEntry } from '../entities/PasswordEntry';

export interface CreatePasswordEntryInput {
  ownerId: string;
  siteName: string;
  siteUrl: string;
  username: string;
  encryptedPassword: string
  notes: string;
  expiresAt?: Date | null;
}

export interface UpdatePasswordEntryInput {
  siteName?: string;
  siteUrl?: string
  username?: string;
  encryptedPassword?: string;
  notes?: string;
  expiresAt?: Date | null
}

export interface IPasswordEntryRepository {
  create(input: CreatePasswordEntryInput): Promise<PasswordEntry>
  findById(id: string, ownerId: string): Promise<PasswordEntry | null>
  listByOwner(ownerId: string): Promise<PasswordEntry[]>
  update(id: string, ownerId: string, input: UpdatePasswordEntryInput): Promise<PasswordEntry | null>
  delete(id: string, ownerId: string): Promise<boolean>
}
