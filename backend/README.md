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

### Check-ins

Check-in endpoints also require a token. They always act as the signed-in user; a user ID sent by the client is ignored.

| Endpoint | Body | Success | Errors |
| --- | --- | --- | --- |
| `POST /api/check-ins` | `{ "spotId": "<spot-id>", "note": "optional" }` | `201` with the new check-in | `400` invalid input or unknown spot; `409` user already has an active check-in |
| `PATCH /api/check-ins/:id/check-out` | `{ "busyness": 6, "noise": 3 }` (whole numbers 1–10) | `200` with the completed check-in | `400` invalid input or already checked out; `404` not found or another user's check-in |
| `GET /api/check-ins/me` | — | `200` with the user's check-ins, newest first (`[]` if none) | — |

Every endpoint returns check-ins in this shape:

```json
{
  "id": "check-in-uuid",
  "spot": { "id": "spot-uuid", "name": "Grainger Library First Floor" },
  "note": "Studying for CS 225",
  "checkedInAt": "2026-11-07T14:00:00.000Z",
  "checkedOutAt": null,
  "busyness": null,
  "noise": null,
  "isActive": true
}
```

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

### Check-in schema

Apply pending local migrations with `npm run db:up`. The check-in table
includes optional `note` text and permits busyness and noise to be omitted until checkout.
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
