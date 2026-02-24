# Bao Gia — System Architecture

> Last updated: 2026-02-24
> Project status: Greenfield — actively being built.

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Backend Module Dependency Graph](#2-backend-module-dependency-graph)
3. [Database ER Diagram](#3-database-er-diagram)
4. [Authentication & Authorization Flow](#4-authentication--authorization-flow)
5. [Quotation Lifecycle State Machine](#5-quotation-lifecycle-state-machine)
6. [AI Pipeline Flow](#6-ai-pipeline-flow)
7. [Multi-Tenancy Model](#7-multi-tenancy-model)
8. [Directory Structure](#8-directory-structure)

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                       │
│                                                                         │
│   Browser / Telegram Bot                                                │
└──────────────┬──────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Frontend — Next.js 16       │
│  Port 4000                   │
│                              │
│  App Router (src/app/)       │
│  - /login, /register         │
│  - /quotations               │
│  - /workflows  (n8n iframe)  │
│                              │
│  State: React Query          │
│  Forms: react-hook-form+zod  │
│  UI: shadcn/ui + Tailwind v4 │
└──────────────┬───────────────┘
               │ HTTP/REST  Bearer JWT
               │ NEXT_PUBLIC_API_URL (default: http://localhost:4001/api)
               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Backend — NestJS 10                                                     │
│  Port 4001  |  Global prefix: /api  |  Swagger: /api/docs               │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Guards: JwtAuthGuard  RolesGuard  ServiceAuthGuard             │    │
│  │          WebhookSecretGuard                                      │    │
│  │  Middleware: CorrelationIdMiddleware                             │    │
│  │  Interceptor: TransformInterceptor  TenantInterceptor           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  22 Feature Modules (see section 2)                                      │
│  TypeORM  |  24 Entities  |  EventEmitter                               │
│  Sentry error tracking                                                   │
└──────────┬────────────────────────────────────┬──────────────────────────┘
           │ TypeORM (pg driver)                │ HTTP  X-Service-Key /
           │                                    │       X-Webhook-Secret
           ▼                                    ▼
┌───────────────────────┐         ┌────────────────────────────────────────┐
│  PostgreSQL 15        │         │  n8n Workflow Engine                   │
│  Port 5432            │         │  Port 5679                             │
│  Database: bao_gia    │         │                                        │
│  24 tables            │         │  Workflows:                            │
│                       │         │  - Vendor Quotation Ingestion          │
│  (main application DB)│         │  - Quotation Delivery (email)          │
└───────────────────────┘         │  - Scheduled Expiration Check          │
                                  │  - Price Monitoring                    │
                                  │  - Batch Processing                    │
                                  │                                        │
                                  │  Own PostgreSQL (port not exposed)     │
                                  └──────────┬─────────────────────────────┘
                                             │ HTTPS
                                             ▼
                                  ┌──────────────────────┐
                                  │  Anthropic Claude API │
                                  │  claude-sonnet-4-*   │
                                  │  (AI operations)     │
                                  └──────────────────────┘

External integrations:
  - Telegram Bot API  (nestjs-telegraf — price alerts, quotation notifications)
  - Sentry            (error tracking, both frontend and backend)
  - Email SMTP        (via n8n — quotation delivery)
```

**Key design decisions:**
- Frontend calls NestJS directly (not through n8n).
- n8n is backend-to-backend only: orchestrates multi-step workflows, never stores business data.
- All AI calls go through NestJS `AiService` — n8n never calls Claude directly.
- All DB writes go through NestJS — n8n never writes SQL directly.

See [n8n Architecture](./n8n-architecture.md) for detailed workflow designs.

---

## 2. Backend Module Dependency Graph

The backend has **22 feature modules** registered in `AppModule`.

```
AppModule
│
├── Infrastructure (no business deps)
│   ├── ConfigModule (global)
│   ├── TypeOrmModule (global, 24 entities)
│   ├── EventEmitterModule (global)
│   ├── SentryModule
│   ├── N8nTriggerModule ──────────────────────► ConfigService
│   └── HealthModule
│
├── Core Auth & Users
│   ├── AuthModule ────────────────────────────► UsersModule, JwtModule, PassportModule
│   └── UsersModule ───────────────────────────► User entity
│
├── Organization & Multi-Tenancy
│   └── OrganizationsModule ───────────────────► Organization, OrganizationMember entities
│
├── Quotation Domain
│   ├── QuotationsModule ──────────────────────► Quotation, QuotationItem, QuotationHistory
│   │                                            Customer, Product entities
│   ├── CustomersModule ───────────────────────► Customer entity
│   ├── ProductsModule ────────────────────────► Product entity
│   ├── TemplatesModule ───────────────────────► Template entity
│   ├── CurrenciesModule ──────────────────────► Currency entity
│   ├── CompanySettingsModule ─────────────────► CompanySettings entity
│   └── AttachmentsModule ─────────────────────► Attachment entity
│
├── AI & Ingestion
│   ├── AiModule ──────────────────────────────► TokenUsage, Organization entities
│   │                                            ConfigService (ANTHROPIC_API_KEY)
│   │                                            TokenTrackingService
│   ├── IngestionModule ───────────────────────► IngestionJob, FileChecksumCache entities
│   │                                            AiModule (AI extraction)
│   └── JobsModule ────────────────────────────► IngestionJob entity
│
├── Webhooks & Integration
│   ├── WebhooksModule ────────────────────────► Quotation, QuotationHistory, N8nExecutionLog
│   │                                            IngestionJob entities
│   │                                            QuotationsModule, PriceMonitoringModule
│   └── N8nTriggerModule ──────────────────────► ConfigService (N8N_BASE_URL, N8N_SERVICE_KEY)
│
├── Workflow & Approval
│   ├── VersioningModule ──────────────────────► QuotationVersion entity
│   ├── ReviewsModule ─────────────────────────► ReviewRequest entity
│   └── PromptsModule ─────────────────────────► AiPromptVersion entity
│
├── Domain Knowledge
│   ├── GlossaryModule ────────────────────────► GlossaryTerm entity
│   └── RulesModule ───────────────────────────► RuleSet entity
│
├── Price Monitoring
│   └── PriceMonitoringModule ─────────────────► PriceMonitoringJob, PriceAlert, PriceRecord
│                                                N8nTriggerService
│
└── Notifications
    └── TelegramModule ────────────────────────► ConfigService (TELEGRAM_BOT_TOKEN)
                                                 TelegramNotificationService
                                                 QuotationsModule, ReviewsModule
```

### Module Summary Table

| # | Module | Endpoint Prefix | Key Entities | Auth |
|---|--------|-----------------|--------------|------|
| 1 | auth | /auth | User | Public (login/register), JWT (profile) |
| 2 | users | /users | User | JWT + Admin role |
| 3 | organizations | /organizations | Organization, OrganizationMember | JWT |
| 4 | quotations | /quotations | Quotation, QuotationItem | JWT |
| 5 | customers | /customers | Customer | JWT |
| 6 | products | /products | Product | JWT |
| 7 | templates | /templates | Template | JWT |
| 8 | currencies | /currencies | Currency | JWT + Admin (write) |
| 9 | company-settings | /company-settings | CompanySettings | JWT |
| 10 | attachments | /quotations/:id/attachments | Attachment | JWT |
| 11 | ai | /ai | TokenUsage, AiPromptVersion | JWT |
| 12 | ingestion | /ingestion | IngestionJob, FileChecksumCache | ServiceAuthGuard |
| 13 | webhooks | /webhooks/n8n | N8nExecutionLog, QuotationHistory | WebhookSecretGuard |
| 14 | jobs | /jobs/ingestion | IngestionJob | JWT |
| 15 | versioning | /quotations/:id/versions | QuotationVersion | JWT |
| 16 | reviews | /reviews | ReviewRequest | JWT |
| 17 | prompts | /prompts | AiPromptVersion | JWT |
| 18 | glossary | /glossary | GlossaryTerm | JWT |
| 19 | rules | /rules | RuleSet | JWT |
| 20 | price-monitoring | /price-monitoring | PriceMonitoringJob, PriceAlert, PriceRecord | JWT |
| 21 | telegram | (Telegram Bot) | — | ChatIdGuard |
| 22 | health | /health | — | Public |

---

## 3. Database ER Diagram

See [Database Schema](./database-schema.md) for full field-level documentation.

```
CORE
─────────────────────────────────────────────────────────────────

  organizations ──────────────────────────────────────────────────┐
  ├── id (PK)                                                      │
  ├── name (UNIQUE)                                                │
  ├── slug (UNIQUE)                                               │
  ├── plan (free|starter|professional|enterprise)                  │
  └── monthly_token_limit                                          │
                                                                  │ FK organization_id (CASCADE)
  users                                                            │
  ├── id (PK)                                                      │
  ├── email (UNIQUE)                                              │
  └── role (admin|manager|sales)                                  │
                                                                   │
  organization_members (junction)                                  │
  ├── id (PK)                                                      │
  ├── user_id ────────────────────────────────► users.id          │
  ├── organization_id ──────────────────────── organizations.id ◄─┘
  ├── role (owner|admin|manager|member)
  └── UNIQUE(user_id, organization_id)


QUOTATION DOMAIN
─────────────────────────────────────────────────────────────────

  currencies
  ├── id (PK)
  └── code (UNIQUE, 3 chars)

  customers ──────────────── organization_id ──► organizations.id
  ├── id (PK)
  └── (soft-delete: deleted_at)

  products ───────────────── organization_id ──► organizations.id
  ├── id (PK)                currency_id ──────► currencies.id
  └── (no soft-delete)

  templates ──────────────── organization_id ──► organizations.id
  ├── id (PK)
  ├── items (JSONB)
  └── (no soft-delete)

  company_settings ────────── organization_id ──► organizations.id
  ├── id (PK)
  └── UNIQUE(organization_id)  [one per org]

  quotations ─────────────── organization_id ──► organizations.id
  ├── id (PK)                 customer_id ──────► customers.id
  ├── quotation_number (UNIQUE) currency_id ────► currencies.id
  ├── status (draft|sent|accepted|rejected|expired) template_id ► templates.id
  ├── version (optimistic lock) created_by ─────► users.id
  └── (soft-delete: deleted_at)
       │
       ├──[1:N]── quotation_items
       │           ├── id (PK)
       │           ├── quotation_id ────────────► quotations.id (CASCADE)
       │           └── product_id (nullable) ───► products.id
       │
       ├──[1:N]── attachments
       │           ├── id (PK)
       │           ├── quotation_id ────────────► quotations.id (CASCADE)
       │           ├── organization_id ─────────► organizations.id
       │           └── uploaded_by ─────────────► users.id
       │
       ├──[1:N]── quotation_history
       │           ├── id (PK)
       │           ├── quotation_id ────────────► quotations.id (CASCADE)
       │           ├── action (enum HistoryAction)
       │           ├── changes (JSONB)
       │           └── performed_by ────────────► users.id
       │
       └──[1:N]── quotation_versions
                   ├── id (PK)
                   ├── quotation_id ────────────► quotations.id (CASCADE)
                   ├── version_number (int)
                   ├── snapshot (JSONB)
                   ├── created_by ──────────────► users.id
                   └── UNIQUE(quotation_id, version_number)


AI & INGESTION
─────────────────────────────────────────────────────────────────

  ai_prompt_versions
  ├── id (PK)
  ├── type (extract|translate|generate|suggest|improve|compare)
  ├── version_number (int)
  ├── system_prompt (TEXT)
  ├── user_prompt_template (TEXT)
  └── UNIQUE(type, version_number)

  token_usage
  ├── id (PK)
  ├── quotation_id (nullable)
  ├── user_id (nullable)
  ├── tenant_id (nullable)
  ├── operation (enum AiOperation)
  └── cost_usd (decimal)

  ingestion_jobs ──────────── organization_id ──► organizations.id
  ├── id (PK)
  ├── attachment_id
  ├── status (pending→extracting→translating→normalizing→review_pending→completed|failed|dead_letter)
  ├── extract_result (JSONB)
  ├── translate_result (JSONB)
  ├── normalize_result (JSONB)
  └── file_checksum (for dedup lookup)

  file_checksum_cache ─────── organization_id ──► organizations.id
  ├── id (PK)
  ├── checksum (length 64)
  ├── extract_result (JSONB)
  ├── translate_result (JSONB)
  ├── expires_at
  └── UNIQUE(checksum, organization_id)

  n8n_execution_log
  ├── id (PK)
  ├── execution_id (indexed)
  ├── status (success|failed|partial)
  ├── payload (JSONB)
  └── correlation_id (indexed)


AUDIT & WORKFLOW
─────────────────────────────────────────────────────────────────

  review_requests ─────────── organization_id ──► organizations.id
  ├── id (PK)               quotation_id (nullable) ► quotations.id
  ├── type (ingestion|status_change|price_override|comparison)
  ├── status (pending|approved|rejected|revision_requested)
  ├── payload (JSONB)
  ├── proposed_data (JSONB)
  ├── reviewer_changes (JSONB)
  ├── requested_by ───────────────────────────► users.id
  ├── assigned_to (nullable) ─────────────────► users.id
  └── reviewed_by (nullable) ─────────────────► users.id


DOMAIN RULES
─────────────────────────────────────────────────────────────────

  rule_sets ───────────────── organization_id ──► organizations.id
  ├── id (PK)
  ├── category (lab|biotech|icu|analytical|general)
  ├── rules (JSONB array of rule objects)
  └── UNIQUE(organization_id, category)

  glossary_terms ──────────── organization_id ──► organizations.id
  ├── id (PK)
  ├── source_term, target_term
  ├── source_language (default 'en'), target_language (default 'vi')
  └── UNIQUE(organization_id, source_term)


PRICE MONITORING
─────────────────────────────────────────────────────────────────

  price_monitoring_jobs ────── organization_id ──► organizations.id
  ├── id (PK)
  ├── status (pending|running|completed|failed|partial)
  └── trigger_type (manual|scheduled)
       │
       ├──[1:N]── price_alerts
       │           ├── id (PK)
       │           ├── job_id ─────────────────► price_monitoring_jobs.id (CASCADE)
       │           ├── organization_id ─────────► organizations.id
       │           ├── product_id
       │           └── severity (info|warning|critical)
       │
       └──[1:N]── price_records
                   ├── id (PK)
                   ├── job_id ──────────────────► price_monitoring_jobs.id (CASCADE)
                   └── product_id
```

---

## 4. Authentication & Authorization Flow

### JWT Authentication

```
Client                    NestJS Backend              Database
  │                            │                          │
  │── POST /auth/login ────────►│                          │
  │   { email, password }       │── SELECT user ──────────►│
  │                            │◄── User record ──────────│
  │                            │── bcrypt.compare()        │
  │                            │── jwt.sign({ sub, email, role })
  │◄── { access_token } ───────│                          │
  │                            │                          │
  │── GET /quotations ─────────►│                          │
  │   Authorization: Bearer <token>  │                    │
  │                            │── JwtAuthGuard.canActivate()
  │                            │   jwt.verify(token)      │
  │                            │   @CurrentUser() → req.user
  │                            │── RolesGuard (if @Roles() present)
  │                            │   check user.role ∈ required roles
  │                            │── Controller handler     │
  │◄── 200 { data }────────────│                          │
```

### Service-to-Service Auth (n8n → Backend)

```
n8n Workflow               NestJS Backend
  │                             │
  │── POST /api/ingestion/extract ►│
  │   X-Service-Key: <key>       │── ServiceAuthGuard.canActivate()
  │                             │   compare header with N8N_SERVICE_KEY env
  │                             │   if match → allow, set system actor
  │◄── 200 { extractedData } ───│
```

### Webhook Auth (n8n → Backend callbacks)

```
n8n (callback)             NestJS Backend
  │                             │
  │── POST /api/webhooks/n8n/quotation-processed ►│
  │   X-Webhook-Secret: <secret>│── WebhookSecretGuard.canActivate()
  │                             │   compare header with N8N_WEBHOOK_SECRET env
  │◄── 200 OK ─────────────────│
```

### Guard Priority Chain

```
Every request:
  CorrelationIdMiddleware → assigns X-Correlation-ID
      │
      ▼
  JwtAuthGuard (most endpoints)
      │── valid JWT → populate req.user
      │── missing/invalid → 401 Unauthorized
      ▼
  RolesGuard (endpoints with @Roles() decorator)
      │── user.role in required roles → pass
      │── otherwise → 403 Forbidden
      ▼
  Controller handler
```

### Roles & Permissions

| Role | Can Do |
|------|--------|
| admin | All operations, manage users, manage currencies, view all orgs |
| manager | Quotation CRUD, customer/product management, approve reviews |
| sales | Create/view own quotations, read customers/products |

---

## 5. Quotation Lifecycle State Machine

```
                    ┌─────────┐
                    │         │
              ┌────►│  DRAFT  │◄────────────────────────────┐
              │     │         │                             │
              │     └────┬────┘                             │
              │          │                                  │
              │    (user sends           (create new version│
              │     to customer)          from sent quote)  │
              │          │                                  │
              │          ▼                                  │
              │     ┌─────────┐                             │
              │     │         │                             │
              │     │  SENT   │─────────────────────────────┘
              │     │         │   (read-only — snapshot taken)
              │     └────┬────┘
              │          │
              │    ┌─────┴──────┐
              │    │            │
              │    ▼            ▼
              │ ┌──────────┐ ┌──────────┐
              │ │ ACCEPTED │ │ REJECTED │
              │ └──────────┘ └──────────┘
              │
              │    ┌───────────────┐
              │    │ Cron job/n8n  │
              └────┤   EXPIRED     │◄── valid_until < today AND status = sent
                   └───────────────┘

Rules:
  - New quotations always start as DRAFT
  - Only DRAFT quotations can be edited (items, prices, terms)
  - SENT quotations are read-only — create a QuotationVersion to modify
  - ACCEPTED / REJECTED are terminal states
  - EXPIRED is set by scheduled n8n job (daily cron)
  - QuotationVersion snapshot is created when status changes from DRAFT → SENT
  - QuotationHistory records every state transition
```

### Status Transition Table

| From | To | Allowed By | Action |
|------|----|------------|--------|
| DRAFT | SENT | Any user with edit access | PATCH /:id/status |
| DRAFT | REJECTED | Any user | PATCH /:id/status |
| SENT | ACCEPTED | Customer response / manager | PATCH /:id/status |
| SENT | REJECTED | Customer response / manager | PATCH /:id/status |
| SENT | EXPIRED | n8n scheduled job | PATCH /:id/status |
| any | DRAFT | Duplicate action | POST /:id/duplicate |

---

## 6. AI Pipeline Flow

### Direct AI Operations (frontend → backend → Claude)

```
Frontend                NestJS AiModule              Claude API
  │                          │                           │
  │── POST /ai/generate-quotation ►│                    │
  │── POST /ai/suggest-items ──────►│                   │
  │── POST /ai/improve-description ►│                   │
  │── POST /ai/compare ────────────►│                   │
  │                          │── AiService.call()        │
  │                          │   1. Load active AiPromptVersion for operation
  │                          │   2. Build system prompt + user prompt
  │                          │── client.messages.create()►│
  │                          │◄── { content, usage } ────│
  │                          │── Parse response JSON      │
  │                          │── TokenTrackingService.track()
  │                          │   INSERT token_usage record
  │◄── 200 { result } ───────│                           │
```

### Document Ingestion Pipeline (n8n → backend → Claude)

```
n8n Workflow                NestJS                     Claude API
  │                            │                           │
  │                         [file upload via attachment endpoint]
  │                            │                           │
  │── POST /api/ingestion/extract ►│                      │
  │   X-Service-Key header     │                           │
  │   { attachmentId }         │── AiService.extract()    │
  │                            │   Load extract prompt     │
  │                            │── claude.messages.create()►│
  │                            │◄── { items, vendor, prices }│
  │                            │── Check FileChecksumCache (dedup)
  │                            │── Track token_usage       │
  │◄── { extractedData } ──────│                           │
  │                            │                           │
  │── POST /api/ingestion/translate ►│                    │
  │   { extractedData }        │── AiService.translate()  │
  │                            │   Load translate prompt   │
  │                            │   Apply GlossaryTerms     │
  │                            │── claude.messages.create()►│
  │                            │◄── { translated Vietnamese }│
  │◄── { translatedData } ─────│                           │
  │                            │                           │
  │── POST /api/ingestion/normalize ►│                    │
  │   { translatedData }       │── IngestionService.normalize()
  │                            │   Match products by name  │
  │                            │   Apply RuleSet           │
  │                            │   Validate units/prices   │
  │◄── { normalizedItems } ────│                           │
  │                            │                           │
  │── POST /quotations ────────►│                          │
  │   { status: "draft", items }│── Create Quotation      │
  │◄── { quotation } ──────────│                           │
  │                            │                           │
  │── POST /webhooks/n8n/quotation-processed ►│           │
  │   X-Webhook-Secret header  │── Update IngestionJob    │
  │                            │── Insert QuotationHistory │
```

### Token Usage Tracking

All AI operations track token usage:

```
AiService (after every Claude call):
  INSERT token_usage {
    operation,           -- generate | suggest | improve | extract | translate | compare
    model,               -- claude-sonnet-4-20250514
    input_tokens,
    output_tokens,
    total_tokens,
    cost_usd,            -- calculated: input * $3/M + output * $15/M
    quotation_id,        -- nullable
    user_id,             -- nullable
    tenant_id,           -- nullable (future multi-tenant)
    prompt_version_id,   -- which AiPromptVersion was active
  }
```

---

## 7. Multi-Tenancy Model

### Current State (Greenfield)

The codebase has multi-tenancy infrastructure scaffolded but not fully enforced in all services. The entities have `organizationId` columns, but the query-level scoping is being built progressively.

### Data Isolation Strategy

Every major entity is scoped by `organizationId`:

```
organizations (1)
     │
     ├─── organization_members (N) ── users (N)    [who can access this org]
     │
     ├─── customers (N)                             [org-scoped]
     ├─── products (N)                              [org-scoped]
     ├─── templates (N)                             [org-scoped]
     ├─── quotations (N)                            [org-scoped]
     ├─── company_settings (1)                      [one per org]
     ├─── attachments (N)                           [org-scoped]
     ├─── ingestion_jobs (N)                        [org-scoped]
     ├─── file_checksum_cache (N)                   [org-scoped, dedup per org]
     ├─── review_requests (N)                       [org-scoped]
     ├─── rule_sets (N)                             [org-scoped]
     ├─── glossary_terms (N)                        [org-scoped]
     └─── price_monitoring_jobs (N)                 [org-scoped]
```

### Organization Member Roles

| Role | Scope | Typical User |
|------|-------|--------------|
| owner | Full control of the organization | Founder/CEO |
| admin | Manage members, settings, all data | IT admin |
| manager | Approve quotations, manage teams | Sales manager |
| member | Create and view own quotations | Sales rep |

Note: `OrgMemberRole` (organization-level) is distinct from `UserRole` (system-level: admin/manager/sales).

### Organization Plans

| Plan | Monthly Token Limit | Description |
|------|--------------------|-|
| free | 100,000 tokens | Trial |
| starter | 1,000,000 tokens | Small team |
| professional | 5,000,000 tokens | Growing business |
| enterprise | Unlimited | Large organizations |

### TenantInterceptor

`TenantInterceptor` extracts the `organizationId` from the JWT user context and stores it in `TenantContext` (request-scoped Injectable), allowing TypeORM repositories to scope queries automatically.

---

## 8. Directory Structure

```
/Bao Gia (monorepo root)
├── docker-compose.yml           # Backend + Frontend + PostgreSQL
├── docker-compose.n8n.yml       # n8n + its own PostgreSQL
├── CLAUDE.md                    # AI agent instructions
│
├── shared/                      # Shared types & constants (both backend + frontend import here)
│   ├── types/
│   │   ├── index.ts             # Barrel re-export
│   │   ├── common.ts            # PaginatedResponse, ApiResponse, SortOrder
│   │   ├── user.ts              # IUser, UserRole, ILoginRequest/Response
│   │   ├── customer.ts          # ICustomer
│   │   ├── product.ts           # IProduct
│   │   ├── quotation.ts         # IQuotation, IQuotationItem, QuotationStatus
│   │   ├── organization.ts      # IOrganization, OrgMemberRole, CRUD types
│   │   ├── job.ts               # IIngestionJob, JobStatus
│   │   ├── review.ts            # IReviewRequest, ReviewType, ReviewStatus
│   │   ├── version.ts           # IQuotationVersion, VersionDiff
│   │   ├── ai.ts                # AiOperation, IAiPromptVersion, CompareResult
│   │   ├── glossary.ts          # IGlossaryTerm
│   │   ├── rule.ts              # IRuleSet, RuleCategory
│   │   ├── price-monitoring.ts  # IPriceMonitoringJob, IPriceAlert, IPriceRecord
│   │   └── dashboard.ts         # DashboardResponse
│   └── constants/
│       ├── quotation-status.ts  # QUOTATION_STATUS_LABELS, OPTIONS
│       ├── currencies.ts        # DEFAULT_CURRENCY_CODE, CURRENCY_CODES
│       └── organization-plans.ts # ORGANIZATION_PLANS, TOKEN limits
│
├── backend/                     # NestJS 10 API
│   ├── src/
│   │   ├── main.ts              # Bootstrap: port 4001, global pipes/filters
│   │   ├── app.module.ts        # Root module, imports all 22 feature modules
│   │   ├── config/
│   │   │   └── configuration.ts # Typed config from env vars
│   │   ├── database/
│   │   │   ├── entities/        # 24 TypeORM entity files + index.ts
│   │   │   ├── migrations/      # TypeORM migration files
│   │   │   └── seeds/           # Database seed data
│   │   ├── common/
│   │   │   ├── guards/          # JwtAuthGuard, RolesGuard, ServiceAuthGuard, WebhookSecretGuard
│   │   │   ├── decorators/      # @Roles(), @CurrentUser()
│   │   │   ├── interceptors/    # TransformInterceptor, TenantInterceptor
│   │   │   ├── middleware/      # CorrelationIdMiddleware
│   │   │   └── services/        # EncryptionService, N8nTriggerService, TenantContext
│   │   └── modules/             # 22 feature modules
│   │       ├── auth/            # JWT login/register/profile
│   │       ├── users/           # User management (admin)
│   │       ├── organizations/   # Multi-tenant org management
│   │       ├── quotations/      # Core quotation CRUD + PDF export
│   │       ├── customers/       # Customer CRUD
│   │       ├── products/        # Product catalog
│   │       ├── templates/       # Quotation templates
│   │       ├── currencies/      # Multi-currency (admin only write)
│   │       ├── company-settings/# Per-org company settings
│   │       ├── attachments/     # File uploads (max 10MB, disk storage)
│   │       ├── ai/              # Claude API integration + token tracking
│   │       ├── ingestion/       # Doc extraction (called by n8n, ServiceAuthGuard)
│   │       ├── webhooks/        # n8n callbacks (WebhookSecretGuard)
│   │       ├── jobs/            # Async ingestion job management
│   │       ├── versioning/      # Quotation version snapshots
│   │       ├── reviews/         # Approval workflow
│   │       ├── prompts/         # AI prompt versioning
│   │       ├── glossary/        # Translation glossary terms
│   │       ├── rules/           # Domain-specific business rules (JSONB)
│   │       ├── price-monitoring/# Product price tracking via n8n
│   │       ├── telegram/        # Telegram bot (price alerts, quotation notifications)
│   │       └── health/          # Health check endpoint
│   ├── package.json
│   └── .env                     # Not committed — see env vars in CLAUDE.md
│
├── frontend/                    # Next.js 16 + React 19
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── layout.tsx       # Root layout (AuthProvider, Toaster)
│   │   │   ├── page.tsx         # Redirect to /quotations
│   │   │   ├── login/           # Login page
│   │   │   ├── register/        # Registration page
│   │   │   ├── quotations/      # Quotation list + detail pages
│   │   │   └── workflows/       # n8n iframe page
│   │   ├── components/          # React components
│   │   │   ├── navbar.tsx       # Top navigation
│   │   │   ├── quotation-list.tsx
│   │   │   ├── quotation-table-actions.tsx
│   │   │   ├── quotation-status-badge.tsx
│   │   │   └── ui/              # shadcn/ui components
│   │   ├── hooks/               # React Query hooks (use-quotations, use-customers, etc.)
│   │   ├── lib/
│   │   │   ├── auth.tsx         # AuthContext + AuthProvider
│   │   │   ├── api.ts           # Axios instance + interceptors
│   │   │   └── api/             # API service functions per domain
│   │   ├── types/
│   │   │   └── index.ts         # Re-exports from @shared/types
│   │   └── middleware.ts        # Next.js middleware — cookie-based auth redirect
│   ├── next.config.ts           # Webpack @shared alias, externalDir
│   └── package.json
│
└── docs/                        # Architecture documentation
    ├── architecture.md          # This file
    ├── database-schema.md       # Full schema reference
    ├── n8n-architecture.md      # n8n workflow design (detailed)
    ├── tech-stack.md            # Technology choices
    └── roadmap/                 # Phase evaluation reports
```

---

## Cross-References

- [Database Schema](./database-schema.md) — full field-level entity documentation
- [n8n Architecture](./n8n-architecture.md) — workflow design, retry policies, security
- [Tech Stack](./tech-stack.md) — technology choices and rationale
