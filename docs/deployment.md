# Deployment Guide

## 1. Environment Variables Reference

### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and fill in the values below.

#### Server

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | HTTP port the NestJS server listens on | `4001` | No |
| `NODE_ENV` | Runtime environment (`development` / `production`) | `development` | No |

#### Database

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | PostgreSQL host | `localhost` | Yes (local) |
| `DB_PORT` | PostgreSQL port | `5432` | No |
| `DB_USERNAME` | PostgreSQL user | `postgres` | Yes (local) |
| `DB_PASSWORD` | PostgreSQL password | `postgres` | Yes (local) |
| `DB_DATABASE` | PostgreSQL database name | `bao_gia` | Yes (local) |
| `DATABASE_URL` | Full connection string (overrides individual DB_* vars). Required for cloud DBs (Render, Neon). | — | Yes (cloud) |
| `DB_SYNCHRONIZE` | Auto-sync TypeORM schema (never use `true` in production with data). | `false` | No |

When `DATABASE_URL` is set, the app uses it directly with `ssl: { rejectUnauthorized: false }` — required for Render and Neon managed databases.

#### Auth

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | Secret key for signing JWTs. Use a long random string in production. | — | Yes |
| `JWT_EXPIRATION` | Token lifetime (e.g. `7d`, `24h`) | `7d` | No |

Generate a strong secret:
```bash
openssl rand -hex 32
```

#### AI (Anthropic)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ANTHROPIC_API_KEY` | Anthropic Claude API key for AI features | — | Yes (if using AI) |

#### n8n Integration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `N8N_SERVICE_KEY` | Shared secret for n8n → backend service calls (`X-Service-Key` header) | — | Yes (if using n8n) |
| `N8N_WEBHOOK_SECRET` | Shared secret for n8n → backend webhook callbacks (`X-Webhook-Secret` header) | — | Yes (if using n8n) |
| `N8N_BASE_URL` | Base URL of the n8n instance for backend to trigger workflows | `http://localhost:5679` | Yes (if using n8n) |

Generate both keys:
```bash
openssl rand -hex 32   # for N8N_SERVICE_KEY
openssl rand -hex 32   # for N8N_WEBHOOK_SECRET
```

#### Encryption

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ENCRYPTION_KEY` | 64-character hex string (32 bytes) for AES-256-GCM encryption of org secrets. Falls back to a JWT_SECRET-derived key if not set (not safe for production). | — | Yes (production) |

Generate:
```bash
openssl rand -hex 32
```

#### CORS

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `CORS_ORIGIN` | Comma-separated list of allowed frontend origins | `http://localhost:4000` | No |

#### Monitoring

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SENTRY_DSN` | Sentry project DSN for error tracking | — | No |
| `SENTRY_ENVIRONMENT` | Sentry environment label (`development`, `production`) | `development` | No |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source map uploads during build | — | No |

---

### Frontend (`frontend/.env.local`)

Copy `frontend/.env.example` to `frontend/.env.local`.

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Full URL of the backend API including `/api` path | `http://localhost:4001/api` | No |
| `NEXT_PUBLIC_N8N_URL` | URL of the n8n instance (used for the workflow editor iframe) | `http://localhost:5678` | No |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for frontend error tracking | — | No |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | Sentry environment label | `development` | No |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source map uploads | — | No |

---

## 2. Local Development Setup

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15 (local install or via Docker)
- Git

### Step-by-Step

**1. Clone the repository**

```bash
git clone git@github.com:giahuydo/bao-gia.git
cd bao-gia
```

**2. Start PostgreSQL**

Using Docker (recommended):

```bash
docker compose up -d postgres
```

Or install PostgreSQL locally and create the database:

```bash
psql -U postgres -c "CREATE DATABASE bao_gia;"
```

**3. Set up backend environment**

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — set JWT_SECRET at minimum
```

**4. Install backend dependencies and start**

```bash
cd backend
npm install
npm run migration:run   # Apply pending migrations
npm run seed            # Optional: seed initial data
npm run start:dev       # Start dev server on port 4001
```

**5. Set up frontend environment**

In a new terminal:

```bash
cp frontend/.env.example frontend/.env.local
# Default values work for local development
```

**6. Install frontend dependencies and start**

```bash
cd frontend
npm install
npm run dev             # Start dev server on port 4000
```

**7. Verify**

- Backend: http://localhost:4001/api/health
- Swagger docs: http://localhost:4001/api/docs
- Frontend: http://localhost:4000

---

## 3. Docker Compose Setup

### Full Stack (postgres + backend + frontend)

The root `docker-compose.yml` runs all three services:

```bash
docker compose up -d
```

Services:

| Container | Port | Description |
|-----------|------|-------------|
| `baogia-postgres` | 5432 | PostgreSQL 15 |
| `baogia-backend` | 4001 | NestJS API |
| `baogia-frontend` | 4000 | Next.js frontend |

The backend reads `backend/.env` for its configuration. Ensure this file exists before starting.

### n8n Workflow Engine

n8n runs separately with its own dedicated PostgreSQL instance (does not share the Bao Gia database):

```bash
docker compose -f docker-compose.n8n.yml up -d
```

Services:

| Container | Port | Description |
|-----------|------|-------------|
| `baogia-n8n` | 5679 | n8n workflow engine |
| `baogia-n8n-postgres` | (internal) | PostgreSQL for n8n data only |

**Default credentials (change before production):**

| Variable | Default Value |
|----------|---------------|
| `N8N_ADMIN_USER` | `admin` |
| `N8N_ADMIN_PASSWORD` | `baogia_n8n_dev` |
| `N8N_DB_PASSWORD` | `n8n_dev_password` |

Access n8n at: http://localhost:5679

**Notable configuration:**

- Telemetry and personalization are disabled (`N8N_DIAGNOSTICS_ENABLED=false`)
- Execution data is pruned after 168 hours (7 days) by default
- Custom nodes can be mounted at `./n8n/custom-nodes/`
- n8n's PostgreSQL port is not exposed to the host by default (can be uncommented in the compose file for debugging)

**Volume data:**

- `baogia_n8n_data` — n8n workflows, credentials, settings
- `baogia_n8n_postgres_data` — n8n database

---

## 4. Production Deployment: Backend (Render)

The backend is deployed to Render using the configuration in `backend/render.yaml`.

### Resources

| Resource | Plan | Region |
|----------|------|--------|
| `bao-gia-db` (PostgreSQL) | Free | Singapore |
| `bao-gia-api` (Web Service) | Free | Singapore |

### Build and Start Commands

| Command | Value |
|---------|-------|
| Build | `PUPPETEER_SKIP_DOWNLOAD=true npm ci --include=dev && npm run build` |
| Start | `npm run start:prod` |

The `--include=dev` flag is required because `@nestjs/cli` (used for building) is a devDependency. Render installs only production dependencies by default, so this flag must be present to include the NestJS CLI in the build environment.

`PUPPETEER_SKIP_DOWNLOAD=true` prevents Puppeteer from downloading Chromium during `npm ci` since it is not needed in the backend.

### Health Check

Render pings `/api/health` to determine if the service is healthy before routing traffic.

### Environment Variables on Render

Set the following in the Render dashboard under the service's "Environment" tab:

| Variable | Source | Notes |
|----------|--------|-------|
| `NODE_ENV` | `production` | Set directly |
| `PORT` | `4001` | Set directly |
| `DATABASE_URL` | Auto-linked from `bao-gia-db` | Render injects this automatically |
| `DB_SYNCHRONIZE` | `true` | Render free tier currently uses synchronize instead of explicit migrations |
| `JWT_SECRET` | Manual (no sync) | Generate with `openssl rand -hex 32` |
| `JWT_EXPIRATION` | `7d` | Set directly |
| `CORS_ORIGIN` | `https://bao-gia-fe.vercel.app,http://localhost:4000` | Set directly |
| `ANTHROPIC_API_KEY` | Manual (no sync) | From Anthropic console |
| `N8N_SERVICE_KEY` | Manual (no sync) | `openssl rand -hex 32` |
| `N8N_WEBHOOK_SECRET` | Manual (no sync) | `openssl rand -hex 32` |
| `ENCRYPTION_KEY` | Manual (no sync) | `openssl rand -hex 32` |
| `SENTRY_DSN` | Manual (no sync) | From Sentry project settings |
| `SENTRY_ENVIRONMENT` | `production` | Set directly |
| `PUPPETEER_SKIP_DOWNLOAD` | `true` | Set directly |

Variables marked "no sync" (`sync: false` in `render.yaml`) are secrets that must be entered manually in the Render dashboard and are not stored in the YAML file.

---

## 5. Production Deployment: Frontend (Vercel)

The frontend is a standard Next.js application deployable to Vercel.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

cd frontend
vercel --prod
```

Or connect the GitHub repository in the Vercel dashboard and configure:

- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Node.js Version:** 20.x

### Environment Variables on Vercel

Set these in the Vercel project settings under "Environment Variables":

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://bao-gia-api.onrender.com/api` | Backend URL on Render |
| `NEXT_PUBLIC_N8N_URL` | URL of your n8n instance | Used for workflow editor iframe |
| `NEXT_PUBLIC_SENTRY_DSN` | From Sentry | Optional |
| `SENTRY_AUTH_TOKEN` | From Sentry | Required only if uploading source maps |

Make sure the Render backend's `CORS_ORIGIN` includes the Vercel deployment URL (e.g., `https://bao-gia-fe.vercel.app`).

### Other Hosting Options

The frontend can also be self-hosted using Docker. A `Dockerfile` must be present in `frontend/`. The `docker-compose.yml` at the root supports this. Set `NEXT_PUBLIC_API_URL` appropriately for the target environment.

---

## 6. Database Migrations in Production

### Generating a Migration

After modifying TypeORM entities, generate a migration file:

```bash
cd backend
npm run migration:generate -- src/database/migrations/<DescriptiveName>
```

This compares the current entity definitions against the existing schema and generates the SQL diff.

### Running Migrations

```bash
npm run migration:run
```

This applies all pending migrations in order. Always run this before deploying a new backend version that includes schema changes.

### Rollback Strategy

```bash
npm run migration:revert
```

This runs the `down()` method of the most recently applied migration, reverting the last schema change.

For multi-step rollbacks, run the command repeatedly.

**Important:** The `render.yaml` currently sets `DB_SYNCHRONIZE=true` for the Render deployment, which means TypeORM auto-syncs the schema on startup instead of using explicit migrations. This is acceptable during the greenfield/scaffolding phase but must be switched to migration-based deployment before going to production with real data:

1. Set `DB_SYNCHRONIZE=false` in the Render environment
2. Ensure all schema changes are captured in migration files
3. Run `npm run migration:run` as part of the deploy process (e.g., as a Render pre-deploy hook or a one-off job)

### Safe Migration Practices

- Always take a database backup before running migrations against production data
- Test migrations against a staging database first
- Prefer additive changes (add columns, add tables) over destructive ones (drop columns, rename columns)
- For destructive changes, use a two-phase approach: deploy with backward-compatible schema first, then clean up in a subsequent release

---

## 7. Health Checks and Monitoring

### Health Endpoint

`GET /api/health` — No authentication required. Used by Render for health checks.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-02-24T08:00:00.000Z",
  "uptime": 3600.12,
  "database": {
    "connected": true,
    "latencyMs": 4
  }
}
```

| Field | Description |
|-------|-------------|
| `status` | `"ok"` if DB is connected, `"degraded"` if not |
| `timestamp` | ISO 8601 timestamp of the check |
| `uptime` | Process uptime in seconds |
| `database.connected` | Whether TypeORM DataSource is initialized |
| `database.latencyMs` | Round-trip time for `SELECT 1` in milliseconds |

The health controller runs a live `SELECT 1` query on each call to verify the actual database connection, not just whether TypeORM was initialized at startup.

### CorrelationId Middleware

All requests receive a `X-Correlation-Id` header (generated if not provided by the caller). This ID is propagated across service-to-service calls to enable distributed tracing in logs.

---

## 8. Sentry Integration

Sentry is integrated for error tracking on both backend and frontend.

### Backend

Sentry is initialized in `backend/src/instrument.ts`, which is imported at the very top of `backend/src/main.ts` before any other imports:

```typescript
// backend/src/instrument.ts
import * as Sentry from "@sentry/nestjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
});
```

`SentryGlobalFilter` is registered as a global exception filter in `AppModule`, so all unhandled exceptions are automatically captured and sent to Sentry.

**Trace sample rates:**
- Development: 100% of transactions sampled
- Production: 10% of transactions sampled (to manage quota)

### Frontend

Frontend Sentry configuration uses `NEXT_PUBLIC_SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_ENVIRONMENT`.

### Setup

1. Create a project in [sentry.io](https://sentry.io) (select NestJS for backend, Next.js for frontend)
2. Copy the DSN from project settings
3. Set `SENTRY_DSN` (backend) and `NEXT_PUBLIC_SENTRY_DSN` (frontend) in the respective environment files
4. Optionally set `SENTRY_AUTH_TOKEN` to enable source map uploads during build, which improves stack trace readability in the Sentry UI
