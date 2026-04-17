import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { IUserRepository } from './domain/repositories/IUserRepository';
import { INoteRepository } from './domain/repositories/INoteRepository';
import { ITaskRepository } from './domain/repositories/ITaskRepository';
import { ICalendarEventRepository } from './domain/repositories/ICalendarEventRepository';
import { IPasswordEntryRepository } from './domain/repositories/IPasswordEntryRepository';
import { IFileRepository } from './domain/repositories/IFileRepository';
import { PasswordHasher } from './infrastructure/security/password';
import { JwtService } from './infrastructure/security/jwt';
import { EncryptionService } from './infrastructure/security/encryption';
import { AuthService } from './application/services/AuthService';
import { NoteService } from './application/services/NoteService';
import { TaskService } from './application/services/TaskService';
import { CalendarEventService } from './application/services/CalendarEventService';
import { PasswordVaultService } from './application/services/PasswordVaultService';
import { FileService } from './application/services/FileService';
import { SearchService } from './application/services/SearchService';
import { AuthController } from './interfaces/http/controllers/AuthController';
import { NoteController } from './interfaces/http/controllers/NoteController';
import { TaskController } from './interfaces/http/controllers/TaskController';
import { CalendarEventController } from './interfaces/http/controllers/CalendarEventController';
import { PasswordVaultController } from './interfaces/http/controllers/PasswordVaultController';
import { FileController } from './interfaces/http/controllers/FileController';
import { SearchController } from './interfaces/http/controllers/SearchController';
import { authRoutes } from './interfaces/http/routes/authRoutes';
import { noteRoutes } from './interfaces/http/routes/noteRoutes';
import { taskRoutes } from './interfaces/http/routes/taskRoutes';
import { calendarEventRoutes } from './interfaces/http/routes/calendarEventRoutes';
import { passwordVaultRoutes } from './interfaces/http/routes/passwordVaultRoutes';
import { fileRoutes } from './interfaces/http/routes/fileRoutes';
import { searchRoutes } from './interfaces/http/routes/searchRoutes';
import { PostgresUserRepository } from './infrastructure/repositories/PostgresUserRepository';
import { PostgresNoteRepository } from './infrastructure/repositories/PostgresNoteRepository';
import { PostgresTaskRepository } from './infrastructure/repositories/PostgresTaskRepository';
import { PostgresCalendarEventRepository } from './infrastructure/repositories/PostgresCalendarEventRepository';
import { PostgresPasswordEntryRepository } from './infrastructure/repositories/PostgresPasswordEntryRepository';
import { PostgresFileRepository } from './infrastructure/repositories/PostgresFileRepository';
import { env } from './config/env';

interface AppDeps {
  userRepository?: IUserRepository;
  noteRepository?: INoteRepository;
  taskRepository?: ITaskRepository;
  calendarEventRepository?: ICalendarEventRepository
  passwordEntryRepository?: IPasswordEntryRepository;
  fileRepository?: IFileRepository;
}

export const createApp = (deps: AppDeps = {}): Express => {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: env.clientOrigins,
      credentials: true,
    })
  )
  app.use(express.json())
  app.use(cookieParser())

  const userRepository = deps.userRepository ?? new PostgresUserRepository()
  const noteRepository = deps.noteRepository ?? new PostgresNoteRepository()
  const taskRepository = deps.taskRepository ?? new PostgresTaskRepository()
  const calendarEventRepository = deps.calendarEventRepository ?? new PostgresCalendarEventRepository()
  const passwordEntryRepository = deps.passwordEntryRepository ?? new PostgresPasswordEntryRepository()
  const fileRepository = deps.fileRepository ?? new PostgresFileRepository()

  const passwordHasher = new PasswordHasher()
  const jwtService = new JwtService()
  const encryptionService = new EncryptionService(env.encryptionSecret)

  const authService = new AuthService(userRepository, passwordHasher, jwtService)
  const noteService = new NoteService(noteRepository)
  const taskService = new TaskService(taskRepository)
  const calendarEventService = new CalendarEventService(calendarEventRepository)
  const passwordVaultService = new PasswordVaultService(passwordEntryRepository, encryptionService)
  const fileService = new FileService(fileRepository, {
    uploadDir: env.uploadDir,
    supabaseUrl: env.supabaseUrl,
    supabaseServiceRoleKey: env.supabaseServiceRoleKey,
    supabaseStorageBucket: env.supabaseStorageBucket,
  })
  const searchService = new SearchService(noteRepository, taskRepository, calendarEventRepository)

  const authController = new AuthController(authService)
  const noteController = new NoteController(noteService)
  const taskController = new TaskController(taskService)
  const calendarEventController = new CalendarEventController(calendarEventService)
  const passwordVaultController = new PasswordVaultController(passwordVaultService)
  const fileController = new FileController(fileService)
  const searchController = new SearchController(searchService)

  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'pos-backend' })
  })

  app.use('/api/auth', authRoutes(authController, jwtService))
  app.use('/api/notes', noteRoutes(noteController, jwtService))
  app.use('/api/tasks', taskRoutes(taskController, jwtService))
  app.use('/api/events', calendarEventRoutes(calendarEventController, jwtService))
  app.use('/api/vault', passwordVaultRoutes(passwordVaultController, jwtService))
  app.use('/api/files', fileRoutes(fileController, jwtService))
  app.use('/api/search', searchRoutes(searchController, jwtService))

  return app
}
