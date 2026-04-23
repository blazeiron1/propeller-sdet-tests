# Propeller SDET Test Suite

Automated API tests for the Propeller E-Commerce GraphQL API.

## Prerequisites
- Node.js 20+
- Docker & Docker Compose
- The API running locally at http://localhost:3000

## Setup & Run

**1. Start the API**

    cd api
    docker-compose up --build

**2. Seed the database (in a separate terminal)**

    cd api
    docker-compose run --rm seed

**3. Install test dependencies**

    npm install

**4. Run tests**

    npm test

## Bugs Found & Fixed

**Bug 1 — Missing x-tenant-id header not enforced**
- File: `src/common/tenant.decorator.ts`
- Problem: Requests without `x-tenant-id` were accepted using a `'default'` fallback
- Fix: Throw `BadRequestException` when header is missing

**Bug 2 — Price column stored as integer**
- File: `src/product/product.entity.ts`
- Problem: Price column typed as `int`, rejecting decimal values like `29.99`
- Fix: Changed column type to `decimal(10,2)`

**Bug 3 — Status filter inverted**
- File: `src/product/product.service.ts`
- Problem: Filtering by ACTIVE returned INACTIVE products and vice versa
- Fix: Removed inverted logic, pass filter status directly to query

**Bug 4 — Pagination offset wrong**
- File: `src/product/product.service.ts`
- Problem: Used `page * pageSize` instead of `(page - 1) * pageSize`
- Fix: Changed to `(page - 1) * pageSize`

**Bug 5 — findOne missing tenantId check**
- File: `src/product/product.service.ts`
- Problem: Products could be accessed across tenants
- Fix: Added `tenantId` to the `where` clause

**Bug 6 — Image priority default wrong**
- File: `src/image/image.entity.ts`
- Problem: Default priority was `0` instead of `100`
- Fix: Changed default to `100`

## Assumptions
- Prices are stored as decimals with up to 2 decimal places
- The API runs locally on port 3000
- Tenant isolation applies to all operations including mutations