# Genie

Genie is a personal digital workspace where day-to-day things live in one place: notes, tasks, events, passwords, and files.

The original idea came from a simple problem. Most people use one app for notes, one for tasks, one calendar, one password manager, and one cloud drive. That split works, but it also creates friction. You keep jumping between apps, context is lost, and personal information gets scattered.

Genie tries to solve that by giving one connected workspace with a clean flow:

- capture notes quickly
- organize tasks into named lists like urgent, today, and follow-up
- manage events in calendar view
- store passwords in an encrypted vault
- upload and organize files in folders

## Live frontend

- [Genie frontend](https://pos-one-ebon.vercel.app/)

## Project structure

- [backend](backend): TypeScript + Express API, auth, business services, repositories, database initialization, and tests
- [frontend](frontend): React + TypeScript client application
- planning and diagram files in the repository root

## Backend setup

1. Go to [backend](backend)
2. Install dependencies with npm install
3. Create backend/.env from [backend/.env.example](backend/.env.example)
4. Run npm run db:init
5. Run npm run dev

## Storage

File uploads are designed for Supabase Storage.

Required env keys:

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_STORAGE_BUCKET

## Current implementation status

- backend modules for auth, notes, tasks, calendar, vault, files, and search are in place
- frontend pages are connected and deployed
- test suite is available in backend/tests
