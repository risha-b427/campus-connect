# Campus Connect API

The backend is an Express API that reads and writes data in Supabase Postgres.

## First-time setup

You need Docker Desktop running. From the repository root, start the local Supabase services:

```powershell
npm run db:start
```

Create `backend/.env` by copying `backend/.env.example`. The example is already configured for the local database. Its default connection string is:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

Keep `.env` on your computer; never commit it or put the database URL in the mobile app. To connect to a hosted Supabase project instead, use the Postgres connection string from the supabase website project's **Connect** panel.

## Database changes

Database schema changes go in SQL migration files under `supabase/migrations/`. From the repository root, create a migration with:

```powershell
npx supabase migration new <description>
```

Edit the generated SQL file, then apply pending migrations locally with:

```powershell
npm run db:up
```

To rebuild the local database from all migrations, run `npm run db:reset`. This clears local database data.

## Run the API

From this `backend` directory:

```powershell
npm install
npm run dev
```

Or, from the repository root, run `npm run backend:dev`. The health endpoint is available at `http://localhost:3000/api/health`.

Run the TypeScript check from this directory with `npm run typecheck`, or from the root with `npm run backend:typecheck`.

## Database access and security

The API connects to Postgres using `DATABASE_URL`. In this project, that connection uses the `postgres` role, which bypasses Row Level Security (RLS). The API must check that a signed-in user is allowed to perform each operation. Keep database credentials on the backend and never expose them in the mobile app.

## Code layout

```text
src/
  features/       # API routes and feature-specific logic
  middleware/     # Shared request middleware
  services/       # Shared services, including the database connection
  app.ts          # Express app configuration
  server.ts       # Starts the HTTP server
```

Feature code can be split into routes, controllers, services, and repositories as needed. Routes are mounted in `src/app.ts`.
