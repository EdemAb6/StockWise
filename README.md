# StockWise

StockWise is a full-stack inventory management system for small businesses.

## Phase 1 setup

### Prerequisites

- Node.js 20 or later
- PostgreSQL 15 or later

### Install dependencies

From the repository root:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

### Configure the environment

Copy `.env.example` to `server/.env` and update `DATABASE_URL` with your local PostgreSQL credentials:

```text
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/stockwise
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Create a `stockwise` database, then run the schema and seed files:

```bash
psql -d stockwise -f server/db/migrations/001_initial_schema.sql
psql -d stockwise -f server/db/seed.sql
```

### Start the application

Run both applications from the repository root:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API health check: http://localhost:5000/api/health

The health endpoint checks both the Express server and its PostgreSQL connection.

## Dashboard API

```text
GET /api/dashboard/stats
```

The endpoint returns the total product count, current inventory value, low
stock count, and the five most recent movements with product details. The
shorter `GET /api/dashboard` route is also available.

## Inventory movement API

Stock changes must be recorded through inventory movements rather than by
updating a product's quantity directly.

```text
POST /api/products/:id/movements
GET  /api/movements
GET  /api/products/:id/movements
```

Create a stock-in movement:

```json
{
  "type": "IN",
  "quantity": 10,
  "reason": "Supplier delivery"
}
```

Create a stock-out movement:

```json
{
  "type": "OUT",
  "quantity": 2,
  "reason": "Customer order"
}
```

Movement creation updates the product quantity and inserts the movement
history record in one PostgreSQL transaction. The product row is locked with
`FOR UPDATE`, and stock-out operations that exceed available inventory return
`409 Conflict` without changing the quantity.
