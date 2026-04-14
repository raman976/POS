import { BaseEntity } from './BaseEntity';

export class PasswordEntry extends BaseEntity {
  public readonly siteName: string;
  public readonly siteUrl: string;
  public readonly username: string;
  public readonly encryptedPassword: string;
  public readonly notes: string;
  public readonly expiresAt: Date | null

  constructor(data: {
    id: string;
    ownerId: string
    siteName: string;
    siteUrl: string;
    username: string;
    encryptedPassword: string;
    notes: string;
    expiresAt?: Date | null
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    super(data)
    this.siteName = data.siteName.trim()
    this.siteUrl = data.siteUrl.trim()
    this.username = data.username.trim()
    this.encryptedPassword = data.encryptedPassword
    this.notes = data.notes
    this.expiresAt = data.expiresAt ?? null
  }
}
