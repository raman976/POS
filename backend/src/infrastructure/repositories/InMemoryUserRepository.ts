import { randomUUID } from 'crypto';
import { User } from '../../domain/entities/User';
import {
  CreateUserInput,
  IUserRepository,
} from '../../domain/repositories/IUserRepository';

export class InMemoryUserRepository implements IUserRepository {
  private readonly users: User[] = [];

  public async create(input: CreateUserInput): Promise<User> {
    const user = new User({
      id: randomUUID(),
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      createdAt: new Date(),
    });

    this.users.push(user);
    return user;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((item) => item.email === email.toLowerCase());
    return user ?? null;
  }

  public async findById(id: string): Promise<User | null> {
    const user = this.users.find((item) => item.id === id);
    return user ?? null;
  }
}
