import { randomUUID } from 'crypto';
import { PasswordEntry } from '../../domain/entities/PasswordEntry';
import { CreatePasswordEntryInput, IPasswordEntryRepository, UpdatePasswordEntryInput } from '../../domain/repositories/IPasswordEntryRepository';

export class InMemoryPasswordEntryRepository implements IPasswordEntryRepository {
  private store: Map<string, PasswordEntry> = new Map()

  async create(input: CreatePasswordEntryInput): Promise<PasswordEntry> {
    const entry = new PasswordEntry({
      id: randomUUID(),
      ownerId: input.ownerId,
      siteName: input.siteName,
      siteUrl: input.siteUrl,
      username: input.username,
      encryptedPassword: input.encryptedPassword,
      notes: input.notes,
      expiresAt: input.expiresAt
    })
    this.store.set(entry.id, entry)
    return entry
  }

  async findById(id: string, ownerId: string): Promise<PasswordEntry | null> {
    const e = this.store.get(id)
    return e && e.ownerId === ownerId ? e : null
  }

  async listByOwner(ownerId: string): Promise<PasswordEntry[]> {
    return Array.from(this.store.values())
      .filter(e => e.ownerId === ownerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async update(id: string, ownerId: string, input: UpdatePasswordEntryInput): Promise<PasswordEntry | null> {
    const existing = this.store.get(id)
    if (!existing || existing.ownerId !== ownerId) return null

    const updated = new PasswordEntry({
      id: existing.id,
      ownerId: existing.ownerId,
      siteName: input.siteName ?? existing.siteName,
      siteUrl: input.siteUrl ?? existing.siteUrl,
      username: input.username ?? existing.username,
      encryptedPassword: input.encryptedPassword ?? existing.encryptedPassword,
      notes: input.notes ?? existing.notes,
      expiresAt: input.expiresAt !== undefined ? input.expiresAt : existing.expiresAt,
      createdAt: existing.createdAt,
      updatedAt: new Date()
    })
    this.store.set(id, updated)
    return updated
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const e = this.store.get(id)
    if (!e || e.ownerId !== ownerId) return false
    this.store.delete(id)
    return true
  }
}
