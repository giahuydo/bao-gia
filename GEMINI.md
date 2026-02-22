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

```bash
cd backend
npm run start:dev    # Dev server (port 4001)
npm run build        # Build
npm test             # Run all tests
npx jest --testPathPattern="<pattern>"  # Run specific tests
```

### Architecture

- Controllers → Services → Repositories (TypeORM)
- DTOs with class-validator decorators for input validation
- NestJS exception filters for error handling
- Use NestJS dependency injection — never instantiate services manually

### Structure

- `src/modules/` — Feature modules (each has module, controller, service, DTOs)
- `src/common/` — Shared decorators, guards, pipes
- `src/database/entities/` — TypeORM entities

### Conventions

- File naming: `*.controller.ts`, `*.service.ts`, `*.entity.ts`, `*.dto.ts`, `*.module.ts`, `*.guard.ts`
- Use `@ApiTags`, `@ApiOperation` for Swagger docs
- Handle errors with NestJS exceptions (`NotFoundException`, `BadRequestException`, etc.)
- Use TypeORM QueryBuilder for complex queries, repository methods for simple CRUD

## Frontend (`frontend/`)

Next.js (App Router) + React + TailwindCSS + shadcn/ui.

### Commands

```bash
cd frontend
npm run dev      # Dev server (port 4000)
npm run build    # Build
npm test         # Run tests
```

### Architecture

- Next.js App Router (`app/` directory)
- TailwindCSS + shadcn/ui components
- React hooks for state management
- API calls centralized in `lib/`

### Structure

- `app/` — Route pages (App Router)
- `components/` — Reusable UI components
- `hooks/use-*.ts` — Custom React hooks
- `lib/*.ts` — Utility functions, API services
- `types/*.ts` — TypeScript types

### Conventions

- Functional components only — no class components
- Use `"use client"` directive only when needed
- Default to Server Components for data fetching
- Use `cn()` utility for conditional classNames
- Strict TypeScript — avoid `any`

## Database (TypeORM + PostgreSQL)

- Table names: snake_case, plural (`quotations`, `quotation_items`)
- Column names: snake_case
- Use `@CreateDateColumn()` and `@UpdateDateColumn()` for timestamps
- Use `uuid` for primary keys
- Define relations explicitly with `@ManyToOne`, `@OneToMany`, etc.
- Always set `onDelete` behavior on relations
- Never modify existing migrations — create new ones

## General Rules

- Write clean, concise TypeScript code
- Self-documenting code — no unnecessary comments
- Handle errors at system boundaries
- Never commit `.env`, credentials, or secrets
- Follow existing patterns in the codebase
