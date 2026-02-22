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
- `src/modules/` -- Feature modules (ai, ingestion, webhooks, quotations, customers, products)
- `src/common/` -- Shared decorators, guards, pipes
- `src/database/` -- Entities, migrations

## Frontend (`frontend/`)

Next.js + React + TailwindCSS + shadcn/ui.

### Commands
- `npm run dev` -- Start dev server
- `npm run build` -- Build
- `npm test` -- Run tests
- `npm run test:e2e` -- Run Playwright E2E tests

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

## Business Domain

### Quotation Lifecycle
Quotations follow this status flow:
`draft` -> `sent` -> `accepted` / `rejected` / `expired`

- New quotations start as `draft`
- Only `draft` quotations can be edited
- `sent` quotations are read-only (create a new version to modify)
- Currency is VND by default, USD optional

### n8n Integration
- n8n workflows handle document ingestion (PDF/image -> AI extraction) and email delivery
- Backend communicates with n8n via REST triggers
- n8n calls back via `/api/webhooks/n8n/*` endpoints
- All n8n requests must include `X-Webhook-Secret` header
- Execution logs are stored in `n8n_execution_logs` table

### AI Module
- Uses Anthropic Claude API (`claude-sonnet-4-20250514`)
- Operations: `generate` (full quotation), `suggest` (line items), `improve` (descriptions)
- Token usage tracked per request with cost calculation
- Internal service calls require `X-Service-Key` header

## Git & Push Protocol

This project uses **3 separate git repos**:

| Repo | Remote | Path |
|------|--------|------|
| Monorepo | `giahuydo/bao-gia` | `/` (root) |
| Backend | `giahuydo/bao_gia_be` | `backend/` |
| Frontend | `giahuydo/bao_gia_fe` | `frontend/` |

**When pushing, ALWAYS push all 3 repos** (mono + backend + frontend).

### Commit Conventions
- Group commits by feature/module (not one giant commit)
- Prefix with scope: `feat(backend):`, `fix(frontend):`, `chore:`, `docs:`, `test:`
- If working on a Linear ticket: `BAO-<number>: <message>`

## Linear Integration

This project uses the **Bao Gia** Linear team.

- **Team**: Bao Gia
- **Project Key**: `BAO` (tickets look like `BAO-123`)
- When searching/listing Linear issues, always filter by team "Bao Gia"
- When creating issues, always create under the "Bao Gia" team
- Branch naming: `BAO-<number>/<short-description>` (e.g. `BAO-42/add-pdf-export`)
- Do NOT interact with issues from other teams (e.g. Clincove)

## MCP Security Policy

External services accessed via MCP tools have scoped permissions:

| Service | READ | WRITE | DELETE |
|---------|------|-------|--------|
| GitHub (giahuydo/bao-gia*) | Yes | Yes | No |
| Linear (Bao Gia team only) | Yes | Yes | No |
| PostgreSQL | Yes | Yes (via TypeORM) | Soft-delete only |

**FORBIDDEN actions**:
- Never drop tables or run destructive SQL directly
- Never force-push to main
- Never interact with repos/teams outside Bao Gia scope
- Never commit `.env`, API keys, or secrets

## Agent Team Conventions

When running agent teams:
- Stop agents after 15 minutes if not done
- Prefer direct work over background agents for tasks < 10 minutes
- Always push all 3 repos after commits
- Don't ask for confirmation on simple commands (ls, curl, git status)

## currentDate
Today's date is 2026-02-22.
