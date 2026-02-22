# n8n Orchestration Architecture for Bao Gia

## 1. Current State Analysis

### What exists in the NestJS backend (port 4001)

| Capability | Module | Status |
|---|---|---|
| Quotation CRUD + transactions | `QuotationsService` | Complete |
| PDF generation (Puppeteer + Handlebars) | `QuotationsService.generatePdf` | Complete |
| AI: generate quotation from text | `AiService.generateQuotation` | Complete |
| AI: suggest items | `AiService.suggestItems` | Complete |
| AI: improve description | `AiService.improveDescription` | Complete |
| File upload/download | `AttachmentsService` | Complete |
| Quotation history tracking | `QuotationHistory` entity | Complete |
| Customer, Product, Template, Currency CRUD | Various modules | Complete |
| Auth (JWT) | `AuthModule` | Complete |

### What does NOT exist yet

| Capability | Notes |
|---|---|
| Vendor quotation ingestion (PDF/DOCX/email → structured data) | Core business pipeline, not built |
| AI extraction from documents (OCR/parse) | Different from current AI endpoints |
| Vietnamese translation pipeline | Not built |
| Data normalization & product matching | Not built |
| Email sending (quotation delivery) | Not built |
| Scheduled tasks (expiration checks, reminders) | Not built |
| Webhook endpoints for n8n callbacks | Not built |
| Service-to-service auth (n8n ↔ backend) | Env vars defined, guard not implemented |

---

## 2. Responsibility Separation

### NestJS Backend — Owner of Truth

**MUST handle:**
- All CRUD operations (quotations, customers, products, templates)
- Business rule validation (pricing rules, discount limits, status transitions)
- Data persistence and transactions
- Authentication and authorization (JWT, RBAC)
- PDF generation and template rendering
- AI prompt construction and response parsing (already in `AiService`)
- Token usage tracking and billing logic
- Multi-tenant data isolation (future SaaS)

**WHY:** Business logic in NestJS is testable, version-controlled, type-safe, and deployable independently. Moving it into n8n makes it untestable, unversioned, and coupled to n8n's execution model.

### n8n — Orchestrator, Not Owner

**SHOULD handle:**
- Multi-step workflow coordination (trigger → step1 → step2 → ... → callback)
- Retry logic with exponential backoff
- File intake routing (email → webhook → file processing trigger)
- Parallel fan-out (e.g., process 10 line items concurrently)
- Scheduled triggers (cron: check expired quotations, send reminders)
- External integrations (email SMTP, Slack notifications, cloud storage)
- Workflow-level error handling and dead letter queuing
- Execution audit trail (n8n's built-in execution log)

**MUST NOT handle:**
- Database writes (always go through NestJS API)
- Business rule evaluation (discount limits, status transition validation)
- AI prompt engineering or response parsing
- Authentication/authorization decisions
- PDF rendering
- Price calculations

### Claude API — Stateless AI Worker

**Called exclusively by NestJS `AiService`**, never directly from n8n.

**WHY:** Prompt templates are code. They need version control, unit tests, and type-safe response parsing. The current `AiService` already does this correctly. n8n should trigger the NestJS endpoint, not call Claude directly.

---

## 3. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ENTRY POINTS                                │
│                                                                     │
│  ┌──────────┐   ┌──────────────┐   ┌────────────┐   ┌───────────┐ │
│  │ Frontend  │   │ Email Inbox  │   │ Manual     │   │ Scheduled │ │
│  │ (Next.js) │   │ (IMAP/SMTP) │   │ Upload     │   │ Cron      │ │
│  │ :4000     │   │              │   │ via n8n UI │   │ via n8n   │ │
│  └─────┬─────┘   └──────┬───────┘   └─────┬──────┘   └─────┬─────┘ │
│        │                │                 │               │         │
└────────┼────────────────┼─────────────────┼───────────────┼─────────┘
         │                │                 │               │
         ▼                ▼                 ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      n8n ORCHESTRATION LAYER (:5679)                │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Workflow: Vendor Quotation Ingestion            │   │
│  │                                                             │   │
│  │  [Trigger] → [Upload to Backend] → [Call AI Extract]       │   │
│  │           → [Call AI Translate] → [Call Normalize]          │   │
│  │           → [Call Create Quotation] → [Notify User]        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Workflow: Quotation Delivery                    │   │
│  │                                                             │   │
│  │  [Webhook from Backend] → [Call Generate PDF]               │   │
│  │           → [Send Email with PDF] → [Callback: status=sent] │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Workflow: Scheduled Tasks                       │   │
│  │                                                             │   │
│  │  [Cron] → [Call Backend: find expired] → [Update status]   │   │
│  │        → [Send reminder emails]                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Authentication: Service API Key in X-Service-Key header           │
│  All data ops: HTTP calls to NestJS API                            │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     │ HTTP (internal network)
                     │ X-Service-Key + X-Webhook-Secret
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  NestJS BACKEND (:4001)                              │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  NEW: Webhook Controller (/api/webhooks/n8n/*)                │ │
│  │  - POST /quotation-processed  (n8n callback after pipeline)   │ │
│  │  - POST /delivery-completed   (n8n callback after email)      │ │
│  │  - Validates X-Webhook-Secret header                          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  NEW: Ingestion Controller (/api/ingestion/*)                 │ │
│  │  - POST /extract     → AiService.extractFromDocument(file)    │ │
│  │  - POST /translate   → AiService.translateToVietnamese(data)  │ │
│  │  - POST /normalize   → IngestionService.normalize(data)       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  NEW: Service Auth Guard                                      │ │
│  │  - Validates X-Service-Key for n8n → backend calls            │ │
│  │  - Separate from JWT (no user context, uses system actor)     │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Existing:       │  │  AiService       │  │  QuotationsService│ │
│  │  All CRUD        │  │  (Claude API)    │  │  (Transactions)  │  │
│  │  Controllers     │  │  Prompt mgmt     │  │  PDF generation  │  │
│  │                  │  │  Token tracking  │  │  History tracking │  │
│  └──────────────────┘  └────────┬─────────┘  └──────────────────┘  │
│                                 │                                   │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │
                                  │ HTTPS (official API)
                                  ▼
                        ┌──────────────────┐
                        │  Claude API      │
                        │  (Anthropic)     │
                        │  Single API key  │
                        └──────────────────┘
                                  │
                                  │
                                  ▼
                        ┌──────────────────┐
                        │  PostgreSQL      │
                        │  (:5432)         │
                        │  bao_gia DB      │
                        └──────────────────┘
```

---

## 4. Core Workflows — Detailed Design

### 4.1 Workflow: Vendor Quotation Ingestion

This is the **primary n8n workflow** — the reason n8n exists in this system.

**Business flow:** Receive vendor quotation file → AI extracts structured data → translate to Vietnamese → normalize → create draft quotation → notify user.

```
TRIGGER
  │
  ├─ (A) Email Trigger: IMAP node polls vendor inbox
  │     → extracts PDF/DOCX attachment + sender metadata
  │
  ├─ (B) Webhook Trigger: Frontend uploads file via n8n webhook
  │     → receives multipart file + userId + optional customerId
  │
  ├─ (C) Manual Trigger: operator drops file in n8n UI
  │
  ▼
STEP 1: Upload file to NestJS
  │  POST http://backend:4001/api/quotations/{id}/attachments
  │  (or a new /api/ingestion/upload endpoint)
  │  → Returns: { attachmentId, filePath, mimeType }
  │
  ▼
STEP 2: Call AI extraction
  │  POST http://backend:4001/api/ingestion/extract
  │  Body: { attachmentId }
  │  → NestJS reads file, calls Claude with document extraction prompt
  │  → Returns: { raw JSON with items, vendor info, pricing }
  │  → NestJS tracks token usage internally
  │
  ▼
STEP 3: Call AI translation
  │  POST http://backend:4001/api/ingestion/translate
  │  Body: { extractedData }
  │  → NestJS calls Claude with translation prompt
  │  → Returns: { translated items in Vietnamese }
  │
  ▼
STEP 4: Call normalization
  │  POST http://backend:4001/api/ingestion/normalize
  │  Body: { translatedData }
  │  → NestJS matches products, validates units, applies business rules
  │  → Returns: { normalizedItems[], customerMatch?, warnings[] }
  │
  ▼
STEP 5: Create draft quotation
  │  POST http://backend:4001/api/quotations
  │  Body: { title, customerId, items, notes, status: "draft" }
  │  → Returns: { quotation with BG-YYYYMMDD-XXX number }
  │
  ▼
STEP 6: Notify user
  │  n8n Send Email / Slack / webhook to frontend
  │  "New quotation BG-20260222-001 created from vendor file X"
  │
  ▼
STEP 7: Callback to backend
     POST http://backend:4001/api/webhooks/n8n/quotation-processed
     Body: { quotationId, executionId, status: "success", processingTimeMs }
```

**n8n workflow JSON structure** (pseudocode):

```json
{
  "name": "Vendor Quotation Ingestion",
  "nodes": [
    { "type": "n8n-nodes-base.webhook",       "name": "Receive File" },
    { "type": "n8n-nodes-base.httpRequest",    "name": "Upload to Backend" },
    { "type": "n8n-nodes-base.httpRequest",    "name": "AI Extract" },
    { "type": "n8n-nodes-base.httpRequest",    "name": "AI Translate" },
    { "type": "n8n-nodes-base.httpRequest",    "name": "Normalize Data" },
    { "type": "n8n-nodes-base.httpRequest",    "name": "Create Quotation" },
    { "type": "n8n-nodes-base.emailSend",      "name": "Notify User" },
    { "type": "n8n-nodes-base.httpRequest",    "name": "Callback Success" },
    { "type": "n8n-nodes-base.errorTrigger",   "name": "Error Handler" },
    { "type": "n8n-nodes-base.httpRequest",    "name": "Callback Failure" }
  ]
}
```

### 4.2 Workflow: Quotation Delivery

**Triggered by NestJS** when user clicks "Send to customer" in frontend.

```
TRIGGER: Webhook from NestJS
  │  POST http://n8n:5679/webhook/deliver-quotation
  │  Body: { quotationId, customerEmail, userId }
  │
  ▼
STEP 1: Fetch quotation data
  │  GET http://backend:4001/api/quotations/{id}
  │
  ▼
STEP 2: Generate PDF
  │  GET http://backend:4001/api/quotations/{id}/pdf
  │  → Returns: PDF buffer
  │
  ▼
STEP 3: Send email
  │  n8n SMTP node
  │  To: customerEmail
  │  Attach: PDF
  │  Template: professional quotation email
  │
  ▼
STEP 4: Update status
  │  PATCH http://backend:4001/api/quotations/{id}/status
  │  Body: { status: "sent" }
  │
  ▼
STEP 5: Callback
     POST http://backend:4001/api/webhooks/n8n/delivery-completed
     Body: { quotationId, emailMessageId, sentAt }
```

### 4.3 Workflow: Scheduled Expiration Check

```
TRIGGER: Cron (daily at 08:00 VN time)
  │
  ▼
STEP 1: Query expiring quotations
  │  GET http://backend:4001/api/quotations?status=sent&validUntilBefore={today}
  │
  ▼
STEP 2: For each expired quotation
  │  PATCH http://backend:4001/api/quotations/{id}/status
  │  Body: { status: "expired" }
  │
  ▼
STEP 3: Send summary notification
     Email/Slack: "5 quotations expired today: BG-..., BG-..., ..."
```

### 4.4 Workflow: Batch Processing (Future)

For multi-tenant SaaS: process multiple vendor files in parallel.

```
TRIGGER: Webhook receives batch upload
  │
  ▼
STEP 1: Split items (n8n SplitInBatches node)
  │  → Fan out to N parallel ingestion sub-workflows
  │  → Each calls the same NestJS endpoints
  │  → n8n handles concurrency limiting (e.g., 3 at a time)
  │
  ▼
STEP 2: Aggregate results
  │  → Collect success/failure for each file
  │
  ▼
STEP 3: Summary callback
     POST http://backend:4001/api/webhooks/n8n/batch-completed
     Body: { batchId, results: [{ fileId, quotationId, status }] }
```

---

## 5. New NestJS Components Required

### 5.1 Service Auth Guard

```
File: src/common/guards/service-auth.guard.ts

Purpose: Validate X-Service-Key header for n8n → backend calls.
Separate from JwtAuthGuard (no user session, uses system actor ID).

Config key: serviceAuth.key (from N8N_SERVICE_KEY env var)
System actor: a fixed UUID representing "n8n-system" in the users table.
```

### 5.2 Ingestion Module

```
File: src/modules/ingestion/

New endpoints (protected by ServiceAuthGuard):
  POST /api/ingestion/extract     → parse document with Claude
  POST /api/ingestion/translate   → translate extracted data
  POST /api/ingestion/normalize   → match products, validate, normalize

New service methods in AiService or new IngestionAiService:
  extractFromDocument(fileBuffer, mimeType) → structured JSON
  translateToVietnamese(extractedData)      → translated JSON
```

### 5.3 Webhook Controller

```
File: src/modules/webhooks/

New endpoints (protected by webhook secret validation):
  POST /api/webhooks/n8n/quotation-processed
  POST /api/webhooks/n8n/delivery-completed
  POST /api/webhooks/n8n/batch-completed

Validates: X-Webhook-Secret header matches N8N_WEBHOOK_SECRET env var.
Records: execution metadata in quotation_history table.
```

### 5.4 Token Usage Tracking

```
File: src/modules/ai/token-usage.entity.ts

New entity: TokenUsage
  - id (uuid)
  - quotationId (nullable, FK)
  - operation (enum: extract, translate, suggest, generate, improve)
  - model (string: "claude-sonnet-4-20250514")
  - inputTokens (int)
  - outputTokens (int)
  - totalTokens (int)
  - costUsd (decimal) — calculated from Anthropic pricing
  - tenantId (string, nullable — for future SaaS)
  - createdAt (timestamp)

Tracked inside AiService after every Claude API call, using
response.usage.input_tokens and response.usage.output_tokens.
```

### 5.5 Notification Trigger Endpoint

```
File: Add to QuotationsController

New endpoint:
  POST /api/quotations/:id/send
  → Validates quotation is in "draft" or "sent" status
  → Calls n8n webhook: POST http://n8n:5679/webhook/deliver-quotation
  → Returns { triggered: true, n8nExecutionId }
```

---

## 6. Retry & Failure Handling

### n8n-level retry

| Step | Retry Policy | Max Retries | Backoff |
|---|---|---|---|
| Upload to backend | Retry on 5xx, timeout | 3 | Exponential: 5s, 15s, 45s |
| AI Extract | Retry on 5xx, 429 (rate limit) | 3 | Exponential: 10s, 30s, 90s |
| AI Translate | Retry on 5xx, 429 | 3 | Exponential: 10s, 30s, 90s |
| Normalize | Retry on 5xx | 2 | Fixed: 5s |
| Create Quotation | **NO RETRY** (idempotency risk) | 0 | — |
| Send Email | Retry on SMTP error | 3 | Exponential: 30s, 60s, 120s |

### NestJS-level handling

- AI calls: `AiService` already catches errors and returns `HttpException(500)`.
- Add: idempotency key support on `POST /api/quotations` to prevent duplicate creation if n8n retries after a timeout where the quotation was actually created.
- Add: `X-Idempotency-Key` header check in `QuotationsService.create()`.

### Dead letter handling

```
n8n Error Workflow:
  [Error Trigger] → [Log error details to backend]
                  → POST /api/webhooks/n8n/execution-failed
                  → Body: { workflowName, executionId, error, inputData }
                  → [Send alert email to admin]

NestJS stores failed executions in a new table:
  n8n_execution_log (id, workflow_name, execution_id, status, error, input_data, created_at)
```

---

## 7. Logging Strategy

### Layer 1: n8n Execution Log (built-in)

- Every workflow execution is stored in n8n's PostgreSQL (separate DB).
- Retention: 7 days dev (`N8N_EXECUTIONS_MAX_AGE=168`), 30 days production.
- Includes: input/output of every node, timing, errors.
- Accessible via n8n UI at `:5679`.

### Layer 2: NestJS Application Logs

- Every API call from n8n includes `X-N8N-Execution-Id` header.
- NestJS logs correlate with n8n execution ID:

```
[IngestionController] extract called | executionId=abc-123 | attachmentId=xyz | duration=3420ms
[AiService] Claude API call | operation=extract | tokens=1250/3200 | cost=$0.018
```

### Layer 3: Quotation History (existing)

- Extend `HistoryAction` enum with new actions:

```typescript
export enum HistoryAction {
  CREATED = 'created',
  UPDATED = 'updated',
  STATUS_CHANGED = 'status_changed',
  DUPLICATED = 'duplicated',
  PDF_EXPORTED = 'pdf_exported',
  // NEW:
  AI_EXTRACTED = 'ai_extracted',
  AI_TRANSLATED = 'ai_translated',
  NORMALIZED = 'normalized',
  EMAIL_SENT = 'email_sent',
  INGESTION_FAILED = 'ingestion_failed',
}
```

### Layer 4: Token Usage Log (new)

- Every Claude API call → insert into `token_usage` table.
- Queryable by quotation, by tenant, by date range, by operation type.
- Dashboard endpoint: `GET /api/ai/usage?from=2026-02-01&to=2026-02-28`

---

## 8. Token Usage Tracking Strategy

### Collection Point

**Inside `AiService`**, after every `client.messages.create()` call:

```typescript
// After Claude API call:
const usage = response.usage;
await this.tokenUsageRepository.save({
  quotationId: context.quotationId ?? null,
  operation: 'extract',  // or 'translate', 'suggest', etc.
  model: 'claude-sonnet-4-20250514',
  inputTokens: usage.input_tokens,
  outputTokens: usage.output_tokens,
  totalTokens: usage.input_tokens + usage.output_tokens,
  costUsd: this.calculateCost(usage, 'claude-sonnet-4-20250514'),
  tenantId: context.tenantId ?? null,
});
```

### Cost Calculation

```typescript
private calculateCost(usage: { input_tokens: number; output_tokens: number }, model: string): number {
  // Anthropic pricing as of 2025 — update when pricing changes
  const pricing = {
    'claude-sonnet-4-20250514': { input: 3.0 / 1_000_000, output: 15.0 / 1_000_000 },
    'claude-haiku-4-5-20251001': { input: 0.80 / 1_000_000, output: 4.0 / 1_000_000 },
  };
  const p = pricing[model];
  return usage.input_tokens * p.input + usage.output_tokens * p.output;
}
```

### SaaS Billing (Future)

- Aggregate `token_usage` by `tenantId` per billing period.
- Each tenant sees their AI usage dashboard.
- Rate limiting per tenant: check `SUM(totalTokens) WHERE tenantId = X AND createdAt > startOfMonth`.

---

## 9. Security: n8n ↔ NestJS Communication

### n8n → NestJS (n8n calls backend API)

```
Header: X-Service-Key: <BAOGIA_SERVICE_KEY>
Validated by: ServiceAuthGuard
Identity: system actor (no user JWT)
Network: docker bridge network (baogia-network), not exposed to internet
```

### NestJS → n8n (backend triggers n8n workflows)

```
Header: Authorization: Bearer <N8N_API_KEY>
Endpoint: POST http://n8n:5679/webhook/<workflow-specific-path>
Network: docker bridge network
```

### n8n → NestJS callbacks (n8n reports completion)

```
Header: X-Webhook-Secret: <N8N_WEBHOOK_SECRET>
Validated by: WebhookController middleware
```

### Production hardening

- All three secrets are distinct random 256-bit keys.
- n8n port 5679 is NOT exposed to the internet; only accessible within Docker network or behind reverse proxy with IP whitelist.
- Rate limit n8n webhook endpoints: 10 req/s.
- TLS between services in production (or use Docker internal networking which doesn't leave the host).

---

## 10. Multi-Tenant SaaS Considerations

### Current: Single-tenant

- One NestJS instance, one PostgreSQL, one n8n instance.
- n8n workflows are shared (one set of workflows).

### Future: Multi-tenant

```
Option A: Shared n8n, tenant isolation in NestJS (Recommended for <100 tenants)

  - n8n workflows receive tenantId in every request.
  - n8n passes tenantId to every NestJS API call.
  - NestJS applies tenant filter at repository level (TypeORM global scope).
  - Token usage tracked per tenant.
  - Quotation numbers scoped per tenant: {TENANT_PREFIX}-BG-YYYYMMDD-XXX.

Option B: Separate n8n per tenant (>100 tenants or strict isolation)

  - Kubernetes: deploy n8n instance per tenant.
  - Expensive but fully isolated.
  - Only needed for compliance-heavy customers.
```

### Data model changes for multi-tenant

```
Add to entities: Quotation, Customer, Product, Template, TokenUsage
  @Column({ name: 'tenant_id', nullable: true })
  tenantId: string;

Add TypeORM subscriber or global scope:
  Every query auto-filters by tenantId from request context.
```

---

## 11. File: docker-compose.n8n.yml — Network Update

The existing `docker-compose.n8n.yml` uses `baogia-network`. The main backend's docker-compose should join the same network so n8n can reach `backend:4001` by container name.

```yaml
# In the main docker-compose.yml (backend + postgres):
services:
  backend:
    networks:
      - baogia-network

networks:
  baogia-network:
    external: true  # Created by docker-compose.n8n.yml
```

---

## 12. Implementation Order

| Phase | What | Effort |
|---|---|---|
| **Phase 1** | ServiceAuthGuard + Webhook controller + ingestion endpoints (extract, translate, normalize) | 3-4 days |
| **Phase 2** | Token usage entity + tracking in AiService | 1-2 days |
| **Phase 3** | n8n Workflow: Vendor Quotation Ingestion | 2-3 days |
| **Phase 4** | n8n Workflow: Quotation Delivery (email) | 1-2 days |
| **Phase 5** | n8n Workflow: Scheduled expiration check | 0.5 day |
| **Phase 6** | Error workflow + dead letter handling | 1 day |
| **Phase 7** | Frontend integration (trigger ingestion, show processing status) | 2-3 days |
| **Phase 8** | Multi-tenant tenantId column + scoping | 3-5 days |

---

## 13. What NOT to Do

| Anti-pattern | Why it's wrong |
|---|---|
| Put Claude API key in n8n credentials and call Claude directly from n8n | Bypasses token tracking, prompt version control, response parsing. All AI calls go through NestJS. |
| Write SQL queries in n8n Code nodes | Bypasses validation, transactions, history tracking. Always call NestJS REST API. |
| Store business rules in n8n IF/Switch nodes | Untestable, unversioned. Business logic lives in NestJS services. |
| Use n8n as the API gateway for frontend | Frontend calls NestJS directly. n8n is backend-to-backend only. |
| Share PostgreSQL between n8n and NestJS | n8n has its own DB (already correctly set up in docker-compose.n8n.yml). |
| Expose n8n port to the internet without auth | n8n admin UI has full execution access. Keep behind VPN/reverse proxy. |
