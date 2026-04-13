export class User {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly createdAt: Date;

  constructor(data: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt?: Date;
  }) {
    this.id = data.id;
    this.name = data.name.trim();
    this.email = data.email.toLowerCase().trim();
    this.passwordHash = data.passwordHash;
    this.createdAt = data.createdAt ?? new Date();
  }
}
