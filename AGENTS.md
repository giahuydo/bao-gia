# Bao Gia — Agent Instructions (Codex / Code Agents)

This file is for autonomous code agents (Codex, Devin, etc.) working on the Bao Gia project.

## Project Overview

Quotation management system: NestJS backend (port 4001) + Next.js frontend (port 4000) + PostgreSQL.

## Session Coordination Protocol

Multiple agents may work on this codebase simultaneously. Follow these rules:

### File Lock Convention
Before modifying a file that other agents may also be working on:
1. Check if the file has recent uncommitted changes: `git diff --name-only`
2. If another agent is actively modifying the same file, coordinate via task list or wait
3. Prefer working on separate modules to avoid merge conflicts

### Claiming Work
- Always check the task list before starting work
- Claim tasks by setting yourself as owner before starting
- Mark tasks as completed when done
- If blocked, create a blocking task and move to the next available work

## Permissions

### ALLOWED
- Read any file in the repository
- Create/edit files in `backend/src/`, `frontend/`, `shared/`
- Run tests: `npm test`, `npx jest`, `npm run test:e2e`
- Run builds: `npm run build`
- Run dev servers: `npm run start:dev`, `npm run dev`
- Create git commits and branches
- Install npm packages (dev or production)

### FORBIDDEN
- Do NOT modify `.env` files or commit secrets
- Do NOT run database migrations without explicit approval
- Do NOT modify CI/CD pipeline configs
- Do NOT push to `main` branch directly (use feature branches)
- Do NOT delete or force-push any branch
- Do NOT interact with external services (Linear, GitHub PRs) — leave that to the team lead

## Architecture Quick Reference

### Backend (NestJS)
```
backend/src/
├── modules/
│   ├── ai/           # Claude API integration, token tracking
│   ├── ingestion/    # Document upload & AI extraction
│   ├── webhooks/     # n8n callback handlers
│   ├── quotations/   # CRUD for quotations
│   ├── customers/    # Customer management
│   └── products/     # Product catalog
├── common/
│   └── guards/       # ServiceAuthGuard, WebhookSecretGuard
└── database/
    └── entities/     # TypeORM entities
```

### Frontend (Next.js)
```
frontend/
├── app/              # App Router pages
├── components/       # Reusable UI (shadcn/ui based)
├── hooks/            # Custom React hooks (use-*.ts)
├── lib/              # API services, utilities
└── types/            # TypeScript types
```

### Shared Types
```
shared/
├── types/            # Entity interfaces (quotation, customer, product)
└── constants/        # Enums (quotation-status, currencies)
```

**Rule**: Always import from `shared/` for cross-boundary types. Never redefine types locally.

## Coding Conventions

### Backend
- Controllers -> Services -> Repositories (TypeORM)
- DTOs with `class-validator` decorators for ALL input validation
- Use NestJS dependency injection — never `new Service()`
- File naming: `*.controller.ts`, `*.service.ts`, `*.entity.ts`, `*.dto.ts`, `*.module.ts`
- Colocate tests: `*.spec.ts` next to source files
- Use NestJS exceptions (`NotFoundException`, `BadRequestException`)

### Frontend
- Functional components only, strict TypeScript (no `any`)
- `"use client"` only when needed (event handlers, hooks, browser APIs)
- Default to Server Components for data fetching
- Use `cn()` for conditional classNames (shadcn pattern)

### Database
- Table names: snake_case, plural (`quotations`, `quotation_items`)
- Use `uuid` primary keys
- Always set `onDelete` on relations
- Never modify existing migrations — create new ones

### Testing
- Backend: Jest with NestJS testing module, mock repositories with `jest.fn()`
- Frontend: Playwright for E2E (`frontend/e2e/`)
- Mock external services (Anthropic SDK, n8n) — never call real APIs in tests
- Anthropic SDK mock pattern: use `__esModule: true` with `default:` key

## Business Domain Rules

### Quotation Status Flow
```
draft -> sent -> accepted
                -> rejected
                -> expired
```
- New quotations start as `draft`
- Only `draft` can be edited
- `sent` quotations are read-only

### Key Entities
| Entity | Table | Notes |
|--------|-------|-------|
| Quotation | `quotations` | Main entity, has items/history |
| QuotationItem | `quotation_items` | Line items with unit price |
| QuotationHistory | `quotation_histories` | Audit trail (created, sent, ai_extracted, etc.) |
| Customer | `customers` | Company/individual info |
| Product | `products` | Product catalog for quick-add |
| TokenUsage | `token_usages` | AI cost tracking per request |
| N8nExecutionLog | `n8n_execution_logs` | Workflow execution audit |

### Currency
- Default: VND (Vietnamese Dong)
- Optional: USD
- All prices stored as integers (no floating point)

## Git Conventions

- Commit prefix: `feat(backend):`, `fix(frontend):`, `chore:`, `test:`, `docs:`
- Keep commits focused (one feature/fix per commit)
- 3 repos: monorepo root, `backend/`, `frontend/` — all must be pushed together
