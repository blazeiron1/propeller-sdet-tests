# 

# \# Propeller SDET Test Suite

# 

# Automated API tests for the Propeller E-Commerce GraphQL API.

# 

# \## Prerequisites

# \- Node.js 20+

# \- Docker \& Docker Compose

# \- The API running locally at http://localhost:3000

# 

# \## Setup \& Run

# 

# \### 1. Start the API

# ```bash

# cd api

# docker-compose up --build

# ```

# 

# \### 2. Seed the database (in a separate terminal)

# ```bash

# cd api

# docker-compose run --rm seed

# ```

# 

# \### 3. Install test dependencies

# ```bash

# npm install

# ```

# 

# \### 4. Run tests

# ```bash

# npm test

# ```

# 

# \## Bugs Found \& Fixed

# 

# \### Bug 1 — Missing x-tenant-id header not enforced

# \*\*File:\*\* `src/common/tenant.decorator.ts`

# \*\*Problem:\*\* The decorator had a `|| 'default'` fallback, meaning requests without the required `x-tenant-id` header were silently accepted and processed under a `'default'` tenant instead of being rejected.

# \*\*Fix:\*\* Removed the fallback and throw a `BadRequestException` when the header is missing.

# 

# \### Bug 2 — Price column stored as integer

# \*\*File:\*\* `src/product/product.entity.ts`

# \*\*Problem:\*\* The price column was typed as `int` in the database, causing decimal prices like `29.99` to fail with a database error.

# \*\*Fix:\*\* Changed column type to `decimal` with precision 10 and scale 2.

# 

# \### Bug 3 — Status filter inverted

# \*\*File:\*\* `src/product/product.service.ts`

# \*\*Problem:\*\* When filtering by status, the logic was inverted — filtering for `ACTIVE` returned `INACTIVE` products and vice versa.

# \*\*Fix:\*\* Removed the inverted logic and pass the filter status directly to the query.

# 

# \### Bug 4 — Pagination offset wrong

# \*\*File:\*\* `src/product/product.service.ts`

# \*\*Problem:\*\* Pagination used `page \* pageSize` for the offset, meaning page 1 skipped the first 10 records instead of starting from the beginning.

# \*\*Fix:\*\* Changed to `(page - 1) \* pageSize` so page 1 starts from offset 0.

# 

# \### Bug 5 — findOne does not check tenantId

# \*\*File:\*\* `src/product/product.service.ts`

# \*\*Problem:\*\* The `findOne` method only queried by `id`, not by `tenantId`, meaning a tenant could access, update, or delete another tenant's products.

# \*\*Fix:\*\* Added `tenantId` to the `where` clause.

# 

# \### Bug 6 — Image priority default value wrong

# \*\*File:\*\* `src/image/image.entity.ts`

# \*\*Problem:\*\* The default priority was set to `0` instead of `100` as documented.

# \*\*Fix:\*\* Changed default from `0` to `100`.

# 

# \## Assumptions

# \- Prices are stored as decimals with up to 2 decimal places

# \- The API runs locally on port 3000

# \- Tenant isolation applies to all operations including mutations

