# Bao Gia - Quotation Management

A full-stack quotation management system for creating, managing, and tracking business quotations. Built with NestJS, Next.js, PostgreSQL, and n8n for workflow automation.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend   │────▶│  PostgreSQL   │
│  (Next.js)   │     │  (NestJS)   │     │    Database   │
│  Port 4000   │     │  Port 4001  │     │  Port 5432    │
└─────────────┘     └──────┬──────┘     └──────────────┘
                           │
                    ┌──────▼──────┐
                    │     n8n      │
                    │  (Workflow)  │
                    │  Port 5679   │
                    └─────────────┘
```

- **Frontend** -- Next.js 16 with React 19, TailwindCSS, React Query, React Hook Form
- **Backend** -- NestJS 10 with TypeORM, JWT authentication, Swagger API docs
- **Database** -- PostgreSQL 15
- **Workflow Engine** -- n8n (Docker) for AI-powered document ingestion and automation
- **Shared** -- Framework-agnostic TypeScript types and constants used by both frontend and backend

## Prerequisites

- **Node.js** >= 20 (see `.nvmrc`)
- **PostgreSQL** >= 15
- **Docker** and **Docker Compose** (for n8n)
- **npm** >= 9

## Quick Start

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd "Bao Gia"

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Set up the database

```bash
# Create the PostgreSQL database
createdb bao_gia

# Copy and configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials
```

### 3. Run database migrations

```bash
cd backend
npm run migration:run
npm run seed   # optional: seed sample data
```

### 4. Start n8n (optional, for workflow automation)

```bash
docker compose -f docker-compose.n8n.yml up -d
```

### 5. Start development servers

```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

The application will be available at:
- Frontend: http://localhost:4000
- Backend API: http://localhost:4001
- Swagger docs: http://localhost:4001/api
- n8n dashboard: http://localhost:5679

## Project Structure

```
Bao Gia/
├── backend/                 # NestJS API server
│   ├── src/
│   │   ├── common/          # Guards, decorators, pipes, filters
│   │   ├── config/          # App configuration, data source
│   │   ├── database/
│   │   │   ├── entities/    # TypeORM entities
│   │   │   ├── migrations/  # Database migrations
│   │   │   └── seeds/       # Seed scripts
│   │   └── modules/         # Feature modules (quotations, customers, products, etc.)
│   └── test/                # E2E tests
├── frontend/                # Next.js frontend
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities, API client
│   └── types/               # Frontend-specific types
├── shared/                  # Shared code (framework-agnostic)
│   ├── types/               # TypeScript interfaces and enums
│   └── constants/           # Shared constants
├── docs/                    # Project documentation
├── docker-compose.n8n.yml   # n8n + its PostgreSQL
├── CLAUDE.md                # AI assistant instructions
└── README.md                # This file
```

## Ports

| Service    | Port | Description               |
|------------|------|---------------------------|
| Frontend   | 4000 | Next.js dev server        |
| Backend    | 4001 | NestJS API server         |
| PostgreSQL | 5432 | Application database      |
| n8n        | 5679 | Workflow automation engine |

Ports start at 4000 to avoid conflicts with other projects.

## Development Commands

### Backend (`backend/`)

| Command                                   | Description                |
|-------------------------------------------|----------------------------|
| `npm run start:dev`                       | Start dev server (watch)   |
| `npm run build`                           | Build for production       |
| `npm test`                                | Run unit tests             |
| `npm run test:e2e`                        | Run E2E tests              |
| `npm run migration:generate -- src/...`   | Generate migration         |
| `npm run migration:run`                   | Run pending migrations     |
| `npm run seed`                            | Seed the database          |
| `npm run lint`                            | Lint and fix               |

### Frontend (`frontend/`)

| Command           | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Start dev server         |
| `npm run build`   | Build for production     |
| `npm run lint`    | Lint                     |

### n8n

| Command                                         | Description       |
|--------------------------------------------------|-------------------|
| `docker compose -f docker-compose.n8n.yml up -d` | Start n8n         |
| `docker compose -f docker-compose.n8n.yml down`  | Stop n8n          |
| `docker compose -f docker-compose.n8n.yml logs`  | View n8n logs     |

## Environment Setup

Copy `backend/.env.example` to `backend/.env` and configure the following:

| Variable              | Description                          | Default                |
|-----------------------|--------------------------------------|------------------------|
| `PORT`                | Backend server port                  | `4001`                 |
| `DB_HOST`             | PostgreSQL host                      | `localhost`            |
| `DB_PORT`             | PostgreSQL port                      | `5432`                 |
| `DB_USERNAME`         | Database user                        | `postgres`             |
| `DB_PASSWORD`         | Database password                    | `postgres`             |
| `DB_DATABASE`         | Database name                        | `bao_gia`              |
| `JWT_SECRET`          | JWT signing secret                   | (change in production) |
| `ANTHROPIC_API_KEY`   | Anthropic API key for AI features    | --                     |
| `N8N_SERVICE_KEY`     | Shared key for n8n service calls     | (generate with openssl)|
| `N8N_WEBHOOK_SECRET`  | Shared key for n8n webhook callbacks | (generate with openssl)|
| `N8N_BASE_URL`        | n8n instance URL                     | `http://localhost:5679`|

## Documentation

See the `docs/` directory for detailed documentation on:
- API specifications
- Database schema
- n8n workflow setup
- Deployment guide
