# POS Project

Personal Operating System project with clear separation between backend and frontend.

## Project layout

- `backend/` contains TypeScript + Express API, auth, services, tests, and database wiring
- `frontend/` is reserved for the UI app (next milestone)
- root files keep planning docs and architecture diagrams

## Backend quick start

1. `cd backend`
2. `npm install`
3. create `backend/.env` using `backend/.env.example` (single env file for backend)
4. `npm run db:init`
5. `npm run dev`

## Backend tests

1. `cd backend`
2. `npm test`

## Current status

- Backend milestone 1 is implemented and passing tests
- Frontend folder is prepared and ready for milestone 2
