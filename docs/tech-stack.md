# Tech Stack - Bao Gia (Quotation Management)

## Overview

Bao Gia is a quotation management system with a NestJS backend, Next.js frontend, PostgreSQL database, and n8n workflow automation for document ingestion pipelines.

---

## Runtime & Language

| Tool       | Version | Notes                |
|------------|---------|----------------------|
| Node.js    | 20.x    | LTS                  |
| npm        | 10.x    |                      |
| TypeScript | 5.x     | Shared across FE/BE  |

---

## Backend (`backend/` - port 4001)

### Framework

| Library               | Version | Purpose                           |
|-----------------------|---------|-----------------------------------|
| NestJS                | 10.x    | Core framework                    |
| @nestjs/platform-express | 10.x | HTTP adapter (Express)            |
| @nestjs/config        | 3.x     | Environment configuration         |
| @nestjs/swagger       | 7.x     | API documentation (OpenAPI)       |

### Database & ORM

| Library          | Version | Purpose                      |
|------------------|---------|------------------------------|
| TypeORM          | 0.3.x   | ORM, migrations, repositories |
| @nestjs/typeorm  | 10.x    | NestJS TypeORM integration   |
| pg               | 8.x     | PostgreSQL driver            |
| PostgreSQL       | 15      | Primary database             |

### Authentication

| Library           | Version | Purpose               |
|-------------------|---------|----------------------|
| @nestjs/passport  | 10.x    | Auth integration      |
| @nestjs/jwt       | 10.x    | JWT token handling    |
| passport          | 0.7.x   | Auth middleware       |
| passport-jwt      | 4.x     | JWT strategy          |
| bcrypt            | 5.x     | Password hashing      |

### Validation & Transformation

| Library            | Version | Purpose               |
|--------------------|---------|----------------------|
| class-validator    | 0.14.x  | DTO validation        |
| class-transformer  | 0.5.x   | Object transformation |

### AI & Document Processing

| Library            | Version | Purpose                            |
|--------------------|---------|-----------------------------------|
| @anthropic-ai/sdk  | 0.30.x  | Claude API (AI extraction, translation, suggestions) |
| puppeteer          | 22.x    | PDF generation (headless Chrome)  |
| handlebars         | 4.x     | PDF template rendering            |

### Utilities

| Library    | Version | Purpose               |
|------------|---------|----------------------|
| rxjs       | 7.x     | Reactive programming  |
| uuid       | 9.x     | UUID generation       |
| dotenv     | 17.x    | Environment variables |

### Dev & Testing

| Library           | Version | Purpose              |
|-------------------|---------|---------------------|
| @nestjs/cli       | 10.x    | CLI scaffolding      |
| @nestjs/testing   | 10.x    | Test utilities       |
| Jest              | 29.x    | Test runner          |
| ts-jest           | 29.x    | TypeScript transform |
| ESLint            | -       | Linting              |
| Prettier          | -       | Code formatting      |

### Backend Modules

```
src/modules/
  ai/              -- Claude AI integration (extraction, translation, suggestions)
  attachments/     -- File upload/download
  auth/            -- JWT authentication
  company-settings/ -- Company configuration
  currencies/      -- Currency management
  customers/       -- Customer CRUD
  ingestion/       -- Vendor document ingestion pipeline
  products/        -- Product catalog
  quotations/      -- Quotation CRUD, PDF generation, history
  templates/       -- Quotation templates
  users/           -- User management
  webhooks/        -- n8n webhook callbacks
```

### Database Entities

```
src/database/entities/
  user.entity.ts
  customer.entity.ts
  product.entity.ts
  quotation.entity.ts
  quotation-item.entity.ts
  quotation-history.entity.ts
  template.entity.ts
  currency.entity.ts
  company-settings.entity.ts
  attachment.entity.ts
  token-usage.entity.ts
  n8n-execution-log.entity.ts
```

---

## Frontend (`frontend/` - port 4000)

### Framework

| Library     | Version | Purpose                    |
|-------------|---------|---------------------------|
| Next.js     | 16.x    | React framework (App Router) |
| React       | 19.x    | UI library                 |
| TypeScript  | 5.x     | Type safety                |

### Styling & UI Components

| Library       | Version | Purpose                    |
|---------------|---------|---------------------------|
| Tailwind CSS  | 4.x     | Utility-first CSS          |
| shadcn/ui     | -       | Component library (New York style) |
| Radix UI      | 1.x     | Headless UI primitives     |
| Lucide React  | 0.575.x | Icon library               |

### State & Data Fetching

| Library             | Version | Purpose                 |
|---------------------|---------|------------------------|
| TanStack React Query | 5.x    | Server state management |
| Axios               | 1.x     | HTTP client             |

### Forms & Validation

| Library              | Version | Purpose               |
|----------------------|---------|----------------------|
| React Hook Form      | 7.x     | Form management       |
| @hookform/resolvers  | 5.x     | Schema validation bridge |
| Zod                  | 4.x     | Schema validation     |

### Utilities

| Library   | Version | Purpose              |
|-----------|---------|---------------------|
| date-fns  | 4.x     | Date manipulation    |
| Sonner    | 2.x     | Toast notifications  |

### Frontend Structure

```
frontend/
  src/
    app/             -- Next.js App Router (pages, layouts)
    components/
      ui/            -- shadcn/ui components
  components/        -- Project-level shared components
  public/            -- Static assets
```

---

## Workflow Automation (n8n - port 5679)

| Component      | Version        | Purpose                           |
|----------------|----------------|----------------------------------|
| n8n            | latest (Docker) | Workflow orchestration            |
| PostgreSQL     | 15-alpine       | n8n's own database (separate from app DB) |

### n8n Workflows

| Workflow                      | Status  | Description                                    |
|-------------------------------|---------|-----------------------------------------------|
| Vendor Quotation Ingestion    | Planned | PDF/DOCX -> AI extract -> translate -> quotation |
| Quotation Delivery            | Planned | Generate PDF -> send email to customer         |
| Scheduled Expiration Check    | Planned | Daily cron to expire old quotations            |

### Communication Pattern

```
n8n -> NestJS:  X-Service-Key header (ServiceAuthGuard)
NestJS -> n8n:  Bearer token (N8N_API_KEY)
n8n callbacks:  X-Webhook-Secret header (WebhookSecretGuard)
```

---

## Infrastructure

### Docker Services

| Service         | Container Name        | Port  | Network          |
|-----------------|----------------------|-------|------------------|
| n8n             | baogia-n8n           | 5679  | baogia-network   |
| n8n PostgreSQL  | baogia-n8n-postgres  | -     | baogia-network   |

### Environment Variables

| Variable             | Service  | Purpose                        |
|----------------------|----------|-------------------------------|
| PORT                 | Backend  | API server port (4001)         |
| DB_HOST/PORT/...     | Backend  | PostgreSQL connection          |
| JWT_SECRET           | Backend  | JWT signing key                |
| ANTHROPIC_API_KEY    | Backend  | Claude API access              |
| N8N_SERVICE_KEY      | Backend  | n8n -> backend auth            |
| N8N_WEBHOOK_SECRET   | Backend  | n8n callback validation        |
| N8N_BASE_URL         | Backend  | n8n endpoint for triggering workflows |

---

## Architecture Diagram

```
                    ┌──────────────┐
                    │   Frontend   │
                    │  Next.js 16  │
                    │   :4000      │
                    └──────┬───────┘
                           │ HTTP
                           ▼
┌───────────┐      ┌──────────────┐      ┌──────────────┐
│   n8n     │◄────►│   Backend    │─────►│  Claude API  │
│   :5679   │      │  NestJS 10   │      │  (Anthropic) │
│           │      │   :4001      │      └──────────────┘
└───────────┘      └──────┬───────┘
                           │ TypeORM
                           ▼
                    ┌──────────────┐
                    │  PostgreSQL  │
                    │   :5432      │
                    │   bao_gia    │
                    └──────────────┘
```

---

## Development Commands

### Backend

```bash
cd backend
npm run start:dev          # Dev server (hot reload)
npm run build              # Production build
npm test                   # Run all tests
npm run test:cov           # Tests with coverage
npm run lint               # ESLint
npm run migration:generate # Generate TypeORM migration
npm run migration:run      # Run migrations
npm run seed               # Seed database
```

### Frontend

```bash
cd frontend
npm run dev                # Dev server
npm run build              # Production build
npm run lint               # ESLint
```

### n8n

```bash
docker compose -f docker-compose.n8n.yml up -d    # Start n8n
docker compose -f docker-compose.n8n.yml down      # Stop n8n
docker compose -f docker-compose.n8n.yml logs -f   # View logs
```
