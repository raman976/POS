import { User } from '../../domain/entities/User';
import {
  CreateUserInput,
  IUserRepository,
} from '../../domain/repositories/IUserRepository';
import { pool } from '../db/pool';

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

const toUser = (row: UserRow): User =>
  new User({
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  });

export class PostgresUserRepository implements IUserRepository {
  public async create(input: CreateUserInput): Promise<User> {
    const { rows } = await pool.query<UserRow>(
      `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, password_hash, created_at
      `,
      [input.name, input.email.toLowerCase(), input.passwordHash],
    );

    return toUser(rows[0]);
  }

  public async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query<UserRow>(
      `
      SELECT id, name, email, password_hash, created_at
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [email.toLowerCase()],
    );

    if (!rows[0]) return null;
    return toUser(rows[0]);
  }

  public async findById(id: string): Promise<User | null> {
    const { rows } = await pool.query<UserRow>(
      `
      SELECT id, name, email, password_hash, created_at
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [id],
    );

    if (!rows[0]) return null;
    return toUser(rows[0]);
  }
}
