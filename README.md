# StockWise

StockWise is a full-stack inventory management system for small businesses.
It helps a business maintain a product catalog, monitor stock levels, record
inventory changes, and understand its current inventory position from a
dashboard.

The project is designed as a practical portfolio and PFE demonstration of
full-stack engineering: a React interface, a REST API, relational data
modeling, validation, transaction-safe business rules, testing, and
deployment-ready configuration.

## Features

- Dashboard statistics:
  - Total products.
  - Total inventory value.
  - Low-stock product count.
  - Five most recent inventory movements.
- Product management:
  - Create, list, search, filter, edit, and delete products.
  - Unique SKU enforcement.
  - Low-stock status indicators.
- Inventory management:
  - Record stock-in and stock-out movements.
  - View movement history.
  - Reject movements that would make stock negative.
  - Keep product quantities and movement records consistent.
- Responsive Tailwind CSS interface with loading, empty, success, and error
  states.

## Architecture

```text
React + Vite + Tailwind CSS
            |
            | JSON over HTTP (/api)
            v
Node.js + Express REST API
            |
            | Raw parameterized SQL through node-postgres
            v
PostgreSQL
```

The frontend never connects directly to PostgreSQL. It calls the Express API,
which validates requests, applies business rules, and executes database
queries through the `pg` connection pool.

### Main directories

```text
client/
  src/components/    Shared layout and modal components
  src/pages/         Dashboard, products, and movements views
  src/services/api.js

server/
  src/routes/        HTTP route definitions
  src/controllers/   HTTP request/response handling
  src/services/      Business logic and database queries
  src/validators/    Request validation middleware
  src/db/            PostgreSQL pool, migrations, and seed data
  tests/             Vitest and Supertest API tests
```

## Technical highlights

### Raw parameterized SQL

StockWise uses the `pg` library and SQL queries with PostgreSQL parameters such
as `$1`, `$2`, and `$3`. It does not use a heavy ORM. This keeps the data
access layer explicit and makes the SQL, indexes, constraints, and transaction
behavior easy to explain in an interview.

### ACID transactions and row-level locking

Creating an inventory movement updates two related pieces of data:

1. The product's current quantity.
2. The movement history record.

These changes occur inside one PostgreSQL transaction. The product row is
locked with:

```sql
SELECT *
FROM products
WHERE id = $1
FOR UPDATE;
```

The lock prevents concurrent requests from both reading the same old quantity.
If an `OUT` movement would exceed available stock, the transaction rolls back
and the quantity remains unchanged. This protects the application from
negative inventory and partial updates.

### Product metadata and stock history are separate

Product endpoints update metadata such as name, SKU, category, price, and
minimum stock. They do not directly update quantity after creation.

Quantity changes go through inventory movements, which creates an auditable
history:

```text
Product API     -> product metadata
Movement API    -> quantity changes + movement records
```

### Centralized error handling

Express error middleware maps expected failures to useful HTTP responses:

- `400 Bad Request`: invalid input.
- `404 Not Found`: missing product.
- `409 Conflict`: duplicate SKU or insufficient stock.
- `500 Internal Server Error`: unexpected server failure.

The PostgreSQL unique constraint on `products.sku` is translated from error
code `23505` into a `409 Conflict` response. Insufficient stock also returns
`409` with the available and requested quantities.

## Prerequisites

- Node.js 20 or later.
- npm.
- PostgreSQL 15 or later, either installed locally or provided by Docker.

## Local setup

### 1. Install dependencies

From the repository root:

```powershell
npm install
npm install --prefix client
npm install --prefix server
```

### 2. Create the database

Create a PostgreSQL database named `stockwise`:

```powershell
createdb stockwise
```

If `createdb` is not available, create a database named `stockwise` through
pgAdmin or another PostgreSQL client.

### 3. Configure environment variables

Copy the root template into the server directory:

```powershell
Copy-Item .env.example server/.env
```

Edit `server/.env` and set your PostgreSQL username and password:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/stockwise
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

The backend loads `server/.env` because the server is started with `server/`
as its working directory. Never commit this file.

### 4. Apply the schema and seed data

Run the migration:

```powershell
psql -d stockwise -f server/db/migrations/001_initial_schema.sql
```

Insert demonstration products:

```powershell
psql -d stockwise -f server/db/seed.sql
```

The schema creates:

- `products`
- `inventory_movements`

It also adds SKU uniqueness, non-negative quantity constraints, movement
constraints, foreign keys, and movement indexes.

### 5. Start the application

Start both the API and frontend from the repository root:

```powershell
npm run dev
```

Open:

- Frontend: <http://localhost:5173>
- API health check: <http://localhost:5000/api/health>
- Dashboard API: <http://localhost:5000/api/dashboard/stats>

The health endpoint verifies the API and its PostgreSQL connection.

To run only one side:

```powershell
npm run dev:server
npm run dev:client
```

## Optional Docker PostgreSQL

If PostgreSQL is not installed locally, Docker Compose can provide the
database:

```powershell
docker compose up -d db
```

The Compose database uses the same credentials as the example environment:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/stockwise
```

After the container is ready, run the migration and seed commands from the
host as shown above. Stop the database with:

```powershell
docker compose down
```

The Compose file intentionally provides PostgreSQL only. The Node API and Vite
client continue to run with the normal development commands, which keeps
hot-reloading and debugging straightforward.

## API overview

### Products

```text
GET    /api/products
GET    /api/products/:id
POST   /api/products
PATCH  /api/products/:id
DELETE /api/products/:id
```

Product listing supports `search`, `category`, and `stockStatus` query
parameters:

```text
/api/products?search=keyboard&category=Accessories&stockStatus=low
```

### Inventory movements

```text
POST /api/products/:id/movements
GET  /api/movements
GET  /api/products/:id/movements
```

Example:

```json
{
  "type": "OUT",
  "quantity": 2,
  "reason": "Customer order"
}
```

### Dashboard

```text
GET /api/dashboard/stats
GET /api/dashboard
```

Both dashboard routes return the same summary.

## Testing

Run the backend Vitest and Supertest suite:

```powershell
npm test --prefix server
```

The tests cover product validation and CRUD behavior, duplicate SKU handling,
movement creation, stock-in and stock-out calculations, insufficient-stock
rollback behavior, transaction cleanup, and movement retrieval.

Build the frontend for production:

```powershell
npm run build --prefix client
```

## Deployment preparation

For deployment, configure these environment variables in the hosting provider:

```env
PORT=5000
DATABASE_URL=<managed PostgreSQL connection string>
CLIENT_ORIGIN=<deployed frontend URL>
NODE_ENV=production
```

Possible hosting combinations include a static frontend host such as Vercel or
Netlify, an API host such as Render or Railway, and a managed PostgreSQL
provider such as Neon, Supabase, Render, or Railway.

Before deploying:

1. Apply the database schema to the managed PostgreSQL database.
2. Seed only demonstration data that is appropriate for the environment.
3. Set `CLIENT_ORIGIN` to the exact frontend origin.
4. Confirm `/api/health` reports a connected database.
5. Run the backend test suite and frontend production build.
6. Never place `DATABASE_URL` or other secrets in frontend variables or Git.

## Portfolio talking points

StockWise demonstrates how to:

- Design a small relational schema with constraints and indexes.
- Build REST endpoints with sensible status codes.
- Validate input at the API boundary.
- Use parameterized SQL to avoid SQL injection.
- Protect multi-step stock updates with ACID transactions.
- Use row-level locking for concurrent inventory operations.
- Separate business logic from HTTP and database concerns.
- Build a responsive React interface with explicit loading and error states.
- Test API behavior with Vitest and Supertest.
