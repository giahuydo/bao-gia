# Bao Gia (Quotation Management)

NestJS backend + Next.js frontend + PostgreSQL.

## Ports

| Service    | Port |
|------------|------|
| Frontend   | 4000 |
| Backend    | 4001 |
| PostgreSQL | 5432 |

Ports start at 4000 to avoid conflicts with Clincove project.

## Backend (`backend/`)

NestJS API. TypeORM + PostgreSQL. Runs on port **4001**.

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
This is the **single source of truth** for API contracts between backend and frontend.

### Structure
- `shared/types/` -- Entity interfaces and API types (quotation, customer, product, common)
- `shared/constants/` -- Enums and constants (quotation-status, currencies)

### Rules
- Backend-dev MUST update shared types when changing API contracts
- Frontend-dev MUST import from `shared/` instead of redefining types locally
- All new types must be re-exported via the barrel `index.ts` files

## Linear Integration

This project uses the **Bao Gia** Linear team. When working with Linear tickets:

- **Team**: Bao Gia
- **Project Key**: `BAO` (tickets look like `BAO-123`)
- When searching/listing Linear issues, always filter by team "Bao Gia"
- When creating issues, always create under the "Bao Gia" team
- Branch naming: `BAO-<number>/<short-description>` (e.g. `BAO-42/add-pdf-export`)
- Commit prefix: `BAO-<number>: <message>` (e.g. `BAO-42: add PDF export feature`)
- Do NOT interact with issues from other teams (e.g. Clincove)

## currentDate
Today's date is 2026-02-22.
