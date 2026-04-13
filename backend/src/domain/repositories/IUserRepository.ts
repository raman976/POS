import { User } from '../entities/User';

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

export interface IUserRepository {
  create(input: CreateUserInput): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
