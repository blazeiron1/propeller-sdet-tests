# Propeller E-Commerce GraphQL API

A simple multi-tenant e-commerce GraphQL API serving **Products** and **Images**.

This project is used as part of the **Junior SDET Assignment** at Propeller Commerce.

## Getting Started

### Prerequisites

- Docker & Docker Compose

### Running the API

```bash
# Start the API and database
docker-compose up --build

# In a separate terminal, seed the database with sample data
docker-compose run --rm seed
```

The GraphQL playground will be available at **http://localhost:3000/graphql**.

### Multi-Tenancy

All requests require an `x-tenant-id` header. In the GraphQL playground, set HTTP headers like:

```json
{
  "x-tenant-id": "tenant-a"
}
```

Available tenants in the seed data: `tenant-a`, `tenant-b`.

## Data Models

### Product

| Field    | Type           | Description                         |
| -------- | -------------- | ----------------------------------- |
| id       | ID             | Auto-generated primary key          |
| name     | String         | Product name                        |
| price    | Float          | Product price (supports decimals)   |
| status   | ProductStatus  | `ACTIVE` or `INACTIVE`              |
| tenantId | String         | Tenant identifier                   |
| images   | [Image]        | Associated images                   |

### Image

| Field     | Type    | Description                                      |
| --------- | ------- | ------------------------------------------------ |
| id        | ID      | Auto-generated primary key                       |
| url       | String  | URL to the image on a CDN or file server         |
| priority  | Int     | Display priority (min: 1, max: 1000, default: 100) |
| tenantId  | String  | Tenant identifier                                |
| productId | Int?    | Associated product (nullable)                    |
| product   | Product?| Associated product relation                      |

## Available Operations

### Queries

```graphql
# List products (with optional filtering and pagination)
products(filter: ProductFilterInput, page: Int = 1, pageSize: Int = 10): [Product]

# Get a single product by ID
product(id: Int!): Product

# List images (optionally filtered by productId)
images(productId: Int): [Image]

# Get a single image by ID
image(id: Int!): Image
```

### Mutations

```graphql
createProduct(input: CreateProductInput!): Product
updateProduct(id: Int!, input: UpdateProductInput!): Product
deleteProduct(id: Int!): Boolean

createImage(input: CreateImageInput!): Image
updateImage(id: Int!, input: UpdateImageInput!): Image
deleteImage(id: Int!): Boolean
```

### Filter Options (ProductFilterInput)

| Field    | Type          | Description                |
| -------- | ------------- | -------------------------- |
| name     | String?       | Partial match (case-insensitive) |
| status   | ProductStatus?| Filter by status           |
| minPrice | Float?        | Minimum price              |
| maxPrice | Float?        | Maximum price              |

## Tech Stack

- **Runtime:** Node.js 20
- **Framework:** NestJS 10
- **GraphQL:** Apollo Server 4 (code-first)
- **ORM:** TypeORM
- **Database:** PostgreSQL 16

## Project Structure

```
src/
├── common/
│   └── tenant.decorator.ts    # @TenantId() parameter decorator
├── product/
│   ├── product.entity.ts      # Product TypeORM entity & GraphQL type
│   ├── product.dto.ts         # Input types (Create, Update, Filter)
│   ├── product.service.ts     # Business logic
│   ├── product.resolver.ts    # GraphQL resolver
│   └── product.module.ts      # NestJS module
├── image/
│   ├── image.entity.ts        # Image TypeORM entity & GraphQL type
│   ├── image.dto.ts           # Input types (Create, Update)
│   ├── image.service.ts       # Business logic
│   ├── image.resolver.ts      # GraphQL resolver
│   └── image.module.ts        # NestJS module
├── app.module.ts              # Root module
├── main.ts                    # Entry point
└── seed.ts                    # Database seeder
```
