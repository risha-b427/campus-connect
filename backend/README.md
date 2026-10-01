# Campus Connect API

Express and TypeScript API for Campus Connect.

## Set Up Environment Variables

Make a `.env` file under `backend/`, copy the contents of `.env.example` into it, and configure the placeholder values to the actual values.

NEVER COMMIT THE `.env` FILE

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
  app.ts                        # Express app configuration
  server.ts                     # HTTP server entry point

Requests should follow this path:

```text
route -> controller -> service -> repository -> database
```

Routes are mounted directly in `src/app.ts`.
