# Bao Gia (Quotation Management)

NestJS backend + Next.js frontend + PostgreSQL.

## Backend (`backend/`)

NestJS API. TypeORM + PostgreSQL.

### Commands
- `npm run start:dev` -- Start dev server
- `npm run build` -- Build
- `npm test` -- Run tests
- `npx jest --testPathPattern="<pattern>"` -- Run specific tests

### Key Patterns
- Controllers -> Services -> Repositories (TypeORM)
- DTOs with class-validator decorators for input validation
- NestJS exception filters for error handling

### Structure
- `src/modules/` -- Feature modules
- `src/common/` -- Shared decorators, guards, pipes
- `src/database/` -- Entities, migrations

## Frontend (`frontend/`)

Next.js + React + TailwindCSS.

### Commands
- `npm run dev` -- Start dev server
- `npm run build` -- Build
- `npm test` -- Run tests

### Structure
- `app/` -- Next.js App Router pages
- `components/` -- Reusable components
- `hooks/` -- Custom React hooks
- `lib/` -- Utilities, API services
- `types/` -- TypeScript types

## Shared (`shared/`)

Shared types, schemas, constants between backend and frontend.

## currentDate
Today's date is 2026-02-22.
