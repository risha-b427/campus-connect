# Campus Connect API

Express and TypeScript API for Campus Connect.

## Set Up Environment Variables

Make a `.env` file under `backend/`, copy the contents of `.env.example` into it, and configure the placeholder values to the actual values.

NEVER COMMIT THE `.env` FILE

For local Supabase, start the stack from the repository root with `npx supabase start` (Docker must be running). Run `npx supabase status` to confirm the database URL. This project's database port is `54322`; the default local connection is:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

The environment template defaults to this local connection. The pool automatically disables SSL for `localhost`, `127.0.0.1`, and `::1`, and enables SSL with certificate verification for other hosts. No `sslmode` parameter is needed.

For hosted Supabase, set `DATABASE_URL` to your PostgreSQL connection string from the dashboard's **Connect** panel. Use the direct connection for a persistent backend with IPv6 access, or the session pooler for IPv4 networks. Replace the password placeholder with your URL-encoded database password. If your environment does not trust the certificate issuer, configure `sslrootcert` with the Supabase certificate from the dashboard. Explicit SSL parameters in the connection string override the pool's automatic defaults.

The shared pool loads `backend/.env` when running commands from the backend directory. Import it in feature repositories and use parameterized queries:

```typescript
import { pool } from "../../services/postgres.js";

// Example query; replace it with queries for your feature's tables.
const result = await pool.query("SELECT $1::text AS message", ["Connected"]);
```

Keep `DATABASE_URL` exclusively in the backend environment. Connections using the `postgres` role bypass Row Level Security, so the API must enforce authorization. For transactions, acquire a client with `pool.connect()` and release it in a `finally` block; call `pool.end()` when shutting down a process that uses the pool.

## Run locally

```powershell
npm install
npm run dev
```

The health endpoint is available at `http://localhost:3000/api/health`.

Run a TypeScript check before opening a pull request:

```powershell
npm run typecheck
```

## Structure

```text
src/
  features/
    <feature>/
      <feature>.routes.ts       # HTTP endpoints
      <feature>.controller.ts   # Request and response handling
      <feature>.service.ts      # Business rules
      <feature>.repository.ts   # Feature-specific database access, when needed
  middleware/                   # Shared Express middleware
  services/                     # Shared integrations, including the PostgreSQL pool/db
  app.ts                        # Express app configuration
  server.ts                     # HTTP server entry point
```

Requests should follow this path:

```text
route -> controller -> service -> repository -> database
```

Routes are mounted directly in `src/app.ts`.
