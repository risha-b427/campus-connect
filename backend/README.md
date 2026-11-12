# Campus Connect API

The backend is an Express API that reads and writes data in Supabase Postgres.

## First-time setup

Install Node.js 22.13 or newer. Campus Connect connects to the shared remote Supabase project; a local Supabase stack and Docker Desktop are not required.

From the repository root, install dependencies:

```bash
npm install
npm --prefix backend install
```

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Fill in the remote Supabase URL, publishable key, and Postgres connection string using the shared credentials. Keep `.env` on your computer; never commit it or put database credentials in the mobile app.

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

If you need a database schema change, contact the backend tech lead before creating or applying a migration. Migrations are kept under `supabase/migrations/` and are applied to the shared remote project by admins. `supabase/seed.sql` is retained as seed data; do not run a local database reset against the shared project.

### Check-in schema

The check-in table includes optional `note` text and permits busyness and noise to be omitted until checkout.
API fields `busyness` and `noise` map to database columns `crowd_level` and
`noise_level`, respectively. Both must be integers from 1–10 at checkout,
and the checkout timestamp and both values must be saved in the same update.
An active check-in has a null `check_out_time`, `crowd_level`, and `noise_level`.

Overall study-spot ratings live separately in `public.ratings`, with `user_id`,
`spot_id`, an integer `rating` from 1 (worst) to 10 (best), and `created_at`.
The composite primary key `(user_id, spot_id)` enforces one overall rating per
user per spot, including concurrent submissions. The API should reject duplicate
ratings (Postgres code `23505` on `ratings_pkey`) with `409 Conflict` rather than
overwriting the existing rating. Repeat visits can still submit busyness and
noise at checkout without creating another overall rating. If an overall rating
is accepted during checkout, save it and the checkout in the same transaction.

Check-ins reference `auth.users(id)` directly, so a verified user does not need
a `public.users` profile before checking in. A unique partial index named
`check_ins_one_active_per_user` prevents concurrent requests from creating
multiple active check-ins for the same user. The API should map violations
of this index (Postgres code `23505`) to `409 Conflict`.

Row Level Security remains enabled, and the
backend must still enforce ownership using the verified `req.user.id`.

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
