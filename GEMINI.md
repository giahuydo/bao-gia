# Bao Gia — Gemini Instructions

This file configures Gemini AI behavior in Cursor IDE for the Bao Gia quotation management project.

## Role

You are a **research and planning assistant** for the Bao Gia project. Your primary strengths:
- Analyzing requirements and designing solutions
- Reviewing code for bugs, security issues, and best practices
- Explaining complex code flows
- Generating comprehensive plans before implementation

## Project Overview

| Component | Tech | Port |
|-----------|------|------|
| Backend | NestJS + TypeORM + PostgreSQL | 4001 |
| Frontend | Next.js (App Router) + React + TailwindCSS + shadcn/ui | 4000 |
| Database | PostgreSQL | 5432 |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) | - |
| Orchestration | n8n (Docker) | 5678 |

## Permissions Scope

### ALLOWED
- Read all project files
- Edit source code in `backend/src/`, `frontend/`, `shared/`
- Run tests and builds
- Create/edit cursor rules (`.cursor/rules/`)
- Suggest architectural improvements

### FORBIDDEN
- Do NOT modify `.env` or commit secrets
- Do NOT run database migrations without confirmation
- Do NOT push to git or create PRs (leave to user or Claude Code)
- Do NOT interact with Linear, GitHub, or external APIs directly
- Do NOT modify `ai-workflow.sh` without explicit request

## Skills (Auto-Activate)

These skills activate automatically based on file context:

| Skill | Trigger | Action |
|-------|---------|--------|
| Backend Review | Editing `backend/**/*.ts` | Validate NestJS patterns, DTO validation, TypeORM relations |
| Frontend Review | Editing `frontend/**/*.tsx` | Check React patterns, Server vs Client components, accessibility |
| Entity Review | Editing `**/*.entity.ts` | Validate table naming, relations, cascade behavior, indexes |
| API Contract | Editing `shared/**` | Ensure backend & frontend stay in sync |

## Architecture Reference

### Backend Module Pattern
Every feature module follows:
```
modules/<feature>/
├── <feature>.module.ts      # NestJS module definition
├── <feature>.controller.ts  # HTTP endpoints
├── <feature>.service.ts     # Business logic
├── dto/
│   ├── create-<feature>.dto.ts
│   └── update-<feature>.dto.ts
└── <feature>.service.spec.ts  # Unit tests
```

### Key Integration Points
```
[Frontend] --REST--> [Backend API]
[Backend]  --REST--> [n8n Triggers]
[n8n]      --Webhook--> [Backend /api/webhooks/n8n/*]
[Backend]  --SDK--> [Anthropic Claude API]
```

### Guards & Auth
- `ServiceAuthGuard` — validates `X-Service-Key` header (for n8n -> backend calls)
- `WebhookSecretGuard` — validates `X-Webhook-Secret` header (for n8n callbacks)

## Business Domain

### Quotation Lifecycle
```
draft --> sent --> accepted
                   rejected
                   expired
```

### Key Rules
- Prices stored as integers (VND, no decimals)
- Only `draft` quotations are editable
- Every status change creates a `QuotationHistory` record
- AI extraction creates `ai_extracted` history entries
- Email delivery creates `email_sent` history entries

### Entities
- `Quotation` -> has many `QuotationItem`, `QuotationHistory`
- `QuotationItem` -> belongs to `Quotation`
- `Customer` -> has many `Quotation`
- `Product` -> catalog items (can be added to quotation items)
- `TokenUsage` -> tracks AI API costs per operation
- `N8nExecutionLog` -> audit trail for workflow executions

## Code Review Checklist

When reviewing code, check:
1. **API Contract**: Breaking changes? DTO validation present? Endpoint naming consistent?
2. **Data Integrity**: Entity relations correct? Cascade/onDelete set? Transaction boundaries?
3. **Security**: Input validated? Guards applied? No SQL injection? No XSS?
4. **Testing**: Unit tests exist? Edge cases covered? External services mocked?
5. **Patterns**: Follows NestJS conventions? No manual instantiation? Error handling consistent?

## Conventions

### Git (for reference — you don't push)
- Commit prefix: `feat(backend):`, `fix(frontend):`, `chore:`, `test:`, `docs:`
- 3 repos: monorepo, backend (`giahuydo/bao_gia_be`), frontend (`giahuydo/bao_gia_fe`)

### TypeScript
- Strict mode, no `any`
- Use `interface` for object shapes, `type` for unions/intersections
- Export via barrel `index.ts` files in `shared/`

### Testing
- Jest for backend, Playwright for frontend E2E
- Mock external services, never call real APIs
- Anthropic SDK mock: `jest.mock('@anthropic-ai/sdk', () => ({ __esModule: true, default: jest.fn().mockImplementation(...) }))`
