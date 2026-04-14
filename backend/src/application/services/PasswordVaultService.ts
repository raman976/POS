import { z } from 'zod';
import { PasswordEntry } from '../../domain/entities/PasswordEntry';
import { IPasswordEntryRepository } from '../../domain/repositories/IPasswordEntryRepository';
import { EncryptionService } from '../../infrastructure/security/encryption';

const createSchema = z.object({
  siteName: z.string().min(1).max(100),
  siteUrl: z.string().default(''),
  username: z.string().min(1),
  password: z.string().min(1),
  notes: z.string().default(''),
  expiresAt: z.string().nullable().optional()
})

const updateSchema = createSchema.partial()

export class PasswordVaultService {
  constructor(
    private readonly repo: IPasswordEntryRepository,
    private readonly encryption: EncryptionService
  ) {}

  async addEntry(ownerId: string, input: unknown): Promise<PasswordEntry & { password: string }> {
    const data = createSchema.parse(input)

    const encryptedPassword = this.encryption.encrypt(data.password)

    const entry = await this.repo.create({
      ownerId,
      siteName: data.siteName,
      siteUrl: data.siteUrl,
      username: data.username,
      encryptedPassword,
      notes: data.notes,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
    })

    return Object.assign(entry, { password: data.password })
  }

  async listEntries(ownerId: string): Promise<PasswordEntry[]> {
    return this.repo.listByOwner(ownerId)
  }

  async getEntryWithPassword(ownerId: string, id: string): Promise<(PasswordEntry & { password: string }) | null> {
    const entry = await this.repo.findById(id, ownerId)
    if (!entry) return null
    const password = this.encryption.decrypt(entry.encryptedPassword)
    return Object.assign(entry, { password })
  }

  async updateEntry(ownerId: string, id: string, input: unknown): Promise<PasswordEntry | null> {
    const data = updateSchema.parse(input)

    return this.repo.update(id, ownerId, {
      ...data,
      encryptedPassword: data.password ? this.encryption.encrypt(data.password) : undefined,
      expiresAt: data.expiresAt !== undefined ? (data.expiresAt ? new Date(data.expiresAt) : null) : undefined,
    })
  }

  async deleteEntry(ownerId: string, id: string): Promise<boolean> {
    return this.repo.delete(id, ownerId)
  }
}
