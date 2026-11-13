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
npm run backend
```

Or from this directory:

```bash
npm install
npm run dev
```

The API runs at `http://localhost:3000`.

## API documentation

See the [API reference](docs/README.md) for authentication, shared errors, and
documentation grouped by resource:

- [GET /api/health](docs/routes/health.md)
- [GET /api/buildings](docs/routes/buildings.md)
- [GET /api/spots](docs/routes/spots.md)
- [GET /api/spots/:id](docs/routes/spots.md#get-apispotsid)

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

Contact the backend tech lead before creating or applying migrations. Admins
apply migrations from `supabase/migrations/` to the shared remote project.
Do not reset the shared database.

## Tests and checks

From the repository root:

```bash
npm run backend:typecheck
npm --prefix backend test
```

API tests mock database queries and authentication, so they require no running
database, Docker, or shared credentials. They verify HTTP behavior and response
mapping; they do not execute migrations or SQL aggregation against PostgreSQL.

## Database access and security

The API verifies Supabase access tokens with `auth.getClaims()`. The health endpoint is public; protected routes are mounted after the authentication middleware in `src/app.ts`.

The API connects to Postgres using `DATABASE_URL`. Keep database credentials on the backend and never expose them in the mobile app. Because the API uses the `postgres` role, which bypasses Row Level Security, protected controllers must still check which records the signed-in user may access.

## Code layout

```text
docs/             # API reference and resource pages
src/
  features/       # API routes and feature-specific logic
  middleware/     # Shared middleware
  services/       # Shared services, including the database connection
  app.ts          # Express app configuration
  server.ts       # Starts the HTTP server
```
