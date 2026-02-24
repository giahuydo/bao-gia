# Bao Gia — Database Schema Reference

> Last updated: 2026-02-24
> Database: PostgreSQL 15
> ORM: TypeORM 0.3.x
> Total entities: 25

---

## Table of Contents

1. [Migration Workflow](#1-migration-workflow)
2. [Soft-Delete Entities](#2-soft-delete-entities)
3. [JSONB Columns](#3-jsonb-columns)
4. [ER Diagram Overview](#4-er-diagram-overview)
5. [Core Entities](#5-core-entities)
6. [Quotation Domain Entities](#6-quotation-domain-entities)
7. [AI & Ingestion Entities](#7-ai--ingestion-entities)
8. [Audit & Workflow Entities](#8-audit--workflow-entities)
9. [Domain Rules Entities](#9-domain-rules-entities)
10. [Price Monitoring Entities](#10-price-monitoring-entities)
11. [Index Strategy](#11-index-strategy)

---

## 1. Migration Workflow

```bash
# Generate a new migration from entity changes
npm run migration:generate -- src/database/migrations/<MigrationName>

# Run all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Seed the database with initial data
npm run seed
```

**Important:** TypeORM `synchronize` is set to `true` in non-production environments (auto-applies schema changes). In production, always generate and review migrations manually.

Environment variable to force synchronize off: `DB_SYNCHRONIZE=false`.

---

## 2. Soft-Delete Entities

Entities using `@DeleteDateColumn` (TypeORM soft-delete — sets `deleted_at`, not physical delete):

| Entity | Table | Notes |
|--------|-------|-------|
| Quotation | quotations | Primary business record, always soft-delete |
| Customer | customers | Preserve customer history when deleted |

All TypeORM `find*` queries automatically exclude soft-deleted records unless `withDeleted: true` is passed.

---

## 3. JSONB Columns

Entities storing structured JSON in PostgreSQL `jsonb` columns:

| Entity | Column | Content |
|--------|--------|---------|
| Template | items | Array of template line items `[{ name, unit, quantity, unitPrice }]` |
| IngestionJob | extract_result | Raw AI extraction output |
| IngestionJob | translate_result | AI translation output |
| IngestionJob | normalize_result | Normalized/matched product data |
| FileChecksumCache | extract_result | Cached extraction result |
| FileChecksumCache | translate_result | Cached translation result |
| QuotationVersion | snapshot | Full quotation state snapshot at version time |
| ReviewRequest | payload | Context data for the review |
| ReviewRequest | proposed_data | Data proposed by requester |
| ReviewRequest | reviewer_changes | Edits made by reviewer |
| QuotationHistory | changes | Before/after diff for the action |
| N8nExecutionLog | payload | Full n8n execution payload |
| RuleSet | rules | Array of rule objects (see Domain Rules section) |

---

## 4. ER Diagram Overview

```
organizations
    │
    ├── organization_members ──────────► users
    ├── company_settings (1:1)
    ├── customers ──────────────────────► users (created_by)
    │       └── quotations ─────────────► users (created_by)
    │               ├── quotation_items ►  products
    │               ├── attachments ────►  users (uploaded_by)
    │               ├── quotation_history► users (performed_by)
    │               └── quotation_versions► users (created_by)
    ├── products ───────────────────────► currencies
    ├── templates ──────────────────────► users (created_by)
    ├── ingestion_jobs
    ├── file_checksum_cache
    ├── review_requests ─────────────────► quotations, users×3
    ├── rule_sets
    ├── glossary_terms
    └── price_monitoring_jobs
            ├── price_alerts
            └── price_records

Global (not org-scoped):
    currencies
    ai_prompt_versions
    token_usage
    n8n_execution_log
    users
```

---

## 5. Core Entities

### 5.1 users

Table: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, auto-generated | Primary key |
| email | varchar | UNIQUE, NOT NULL | Login email |
| password | varchar | NOT NULL, @Exclude from serialization | Bcrypt hash |
| full_name | varchar | NOT NULL | Display name |
| role | enum | NOT NULL, default 'sales' | admin \| manager \| sales |
| is_active | boolean | NOT NULL, default true | Account active flag |
| created_at | timestamptz | NOT NULL | Auto-set on insert |
| updated_at | timestamptz | NOT NULL | Auto-set on update |

Relations:
- OneToMany → customers (created_by)
- OneToMany → products (created_by)
- OneToMany → quotations (created_by)
- OneToMany → templates (created_by)

Enum `UserRole`: `admin`, `manager`, `sales`

---

### 5.2 organizations

Table: `organizations`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| name | varchar | UNIQUE, NOT NULL | Organization display name |
| slug | varchar | UNIQUE, NOT NULL | URL-safe identifier |
| description | text | nullable | Organization description |
| logo_url | varchar | nullable | Logo image URL |
| is_active | boolean | NOT NULL, default true | Org active flag |
| plan | enum | NOT NULL, default 'free' | Subscription plan |
| monthly_token_limit | int | NOT NULL, default 100000 | AI token budget per month |
| anthropic_api_key | varchar | nullable | AES-256-GCM encrypted org API key |
| created_at | timestamptz | NOT NULL | Auto-set on insert |
| updated_at | timestamptz | NOT NULL | Auto-set on update |

Relations:
- OneToMany → organization_members

Enum `OrganizationPlan`: `free`, `starter`, `professional`, `enterprise`

Note: `anthropic_api_key` is encrypted at rest using `EncryptionService` (AES-256-GCM). Decrypted only when needed for API calls.

---

### 5.3 organization_members

Table: `organization_members`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| user_id | uuid | FK → users.id, INDEX | Member user |
| organization_id | uuid | FK → organizations.id (CASCADE DELETE), INDEX | Organization |
| role | enum | NOT NULL, default 'member' | Member role within org |
| is_active | boolean | NOT NULL, default true | Membership active flag |
| created_at | timestamptz | NOT NULL | Auto-set on insert |

Unique constraint: `(user_id, organization_id)` — one user cannot be a member of the same org twice.

Enum `OrgMemberRole`: `owner`, `admin`, `manager`, `member`

---

## 6. Quotation Domain Entities

### 6.1 currencies

Table: `currencies`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| code | varchar(3) | UNIQUE, NOT NULL | ISO currency code (VND, USD, EUR, JPY) |
| name | varchar | NOT NULL | Full currency name |
| symbol | varchar(5) | NOT NULL | Display symbol (₫, $, €, ¥) |
| exchange_rate | decimal(15,6) | NOT NULL, default 1 | Rate relative to base currency |
| decimal_places | int | NOT NULL, default 0 | Display decimal places (VND=0, USD=2) |
| is_default | boolean | NOT NULL, default false | Default currency flag (VND) |
| is_active | boolean | NOT NULL, default true | Currency active flag |
| created_at | timestamptz | NOT NULL | Auto-set on insert |
| updated_at | timestamptz | NOT NULL | Auto-set on update |

Default currency: VND (Vietnamese Dong). Only admin can create/edit currencies.

---

### 6.2 customers

Table: `customers`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| organization_id | uuid | FK → organizations.id (CASCADE DELETE), INDEX | Owning organization |
| name | varchar | NOT NULL | Customer/company name |
| email | varchar | nullable | Contact email |
| phone | varchar | nullable | Contact phone |
| address | text | nullable | Business address |
| tax_code | varchar | nullable | Vietnamese tax code (MST) |
| contact_person | varchar | nullable | Primary contact name |
| notes | text | nullable | Internal notes |
| created_by | uuid | FK → users.id, NOT NULL | User who created this record |
| created_at | timestamptz | NOT NULL | Auto-set on insert |
| updated_at | timestamptz | NOT NULL | Auto-set on update |
| deleted_at | timestamptz | nullable | Soft-delete timestamp |

Relations:
- ManyToOne → organizations (cascade delete)
- ManyToOne → users (created_by)
- OneToMany → quotations

---

### 6.3 products

Table: `products`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| organization_id | uuid | FK → organizations.id (CASCADE DELETE), INDEX | Owning organization |
| name | varchar | NOT NULL | Product/service name |
| description | text | nullable | Product description |
| unit | varchar | NOT NULL | Unit of measure (cái, bộ, chiếc) |
| default_price | decimal(15,2) | NOT NULL | Default unit price |
| category | varchar | nullable | Product category |
| is_active | boolean | NOT NULL, default true | Active in catalog |
| currency_id | uuid | FK → currencies.id, nullable | Price currency |
| created_by | uuid | FK → users.id, NOT NULL | Creator |
| created_at | timestamptz | NOT NULL | Auto-set on insert |
| updated_at | timestamptz | NOT NULL | Auto-set on update |

---

### 6.4 templates

Table: `templates`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| organization_id | uuid | FK → organizations.id (CASCADE DELETE), INDEX | Owning organization |
| name | varchar | NOT NULL | Template name |
| description | text | nullable | Template description |
| default_terms | text | nullable | Default payment/delivery terms |
| default_notes | text | nullable | Default notes text |
| default_tax | decimal(5,2) | NOT NULL, default 0 | Default tax percentage |
| default_discount | decimal(5,2) | NOT NULL, default 0 | Default discount percentage |
| items | jsonb | nullable | Pre-filled line items array |
| is_default | boolean | NOT NULL, default false | Default template for new quotations |
| created_by | uuid | FK → users.id, NOT NULL | Creator |
| created_at | timestamptz | NOT NULL | Auto-set on insert |
| updated_at | timestamptz | NOT NULL | Auto-set on update |

JSONB `items` schema:
```json
[
  {
    "name": "Máy ly tâm",
    "description": "...",
    "unit": "cái",
    "quantity": 1,
    "unitPrice": 5000000
  }
]
```

---

### 6.5 company_settings

Table: `company_settings`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| organization_id | uuid | FK → organizations.id (CASCADE DELETE), UNIQUE INDEX | One per org |
| company_name | varchar | NOT NULL | Vietnamese company name |
| company_name_en | varchar | nullable | English company name |
| tax_code | varchar | nullable | Company tax code |
| address | text | nullable | Company address |
| phone | varchar | nullable | Company phone |
| email | varchar | nullable | Company email |
| website | varchar | nullable | Company website |
| logo_url | varchar | nullable | Logo image URL |
| bank_name | varchar | nullable | Bank name |
| bank_account | varchar | nullable | Bank account number |
| bank_branch | varchar | nullable | Bank branch |
| quotation_prefix | varchar | NOT NULL, default 'BG' | Prefix for quotation numbers (BG-20260224-001) |
| quotation_terms | text | nullable | Default quotation terms text |
| quotation_notes | text | nullable | Default quotation notes text |
| created_at | timestamptz | NOT NULL | Auto-set on insert |
| updated_at | timestamptz | NOT NULL | Auto-set on update |

Constraint: `UNIQUE(organization_id)` — exactly one settings record per organization.

---

### 6.6 quotations

Table: `quotations`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| organization_id | uuid | FK → organizations.id (CASCADE DELETE), INDEX | Owning organization |
| quotation_number | varchar | UNIQUE, NOT NULL | Human-readable number (BG-20260224-001) |
| title | varchar | NOT NULL | Quotation title |
| customer_id | uuid | FK → customers.id, NOT NULL | Linked customer |
| status | enum | NOT NULL, default 'draft' | Lifecycle status |
| valid_until | date | nullable | Expiry date |
| notes | text | nullable | Internal notes |
| terms | text | nullable | Payment/delivery terms shown to customer |
| discount | decimal(5,2) | NOT NULL, default 0 | Overall discount percentage |
| tax | decimal(5,2) | NOT NULL, default 0 | Tax percentage (VAT) |
| subtotal | decimal(15,2) | NOT NULL, default 0 | Sum of item amounts |
| total | decimal(15,2) | NOT NULL, default 0 | subtotal × (1 - discount) × (1 + tax) |
| currency_id | uuid | FK → currencies.id, nullable | Quotation currency |
| template_id | uuid | FK → templates.id, nullable | Template used (if any) |
| created_by | uuid | FK → users.id, NOT NULL | Creator |
| version | int | NOT NULL (TypeORM VersionColumn) | Optimistic lock version |
| created_at | timestamptz | NOT NULL | Auto-set on insert |
| updated_at | timestamptz | NOT NULL | Auto-set on update |
| deleted_at | timestamptz | nullable | Soft-delete timestamp |

Enum `QuotationStatus`: `draft`, `sent`, `accepted`, `rejected`, `expired`

Relations:
- OneToMany → quotation_items (cascade: true, eager: true)
- OneToMany → attachments
- OneToMany → quotation_history
- OneToMany → quotation_versions

---

### 6.7 quotation_items

Table: `quotation_items`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| quotation_id | uuid | FK → quotations.id (CASCADE DELETE), NOT NULL | Parent quotation |
| product_id | uuid | FK → products.id, nullable | Linked catalog product |
| name | varchar | NOT NULL | Item name (copied from product or custom) |
| description | text | nullable | Item description |
| unit | varchar | NOT NULL | Unit of measure |
| quantity | decimal(15,2) | NOT NULL | Quantity |
| unit_price | decimal(15,2) | NOT NULL | Price per unit |
| amount | decimal(15,2) | NOT NULL | quantity × unit_price |
| sort_order | int | NOT NULL, default 0 | Display ordering |

Note: `product_id` is nullable — line items can be ad-hoc (not linked to catalog).

---

### 6.8 attachments

Table: `attachments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| organization_id | uuid | FK → organizations.id (CASCADE DELETE), INDEX | Owning organization |
| quotation_id | uuid | FK → quotations.id (CASCADE DELETE), NOT NULL | Parent quotation |
| file_name | varchar | NOT NULL | Stored filename (UUID-based) |
| original_name | varchar | NOT NULL | Original uploaded filename |
| mime_type | varchar | NOT NULL | MIME type (application/pdf, image/png, etc.) |
| file_size | int | NOT NULL | File size in bytes (max 10MB = 10,485,760) |
| file_path | varchar | NOT NULL | Absolute storage path |
| uploaded_by | uuid | FK → users.id, NOT NULL | Uploader |
| created_at | timestamptz | NOT NULL | Auto-set on insert |

---

## 7. AI & Ingestion Entities

### 7.1 ai_prompt_versions

Table: `ai_prompt_versions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| type | enum | NOT NULL, INDEX | Prompt type |
| version_number | int | NOT NULL | Version number within type |
| system_prompt | text | NOT NULL | Claude system prompt |
| user_prompt_template | text | NOT NULL | User prompt template (may contain {variables}) |
| model | varchar | NOT NULL | Claude model ID (e.g. claude-sonnet-4-20250514) |
| max_tokens | int | NOT NULL | Max response tokens |
| is_active | boolean | NOT NULL, default false, INDEX | Only one active version per type |
| change_notes | text | nullable | What changed in this version |
| created_by | uuid | nullable | Creator (user ID) |
| created_at | timestamptz | NOT NULL | Auto-set on insert |

Unique constraint: `(type, version_number)` — version numbers unique per prompt type.

Enum `PromptType`: `extract`, `translate`, `generate`, `suggest`, `improve`, `compare`

---

### 7.2 token_usage

Table: `token_usage`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| quotation_id | uuid | nullable, INDEX | Associated quotation (if any) |
| operation | enum | NOT NULL | AI operation type |
| model | varchar | NOT NULL | Claude model used |
| input_tokens | int | NOT NULL | Input token count |
| output_tokens | int | NOT NULL | Output token count |
| total_tokens | int | NOT NULL | input + output |
| cost_usd | decimal(10,6) | NOT NULL | Calculated USD cost |
| user_id | uuid | nullable, INDEX | User who triggered the operation |
| tenant_id | uuid | nullable, INDEX | Reserved for multi-tenant billing |
| n8n_execution_id | varchar | nullable | Correlated n8n execution |
| prompt_version_id | uuid | nullable | Which AiPromptVersion was used |
| created_at | timestamptz | NOT NULL, INDEX | Auto-set on insert (used for monthly aggregation) |

Enum `AiOperation`: `generate`, `suggest`, `improve`, `extract`, `translate`, `compare`

Cost formula: `input_tokens × ($3.00 / 1,000,000) + output_tokens × ($15.00 / 1,000,000)` for `claude-sonnet-4-*`.

---

### 7.3 ingestion_jobs

Table: `ingestion_jobs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| organization_id | uuid | FK → organizations.id (CASCADE DELETE), INDEX | Owning organization |
| attachment_id | varchar | NOT NULL | Reference to uploaded attachment |
| status | enum | NOT NULL, default 'pending', INDEX | Pipeline stage |
| current_step | varchar | nullable | Human-readable current step name |
| retries | int | NOT NULL, default 0 | Retry count |
| max_retries | int | NOT NULL, default 3 | Maximum allowed retries |
| file_checksum | varchar(64) | nullable, INDEX | SHA-256 checksum for deduplication |
| extract_result | jsonb | nullable | AI extraction output |
| translate_result | jsonb | nullable | AI translation output |
| normalize_result | jsonb | nullable | Normalized/matched product data |
| quotation_id | uuid | nullable | Created quotation (after success) |
| error | text | nullable | Error message if failed |
| error_stack | text | nullable | Stack trace if failed |
| n8n_execution_id | varchar | nullable | Correlated n8n execution ID |
| correlation_id | varchar | nullable, INDEX | Cross-service correlation ID |
| prompt_version_id | uuid | nullable | Active prompt version used |
| customer_id | uuid | nullable | Pre-identified customer |
| created_by | uuid | NOT NULL | User who initiated the job |
| processing_time_ms | int | nullable | Total processing duration |
| started_at | timestamptz | nullable | When processing began |
| completed_at | timestamptz | nullable | When processing completed |
| created_at | timestamptz | NOT NULL | Auto-set on insert |
| updated_at | timestamptz | NOT NULL | Auto-set on update |

Enum `JobStatus`:
```
pending → extracting → translating → normalizing → review_pending → completed
                                                                  → failed
                                                                  → dead_letter
```

---

### 7.4 file_checksum_cache

Table: `file_checksum_cache`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| checksum | varchar(64) | NOT NULL, INDEX | SHA-256 checksum of file |
| organization_id | uuid | FK → organizations.id (CASCADE DELETE), INDEX | Owning organization |
| original_file_name | varchar | NOT NULL | Original filename |
| mime_type | varchar | NOT NULL | MIME type |
| file_size | int | NOT NULL | File size in bytes |
| extract_result | jsonb | nullable | Cached extraction result |
| translate_result | jsonb | nullable | Cached translation result |
| prompt_version_id | varchar | nullable | Prompt version used for this cache entry |
| hit_count | int | NOT NULL, default 0 | Cache hit counter |
| last_hit_at | timestamptz | nullable | Last time this cache was hit |
| expires_at | timestamptz | NOT NULL, INDEX | Cache expiry timestamp |
| created_at | timestamptz | NOT NULL | Auto-set on insert |

Unique constraint: `(checksum, organization_id)` — cache is per-org (same file in different orgs = different cache entries).

Purpose: Prevents re-processing the same document. If `checksum` + `organizationId` matches an unexpired entry, reuse the cached `extract_result` and `translate_result` instead of calling Claude again.

---

### 7.5 n8n_execution_log

Table: `n8n_execution_log`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| workflow_name | varchar | NOT NULL | n8n workflow name |
| execution_id | varchar | NOT NULL, INDEX | n8n execution ID |
| status | enum | NOT NULL | Execution result |
| quotation_id | uuid | nullable, INDEX | Related quotation |
| payload | jsonb | nullable | Full execution payload |
| error | text | nullable | Error message if failed |
| processing_time_ms | int | nullable | Execution duration |
| organization_id | varchar | nullable | Related organization |
| correlation_id | varchar | nullable, INDEX | Cross-service correlation |
| created_at | timestamptz | NOT NULL | Auto-set on insert |

Enum `ExecutionStatus`: `success`, `failed`, `partial`

---

## 8. Audit & Workflow Entities

### 8.1 quotation_history

Table: `quotation_history`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| quotation_id | uuid | FK → quotations.id (CASCADE DELETE), NOT NULL | Parent quotation |
| action | enum | NOT NULL | Action performed |
| changes | jsonb | nullable | Before/after diff data |
| note | text | nullable | Human-readable note |
| performed_by | uuid | FK → users.id, NOT NULL | Actor |
| created_at | timestamptz | NOT NULL | Auto-set on insert |

Enum `HistoryAction`:
```
created           updated           status_changed    duplicated
pdf_exported      ai_extracted      ai_translated     normalized
email_sent        ingestion_failed  version_created   review_requested
review_approved   review_rejected   comparison_run
```

---

### 8.2 quotation_versions

Table: `quotation_versions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| quotation_id | uuid | FK → quotations.id (CASCADE DELETE), NOT NULL, INDEX | Parent quotation |
| version_number | int | NOT NULL | Sequential version number |
| label | text | nullable | Human-readable label (e.g. "v2 - Revised pricing") |
| snapshot | jsonb | NOT NULL | Full quotation state at this version |
| change_summary | text | nullable | Summary of changes |
| created_by | uuid | FK → users.id, NOT NULL | Who created this version |
| created_at | timestamptz | NOT NULL | Auto-set on insert |

Unique constraint: `(quotation_id, version_number)` — version numbers unique per quotation.

The `snapshot` JSONB stores the complete quotation including all items, customer info, prices, and terms at the time of versioning.

---

### 8.3 review_requests

Table: `review_requests`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| organization_id | uuid | FK → organizations.id (CASCADE DELETE), INDEX | Owning organization |
| type | enum | NOT NULL | Review request type |
| status | enum | NOT NULL, default 'pending', INDEX | Review status |
| quotation_id | uuid | FK → quotations.id, nullable, INDEX | Related quotation |
| job_id | uuid | nullable | Related ingestion job |
| payload | jsonb | NOT NULL | Context data for reviewer |
| proposed_data | jsonb | nullable | Data proposed for approval |
| reviewer_notes | text | nullable | Reviewer's comments |
| reviewer_changes | jsonb | nullable | Changes made by reviewer |
| requested_by | uuid | FK → users.id, NOT NULL | Who requested review |
| assigned_to | uuid | FK → users.id, nullable, INDEX | Assigned reviewer |
| reviewed_by | uuid | FK → users.id, nullable | Who reviewed |
| reviewed_at | timestamptz | nullable | When review was completed |
| created_at | timestamptz | NOT NULL | Auto-set on insert |
| updated_at | timestamptz | NOT NULL | Auto-set on update |

Enum `ReviewType`: `ingestion`, `status_change`, `price_override`, `comparison`

Enum `ReviewStatus`: `pending`, `approved`, `rejected`, `revision_requested`

---

## 9. Domain Rules Entities

### 9.1 rule_sets

Table: `rule_sets`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| organization_id | uuid | FK → organizations.id (CASCADE DELETE), INDEX | Owning organization |
| category | enum | NOT NULL | Domain category |
| name | varchar | NOT NULL | Rule set name |
| description | text | nullable | Rule set description |
| rules | jsonb | NOT NULL | Array of rule objects |
| is_active | boolean | NOT NULL, default true | Whether rules are enforced |
| created_by | uuid | NOT NULL | Creator |
| created_at | timestamptz | NOT NULL | Auto-set on insert |
| updated_at | timestamptz | NOT NULL | Auto-set on update |

Unique constraint: `(organization_id, category)` — one rule set per category per org.

Enum `RuleCategory`: `lab`, `biotech`, `icu`, `analytical`, `general`

JSONB `rules` schema:
```json
[
  {
    "field": "unit_price",
    "operator": "less_than",
    "value": 1000,
    "action": "warn",
    "actionValue": "Price may be too low for lab equipment",
    "priority": 1,
    "message": "Unit price below minimum threshold"
  }
]
```

Rule object fields:
| Field | Type | Description |
|-------|------|-------------|
| field | string | Entity field to evaluate |
| operator | string | Comparison: `equals`, `less_than`, `greater_than`, `contains`, etc. |
| value | any | Comparison value |
| action | string | `warn`, `block`, `auto_correct` |
| actionValue | any | optional — value to set for `auto_correct` |
| priority | int | Evaluation order (lower = higher priority) |
| message | string | optional — human-readable message |

---

### 9.2 glossary_terms

Table: `glossary_terms`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| organization_id | uuid | FK → organizations.id (CASCADE DELETE), INDEX | Owning organization |
| source_term | varchar | NOT NULL | Term in source language |
| target_term | varchar | NOT NULL | Term in target language |
| source_language | varchar | NOT NULL, default 'en' | Source language code |
| target_language | varchar | NOT NULL, default 'vi' | Target language code |
| category | varchar | nullable, INDEX | Term category (lab, biotech, etc.) |
| created_by | uuid | NOT NULL | Creator |
| created_at | timestamptz | NOT NULL | Auto-set on insert |
| updated_at | timestamptz | NOT NULL | Auto-set on update |

Unique constraint: `(organization_id, source_term)` — one translation per source term per org.

Used by `AiService.translate()` to inject domain-specific terminology into the translation prompt, ensuring consistent Vietnamese terminology across quotations.

---

## 10. Price Monitoring Entities

### 10.1 price_monitoring_jobs

Table: `price_monitoring_jobs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| organization_id | uuid | FK → organizations.id (CASCADE DELETE), INDEX | Owning organization |
| status | enum | NOT NULL, default 'pending', INDEX | Job status |
| trigger_type | enum | NOT NULL | How the job was triggered |
| triggered_by | varchar | nullable | User ID if manual trigger |
| total_products | int | NOT NULL, default 0 | Total products to check |
| processed_products | int | NOT NULL, default 0 | Products checked so far |
| alert_count | int | NOT NULL, default 0 | Number of alerts generated |
| n8n_execution_id | varchar | nullable | Correlated n8n execution |
| error | text | nullable | Error message if failed |
| started_at | timestamptz | nullable | When processing started |
| completed_at | timestamptz | nullable | When processing completed |
| created_at | timestamptz | NOT NULL | Auto-set on insert |
| updated_at | timestamptz | NOT NULL | Auto-set on update |

Enum `PriceMonitoringJobStatus`: `pending`, `running`, `completed`, `failed`, `partial`

Enum `PriceMonitoringTriggerType`: `manual`, `scheduled`

---

### 10.2 price_alerts

Table: `price_alerts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| organization_id | uuid | FK → organizations.id (CASCADE DELETE), INDEX | Owning organization |
| job_id | uuid | FK → price_monitoring_jobs.id (CASCADE DELETE), INDEX | Parent job |
| product_id | uuid | NOT NULL, INDEX | Product that triggered alert |
| product_name | varchar | nullable | Product name at time of alert |
| severity | enum | NOT NULL, INDEX | Alert severity level |
| previous_price | decimal(15,2) | NOT NULL | Price before change |
| current_price | decimal(15,2) | NOT NULL | Price after change |
| price_change_percent | decimal(8,2) | NOT NULL | Percentage change |
| message | text | NOT NULL | Human-readable alert message |
| is_read | boolean | NOT NULL, default false | Whether alert has been acknowledged |
| created_at | timestamptz | NOT NULL | Auto-set on insert |

Enum `PriceAlertSeverity`: `info`, `warning`, `critical`

Alerts are sent to Telegram via `TelegramNotificationService` when a monitoring job completes.

---

### 10.3 price_records

Table: `price_records`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | Primary key |
| job_id | uuid | FK → price_monitoring_jobs.id (CASCADE DELETE), INDEX | Parent job |
| product_id | uuid | NOT NULL, INDEX | Product ID |
| product_name | varchar | NOT NULL | Product name at time of record |
| previous_price | decimal(15,2) | NOT NULL | Previous recorded price |
| current_price | decimal(15,2) | NOT NULL | Current fetched price |
| price_change | decimal(15,2) | NOT NULL | Absolute change |
| price_change_percent | decimal(8,2) | NOT NULL | Percentage change |
| currency_code | varchar(3) | NOT NULL, default 'VND' | Currency code |
| source | varchar | nullable | Where the price was fetched from |
| fetched_at | timestamptz | NOT NULL | When the price was fetched |
| created_at | timestamptz | NOT NULL | Auto-set on insert |

---

## 11. Index Strategy

### Primary Key Indexes (all tables)
All tables use `uuid` primary keys with `@PrimaryGeneratedColumn('uuid')`. PostgreSQL automatically creates B-tree indexes on PKs.

### Unique Constraints

| Table | Unique Columns | Purpose |
|-------|---------------|---------|
| users | email | Login uniqueness |
| organizations | name | Display name uniqueness |
| organizations | slug | URL slug uniqueness |
| currencies | code | ISO code uniqueness |
| company_settings | organization_id | One settings per org |
| quotations | quotation_number | Human-readable ID uniqueness |
| organization_members | (user_id, organization_id) | No duplicate memberships |
| ai_prompt_versions | (type, version_number) | Version uniqueness per type |
| quotation_versions | (quotation_id, version_number) | Version numbering per quotation |
| file_checksum_cache | (checksum, organization_id) | Cache uniqueness per org |
| rule_sets | (organization_id, category) | One rule set per category per org |
| glossary_terms | (organization_id, source_term) | One translation per term per org |

### Foreign Key Indexes (explicit @Index() decorators)

| Table | Indexed Columns | Reason |
|-------|-----------------|--------|
| organization_members | user_id, organization_id | Membership lookups |
| quotations | organization_id | Tenant-scoped queries |
| customers | organization_id | Tenant-scoped queries |
| products | organization_id | Tenant-scoped queries |
| templates | organization_id | Tenant-scoped queries |
| attachments | organization_id | Tenant-scoped queries |
| ingestion_jobs | organization_id, status, file_checksum, correlation_id | Job queue queries |
| file_checksum_cache | checksum, organization_id, expires_at | Cache lookups |
| token_usage | quotation_id, user_id, tenant_id, created_at | Billing aggregations |
| ai_prompt_versions | type, is_active | Active prompt lookup |
| review_requests | organization_id, status, quotation_id, assigned_to | Review queue queries |
| quotation_versions | quotation_id | Version list queries |
| n8n_execution_log | execution_id, quotation_id, correlation_id | Log correlation |
| price_monitoring_jobs | organization_id, status | Job queue queries |
| price_alerts | organization_id, job_id, product_id, severity | Alert queries |
| price_records | job_id, product_id | Price history queries |

### Query Performance Notes

1. **Tenant isolation queries** always filter by `organization_id` first — all org-scoped tables have this indexed.
2. **Token usage aggregation** uses `(tenant_id, created_at)` — both indexed for monthly billing rollup.
3. **Ingestion deduplication** uses `(checksum, organization_id)` on `file_checksum_cache` — unique index doubles as lookup index.
4. **Active prompt lookup** uses `(type, is_active)` on `ai_prompt_versions` — quick lookup for the active prompt of each type.
5. **Soft-delete** is handled at TypeORM level — queries automatically add `WHERE deleted_at IS NULL`.

---

## Cross-References

- [System Architecture](./architecture.md) — high-level design, module dependencies
- [n8n Architecture](./n8n-architecture.md) — ingestion pipeline using these entities
