import { z } from 'zod';
import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { JwtService } from '../../infrastructure/security/jwt';
import { PasswordHasher } from '../../infrastructure/security/password';

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
});

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export class AuthService {
  constructor(
    private readonly users: IUserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  public async register(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    const data = signUpSchema.parse(input);

    const existing = await this.users.findByEmail(data.email);
    if (existing) {
      throw new Error('Email already in use');
    }

    const passwordHash = await this.passwordHasher.hash(data.password);

    const user = await this.users.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return { user, token };
  }

  public async login(input: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    const data = signInSchema.parse(input);

    const user = await this.users.findByEmail(data.email);
    if (!user) throw new Error('Invalid credentials');

    const isValid = await this.passwordHasher.compare(data.password, user.passwordHash);
    if (!isValid) throw new Error('Invalid credentials');

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return { user, token };
  }

  public async getProfile(userId: string): Promise<User> {
    const user = await this.users.findById(userId);
    if (!user) throw new Error('User not found');

    return user;
  }

  public async verifyPassword(userId: string, password: string): Promise<boolean> {
    const passwordSchema = z.string().min(1)
    const plainPassword = passwordSchema.parse(password)

    const user = await this.users.findById(userId)
    if (!user) throw new Error('User not found')

    return this.passwordHasher.compare(plainPassword, user.passwordHash)
  }
}
