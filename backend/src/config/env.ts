import dotenv from 'dotenv';

dotenv.config();

const stripWrappingQuotes = (value: string): string => {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
};

const withDbPassword = (url: string, dbPass: string | undefined): string => {
  if (!dbPass) return url;
  const safePass = encodeURIComponent(stripWrappingQuotes(dbPass));
  return url.replace('[YOUR_DB_PASSWORD]', safePass);
};

const dbPass = process.env.DB_PASS ?? process.env.db_pass;
const rawDatabaseUrl = process.env.DATABASE_URL;
const nodeEnv = process.env.NODE_ENV ?? 'development';

if (!rawDatabaseUrl && nodeEnv !== 'test') {
  throw new Error('DATABASE_URL is required in environment variables');
}

const defaultDbForTests = 'postgres://postgres:postgres@localhost:5432/postgres';

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv,
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET ?? 'change_this_jwt_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  databaseUrl: withDbPassword(rawDatabaseUrl ?? defaultDbForTests, dbPass),
};
