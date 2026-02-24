# Bao Gia API Reference

> This document supplements the interactive Swagger UI available at `http://localhost:4001/api/docs`. It provides practical context, request/response examples, and notes that are harder to express in OpenAPI spec alone.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [Common Patterns](#common-patterns)
4. [Modules](#modules)
   - [Auth](#auth)
   - [Users](#users)
   - [Organizations](#organizations)
   - [Quotations](#quotations)
   - [Customers](#customers)
   - [Products](#products)
   - [Templates](#templates)
   - [Currencies](#currencies)
   - [Company Settings](#company-settings)
   - [Attachments](#attachments)
   - [AI](#ai)
   - [Ingestion](#ingestion)
   - [Webhooks (n8n)](#webhooks-n8n)
   - [Versioning](#versioning)
   - [Reviews](#reviews)
   - [Jobs](#jobs)
   - [Prompts](#prompts)
   - [Glossary](#glossary)
   - [Rules](#rules)
   - [Price Monitoring](#price-monitoring)
   - [Health](#health)
5. [Error Codes](#error-codes)
6. [Rate Limiting and Token Budget](#rate-limiting-and-token-budget)

---

## Overview

| Property | Value |
|----------|-------|
| Base URL (local) | `http://localhost:4001/api` |
| Base URL (production) | Set via environment — check deployment config |
| Content-Type | `application/json` (except file uploads: `multipart/form-data`) |
| Authentication | Bearer JWT in `Authorization` header |
| Swagger UI | `http://localhost:4001/api/docs` |
| Global prefix | `/api` — all endpoints start with `/api/` |

---

## Authentication Flow

All protected endpoints require a valid JWT in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

### Step-by-step

1. **Register** — create a new user account (`POST /api/auth/register`)
2. **Login** — exchange credentials for a JWT (`POST /api/auth/login`)
3. **Use token** — include the returned `accessToken` in every subsequent request
4. **Check identity** — call `GET /api/auth/profile` to verify the token and fetch user data

Tokens expire after **7 days** (configured via `JWT_EXPIRATION`). There is no refresh token endpoint at this time; re-login to get a new token.

### Auth levels used in this document

| Label | Meaning |
|-------|---------|
| Public | No authentication required |
| JWT | Valid Bearer token required |
| JWT + Role | Valid token AND user must have the specified role (`admin`, `manager`, `sales`) |
| Webhook Secret | `X-Webhook-Secret` header required (n8n callbacks) |
| Service Key | `X-Service-Key` header required (n8n → backend ingestion) |

---

## Common Patterns

### Pagination

Endpoints that return lists accept these query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (min: 1) |
| `limit` | integer | 20 | Items per page (min: 1) |
| `search` | string | — | Free-text search (field varies per endpoint) |

**Paginated response format:**

```json
{
  "data": [ /* array of items */ ],
  "total": 120,
  "page": 1,
  "limit": 20,
  "totalPages": 6
}
```

### Standard error response format

```json
{
  "statusCode": 404,
  "message": "Quotation not found",
  "error": "Not Found"
}
```

### Validation error response format

When the request body fails DTO validation (400):

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

The `message` field is an array of strings when multiple validation constraints fail.

### Multi-tenancy

Every authenticated user belongs to an organization (via `organizationId` on the JWT payload). All resource queries are automatically scoped to `user.organizationId` — you cannot access data from another organization through normal endpoints.

---

## Modules

---

### Auth

Base path: `/api/auth`

---

#### POST /api/auth/register

**Auth:** Public

Register a new user account.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyen Van A"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Minimum 6 characters |
| `fullName` | string | Yes | Non-empty string |

**Response (201):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "role": "sales",
    "isActive": true,
    "createdAt": "2026-02-24T10:00:00.000Z",
    "updatedAt": "2026-02-24T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Notes:** New users are assigned `role: "sales"` by default. An admin must manually elevate roles via `PATCH /api/users/:id`.

---

#### POST /api/auth/login

**Auth:** Public

Authenticate and retrieve a JWT.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "role": "sales",
    "isActive": true,
    "createdAt": "2026-02-24T10:00:00.000Z",
    "updatedAt": "2026-02-24T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (401):** Invalid credentials.

---

#### GET /api/auth/profile

**Auth:** JWT

Retrieve the current user's profile. Useful for validating a stored token.

**Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "fullName": "Nguyen Van A",
  "role": "sales",
  "isActive": true,
  "createdAt": "2026-02-24T10:00:00.000Z",
  "updatedAt": "2026-02-24T10:00:00.000Z"
}
```

**Notes:** The `password` field is stripped before returning.

---

### Users

Base path: `/api/users`

All endpoints require `JWT + Role: admin`.

---

#### GET /api/users

**Auth:** JWT + Role: admin

List all registered users in the system.

**Response (200):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "role": "sales",
    "isActive": true,
    "createdAt": "2026-02-24T10:00:00.000Z",
    "updatedAt": "2026-02-24T10:00:00.000Z"
  }
]
```

**Notes:** Returns all users (no pagination). This is an admin-only global view — not scoped to organization.

---

#### PATCH /api/users/:id

**Auth:** JWT + Role: admin

Update a user's role or active status.

**Path params:** `id` — User UUID

**Request body** (all fields optional):

```json
{
  "role": "manager",
  "isActive": true,
  "fullName": "Nguyen Van B"
}
```

**Response (200):** Updated user object.

---

#### DELETE /api/users/:id

**Auth:** JWT + Role: admin

Deactivate a user (sets `isActive: false`). Does not permanently delete.

**Path params:** `id` — User UUID

**Response (200):** Updated user object with `isActive: false`.

---

### Organizations

Base path: `/api/organizations`

All endpoints require JWT.

---

#### POST /api/organizations

**Auth:** JWT

Create a new organization. The authenticated user becomes the owner.

**Request body:**

```json
{
  "name": "Acme Corp",
  "description": "A laboratory equipment company",
  "logoUrl": "https://example.com/logo.png",
  "plan": "starter",
  "anthropicApiKey": "sk-ant-..."
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | Yes | Minimum 2 characters |
| `description` | string | No | — |
| `logoUrl` | string | No | URL string |
| `plan` | enum | No | `free`, `starter`, `professional`, `enterprise`. Default: `free` |
| `anthropicApiKey` | string | No | Stored AES-256-GCM encrypted |

**Response (201):** Created organization object.

---

#### GET /api/organizations

**Auth:** JWT

List all organizations the authenticated user belongs to.

**Response (200):** Array of organization objects.

---

#### GET /api/organizations/:id

**Auth:** JWT

Get organization details including member list.

**Path params:** `id` — Organization UUID

**Response (200):**

```json
{
  "id": "org-uuid",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "plan": "starter",
  "monthlyTokenLimit": 1000000,
  "isActive": true,
  "members": [
    {
      "id": "member-uuid",
      "userId": "user-uuid",
      "organizationId": "org-uuid",
      "role": "owner",
      "isActive": true,
      "createdAt": "2026-02-24T10:00:00.000Z"
    }
  ],
  "createdAt": "2026-02-24T10:00:00.000Z",
  "updatedAt": "2026-02-24T10:00:00.000Z"
}
```

**Notes:** Only accessible if the requesting user is a member of the organization.

---

#### PATCH /api/organizations/:id

**Auth:** JWT (owner or admin org role)

Update organization settings.

**Path params:** `id` — Organization UUID

**Request body** (all optional):

```json
{
  "name": "Acme Corp Updated",
  "description": "Updated description",
  "plan": "professional"
}
```

---

#### POST /api/organizations/:id/members

**Auth:** JWT (owner or admin org role)

Add a user to the organization.

**Path params:** `id` — Organization UUID

**Request body:**

```json
{
  "userId": "user-uuid",
  "role": "member"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `userId` | UUID | Yes | Must be an existing user ID |
| `role` | enum | No | `owner`, `admin`, `manager`, `member`. Default: `member` |

---

#### DELETE /api/organizations/:id/members/:userId

**Auth:** JWT (owner or admin org role)

Remove a member from the organization.

**Path params:** `id` — Organization UUID, `userId` — User UUID to remove

---

#### PATCH /api/organizations/:id/members/:userId

**Auth:** JWT (owner only)

Update a member's role within the organization.

**Path params:** `id` — Organization UUID, `userId` — Target user UUID

**Request body:**

```json
{
  "role": "manager"
}
```

---

### Quotations

Base path: `/api/quotations`

All endpoints require JWT. All data is scoped to the user's organization.

---

#### POST /api/quotations

**Auth:** JWT

Create a new quotation. New quotations start in `draft` status.

**Request body:**

```json
{
  "title": "Bao gia thiet ke website cho cong ty ABC",
  "customerId": "customer-uuid",
  "validUntil": "2026-03-31",
  "notes": "Ghi chu them ve yeu cau khach hang",
  "terms": "Thanh toan 50% truoc, 50% sau khi ban giao",
  "discount": 5,
  "tax": 10,
  "templateId": "template-uuid",
  "items": [
    {
      "productId": "product-uuid",
      "name": "Thiet ke giao dien",
      "description": "Thiet ke UI/UX cho 10 trang",
      "unit": "goi",
      "quantity": 1,
      "unitPrice": 15000000,
      "sortOrder": 0
    }
  ]
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | string | Yes | — |
| `customerId` | UUID | Yes | Must exist in the org |
| `validUntil` | date string | No | ISO 8601 date (e.g. `2026-03-31`) |
| `notes` | string | No | — |
| `terms` | string | No | — |
| `discount` | number | No | 0–100 (percentage) |
| `tax` | number | No | 0–100 (percentage) |
| `templateId` | UUID | No | Existing template in the org |
| `items` | array | Yes | At least one item recommended |
| `items[].productId` | UUID | No | Links item to catalog product |
| `items[].name` | string | Yes | — |
| `items[].unit` | string | Yes | e.g. `goi`, `cai`, `gio` |
| `items[].quantity` | number | Yes | Min: 0 |
| `items[].unitPrice` | number | Yes | Min: 0, in VND |
| `items[].sortOrder` | integer | No | Display order |

**Response (201):** Full quotation object with computed `subtotal` and `total`.

---

#### GET /api/quotations

**Auth:** JWT

List quotations with pagination and filtering.

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Default: 1 |
| `limit` | integer | Default: 20 |
| `search` | string | Searches quotation number and title |
| `status` | enum | Filter by status: `draft`, `sent`, `accepted`, `rejected`, `expired` |
| `customerId` | UUID | Filter by customer |

**Response (200):** Paginated response with quotation array.

---

#### GET /api/quotations/dashboard

**Auth:** JWT

Get aggregated statistics for the organization's quotation dashboard.

**Response (200):**

```json
{
  "totalQuotations": 150,
  "byStatus": {
    "draft": 45,
    "sent": 60,
    "accepted": 30,
    "rejected": 10,
    "expired": 5
  },
  "totalRevenue": 1500000000,
  "acceptedRevenue": 900000000,
  "monthlyTrend": [
    {
      "month": "2026-01",
      "count": 25,
      "revenue": 250000000
    }
  ]
}
```

**Notes:** Call this endpoint before listing quotations to display summary stats on the dashboard page.

---

#### GET /api/quotations/:id

**Auth:** JWT

Get a single quotation with all items, customer info, and history.

**Path params:** `id` — Quotation UUID

**Response (200):** Full `IQuotation` object including nested `items` array.

---

#### PATCH /api/quotations/:id

**Auth:** JWT

Update a quotation. Only `draft` status quotations can be edited.

**Path params:** `id` — Quotation UUID

**Request body:** Same shape as `POST /api/quotations` but all fields are optional.

**Notes:** Attempting to update a non-draft quotation will return a 400 error. To modify a sent quotation, create a new version first.

---

#### DELETE /api/quotations/:id

**Auth:** JWT

Soft-delete a quotation. The record remains in the database but is excluded from normal queries.

**Path params:** `id` — Quotation UUID

**Response (200):** Success confirmation.

---

#### PATCH /api/quotations/:id/status

**Auth:** JWT

Update the status of a quotation.

**Path params:** `id` — Quotation UUID

**Request body:**

```json
{
  "status": "sent"
}
```

**Status lifecycle:**

```
draft -> sent -> accepted
                -> rejected
                -> expired
```

**Notes:** Once a quotation is `sent`, it becomes read-only. Use the duplicate or versioning endpoints to create an editable copy.

---

#### POST /api/quotations/:id/duplicate

**Auth:** JWT

Create a copy of a quotation as a new `draft`. The duplicate gets a new `quotationNumber` and all items are copied.

**Path params:** `id` — Quotation UUID

**Response (201):** New quotation object with `status: "draft"`.

---

#### GET /api/quotations/:id/pdf

**Auth:** JWT

Export the quotation as a PDF file.

**Path params:** `id` — Quotation UUID

**Response (200):**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="BG-2026-001.pdf"`
- Body: Binary PDF data

**Notes:** The PDF includes company settings (logo, bank info), quotation items, totals, and terms. Company settings must be configured via `PUT /api/company-settings` for the PDF to be complete.

---

### Customers

Base path: `/api/customers`

All endpoints require JWT. Data is scoped to the user's organization.

---

#### POST /api/customers

**Auth:** JWT

Create a new customer.

**Request body:**

```json
{
  "name": "Cong ty ABC",
  "email": "contact@abc.com",
  "phone": "0901234567",
  "address": "123 Nguyen Hue, Q1, HCM",
  "taxCode": "0123456789",
  "contactPerson": "Nguyen Van A",
  "notes": "Khach hang VIP"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | Yes | — |
| `email` | string | No | Valid email format |
| `phone` | string | No | — |
| `address` | string | No | — |
| `taxCode` | string | No | Vietnamese tax code |
| `contactPerson` | string | No | — |
| `notes` | string | No | — |

**Response (201):** Created customer object.

---

#### GET /api/customers

**Auth:** JWT

List customers with pagination and search.

**Query parameters:** `page`, `limit`, `search` (searches by name, email, phone)

**Response (200):** Paginated customer list.

---

#### GET /api/customers/:id

**Auth:** JWT

**Response (200):** Single customer object.

---

#### PATCH /api/customers/:id

**Auth:** JWT

Update customer fields. All fields optional.

---

#### DELETE /api/customers/:id

**Auth:** JWT

Soft-delete a customer.

**Notes:** Customers linked to quotations cannot be deleted until the quotations are removed.

---

### Products

Base path: `/api/products`

All endpoints require JWT. Data is scoped to the user's organization.

---

#### POST /api/products

**Auth:** JWT

Create a new product or service in the catalog.

**Request body:**

```json
{
  "name": "Thiet ke website",
  "description": "Thiet ke website responsive, SEO friendly",
  "unit": "goi",
  "defaultPrice": 15000000,
  "category": "Web Development"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | Yes | — |
| `description` | string | No | — |
| `unit` | string | Yes | e.g. `goi`, `cai`, `gio` |
| `defaultPrice` | number | Yes | Min: 0, in VND |
| `category` | string | No | Used for filtering |

**Response (201):** Created product object.

---

#### GET /api/products

**Auth:** JWT

List products with pagination, search, and category filter.

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Default: 1 |
| `limit` | integer | Default: 20 |
| `search` | string | Searches name and description |
| `category` | string | Filter by product category |

**Response (200):** Paginated product list.

---

#### GET /api/products/:id

**Auth:** JWT

Get a single product by ID.

---

#### PATCH /api/products/:id

**Auth:** JWT

Update product fields. All fields optional.

---

#### DELETE /api/products/:id

**Auth:** JWT

Delete a product from the catalog.

---

### Templates

Base path: `/api/templates`

All endpoints require JWT. Data is scoped to the user's organization.

---

#### POST /api/templates

**Auth:** JWT

Create a new quotation template.

**Request body:**

```json
{
  "name": "Website Development Template",
  "defaultTerms": "Thanh toan 50% truoc, 50% sau ban giao",
  "defaultNotes": "Bao hanh 1 nam",
  "defaultTax": 10,
  "defaultDiscount": 0,
  "isDefault": false,
  "items": [
    {
      "name": "Thiet ke UI/UX",
      "unit": "goi",
      "quantity": 1,
      "unitPrice": 10000000,
      "sortOrder": 0
    }
  ]
}
```

**Response (201):** Created template object.

---

#### GET /api/templates

**Auth:** JWT

List all templates for the organization (no pagination — templates are typically few).

---

#### GET /api/templates/:id

**Auth:** JWT

Get a single template.

---

#### PATCH /api/templates/:id

**Auth:** JWT

Update a template. All fields optional.

---

#### DELETE /api/templates/:id

**Auth:** JWT

Delete a template.

---

#### POST /api/templates/:id/apply

**Auth:** JWT

Apply a template to generate pre-filled quotation draft data. Does not create a quotation — returns the data to be used in `POST /api/quotations`.

**Path params:** `id` — Template UUID

**Request body:**

```json
{
  "customerId": "customer-uuid"
}
```

**Response (200):** Quotation draft data pre-filled from the template, ready to POST to `/api/quotations`.

---

### Currencies

Base path: `/api/currencies`

---

#### GET /api/currencies

**Auth:** JWT

List all active currencies in the system.

**Response (200):**

```json
[
  {
    "id": "currency-uuid",
    "code": "VND",
    "name": "Vietnamese Dong",
    "symbol": "₫",
    "exchangeRate": 1,
    "decimalPlaces": 0,
    "isDefault": true
  },
  {
    "id": "currency-uuid-2",
    "code": "USD",
    "name": "US Dollar",
    "symbol": "$",
    "exchangeRate": 25000,
    "decimalPlaces": 2,
    "isDefault": false
  }
]
```

---

#### GET /api/currencies/:id

**Auth:** JWT

Get a single currency by ID.

---

#### POST /api/currencies

**Auth:** JWT + Role: admin

Create a new currency.

**Request body:**

```json
{
  "code": "EUR",
  "name": "Euro",
  "symbol": "€",
  "exchangeRate": 27000,
  "decimalPlaces": 2,
  "isDefault": false
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `code` | string | Yes | Exactly 3 uppercase characters, unique |
| `name` | string | Yes | — |
| `symbol` | string | Yes | — |
| `exchangeRate` | number | Yes | Relative to VND |
| `decimalPlaces` | integer | No | Default: 2 |
| `isDefault` | boolean | No | Only one currency can be default |

---

#### PATCH /api/currencies/:id

**Auth:** JWT + Role: admin

Update currency fields (e.g. update exchange rate).

---

#### DELETE /api/currencies/:id

**Auth:** JWT + Role: admin

Deactivate a currency (sets `isActive: false`).

---

### Company Settings

Base path: `/api/company-settings`

Settings are per-organization.

---

#### GET /api/company-settings

**Auth:** JWT

Retrieve the current organization's company settings.

**Response (200):**

```json
{
  "id": "settings-uuid",
  "organizationId": "org-uuid",
  "companyName": "Cong ty TNHH ABC",
  "companyNameEn": "ABC Company Limited",
  "taxCode": "0123456789",
  "address": "123 Nguyen Hue, Q1, TP.HCM",
  "phone": "028 1234 5678",
  "email": "info@abc.com",
  "website": "https://abc.com",
  "logoUrl": "https://example.com/logo.png",
  "bankName": "Vietcombank",
  "bankAccount": "1234567890",
  "bankBranch": "Chi nhanh HCM",
  "quotationPrefix": "BG",
  "quotationTerms": "Dieu khoan thanh toan...",
  "quotationNotes": "Ghi chu chung...",
  "createdAt": "2026-02-24T10:00:00.000Z",
  "updatedAt": "2026-02-24T10:00:00.000Z"
}
```

---

#### PUT /api/company-settings

**Auth:** JWT + Role: admin or manager

Update company settings. All fields are optional (partial update).

**Request body:**

```json
{
  "companyName": "Cong ty TNHH ABC",
  "companyNameEn": "ABC Company Limited",
  "taxCode": "0123456789",
  "address": "123 Nguyen Hue, Q1, TP.HCM",
  "phone": "028 1234 5678",
  "email": "info@abc.com",
  "website": "https://abc.com",
  "logoUrl": "https://example.com/logo.png",
  "bankName": "Vietcombank",
  "bankAccount": "1234567890",
  "bankBranch": "Chi nhanh HCM",
  "quotationPrefix": "BG",
  "quotationTerms": "Dieu khoan thanh toan mac dinh...",
  "quotationNotes": "Ghi chu chung..."
}
```

**Notes:** `quotationPrefix` is used to generate quotation numbers (e.g. `BG-2026-001`). Changing it does not affect existing quotation numbers.

---

### Attachments

Attachments are linked to quotations. The controller has no common base path — routes are split across two path patterns.

---

#### POST /api/quotations/:quotationId/attachments

**Auth:** JWT

Upload a file attachment to a quotation.

**Path params:** `quotationId` — Quotation UUID

**Request:** `multipart/form-data` with field name `file`

**Constraints:**
- Max file size: **10 MB**
- Content-Type: detected automatically from the file

**Response (201):**

```json
{
  "id": "attachment-uuid",
  "quotationId": "quotation-uuid",
  "fileName": "vendor-quote-abc123.pdf",
  "originalName": "vendor-quote.pdf",
  "mimeType": "application/pdf",
  "fileSize": 245760,
  "filePath": "/uploads/...",
  "uploadedBy": "user-uuid",
  "createdAt": "2026-02-24T10:00:00.000Z"
}
```

**Notes:** Uploaded files are stored on disk. The `filePath` is internal and not meant to be accessed directly — use the download endpoint.

---

#### GET /api/quotations/:quotationId/attachments

**Auth:** JWT

List all attachments for a quotation.

**Path params:** `quotationId` — Quotation UUID

**Response (200):** Array of attachment objects.

---

#### GET /api/attachments/:id/download

**Auth:** JWT

Download an attachment by its ID. Returns the raw file binary with appropriate MIME type headers.

**Path params:** `id` — Attachment UUID

**Response (200):**
- Content-Type: Original file MIME type
- Content-Disposition: `attachment; filename="<original filename>"`
- Body: Binary file data

---

#### DELETE /api/attachments/:id

**Auth:** JWT

Delete an attachment and remove the file from disk.

**Path params:** `id` — Attachment UUID

---

### AI

Base path: `/api/ai`

All endpoints require JWT. AI operations consume tokens from the organization's monthly budget.

---

#### POST /api/ai/generate-quotation

**Auth:** JWT

Generate a complete quotation draft from a natural language description using Claude AI.

**Request body:**

```json
{
  "description": "Bao gia thiet ke website thuong mai dien tu cho cong ty ABC, bao gom thiet ke UI/UX, lap trinh frontend va backend, tich hop thanh toan"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `description` | string | Yes | Minimum 10 characters |

**Response (200):** Structured quotation draft data including suggested title, items with names, quantities, and estimated prices.

**Notes:** This returns draft data, not a saved quotation. Pass the response to `POST /api/quotations` to save it.

---

#### POST /api/ai/suggest-items

**Auth:** JWT

Get AI-suggested line items based on a quotation title. Useful for quickly building a quotation.

**Request body:**

```json
{
  "title": "Bao gia thiet ke website ecommerce",
  "existingItems": ["Thiet ke UI/UX", "Lap trinh backend"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Quotation title for context |
| `existingItems` | string[] | No | Items already in the quotation to avoid duplicates |

**Response (200):** Array of suggested item names.

---

#### POST /api/ai/improve-description

**Auth:** JWT

Get an AI-improved version of an item description.

**Request body:**

```json
{
  "itemName": "Thiet ke UI",
  "currentDescription": "Thiet ke giao dien cho website"
}
```

**Response (200):**

```json
{
  "improvedDescription": "Thiet ke giao dien nguoi dung (UI) chuyen nghiep cho website, bao gom wireframe, mockup va prototype. Dam bao tinh nhat quan thuong hieu, trai nghiem nguoi dung toi uu va tuong thich da thiet bi."
}
```

---

#### POST /api/ai/compare

**Auth:** JWT

Compare a vendor's specification against customer requirements using AI. Returns a match analysis with scores, gaps, and suggestions.

**Request body:**

```json
{
  "vendorSpec": {
    "items": [
      {
        "name": "Centrifuge 5424",
        "description": "Microcentrifuge with 24-place rotor",
        "unit": "unit",
        "quantity": 1,
        "unitPrice": 150000000,
        "category": "lab"
      }
    ]
  },
  "customerRequirement": {
    "items": [
      {
        "name": "High-speed microcentrifuge",
        "description": "For clinical laboratory use",
        "unit": "unit",
        "quantity": 2
      }
    ],
    "budget": 500000000
  },
  "quotationId": "quotation-uuid"
}
```

**Response (200):** `CompareResult` object:

```json
{
  "matches": [
    {
      "vendorItemIndex": 0,
      "requirementItemIndex": 0,
      "matchScore": 0.85,
      "matchReason": "High-speed microcentrifuge meets clinical lab requirements",
      "priceAssessment": "Within budget at 150M VND per unit",
      "specComparison": {
        "met": ["speed", "rotor capacity"],
        "unmet": ["quantity — vendor offers 1, customer needs 2"],
        "exceeded": []
      },
      "gaps": ["Quantity shortfall"],
      "suggestions": ["Order 2 units or find alternative model"]
    }
  ],
  "unmatchedVendorItems": [],
  "unmatchedRequirements": [],
  "overallScore": 0.8,
  "summary": "Good match overall with a quantity gap.",
  "budgetAnalysis": {
    "totalVendorCost": 150000000,
    "budget": 500000000,
    "withinBudget": true,
    "savings": 350000000
  }
}
```

---

#### GET /api/ai/usage/summary

**Auth:** JWT

Get aggregated AI token usage summary grouped by operation and time period.

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | date string | Start date filter |
| `to` | date string | End date filter |

**Response (200):** Aggregated usage totals by operation.

---

#### GET /api/ai/usage/records

**Auth:** JWT

Get detailed per-request token usage records with pagination.

**Query parameters:** Supports pagination + date/operation filters.

**Response (200):** Paginated list of `TokenUsage` records.

---

#### GET /api/ai/usage/dashboard

**Auth:** JWT

Get cost analytics dashboard with time-series data, budget alerts, and per-user breakdown.

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | date string | Start date (ISO format) |
| `to` | date string | End date (ISO format) |
| `groupBy` | string | `day`, `week`, `month` (default: `day`) |

**Response (200):** `DashboardResponse` object including time-series, per-operation breakdown, per-user breakdown, and budget alert if approaching limit.

---

### Ingestion

Base path: `/api/ingestion`

**Auth:** Service Key (`X-Service-Key` header)

These endpoints are called by n8n workflows during the document ingestion pipeline. They are **not** meant to be called directly by the frontend.

**Required headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-Service-Key` | Yes | Must match `N8N_SERVICE_KEY` env var |
| `X-N8N-Execution-Id` | No | n8n execution ID for tracing |
| `X-Job-Id` | No | Ingestion job ID |
| `X-Organization-Id` | No | Organization context |

---

#### POST /api/ingestion/extract

Extract structured data from a vendor document using AI.

**Request body:**

```json
{
  "attachmentId": "attachment-uuid"
}
```

**Response (200):** `ExtractedData` object:

```json
{
  "title": "Vendor Quotation #VQ-2026-001",
  "vendorName": "ABC Medical Supplies Co.",
  "items": [
    {
      "name": "Centrifuge Model X200",
      "description": "High-speed centrifuge for clinical labs",
      "unit": "unit",
      "quantity": 2,
      "unitPrice": 15000,
      "currency": "USD"
    }
  ],
  "notes": "FOB Ho Chi Minh City",
  "terms": "Net 30 days"
}
```

**Notes:** Reads the file at the given attachment ID, sends it to Claude for extraction, and returns structured JSON. Deduplication via file checksum — identical files return cached results.

---

#### POST /api/ingestion/translate

Translate extracted quotation data to Vietnamese.

**Request body:**

```json
{
  "extractedData": {
    "title": "Vendor Quotation #VQ-2026-001",
    "vendorName": "ABC Medical Supplies Co.",
    "items": [ /* ExtractedItem array */ ],
    "notes": "FOB Ho Chi Minh City",
    "terms": "Net 30 days"
  }
}
```

**Response (200):** Translated data object with all fields in Vietnamese. Injects organization glossary terms for domain-specific translation consistency.

---

#### POST /api/ingestion/normalize

Normalize translated data against the product catalog and customer database.

**Request body:**

```json
{
  "translatedData": { /* TranslatedData object */ },
  "customerId": "customer-uuid"
}
```

**Response (200):**

```json
{
  "items": [ /* matched/normalized items */ ],
  "warnings": ["Item 'May ly tam' does not match any catalog product"],
  "customer": { /* resolved customer object */ }
}
```

**Notes:** Matches items to existing catalog products by name similarity. Returns warnings for unmatched items.

---

### Webhooks (n8n)

Base path: `/api/webhooks/n8n`

**Auth:** Webhook Secret (`X-Webhook-Secret` header)

These endpoints are called by n8n at the end of workflow executions to report results. They act as callback URLs.

**Required headers:**

| Header | Required | Description |
|--------|----------|-------------|
| `X-Webhook-Secret` | Yes | Must match `N8N_WEBHOOK_SECRET` env var |

---

#### POST /api/webhooks/n8n/quotation-processed

Called by n8n after the vendor quotation ingestion workflow completes.

**Request body:**

```json
{
  "executionId": "n8n-execution-id",
  "jobId": "job-uuid",
  "status": "completed",
  "quotationData": { /* normalized quotation data */ },
  "error": null
}
```

**Response (200):** Acknowledgement.

---

#### POST /api/webhooks/n8n/delivery-completed

Called by n8n after sending a quotation PDF via email to the customer.

**Request body:**

```json
{
  "executionId": "n8n-execution-id",
  "quotationId": "quotation-uuid",
  "recipientEmail": "customer@example.com",
  "status": "delivered"
}
```

**Response (200):** Acknowledgement. Updates quotation status to `sent` and records a history entry.

---

#### POST /api/webhooks/n8n/execution-failed

Called by n8n error workflow when any workflow execution fails. Acts as a dead letter queue.

**Request body:**

```json
{
  "executionId": "n8n-execution-id",
  "workflowName": "vendor-quotation-ingestion",
  "error": "Claude API timeout",
  "jobId": "job-uuid"
}
```

**Response (200):** Acknowledgement. Marks the associated job as `dead_letter` and stores the error log.

---

#### POST /api/webhooks/n8n/price-monitoring-completed

Called by n8n after a price monitoring workflow completes.

**Request body:**

```json
{
  "jobId": "price-monitoring-job-uuid",
  "executionId": "n8n-execution-id",
  "status": "completed",
  "results": [
    {
      "productId": "product-uuid",
      "productName": "Centrifuge Model X",
      "previousPrice": 150000000,
      "currentPrice": 155000000,
      "currencyCode": "VND",
      "source": "vendor-website",
      "fetchedAt": "2026-02-24T10:00:00.000Z"
    }
  ],
  "processingTimeMs": 12500
}
```

**Response (200):** Acknowledgement. Creates price records and generates alerts for significant changes.

---

### Versioning

Base path: `/api/quotations/:id/versions`

All endpoints require JWT. Enables snapshot-based version history for quotations.

---

#### GET /api/quotations/:id/versions

**Auth:** JWT

List all saved version snapshots for a quotation, ordered by version number.

**Path params:** `id` — Quotation UUID

**Response (200):** Array of `IQuotationVersion` objects (without the full `snapshot` field to keep response small).

---

#### POST /api/quotations/:id/versions

**Auth:** JWT

Create a version snapshot of the quotation's current state.

**Path params:** `id` — Quotation UUID

**Request body:**

```json
{
  "label": "Before price revision",
  "changeSummary": "Luu lai truoc khi dieu chinh gia theo yeu cau khach hang"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `label` | string | No | Human-readable label for the version |
| `changeSummary` | string | No | Description of what changed |

**Response (201):** Created `IQuotationVersion` with full snapshot.

---

#### GET /api/quotations/:id/versions/compare

**Auth:** JWT

Compare two version snapshots and get a diff.

**Path params:** `id` — Quotation UUID

**Query parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `versionA` | UUID | Yes | First version ID |
| `versionB` | UUID | Yes | Second version ID |

**Response (200):** `VersionDiff` object:

```json
{
  "items": {
    "added": [{ "index": 2, "item": { /* item data */ } }],
    "removed": [],
    "modified": [
      {
        "index": 0,
        "changes": [
          { "field": "unitPrice", "from": 15000000, "to": 18000000 }
        ]
      }
    ]
  },
  "totals": {
    "subtotal": { "from": 15000000, "to": 18000000 },
    "total": { "from": 16500000, "to": 19800000 }
  },
  "metadata": {
    "title": { "from": "Old title", "to": "New title" }
  }
}
```

---

#### GET /api/quotations/:id/versions/:versionId

**Auth:** JWT

Get a single version snapshot with the full quotation data at that point in time.

**Path params:** `id` — Quotation UUID, `versionId` — Version UUID

---

### Reviews

Base path: `/api/reviews`

All endpoints require JWT. Supports an approval workflow for quotations and ingestion results.

---

#### POST /api/reviews

**Auth:** JWT

Create a new review request (e.g. to get approval before sending a quotation).

**Request body:**

```json
{
  "type": "ingestion",
  "quotationId": "quotation-uuid",
  "jobId": "job-uuid",
  "payload": {
    "reason": "AI-extracted data requires human review",
    "extractedItems": []
  },
  "proposedData": { /* the data to be reviewed */ },
  "assignedTo": "reviewer-user-uuid"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `type` | enum | Yes | `ingestion`, `status_change`, `price_override`, `comparison` |
| `quotationId` | UUID | No | Related quotation |
| `jobId` | UUID | No | Related ingestion job |
| `payload` | object | Yes | Arbitrary context data |
| `proposedData` | object | No | The proposed changes to approve/reject |
| `assignedTo` | UUID | No | User to assign the review to |

**Response (201):** Created review request object.

---

#### GET /api/reviews

**Auth:** JWT

List review requests for the organization.

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | enum | Filter: `pending`, `approved`, `rejected`, `revision_requested` |
| `type` | enum | Filter by review type |
| `page`, `limit` | integer | Pagination |

**Response (200):** Paginated review list.

---

#### GET /api/reviews/:id

**Auth:** JWT

Get review request detail including payload and proposed data.

---

#### PATCH /api/reviews/:id/approve

**Auth:** JWT

Approve a review request.

**Request body:**

```json
{
  "reviewerNotes": "Data looks correct, approved",
  "reviewerChanges": {
    "unitPrice": 16000000
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reviewerNotes` | string | No | Reviewer comments |
| `reviewerChanges` | object | No | Any modifications made during review |

**Response (200):** Updated review with `status: "approved"`.

---

#### PATCH /api/reviews/:id/reject

**Auth:** JWT

Reject a review request.

**Request body:**

```json
{
  "reviewerNotes": "Prices are incorrect, please re-extract"
}
```

`reviewerNotes` is **required** when rejecting.

---

#### PATCH /api/reviews/:id/request-revision

**Auth:** JWT

Request a revision — sends the review back to the requester for modification.

**Request body:**

```json
{
  "reviewerNotes": "Please update item descriptions to be more detailed",
  "reviewerChanges": {}
}
```

`reviewerNotes` is **required**. `reviewerChanges` is optional (object).

---

### Jobs

Base path: `/api/jobs/ingestion`

All endpoints require JWT. Manages async document ingestion job lifecycle.

---

#### POST /api/jobs/ingestion

**Auth:** JWT

Create and trigger a new ingestion job. This kicks off the n8n ingestion workflow for the specified attachment.

**Request body:**

```json
{
  "attachmentId": "attachment-uuid",
  "customerId": "customer-uuid"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `attachmentId` | UUID | Yes | The uploaded vendor document to process |
| `customerId` | UUID | No | Pre-associate the result with a customer |

**Response (201):** Created job object with `status: "pending"`.

---

#### GET /api/jobs/ingestion

**Auth:** JWT

List ingestion jobs for the organization.

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | enum | Filter by: `pending`, `extracting`, `translating`, `normalizing`, `review_pending`, `completed`, `failed`, `dead_letter` |
| `page`, `limit` | integer | Pagination |

**Response (200):** Paginated job list.

---

#### GET /api/jobs/ingestion/:jobId

**Auth:** JWT

Get full job status and results (extract, translate, normalize results).

**Path params:** `jobId` — Job UUID

**Response (200):** `IIngestionJob` object:

```json
{
  "id": "job-uuid",
  "organizationId": "org-uuid",
  "attachmentId": "attachment-uuid",
  "status": "completed",
  "currentStep": null,
  "retries": 0,
  "maxRetries": 3,
  "extractResult": { /* extracted data */ },
  "translateResult": { /* translated data */ },
  "normalizeResult": { /* normalized data */ },
  "quotationId": "quotation-uuid",
  "processingTimeMs": 8500,
  "startedAt": "2026-02-24T10:00:00.000Z",
  "completedAt": "2026-02-24T10:00:08.000Z",
  "createdAt": "2026-02-24T09:59:58.000Z",
  "updatedAt": "2026-02-24T10:00:08.000Z"
}
```

---

#### POST /api/jobs/ingestion/:jobId/retry

**Auth:** JWT

Retry a failed job. Re-triggers the n8n workflow from the last successful step.

**Path params:** `jobId` — Job UUID

**Notes:** Only jobs with `status: "failed"` can be retried. Jobs in `dead_letter` status (exceeded max retries) cannot be retried automatically.

---

### Prompts

Base path: `/api/prompts`

All endpoints require JWT. Manages versioned AI prompt configurations.

---

#### POST /api/prompts

**Auth:** JWT

Create a new prompt version.

**Request body:**

```json
{
  "type": "generate",
  "systemPrompt": "You are an expert at creating Vietnamese business quotations...",
  "userPromptTemplate": "Create a quotation draft for: {{description}}",
  "model": "claude-sonnet-4-20250514",
  "maxTokens": 4096,
  "changeNotes": "Improved Vietnamese terminology"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `type` | enum | Yes | `extract`, `translate`, `generate`, `suggest`, `improve`, `compare` |
| `systemPrompt` | string | Yes | System instruction |
| `userPromptTemplate` | string | Yes | Template with `{{variable}}` placeholders |
| `model` | string | Yes | Claude model ID |
| `maxTokens` | integer | Yes | Max output tokens |
| `changeNotes` | string | No | Description of changes |

---

#### GET /api/prompts

**Auth:** JWT

List all prompt versions.

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | enum | Filter by prompt type |

**Response (200):** Array of `IAiPromptVersion` objects.

---

#### GET /api/prompts/:id

**Auth:** JWT

Get a single prompt version.

---

#### PATCH /api/prompts/:id

**Auth:** JWT

Update a prompt version. Only inactive (draft) prompts can be edited.

**Request body:** Same as create, all fields optional.

---

#### PATCH /api/prompts/:id/activate

**Auth:** JWT

Activate a prompt version for its type. Automatically deactivates the previously active prompt of the same type.

**Response (200):** Activated prompt with `isActive: true`.

**Notes:** Only one prompt per type can be active at a time. The system uses the active prompt when making AI calls.

---

### Glossary

Base path: `/api/glossary`

All endpoints require JWT. Manages domain-specific translation glossary per organization.

---

#### POST /api/glossary

**Auth:** JWT

Create a glossary term.

**Request body:**

```json
{
  "sourceTerm": "centrifuge",
  "targetTerm": "may ly tam",
  "sourceLanguage": "en",
  "targetLanguage": "vi",
  "category": "lab"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sourceTerm` | string | Yes | Original term |
| `targetTerm` | string | Yes | Translation |
| `sourceLanguage` | string | No | Default: `en` |
| `targetLanguage` | string | No | Default: `vi` |
| `category` | string | No | Domain category for filtering |

---

#### GET /api/glossary

**Auth:** JWT

List glossary terms with optional search and category filter.

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search in source and target terms |
| `category` | string | Filter by category |

---

#### GET /api/glossary/export

**Auth:** JWT

Export all glossary terms, optionally filtered by category.

**Query parameters:** `category` (optional)

**Response (200):** Array of all matching glossary terms (no pagination).

---

#### GET /api/glossary/:id

**Auth:** JWT

Get a single glossary term.

---

#### PATCH /api/glossary/:id

**Auth:** JWT

Update a glossary term.

---

#### DELETE /api/glossary/:id

**Auth:** JWT

Delete a glossary term.

---

#### POST /api/glossary/import

**Auth:** JWT

Bulk import multiple glossary terms in a single request.

**Request body:**

```json
{
  "terms": [
    {
      "sourceTerm": "centrifuge",
      "targetTerm": "may ly tam",
      "category": "lab"
    },
    {
      "sourceTerm": "autoclave",
      "targetTerm": "noi khu trung",
      "category": "lab"
    }
  ]
}
```

**Response (201):** Summary of imported terms (created count, skipped count).

---

### Rules

Base path: `/api/rules`

All endpoints require JWT. Manages domain-specific validation rule sets used during ingestion normalization.

---

#### POST /api/rules

**Auth:** JWT

Create a rule set.

**Request body:**

```json
{
  "category": "lab",
  "name": "Laboratory Equipment Validation Rules",
  "description": "Rules for validating lab equipment quotations",
  "rules": [
    {
      "field": "unitPrice",
      "operator": "gt",
      "value": 0,
      "action": "reject",
      "priority": 1,
      "message": "Unit price must be greater than 0"
    },
    {
      "field": "quantity",
      "operator": "gte",
      "value": 1,
      "action": "flag",
      "priority": 2,
      "message": "Quantity should be at least 1"
    }
  ]
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `category` | enum | Yes | `lab`, `biotech`, `icu`, `analytical`, `general` |
| `name` | string | Yes | — |
| `rules[].field` | string | Yes | Field name to evaluate |
| `rules[].operator` | enum | Yes | `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `contains`, `startsWith` |
| `rules[].value` | any | Yes | Value to compare against |
| `rules[].action` | enum | Yes | `flag`, `reject`, `modify` |
| `rules[].priority` | integer | Yes | Lower number = higher priority |

---

#### GET /api/rules

**Auth:** JWT

List rule sets.

**Query parameters:** `category` (optional enum filter)

---

#### GET /api/rules/:id

**Auth:** JWT

Get a single rule set.

---

#### PATCH /api/rules/:id

**Auth:** JWT

Update a rule set.

---

#### DELETE /api/rules/:id

**Auth:** JWT

Delete a rule set.

---

#### POST /api/rules/evaluate

**Auth:** JWT

Evaluate rules against sample data without saving. Used for testing rule sets.

**Request body:**

```json
{
  "category": "lab",
  "items": [
    {
      "name": "Centrifuge",
      "unitPrice": 0,
      "quantity": 1
    }
  ],
  "ruleSetId": "rule-set-uuid"
}
```

**Response (200):** `RuleEvaluationResult`:

```json
{
  "passed": false,
  "flagged": [],
  "rejected": [
    {
      "item": { "name": "Centrifuge", "unitPrice": 0 },
      "rule": { "field": "unitPrice", "operator": "gt", "value": 0 },
      "message": "Unit price must be greater than 0"
    }
  ]
}
```

---

### Price Monitoring

Base path: `/api/price-monitoring`

All endpoints require JWT. Monitors product price changes via n8n workflows.

---

#### POST /api/price-monitoring/trigger

**Auth:** JWT

Trigger a price monitoring job for the organization.

**Request body:**

```json
{
  "productIds": ["product-uuid-1", "product-uuid-2"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productIds` | UUID[] | No | Specific products to monitor. If omitted, monitors all active products |

**Response (201):** Created price monitoring job object.

---

#### GET /api/price-monitoring/jobs

**Auth:** JWT

List price monitoring jobs for the organization.

**Query parameters:** `page`, `limit`, `status` filter

**Response (200):** Paginated list of `IPriceMonitoringJob` objects.

---

#### GET /api/price-monitoring/jobs/:id

**Auth:** JWT

Get a price monitoring job with its associated price records.

**Path params:** `id` — Job UUID

**Response (200):** Job object with nested `priceRecords` array.

---

#### GET /api/price-monitoring/history

**Auth:** JWT

Get price history for a specific product.

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `productId` | UUID | Required — product to fetch history for |
| `from` | date string | Start date |
| `to` | date string | End date |
| `page`, `limit` | integer | Pagination |

**Response (200):** Paginated `IPriceRecord` list.

---

#### GET /api/price-monitoring/alerts

**Auth:** JWT

List price alerts for the organization.

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `isRead` | boolean | Filter by read status |
| `severity` | enum | `info`, `warning`, `critical` |
| `page`, `limit` | integer | Pagination |

**Response (200):** Paginated `IPriceAlert` list.

---

#### PATCH /api/price-monitoring/alerts/read-all

**Auth:** JWT

Mark all price alerts as read for the organization.

**Response (200):** Count of alerts updated.

---

#### PATCH /api/price-monitoring/alerts/:id/read

**Auth:** JWT

Mark a specific price alert as read.

**Path params:** `id` — Alert UUID

**Response (200):** Updated alert with `isRead: true`.

---

### Health

Base path: `/api/health`

---

#### GET /api/health

**Auth:** Public

Check API and database health.

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2026-02-24T10:00:00.000Z",
  "uptime": 3600.5,
  "database": {
    "connected": true,
    "latencyMs": 2
  }
}
```

| Field | Values | Description |
|-------|--------|-------------|
| `status` | `ok`, `degraded` | `degraded` when DB is disconnected |
| `uptime` | number | Process uptime in seconds |
| `database.latencyMs` | number or null | null if DB is not connected |

---

## Error Codes

| HTTP Status | Meaning | When it occurs |
|-------------|---------|----------------|
| 400 | Bad Request | Validation failure (missing required fields, wrong types, out-of-range values) |
| 401 | Unauthorized | Missing or invalid JWT token; wrong service key or webhook secret |
| 403 | Forbidden | Authenticated but insufficient role or trying to access another org's data |
| 404 | Not Found | Resource does not exist or belongs to a different organization |
| 409 | Conflict | Duplicate unique value (e.g. currency code already exists, email already registered) |
| 413 | Payload Too Large | File upload exceeds 10 MB limit |
| 429 | Too Many Requests | Monthly AI token budget exceeded for the organization |
| 500 | Internal Server Error | Unexpected server error — check logs |

### Common 400 scenarios

- `email must be an email` — invalid email format in register/login
- `password must be longer than or equal to 6 characters` — password too short
- `discount must not be greater than 100` — discount/tax out of 0–100 range
- `items should not be empty` — quotation submitted with no items
- `description must be longer than or equal to 10 characters` — AI generate description too short

---

## Rate Limiting and Token Budget

There is no HTTP-level rate limiter on the API. The limiting mechanism for AI features is the **monthly token budget** per organization.

### Token budget by plan

| Plan | Monthly Token Limit | Price |
|------|---------------------|-------|
| Free | 100,000 tokens | $0 |
| Starter | 1,000,000 tokens | $29/month |
| Professional | 5,000,000 tokens | $99/month |
| Enterprise | Unlimited | $299/month |

When an organization exhausts its token budget, AI endpoints (`/api/ai/*` and `/api/ingestion/*`) will return `429 Too Many Requests` with a message indicating the budget has been reached.

**Overage rate:** $0.02 per 1,000 tokens beyond the limit (Enterprise plan only).

### Token tracking

Every AI request is logged in the `token_usage` table with:
- `operation` — which AI feature was used
- `inputTokens` / `outputTokens` / `costUsd`
- `userId` — who triggered the request
- `quotationId` — if applicable

Use `GET /api/ai/usage/summary` and `GET /api/ai/usage/dashboard` to monitor consumption.
