# POS Backend

Backend-first foundation for the Personal Operating System project.

## What is done in milestone 1

- TypeScript + Express backend setup
- OOP style layers
  - entities
  - repository interfaces
  - service layer
  - controllers and routes
- JWT auth with cookie-based session token
- Notes module (create and list)
- Postgres repositories (Supabase compatible)
- In-memory repositories for fast tests
- Jest + Supertest test suite

## Routes added

- GET /health
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout
- POST /api/notes
- GET /api/notes

## Environment

Create backend/.env using backend/.env.example.

Important:
- DATABASE_URL should be the direct Postgres connection string from Supabase.
- If placeholder [YOUR_DB_PASSWORD] exists in DATABASE_URL, app can fill it from DB_PASS or db_pass.

## Local run

1. npm install
2. npm run db:init
3. npm run dev

## Tests

1. npm test

## Next milestone

- Tasks module with due date, priority, and status
- Folder and tag system
- Audit logs and permissions
- File metadata and storage integration
