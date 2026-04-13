import bcrypt from 'bcryptjs';

export class PasswordHasher {
  public async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, 10);
  }

  public async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
