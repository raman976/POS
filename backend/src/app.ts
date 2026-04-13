import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { IUserRepository } from './domain/repositories/IUserRepository';
import { INoteRepository } from './domain/repositories/INoteRepository';
import { PasswordHasher } from './infrastructure/security/password';
import { JwtService } from './infrastructure/security/jwt';
import { AuthService } from './application/services/AuthService';
import { NoteService } from './application/services/NoteService';
import { AuthController } from './interfaces/http/controllers/AuthController';
import { NoteController } from './interfaces/http/controllers/NoteController';
import { authRoutes } from './interfaces/http/routes/authRoutes';
import { noteRoutes } from './interfaces/http/routes/noteRoutes';
import { PostgresUserRepository } from './infrastructure/repositories/PostgresUserRepository';
import { PostgresNoteRepository } from './infrastructure/repositories/PostgresNoteRepository';
import { env } from './config/env';

interface AppDeps {
  userRepository?: IUserRepository;
  noteRepository?: INoteRepository;
}

export const createApp = (deps: AppDeps = {}): Express => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  const userRepository = deps.userRepository ?? new PostgresUserRepository();
  const noteRepository = deps.noteRepository ?? new PostgresNoteRepository();

  const passwordHasher = new PasswordHasher();
  const jwtService = new JwtService();

  const authService = new AuthService(userRepository, passwordHasher, jwtService);
  const noteService = new NoteService(noteRepository);

  const authController = new AuthController(authService);
  const noteController = new NoteController(noteService);

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'pos-backend' });
  });

  app.use('/api/auth', authRoutes(authController, jwtService));
  app.use('/api/notes', noteRoutes(noteController, jwtService));

  return app;
};
