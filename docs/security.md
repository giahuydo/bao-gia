# Security Documentation

## 1. Authentication

### JWT Flow

Bao Gia uses stateless JWT (JSON Web Token) authentication via `@nestjs/passport` and `passport-jwt`.

**Flow:**

```
1. POST /api/auth/register  { email, password, fullName }
   -> Password hashed with bcrypt (salt rounds: 10)
   -> User saved to DB
   -> JWT token generated and returned

2. POST /api/auth/login  { email, password }
   -> bcrypt.compare(plaintext, hash)
   -> isActive check (deactivated accounts are rejected)
   -> JWT token generated and returned

3. Protected endpoints
   -> Client sends: Authorization: Bearer <token>
   -> JwtStrategy validates token, fetches user from DB, attaches to request
   -> @CurrentUser() decorator injects user into controller method
```

**Token payload:**

```json
{
  "sub": "<user-uuid>",
  "email": "user@example.com",
  "role": "sales",
  "organizationId": "<org-uuid>"
}
```

The `organizationId` is populated from the user's first active `OrganizationMember` record. This is used for multi-tenant scoping throughout the request lifecycle.

**Token expiration:** 7 days (configurable via `JWT_EXPIRATION` env var).

**Token extraction:** `ExtractJwt.fromAuthHeaderAsBearerToken()` — tokens must be sent in the `Authorization` header. Cookie-based auth is not used.

### Password Hashing

Passwords are hashed using `bcrypt` with a cost factor of 10:

```typescript
// backend/src/modules/auth/auth.service.ts
const hashedPassword = await bcrypt.hash(registerDto.password, 10);
```

The `password` field on the `User` entity is decorated with `@Exclude()` from `class-transformer`, which prevents it from appearing in serialized API responses.

**Minimum password length:** 6 characters (enforced by `@MinLength(6)` in `RegisterDto`).

### JwtStrategy Validation

On every authenticated request, `JwtStrategy.validate()`:

1. Looks up the user by `payload.sub` (UUID) with `isActive: true`
2. Throws `UnauthorizedException` if the user is not found or is deactivated
3. Loads all active `OrganizationMember` records for the user
4. Attaches `organizationId` and `organizationIds` (all memberships) to the request user object

This means deactivating a user account immediately blocks all subsequent requests even if a valid JWT exists.

---

## 2. Authorization

### Role-Based Access Control

Three user roles exist (defined in `UserRole` enum):

| Role | Description |
|------|-------------|
| `admin` | Full system access, can manage users and org-level settings |
| `manager` | Can manage quotations, customers, products, templates |
| `sales` | Default role for new registrations; standard CRUD access |

Roles are stored on the `User` entity and embedded in the JWT payload.

### Guards

All guards live in `backend/src/common/guards/`.

#### JwtAuthGuard

Extends `AuthGuard('jwt')` from Passport. Validates the Bearer token, invokes `JwtStrategy`, and attaches the user to `request.user`. Applied via `@UseGuards(JwtAuthGuard)`.

```typescript
// Throws 401 if token is missing or invalid
if (err || !user) {
  throw new UnauthorizedException('Authentication required');
}
```

#### RolesGuard

Reads the `@Roles()` metadata set on the handler or controller class and checks `user.role` against the required roles. Returns 403 if the user lacks the required role.

```typescript
// Usage example
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Delete('users/:id')
remove(@Param('id') id: string) { ... }
```

If no `@Roles()` decorator is present on an endpoint, `RolesGuard` passes all authenticated users.

#### WebhookSecretGuard

Validates the `X-Webhook-Secret` header for n8n callback endpoints (`/api/webhooks/n8n/*`). The secret is compared against `N8N_WEBHOOK_SECRET` from config. Logs the IP address on failed attempts.

#### ServiceAuthGuard

Validates the `X-Service-Key` header for n8n → backend service calls (`/api/ingestion/*`). The key is compared against `N8N_SERVICE_KEY` from config. On success, attaches `request.serviceActor = 'n8n-system'` and `request.n8nExecutionId` for downstream logging.

The two n8n secrets (`SERVICE_KEY` vs `WEBHOOK_SECRET`) are intentionally separate so they can be rotated independently.

### @Roles() Decorator

```typescript
// backend/src/common/decorators/roles.decorator.ts
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

Attaches role metadata to the route handler for `RolesGuard` to read via `Reflector`.

### @CurrentUser() Decorator

```typescript
// backend/src/common/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

Usage in controllers:

```typescript
// Inject full user object
@CurrentUser() user: User

// Inject a single field
@CurrentUser('organizationId') orgId: string
```

---

## 3. Multi-Tenant Data Isolation

### Organization Scoping

Every major business entity carries an `organizationId` column indexed for performance:

- `Quotation.organizationId`
- `Customer.organizationId`
- `Product.organizationId`
- `Template.organizationId`
- `CompanySettings.organizationId`
- `Attachment.organizationId`
- `GlossaryTerm.organizationId`
- `RuleSet.organizationId`
- `IngestionJob.organizationId`

Service methods receive `organizationId` from the authenticated user (via `@CurrentUser()`) and always include it in `WHERE` clauses. This prevents users from accessing data that belongs to other tenants even if they know the record UUID.

Example from `AttachmentsService`:

```typescript
async findByQuotation(quotationId: string, organizationId?: string) {
  const where: any = { quotationId };
  if (organizationId) where.organizationId = organizationId;
  return this.attachmentsRepository.find({ where, order: { createdAt: 'DESC' } });
}
```

### OrganizationMember Roles

Users belong to organizations via the `OrganizationMember` join entity with a role column:

| Role | Typical Access |
|------|---------------|
| `owner` | Full control, can delete organization |
| `admin` | Manage members, settings |
| `manager` | Manage business data (quotations, customers, products) |
| `member` | Standard read/write access |

A user can be a member of multiple organizations. The active `organizationId` is resolved at login time from the first active membership and embedded in the JWT. The JWT strategy also loads all `organizationIds` for multi-org support.

---

## 4. Data Encryption

### AES-256-GCM for Organization Secrets

Organization-level Anthropic API keys are encrypted at rest using AES-256-GCM, implemented in `backend/src/common/services/encryption.service.ts`.

**Algorithm:** `aes-256-gcm` (authenticated encryption — provides both confidentiality and integrity)

**Key derivation:** The encryption key is provided as a 64-character hex string via the `ENCRYPTION_KEY` environment variable, decoded into a 32-byte `Buffer`. In development, if `ENCRYPTION_KEY` is not set, the key falls back to a deterministic derivation from `JWT_SECRET` (this fallback is not safe for production).

**Ciphertext format:** `base64(iv):base64(authTag):base64(ciphertext)` — all three components are stored together as a single string, allowing the service to self-contain all information needed for decryption.

```typescript
encrypt(plaintext: string): string {
  const iv = randomBytes(12);           // 96-bit random IV
  const cipher = createCipheriv('aes-256-gcm', this.key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag(); // 128-bit authentication tag
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}
```

**Key generation for production:**

```bash
openssl rand -hex 32
```

---

## 5. Input Validation

### Backend: Global ValidationPipe

Applied globally in `backend/src/main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Strip properties not in DTO
    forbidNonWhitelisted: true,   // Throw 400 for unknown properties
    transform: true,              // Auto-transform to DTO class instances
    transformOptions: {
      enableImplicitConversion: true,  // Convert query params to correct types
    },
  }),
);
```

- `whitelist: true` prevents mass-assignment attacks by silently stripping any fields not declared in the DTO.
- `forbidNonWhitelisted: true` escalates to an error so clients know their payload is malformed.

DTOs use `class-validator` decorators. Example from `RegisterDto`:

```typescript
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;
}
```

### Frontend: Zod + react-hook-form

All forms use Zod schemas validated through `@hookform/resolvers/zod`. Validation runs client-side before the API call, reducing unnecessary requests.

---

## 6. CORS Configuration

CORS is configured in `backend/src/main.ts`:

```typescript
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4000')
  .split(',')
  .map((o) => o.trim());

app.enableCors({
  origin: allowedOrigins,
  credentials: true,
});
```

`CORS_ORIGIN` accepts a comma-separated list of origins. The production Render deployment sets:

```
CORS_ORIGIN=https://bao-gia-fe.vercel.app,http://localhost:4000
```

`credentials: true` allows the browser to send cookies alongside cross-origin requests (used for the auth token cookie set by the frontend).

---

## 7. Service-to-Service Authentication

### n8n → Ingestion Endpoints (X-Service-Key)

Endpoints under `/api/ingestion/*` (`/extract`, `/translate`, `/normalize`) are protected by `ServiceAuthGuard`. n8n must include:

```
X-Service-Key: <N8N_SERVICE_KEY>
```

On failed authentication, the guard logs the source IP and the URL being accessed.

### n8n → Webhook Callbacks (X-Webhook-Secret)

Endpoints under `/api/webhooks/n8n/*` (`/quotation-processed`, `/delivery-completed`, `/execution-failed`) are protected by `WebhookSecretGuard`. n8n must include:

```
X-Webhook-Secret: <N8N_WEBHOOK_SECRET>
```

Both secrets should be generated with `openssl rand -hex 32` and stored as environment variables. They are intentionally different secrets to allow independent rotation.

---

## 8. File Upload Restrictions

File uploads are handled in `backend/src/modules/attachments/attachments.controller.ts` using `@nestjs/platform-express` (Multer) with NestJS `ParseFilePipe`.

**Maximum file size:** 10 MB (enforced by `MaxFileSizeValidator`):

```typescript
new ParseFilePipe({
  validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
})
```

Requests exceeding 10 MB will be rejected with HTTP 400 before reaching the service layer.

**MIME type validation:** Not yet explicitly enforced at the controller level — the stored `mimeType` comes from `file.mimetype` as reported by Multer. Future work should add a `FileTypeValidator` to restrict uploads to allowed document and image types (e.g., PDF, JPEG, PNG, DOCX).

**Storage isolation:** Uploaded files are stored under `uploads/<organizationId>/` on the server filesystem. Files are renamed to UUID-based names (`<uuid>.<ext>`) to prevent filename collisions and path traversal. Downloads are restricted by `organizationId`, so tenants cannot download files from other organizations.

---

## 9. Soft-Delete Policy

The following entities use TypeORM's `@DeleteDateColumn` (soft-delete) rather than hard deletes:

| Entity | Table | Soft-Delete Column |
|--------|-------|--------------------|
| `Quotation` | `quotations` | `deleted_at` |
| `Customer` | `customers` | `deleted_at` |

Soft-deleted records remain in the database and can potentially be restored. TypeORM automatically excludes them from standard `find()` queries by adding `WHERE deleted_at IS NULL`.

All other entities (e.g., `Product`, `Template`, `Attachment`, `User`) do not currently use soft-delete — removals are permanent. The `User` entity uses an `is_active` boolean flag instead of deletion to deactivate accounts.
