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

For authentication, set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `backend/.env`. Run `npx supabase status` from the repository root to find the local API URL and publishable key. For a hosted project, use its project URL and publishable key instead.

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

API requests must send the access token returned by Supabase signup or login in an `Authorization: Bearer <access_token>` header. The `requireAuth` middleware verifies the JWT with Supabase's `auth.getClaims()` and puts the user ID in `req.user.id`. It also checks the token's project issuer, audience, role, and expiry. The health endpoint stays public; mount new `/api` routes after `app.use("/api", requireAuth)` in `src/app.ts` to protect them.

In protected controllers, use `req.user!.id` for the caller's identity, rather than trusting a user ID supplied in the request body. Each route still needs to check which records that user may access. JWT verification alone does not immediately detect signout or user deletion; a verified token can remain valid until it expires.

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
