# Bao Gia — Developer Onboarding Guide

This guide is the starting point for any new developer joining the Bao Gia project. It covers local setup, project structure, key patterns, testing, and common how-to tasks.

---

## 1. Prerequisites

Make sure you have the following installed before cloning the repo:

| Tool | Minimum Version | Notes |
|------|----------------|-------|
| Node.js | 20 | Use nvm or fnm to manage versions |
| npm | 9 | Comes with Node.js 20+ |
| PostgreSQL | 15 | Running locally or via Docker |
| Docker | Any recent | Optional but recommended for DB |
| Git | Any recent | Required |

---

## 2. Quick Start

### 2.1 Clone the Repository

```bash
git clone https://github.com/giahuydo/bao-gia.git
cd bao-gia
```

### 2.2 Install Dependencies

Install backend and frontend dependencies separately:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2.3 Environment Setup

**Backend** — create `backend/.env` from the example below:

```env
PORT=4001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=bao_gia

# Auth
JWT_SECRET=your-secret-here
JWT_EXPIRATION=7d

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-...

# n8n integration
N8N_SERVICE_KEY=your-n8n-service-key
N8N_WEBHOOK_SECRET=your-webhook-secret
N8N_BASE_URL=http://localhost:5679

# Encryption key for org-level secrets (AES-256-GCM, 32-byte hex)
ENCRYPTION_KEY=your-32-byte-hex-key
```

**Frontend** — create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4001/api
NEXT_PUBLIC_N8N_URL=http://localhost:5678
```

### 2.4 Database Setup

Create the PostgreSQL database:

```bash
psql -U postgres -c "CREATE DATABASE bao_gia;"
```

Or via Docker:

```bash
docker run --name bao-gia-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=bao_gia \
  -p 5432:5432 \
  -d postgres:15
```

### 2.5 Run Database Migrations

```bash
cd backend
npm run migration:run
```

### 2.6 Seed the Database

```bash
cd backend
npm run seed
```

### 2.7 Start Development Servers

In two separate terminals:

```bash
# Terminal 1 — backend (port 4001)
cd backend
npm run start:dev

# Terminal 2 — frontend (port 4000)
cd frontend
npm run dev
```

The application is now accessible at:
- Frontend: http://localhost:4000
- Backend API: http://localhost:4001/api
- Swagger docs: http://localhost:4001/api/docs

---

## 3. Project Structure

This is a monorepo with three main directories:

```
bao-gia/
├── backend/          # NestJS 10 API
├── frontend/         # Next.js 16 application
├── shared/           # Shared TypeScript types and constants
└── docs/             # Project documentation
```

### 3.1 Backend — `backend/src/`

```
backend/src/
├── app.module.ts               # Root module — registers all modules
├── main.ts                     # Entry point — bootstrap, global pipes, CORS
├── config/
│   └── configuration.ts        # env variable mapping
├── common/
│   ├── decorators/
│   │   ├── current-user.decorator.ts   # @CurrentUser() param decorator
│   │   └── roles.decorator.ts          # @Roles() metadata decorator
│   ├── guards/
│   │   ├── jwt-auth.guard.ts           # JWT Bearer validation
│   │   ├── roles.guard.ts              # Role-based access control
│   │   ├── service-auth.guard.ts       # X-Service-Key (n8n -> backend)
│   │   └── webhook-secret.guard.ts     # X-Webhook-Secret (n8n callbacks)
│   ├── interceptors/
│   │   ├── transform.interceptor.ts    # Wraps responses in ApiResponse shape
│   │   └── tenant.interceptor.ts       # Injects organizationId into context
│   ├── middleware/
│   │   └── correlation-id.middleware.ts # X-Correlation-Id across services
│   └── services/
│       ├── encryption.service.ts       # AES-256-GCM for org secrets
│       ├── n8n-trigger.service.ts      # REST calls to trigger n8n workflows
│       └── tenant-context.service.ts   # Multi-tenant context helper
├── database/
│   ├── entities/               # TypeORM entity classes (one file per table)
│   ├── migrations/             # TypeORM migration files
│   └── seeds/                  # Database seed scripts
└── modules/                    # Feature modules (one directory per domain)
    ├── auth/
    ├── users/
    ├── quotations/
    ├── customers/
    ├── products/
    ├── templates/
    ├── currencies/
    ├── company-settings/
    ├── attachments/
    ├── ai/
    ├── ingestion/
    ├── webhooks/
    ├── organizations/
    ├── jobs/
    ├── versioning/
    ├── reviews/
    ├── prompts/
    ├── glossary/
    ├── rules/
    ├── price-monitoring/
    ├── telegram/
    └── health/
```

### 3.2 Frontend — `frontend/src/`

```
frontend/src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout — Providers + Navbar
│   ├── page.tsx                # Root redirect -> /dashboard
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/page.tsx
│   ├── quotations/
│   │   ├── page.tsx            # Quotation list
│   │   ├── new/page.tsx        # Create quotation
│   │   └── [id]/
│   │       ├── page.tsx        # Quotation detail
│   │       └── edit/page.tsx
│   ├── customers/
│   ├── products/
│   ├── templates/
│   ├── ai/
│   ├── jobs/
│   ├── reviews/
│   ├── organizations/
│   ├── settings/page.tsx
│   ├── currencies/page.tsx
│   ├── glossary/page.tsx
│   ├── rules/
│   ├── price-monitoring/page.tsx
│   └── workflows/page.tsx
├── components/
│   ├── layout/
│   │   └── navbar.tsx          # Top navigation bar
│   ├── ui/                     # shadcn/ui primitives
│   ├── quotations/             # Quotation-specific components
│   ├── customers/
│   ├── products/
│   ├── templates/
│   ├── ai/
│   ├── jobs/
│   ├── reviews/
│   ├── organizations/
│   ├── attachments/
│   ├── dashboard/
│   ├── currencies/
│   ├── glossary/
│   ├── rules/
│   ├── versions/
│   ├── settings/
│   └── price-monitoring/
├── hooks/                      # React Query hooks (one per domain)
│   ├── use-quotations.ts
│   ├── use-customers.ts
│   ├── use-products.ts
│   └── ...
├── lib/
│   ├── api.ts                  # Axios instance with interceptors
│   ├── auth.tsx                # AuthProvider + useAuth hook
│   ├── providers.tsx           # React context providers wrapper
│   └── api/                   # API service functions (one per domain)
│       ├── auth.ts
│       ├── quotations.ts
│       ├── customers.ts
│       └── ...
├── middleware.ts               # Next.js server middleware (auth redirect)
└── types/
    └── index.ts                # Re-exports from shared/types
```

### 3.3 Shared — `shared/`

```
shared/
├── types/
│   ├── index.ts           # Barrel — re-exports all types
│   ├── common.ts          # PaginatedResponse, ApiResponse, SortOrder
│   ├── user.ts            # UserRole, IUser, ILoginRequest, ILoginResponse
│   ├── quotation.ts       # QuotationStatus, IQuotation, IQuotationItem, ...
│   ├── customer.ts        # ICustomer
│   ├── product.ts         # IProduct
│   ├── organization.ts    # IOrganization, OrgMemberRole, ...
│   ├── job.ts             # JobStatus, IIngestionJob
│   ├── review.ts          # ReviewType, ReviewStatus, IReviewRequest
│   ├── version.ts         # IQuotationVersion, VersionDiff
│   ├── ai.ts              # AiOperation, IAiPromptVersion, CompareResult
│   ├── glossary.ts        # IGlossaryTerm
│   ├── rule.ts            # RuleCategory, IRule, IRuleSet
│   ├── price-monitoring.ts
│   └── dashboard.ts
└── constants/
    ├── quotation-status.ts    # QUOTATION_STATUS_LABELS, QUOTATION_STATUS_OPTIONS
    ├── currencies.ts          # DEFAULT_CURRENCY_CODE, CURRENCY_CODES
    ├── organization-plans.ts  # ORGANIZATION_PLANS with token limits
    └── price-monitoring.ts
```

---

## 4. Backend Patterns

### 4.1 Controller → Service → Repository

Every module follows this three-layer pattern:

```
HTTP Request
    |
    v
Controller  (handles HTTP, validates input via DTO, delegates to service)
    |
    v
Service     (business logic, orchestrates DB calls, throws HTTP exceptions)
    |
    v
Repository  (TypeORM repository — injected via @InjectRepository())
```

**Example — Quotations module:**

```typescript
// quotations.module.ts — registers entities and wires controller + service
@Module({
  imports: [TypeOrmModule.forFeature([Quotation, QuotationItem, QuotationHistory, Customer, Product])],
  controllers: [QuotationsController],
  providers: [QuotationsService],
  exports: [QuotationsService],
})
export class QuotationsModule {}
```

```typescript
// quotations.controller.ts — handles HTTP layer
@ApiTags('quotations')
@ApiBearerAuth()
@Controller('quotations')
@UseGuards(JwtAuthGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  create(@Body() createDto: CreateQuotationDto, @CurrentUser() user: any) {
    return this.quotationsService.create(createDto, user.id, user.organizationId);
  }

  @Get()
  findAll(@Query() queryDto: QuotationQueryDto, @CurrentUser() user: any) {
    return this.quotationsService.findAll(queryDto, user.organizationId);
  }

  @Get(':id/pdf')
  @ApiProduces('application/pdf')
  async exportPdf(@Param('id') id: string, @Res() res: Response, @CurrentUser() user: any) {
    const pdfBuffer = await this.quotationsService.generatePdf(id);
    res.set({ 'Content-Type': 'application/pdf', ... });
    res.end(pdfBuffer);
  }
}
```

### 4.2 Guards

Guards are applied at the controller or handler level via `@UseGuards()`:

| Guard | File | Purpose |
|-------|------|---------|
| `JwtAuthGuard` | `common/guards/jwt-auth.guard.ts` | Validates `Authorization: Bearer <token>` on every protected route |
| `RolesGuard` | `common/guards/roles.guard.ts` | Checks `@Roles()` decorator against the authenticated user's role |
| `ServiceAuthGuard` | `common/guards/service-auth.guard.ts` | Validates `X-Service-Key` header for n8n → backend calls |
| `WebhookSecretGuard` | `common/guards/webhook-secret.guard.ts` | Validates `X-Webhook-Secret` for n8n callback routes |

```typescript
// JwtAuthGuard extends Passport's AuthGuard('jwt')
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}

// RolesGuard reads metadata set by @Roles()
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    if (!requiredRoles.some((role) => user.role === role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
```

### 4.3 Decorators

```typescript
// @Roles() — restricts endpoint to specific roles
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Get('admin-only')
adminEndpoint() { ... }

// @CurrentUser() — injects the authenticated user from request
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}

// @CurrentUser('id') — injects only a specific field
create(@Body() dto: CreateDto, @CurrentUser('id') userId: string) { ... }
```

### 4.4 DTOs with class-validator

Every request body is validated through a DTO class decorated with `class-validator`:

```typescript
// backend/src/modules/quotations/dto/create-quotation.dto.ts
export class CreateQuotationDto {
  @ApiProperty({ example: 'Bao gia thiet ke website cho cong ty ABC' })
  @IsString()
  title: string;

  @ApiProperty()
  @IsUUID()
  customerId: string;

  @ApiPropertyOptional({ example: '2026-03-31' })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({ example: 5, description: 'Discount percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;

  @ApiProperty({ type: [CreateQuotationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuotationItemDto)
  items: CreateQuotationItemDto[];
}
```

### 4.5 Global ValidationPipe

Applied in `main.ts` with these settings:

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,           // Strip unknown properties
  forbidNonWhitelisted: true, // 400 if unknown properties sent
  transform: true,           // Auto-transform to DTO class instances
  transformOptions: {
    enableImplicitConversion: true,  // Convert query params to declared types
  },
}));
```

Other global settings in `main.ts`:
- Global prefix: `/api` — all routes are `/api/...`
- CORS: allows origins configured via env (includes `http://localhost:4000`)
- Swagger UI: `/api/docs`

---

## 5. Frontend Patterns

### 5.1 Next.js App Router

Pages are defined as `page.tsx` files inside `frontend/src/app/`. Each page exports a default React component. The root layout (`layout.tsx`) wraps all pages with `Providers` (React Query + Auth) and the `Navbar`.

```typescript
// frontend/src/app/quotations/page.tsx
import { QuotationList } from "@/components/quotations/quotation-list";

export default function QuotationsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <QuotationList />
    </div>
  );
}
```

Client components (those with interactivity) use the `"use client"` directive at the top.

### 5.2 React Query for Server State

All server data is managed with `@tanstack/react-query`. The pattern is:
1. Define API functions in `src/lib/api/<domain>.ts`
2. Wrap them in hooks inside `src/hooks/use-<domain>.ts`
3. Use the hook inside components

```typescript
// src/hooks/use-quotations.ts
export function useQuotations(params: GetQuotationsParams = {}) {
  return useQuery({
    queryKey: ["quotations", params],
    queryFn: () => getQuotations(params),
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateQuotationDto) => createQuotation(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
  });
}
```

### 5.3 API Client (Axios with Interceptors)

The single Axios instance lives in `src/lib/api.ts`:

```typescript
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear token and redirect to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; max-age=0";
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
```

All API service functions import and use this `api` instance:

```typescript
// src/lib/api/quotations.ts
import { api } from "@/lib/api";

export async function getQuotations(params: GetQuotationsParams) {
  const { data } = await api.get<PaginatedResponse<IQuotation>>("/quotations", { params });
  return data;
}
```

### 5.4 Auth System

Authentication has two layers:

**Server-side (Next.js middleware)** — `src/middleware.ts` runs on every request server-side. It checks for a `token` cookie and redirects to `/login` if missing on protected routes.

```typescript
// src/middleware.ts
const PUBLIC_PATHS = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p))) {
    if (token) return NextResponse.redirect(new URL("/quotations", request.url));
    return NextResponse.next();
  }
  if (!token) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}
```

**Client-side (AuthProvider)** — `src/lib/auth.tsx` provides an `AuthContext` that calls `GET /auth/profile` on mount to hydrate the user. It exposes `login()`, `register()`, and `logout()` functions.

Login stores the token in both `localStorage` (for Axios interceptor) and a cookie (for Next.js middleware):

```typescript
// Inside AuthProvider.login()
const { data } = await loginApi({ email, password });
localStorage.setItem("token", data.accessToken);
document.cookie = `token=${data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}`;
```

### 5.5 shadcn/ui Component Library

UI primitives are in `src/components/ui/`. All components come from shadcn/ui (built on Radix UI + Tailwind CSS). Do not modify files inside `src/components/ui/` — treat them as dependencies. Instead, build feature components in the domain directories (e.g., `src/components/quotations/`).

### 5.6 Forms — react-hook-form + Zod

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  customerId: z.string().uuid("Must be a valid customer"),
  discount: z.number().min(0).max(100).optional(),
});

type FormData = z.infer<typeof schema>;

function QuotationForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const form = useForm<FormData>({ resolver: zodResolver(schema) });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
```

---

## 6. Shared Types Workflow

The `shared/` directory is the single source of truth for all API contracts. Both backend and frontend import from it.

### 6.1 How Types Flow

```
shared/types/quotation.ts
    |
    |--- imported by backend entity files and DTOs (for enum values)
    |
    |--- imported by frontend via @shared alias
         frontend/src/types/index.ts re-exports for component use
```

**Frontend webpack alias** (set in `next.config.ts`):

```typescript
// next.config.ts
config.resolve.alias["@shared"] = path.resolve(__dirname, "shared");
```

**Frontend tsconfig path** (set in `tsconfig.json`):

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@shared/*": ["../shared/*"]
  }
}
```

### 6.2 How to Add or Modify an API Contract

1. **Add or edit the type in `shared/types/<domain>.ts`:**

```typescript
// shared/types/customer.ts
export interface ICustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxCode?: string;
  contactPerson?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
```

2. **Re-export from `shared/types/index.ts`** (if adding a new file):

```typescript
export * from './customer';
```

3. **Update the backend entity** to match the new shape.

4. **Update the frontend** `src/types/index.ts` if you want the type available project-wide:

```typescript
export { type ICustomer } from "@shared/types/customer";
```

5. **Never redefine types locally** in frontend components — always import from `@/types` or `@shared/types`.

---

## 7. Testing Strategy

### 7.1 Backend Unit Tests (Jest)

Backend tests use Jest with `@nestjs/testing`. Each service gets its own `.spec.ts` file in the same directory.

**The standard pattern** — mock all dependencies with `jest.fn()`, wire them via `Test.createTestingModule`, test behavior not implementation:

```typescript
// backend/src/modules/quotations/quotations.service.spec.ts
describe('QuotationsService', () => {
  let service: QuotationsService;
  let mockQuotationsRepo: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockQuotationsRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 'uuid', ...entity })),
      create: jest.fn().mockImplementation((data) => ({ ...data })),
      softRemove: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn().mockReturnValue(buildQueryBuilderMock()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotationsService,
        { provide: getRepositoryToken(Quotation), useValue: mockQuotationsRepo },
        { provide: DataSource, useValue: mockDataSource },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<QuotationsService>(QuotationsService);
  });

  describe('findOne()', () => {
    it('should throw NotFoundException when quotation is not found', async () => {
      mockQuotationsRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
```

**Running tests:**

```bash
# Run all tests
cd backend && npm test

# Run tests for a specific module
npx jest --testPathPattern="quotations"

# Run with coverage
npm test -- --coverage
```

### 7.2 Frontend E2E Tests (Playwright)

E2E tests live in `frontend/` and use Playwright:

```bash
cd frontend
npm run test:e2e
```

### 7.3 What to Test

- **Services**: every public method — happy path and error cases (not found, validation, unauthorized)
- **Guards**: valid token passes, missing token throws 401, wrong role throws 403
- **Edge cases**: null/undefined input, boundary values (max discount 100%, min quantity 1)

---

## 8. Git Workflow

### 8.1 Three Repositories

The project has three separate git remotes. When pushing, push all three:

| Repo | Remote | Directory |
|------|--------|-----------|
| Monorepo | `giahuydo/bao-gia` | `/` (root) |
| Backend | `giahuydo/bao_gia_be` | `backend/` |
| Frontend | `giahuydo/bao_gia_fe` | `frontend/` |

### 8.2 Branch Naming

```
BAO-{ticket-id}/{short-description}

Examples:
  BAO-42/quotation-crud
  BAO-55/customer-list-page
  fix/pdf-export-encoding
```

### 8.3 Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

- **Header**: 72 chars max, lowercase, imperative mood, no trailing period
- **Scope**: `backend`, `frontend`, `shared`, or ticket ID (`BAO-42`)
- **Body**: explain *why*, not *what* — wrap at 72 chars

```
feat(backend): implement quotation CRUD with pagination and soft-delete

Refs: BAO-12
```

```
fix(frontend): handle 401 response from axios interceptor on token expiry
```

| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `test` | Adding or updating tests |
| `chore` | Deps, config, build scripts |
| `refactor` | Code change without behavior change |
| `docs` | Documentation only |

---

## 9. Common Tasks

### 9.1 How to Add a New API Endpoint

**Step 1 — Define the shared type** (if the response shape is new):

```typescript
// shared/types/my-domain.ts
export interface IMyEntity {
  id: string;
  name: string;
  organizationId: string;
  createdAt: string;
}
```

**Step 2 — Create the DTO** in the backend module:

```typescript
// backend/src/modules/my-domain/dto/create-my-entity.dto.ts
import { IsString } from 'class-validator';

export class CreateMyEntityDto {
  @IsString()
  name: string;
}
```

**Step 3 — Add the method to the service**:

```typescript
// backend/src/modules/my-domain/my-domain.service.ts
async create(dto: CreateMyEntityDto, organizationId: string): Promise<MyEntity> {
  const entity = this.repo.create({ ...dto, organizationId });
  return this.repo.save(entity);
}
```

**Step 4 — Add the route to the controller**:

```typescript
// backend/src/modules/my-domain/my-domain.controller.ts
@Post()
create(@Body() dto: CreateMyEntityDto, @CurrentUser() user: any) {
  return this.myDomainService.create(dto, user.organizationId);
}
```

**Step 5 — Write a service test immediately.**

### 9.2 How to Add a New Frontend Page

**Step 1 — Create the page file:**

```typescript
// frontend/src/app/my-domain/page.tsx
import { MyDomainList } from "@/components/my-domain/my-domain-list";

export default function MyDomainPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <MyDomainList />
    </div>
  );
}
```

**Step 2 — Add the API service function:**

```typescript
// frontend/src/lib/api/my-domain.ts
import { api } from "@/lib/api";
import type { IMyEntity } from "@/types";

export async function getMyEntities(): Promise<IMyEntity[]> {
  const { data } = await api.get<IMyEntity[]>("/my-domain");
  return data;
}
```

**Step 3 — Create the React Query hook:**

```typescript
// frontend/src/hooks/use-my-domain.ts
import { useQuery } from "@tanstack/react-query";
import { getMyEntities } from "@/lib/api/my-domain";

export function useMyEntities() {
  return useQuery({
    queryKey: ["my-domain"],
    queryFn: getMyEntities,
  });
}
```

**Step 4 — Build the component using the hook and shadcn/ui primitives.**

**Step 5 — Add the nav item** in `frontend/src/components/layout/navbar.tsx` if the page should appear in the top navigation.

### 9.3 How to Add a New Database Entity

**Step 1 — Create the entity file:**

```typescript
// backend/src/database/entities/my-entity.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('my_entities')
export class MyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('uuid')
  organizationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Step 2 — Register the entity in `app.module.ts`:**

```typescript
// backend/src/app.module.ts
import { MyEntity } from './database/entities/my-entity.entity';

// Inside TypeOrmModule.forRootAsync entities array:
entities: [...existingEntities, MyEntity],
```

**Step 3 — Generate and run a migration:**

```bash
cd backend
npm run migration:generate -- src/database/migrations/AddMyEntity
npm run migration:run
```

**Step 4 — Inject the repository** into the module and service using `TypeOrmModule.forFeature([MyEntity])`.

### 9.4 How to Add a New Shared Type

**Step 1 — Add the type to the appropriate file in `shared/types/`** (or create a new file):

```typescript
// shared/types/my-domain.ts
export interface IMyDomain {
  id: string;
  name: string;
}

export type CreateMyDomainRequest = Pick<IMyDomain, 'name'>;
```

**Step 2 — Re-export from the barrel file:**

```typescript
// shared/types/index.ts
export * from './my-domain';
```

**Step 3 — Re-export in the frontend types file** (if needed at component level):

```typescript
// frontend/src/types/index.ts
export { type IMyDomain } from "@shared/types/my-domain";
```

Both backend and frontend can now import `IMyDomain` from their respective import paths.
