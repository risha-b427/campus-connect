# Campus Connect API

The backend is an Express API that reads and writes data in Supabase Postgres.

## First-time setup

Install Node.js 22.13 or newer and Docker Desktop. Docker Desktop must be running.

From the repository root, install dependencies and start Supabase:

```bash
npm install
npm --prefix backend install
npm run db:start
```

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

The example is configured for the local database. View the local Supabase URL and publishable key with:

```bash
npx supabase status
```

Keep `.env` on your computer; never commit it or put database credentials in the mobile app.

Apply migrations and seed data:

```bash
npm run db:reset
```

## Run the API

From the repository root:

```bash
npm run backend:dev
```

Or from this directory:

```bash
npm install
npm run dev
```

The API runs at `http://localhost:3000`.

## API endpoints

The health endpoint is public:

```text
GET http://localhost:3000/api/health
```

Buildings and spots require a Supabase access token:

```text
GET http://localhost:3000/api/buildings
GET http://localhost:3000/api/spots
GET http://localhost:3000/api/spots?spotType=Library
```

Send the token in this header:

```text
Authorization: Bearer <supabase-access-token>
```

`GET /api/spots` returns all spots when no filter is supplied. Supported `spotType` values are `Cafe`, `Library`, `University Housing`, `Restaurant`, `Outdoor`, and `Lounge`.

## Database changes

Create schema changes in SQL migration files under `supabase/migrations/`:

```bash
npx supabase migration new <description>
npm run db:up
```

To rebuild the local database from all migrations and reload seed data:

```bash
npm run db:reset
```

Resetting clears local database data.

## Tests and checks

From the repository root:

```bash
npm run backend:typecheck
npm --prefix backend test
```

## Database access and security

The API verifies Supabase access tokens with `auth.getClaims()`. The health endpoint is public; protected routes are mounted after the authentication middleware in `src/app.ts`.

The API connects to Postgres using `DATABASE_URL`. Keep database credentials on the backend and never expose them in the mobile app. Because the API uses the `postgres` role, which bypasses Row Level Security, protected controllers must still check which records the signed-in user may access.

## Code layout

```text
src/
  features/       # API routes and feature-specific logic
  middleware/     # Shared middleware
  services/       # Shared services, including the database connection
  app.ts          # Express app configuration
  server.ts       # Starts the HTTP server
```
