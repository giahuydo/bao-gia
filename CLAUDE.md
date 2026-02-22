# Bao Gia (Quotation Management)

NestJS backend + Next.js frontend + PostgreSQL. Multi-tenant SaaS for managing quotations with AI-powered document ingestion.

## Ports

| Service    | Port |
|------------|------|
| Frontend   | 4000 |
| Backend    | 4001 |
| PostgreSQL | 5432 |

---

## Backend (`backend/`)

NestJS 10 API. TypeORM + PostgreSQL. Runs on port **4001**.

### Commands
- `npm run start:dev` -- Start dev server
- `npm run build` -- Build
- `npm test` -- Run all tests
- `npx jest --testPathPattern="<pattern>"` -- Run specific tests
- `npm run migration:generate -- src/database/migrations/<Name>` -- Generate migration
- `npm run migration:run` -- Run pending migrations
- `npm run seed` -- Seed database

### Key Patterns
- Controllers -> Services -> Repositories (TypeORM)
- DTOs with class-validator decorators for input validation
- Global ValidationPipe: whitelist, forbidNonWhitelisted, transform, implicitConversion
- Global prefix: `/api`
- CORS origin: `http://localhost:4000`
- Swagger docs at `/api/docs`

### Modules (`src/modules/`)

| Module | Purpose | Key Endpoints |
|--------|---------|---------------|
| **auth** | JWT auth (register/login/profile) | `POST /auth/register`, `POST /auth/login`, `GET /auth/profile` |
| **users** | User management (admin) | `GET /users`, `PATCH /users/:id`, `DELETE /users/:id` |
| **organizations** | Multi-tenant orgs | `POST /organizations`, `GET /organizations`, CRUD + member management |
| **quotations** | Core CRUD + PDF export | `POST/GET/PATCH/DELETE /quotations`, `PATCH /:id/status`, `POST /:id/duplicate`, `GET /:id/pdf` |
| **customers** | Customer CRUD | `POST/GET/PATCH/DELETE /customers` |
| **products** | Product catalog | `POST/GET/PATCH/DELETE /products` |
| **templates** | Quotation templates | CRUD + `POST /:id/apply` |
| **currencies** | Multi-currency | CRUD (admin only) |
| **company-settings** | Org settings | `GET/PUT /company-settings` |
| **attachments** | File uploads (max 10MB) | `POST/GET /quotations/:id/attachments`, `GET /attachments/:id/download` |
| **ai** | Claude API integration | `POST /ai/generate-quotation`, `suggest-items`, `improve-description`, `compare` + usage endpoints |
| **ingestion** | Doc extraction (n8n->backend) | `POST /ingestion/extract`, `/translate`, `/normalize` (X-Service-Key) |
| **webhooks** | n8n callbacks | `POST /webhooks/n8n/quotation-processed`, `/delivery-completed`, `/execution-failed` (X-Webhook-Secret) |
| **versioning** | Quotation versions | `GET/POST /quotations/:id/versions`, compare endpoint |
| **reviews** | Approval workflow | CRUD + approve/reject/request-revision |
| **jobs** | Async ingestion jobs | `POST/GET /jobs/ingestion`, retry endpoint |
| **prompts** | AI prompt versioning | CRUD + activate endpoint |
| **health** | Health check | `GET /health` |

### Guards (`src/common/guards/`)
- **JwtAuthGuard** -- Validates JWT Bearer token (most endpoints)
- **RolesGuard** -- Checks `@Roles()` decorator (admin, manager, sales)
- **WebhookSecretGuard** -- Validates `X-Webhook-Secret` header (n8n callbacks)
- **ServiceAuthGuard** -- Validates `X-Service-Key` header (n8n -> ingestion)

### Decorators (`src/common/decorators/`)
- **@Roles('admin', 'manager')** -- Set required roles
- **@CurrentUser()** -- Inject authenticated user from request

### Database Entities (`src/database/entities/`)

**Core:**
- **User** -- id, email, password(hashed), fullName, role(admin|manager|sales), isActive
- **Organization** -- id, name, slug, plan(free|starter|pro|enterprise), monthlyTokenLimit, anthropicApiKey(encrypted)
- **OrganizationMember** -- userId, organizationId, role(owner|admin|manager|member)

**Quotation Domain:**
- **Quotation** -- quotationNumber(unique), title, customerId, status(draft|sent|accepted|rejected|expired), validUntil, notes, terms, discount, tax, subtotal, total, currencyId, templateId, createdBy, organizationId. Soft-delete. Version column.
- **QuotationItem** -- quotationId(cascade), productId, name, description, unit, quantity, unitPrice, amount, sortOrder
- **Customer** -- name, email, phone, address, taxCode, contactPerson, organizationId. Soft-delete.
- **Product** -- name, description, unit, defaultPrice, category, isActive, currencyId, organizationId
- **Template** -- name, defaultTerms/Notes/Tax/Discount, items(jsonb), isDefault, organizationId
- **Currency** -- code(3char unique), name, symbol, exchangeRate, decimalPlaces, isDefault
- **Attachment** -- quotationId, fileName, originalName, mimeType, fileSize, filePath, uploadedBy
- **CompanySettings** -- per org: companyName, taxCode, address, phone, email, logo, bank info, quotationPrefix('BG')

**AI & Ingestion:**
- **TokenUsage** -- operation(generate|suggest|improve|extract|translate|compare), model, inputTokens, outputTokens, costUsd, quotationId, userId
- **AiPromptVersion** -- type, versionNumber, systemPrompt, userPromptTemplate, model, maxTokens, isActive
- **IngestionJob** -- status(pending|extracting|translating|normalizing|review_pending|completed|failed|dead_letter), extractResult/translateResult/normalizeResult(jsonb), retries, fileChecksum
- **FileChecksumCache** -- checksum, extractResult, translateResult, hitCount, expiresAt (deduplication)
- **N8nExecutionLog** -- workflowName, executionId, status, payload, error

**Audit & Workflow:**
- **QuotationHistory** -- action(created|updated|status_changed|duplicated|pdf_exported|ai_extracted|...), changes(jsonb), performedBy
- **QuotationVersion** -- versionNumber, snapshot(jsonb), changeSummary, createdBy
- **ReviewRequest** -- type(ingestion|status_change|price_override|comparison), status(pending|approved|rejected), payload, assignedTo, reviewedBy

**Domain Rules:**
- **RuleSet** -- category(lab|biotech|icu|analytical|general), rules(jsonb), organizationId
- **GlossaryTerm** -- sourceTerm, targetTerm, sourceLanguage, targetLanguage, category, organizationId

### Environment Variables (.env)
```
PORT=4001
DB_HOST=localhost  DB_PORT=5432  DB_USERNAME=postgres  DB_PASSWORD=postgres  DB_DATABASE=bao_gia
JWT_SECRET=...  JWT_EXPIRATION=7d
ANTHROPIC_API_KEY=...
N8N_SERVICE_KEY=...  N8N_WEBHOOK_SECRET=...  N8N_BASE_URL=http://localhost:5679
ENCRYPTION_KEY=... (AES-256-GCM for org secrets)
```

---

## Frontend (`frontend/`)

Next.js 16 + React 19 + Tailwind CSS v4 + shadcn/ui + Radix UI.

### Commands
- `npm run dev` -- Start dev server (port 4000)
- `npm run build` -- Build
- `npm run test:e2e` -- Playwright E2E tests

### Key Dependencies
- **@tanstack/react-query** -- Server state (60s staleTime, no refetchOnWindowFocus)
- **axios** -- HTTP client
- **react-hook-form** + **@hookform/resolvers** + **zod** -- Forms & validation
- **lucide-react** -- Icons
- **sonner** -- Toast notifications
- **date-fns** -- Date formatting

### Pages (`src/app/`)

| Route | Auth | Description |
|-------|------|-------------|
| `/` | - | Redirects to `/quotations` |
| `/login` | Public | Login form (email/password) |
| `/register` | Public | Registration form (fullName/email/password) |
| `/quotations` | Protected | Quotation list with search, status filter, pagination |
| `/workflows` | Protected | n8n editor in iframe |

### Components (`src/components/`)

**Layout:**
- `navbar.tsx` -- Top nav with logo, nav links (Quotations, Workflows), user dropdown (initials avatar, email, logout). Hidden when not authenticated.

**Quotations:**
- `quotation-list.tsx` -- Table with search (debounced 300ms), status filter, pagination (20/page), VND formatting
- `quotation-table-actions.tsx` -- Row dropdown (View, Edit, Duplicate, Delete)
- `quotation-status-badge.tsx` -- Color-coded status (draft=gray, sent=blue, accepted=green, rejected=red, expired=gray)

**UI (shadcn):** button, card, input, label, badge, table, select, dropdown-menu, dialog, form, alert-dialog, separator, tabs, sheet, avatar, textarea

### Auth System (`src/lib/auth.tsx` + `src/middleware.ts`)

**Flow:**
1. **Server-side:** Next.js middleware checks `token` cookie -> redirect to `/login` if missing
2. **Client-side:** AuthProvider calls `GET /auth/profile` -> sets user state or redirects
3. **API 401:** Axios interceptor clears token + redirects to `/login`
4. **Login/Register:** Stores token in localStorage + cookie (7 days) -> redirects to `/quotations`

**Public paths:** `/login`, `/register` (middleware skips auth check)

**AuthContext provides:** `user: IUser | null`, `isLoading`, `login()`, `register()`, `logout()`

### API Client (`src/lib/api.ts`)
- Base URL: `NEXT_PUBLIC_API_URL` || `http://localhost:4001/api`
- Request interceptor: attaches `Authorization: Bearer {token}` from localStorage
- Response interceptor: on 401, clears token + cookie, redirects to `/login`

### API Services (`src/lib/api/`)
- `auth.ts` -- `login(data)`, `getProfile()`
- `quotations.ts` -- `getQuotations(params)` returns `PaginatedResponse<IQuotation>`

### Hooks (`src/hooks/`)
- `use-quotations.ts` -- `useQuotations(params)` wraps React Query for quotation list

### Types (`src/types/index.ts`)
Re-exports from `@shared/types`: IQuotation, ICustomer, IProduct, IUser, QuotationStatus, PaginatedResponse, etc.

### Config
- `next.config.ts` -- Webpack alias `@shared` -> `../shared`, `experimental.externalDir: true`
- `tsconfig.json` -- Paths: `@/*` -> `./src/*`, `@shared/*` -> `../shared/*`
- Env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_N8N_URL` (default http://localhost:5678)

---

## Shared (`shared/`)

Single source of truth for API contracts. Both backend and frontend import from here.

### Types (`shared/types/`)

| File | Exports |
|------|---------|
| `common.ts` | `PaginatedResponse<T>`, `ApiResponse<T>`, `SortOrder`, `PaginationQuery` |
| `user.ts` | `UserRole`(admin/manager/sales), `IUser`, `ILoginRequest`, `ILoginResponse` |
| `customer.ts` | `ICustomer` |
| `product.ts` | `IProduct` |
| `quotation.ts` | `QuotationStatus`(draft/sent/accepted/rejected/expired), `HistoryAction`, `IQuotation`, `IQuotationItem`, `IQuotationHistory`, `IAttachment` |
| `organization.ts` | `OrganizationPlan`, `OrgMemberRole`, `IOrganization`, `IOrganizationMember`, CRUD request types |
| `job.ts` | `JobStatus`(pending/extracting/.../failed/dead_letter), `IIngestionJob`, `CreateJobRequest` |
| `review.ts` | `ReviewType`, `ReviewStatus`, `IReviewRequest`, create/approve/reject request types |
| `version.ts` | `IQuotationVersion`, `CreateVersionRequest`, `VersionDiff` |
| `ai.ts` | `AiOperation`, `PromptType`, `IAiPromptVersion`, `CompareSpecsRequest`, `CompareResult`, `DashboardResponse` |
| `glossary.ts` | `IGlossaryTerm`, `CreateGlossaryTermRequest`, `ImportGlossaryRequest` |
| `rule.ts` | `RuleCategory`(lab/biotech/icu/analytical/general), `IRule`, `IRuleSet`, `EvaluateRulesRequest` |

### Constants (`shared/constants/`)

| File | Exports |
|------|---------|
| `quotation-status.ts` | `QUOTATION_STATUS_LABELS`, `QUOTATION_STATUS_OPTIONS` |
| `currencies.ts` | `DEFAULT_CURRENCY_CODE`('VND'), `CURRENCY_CODES`(VND/USD/EUR/JPY) |
| `organization-plans.ts` | `ORGANIZATION_PLANS`(free/starter/pro/enterprise with token limits), `TOKEN_OVERAGE_RATE_PER_1K`, `DEFAULT_ORG_ID` |

### Rules
- Backend-dev MUST update shared types when changing API contracts
- Frontend-dev MUST import from `shared/` instead of redefining types locally
- All new types must be re-exported via barrel `index.ts` files

---

## Business Domain

### Quotation Lifecycle
`draft` -> `sent` -> `accepted` / `rejected` / `expired`
- New quotations start as `draft`
- Only `draft` quotations can be edited
- `sent` quotations are read-only (create a new version to modify)
- Currency is VND by default, USD optional

### n8n Integration
- n8n workflows: document ingestion (PDF/image -> AI extraction) and email delivery
- Backend -> n8n: REST triggers via `N8N_BASE_URL`
- n8n -> Backend: callbacks via `/api/webhooks/n8n/*` (X-Webhook-Secret) and `/api/ingestion/*` (X-Service-Key)
- Execution logs stored in `n8n_execution_logs` table
- CorrelationId middleware tracks requests across services

### AI Module
- Anthropic Claude API (`claude-sonnet-4-20250514`)
- 6 operations: `generate`, `suggest`, `improve`, `extract`, `translate`, `compare`
- Token usage tracked per request with cost calculation (USD)
- Monthly token budget per organization (enforced by plan)
- Prompt versioning system (AiPromptVersion entity)

### Multi-Tenancy
- Every major entity scoped by `organizationId`
- Users belong to orgs via `OrganizationMember` with roles (owner/admin/manager/member)
- CompanySettings per organization
- Org-level API key encryption (AES-256-GCM)

---

## Git & Push Protocol

**3 separate git repos:**

| Repo | Remote | Path |
|------|--------|------|
| Monorepo | `giahuydo/bao-gia` | `/` (root) |
| Backend | `giahuydo/bao_gia_be` | `backend/` |
| Frontend | `giahuydo/bao_gia_fe` | `frontend/` |

**When pushing, ALWAYS push all 3 repos** (mono + backend + frontend).

### Commit Conventions
- Prefix: `feat(backend):`, `fix(frontend):`, `chore:`, `docs:`, `test:`
- Linear tickets: `BAO-<number>: <message>`
- Branch naming: `BAO-<number>/<short-description>`

## Linear Integration

- **Team**: Bao Gia | **Key**: `BAO` (e.g. `BAO-123`)
- Always filter by team "Bao Gia"
- Do NOT interact with issues from other teams

## MCP Security Policy

| Service | READ | WRITE | DELETE |
|---------|------|-------|--------|
| GitHub (giahuydo/bao-gia*) | Yes | Yes | No |
| Linear (Bao Gia team only) | Yes | Yes | No |
| PostgreSQL | Yes | Yes (via TypeORM) | Soft-delete only |

**FORBIDDEN**: drop tables, force-push main, interact outside Bao Gia scope, commit `.env`/secrets

## Agent Conventions
- Stop agents after 15 minutes if not done
- Prefer direct work over background agents for tasks < 10 minutes
- Always push all 3 repos after commits
- Don't ask for confirmation on simple commands
