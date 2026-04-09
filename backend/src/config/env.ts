import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const rawDatabaseUrl = process.env.DATABASE_URL;
const nodeEnv = process.env.NODE_ENV ?? 'development';

if (!rawDatabaseUrl && nodeEnv !== 'test') {
  throw new Error('DATABASE_URL is required in environment variables');
}

const defaultDbForTests = 'postgres://postgres:postgres@localhost:5432/postgres';

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv,
  clientOrigins: (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET ?? 'change_this_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  databaseUrl: rawDatabaseUrl ?? defaultDbForTests,
  encryptionSecret: process.env.ENCRYPTION_SECRET ?? 'change_this_encryption_secret',
  uploadDir: process.env.UPLOAD_DIR ?? './uploads',
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? 'pos-files',
};
