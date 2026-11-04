# Getting started with backend tickets and APIs

This guide is for someone writing their first backend ticket in Campus Connect. It explains the request flow, where code belongs, and how to implement and check an API change.

## What is the backend, and why do we need it?

The **frontend** is the part people see and interact with: our mobile app in `mobile/`. The **backend** is a program that receives requests from the app, checks them, applies application rules, and reads or writes data. The **database** stores data so it is available after a request finishes.

For application data, the basic flow is:

```text
Frontend (mobile app)
    | Request: "Give me the library spots"
    v
Backend (API)
    | SQL query: find the matching spots
    v
Postgres database
    | Matching rows
    v
Backend
    | Response: spot data as JSON
    v
Frontend displays the spots
```

The frontend asks the backend for data instead of connecting directly to Postgres. The backend gives us one place to validate input, check permissions, apply rules, and keep database credentials private.

In this project:

| Tool | Purpose |
| --- | --- |
| Node.js | Runs the backend JavaScript. |
| TypeScript | Describes the shapes of data and helps catch mistakes while developing. |
| Express | Receives HTTP requests and sends responses. |
| Postgres | Stores application data in tables. |
| Supabase | Provides our local Postgres environment and authentication. |

Signing in is a separate interaction with Supabase Auth. The diagram above describes how application data moves between the frontend, backend, and database.

## Run the project locally

Follow the [existing backend README](README.md#first-time-setup) for installation, environment configuration, and database setup. You need Node.js 22.13 or newer and Docker Desktop running.

After setup, start the backend from the repository root, the directory containing `backend/`, `mobile/`, and `supabase/`:

```bash
npm run backend:dev
```

Leave that terminal running. The development server reloads when backend source files change. The default API address is `http://localhost:3000`.

Open `http://localhost:3000/api/health` in a browser to try the public health endpoint. You can also use an API client such as Postman or run:

```bash
curl http://localhost:3000/api/health
```

In Windows PowerShell, use `curl.exe` for the curl examples in this guide.

## What is an API endpoint?

An **API** is the interface the frontend uses to ask the backend to do something. An **endpoint** is a particular HTTP method and URL path that the backend accepts.

For example:

```text
GET http://localhost:3000/api/spots?spotType=Library
```

| Part | Meaning |
| --- | --- |
| `GET` | The HTTP method: we want to read data. |
| `http://localhost:3000` | The backend address on your computer. |
| `/api/spots` | The path identifying the resource we want. |
| `?spotType=Library` | A query parameter that filters the results. |

Common methods are `GET` (read), `POST` (create), `PATCH` (partially update), and `DELETE` (remove). Each method needs its own implementation; adding a `GET` route does not automatically add the others.

A request can carry input in several places:

- **Path parameters** identify a resource. A hypothetical `/api/spots/:id` route would read the ID from `req.params.id`.
- **Query parameters** supply options such as filters. Our spots endpoint reads `req.query.spotType`.
- **Headers** carry extra information, such as an access token proving the user is signed in.
- **A body** carries submitted data, usually JSON, for operations such as creating or updating a resource. Parsed JSON is available as `req.body`.

The backend responds with an **HTTP status code** and often **JSON**, a text format for objects and lists. For example, a successful spots request returns `200` and a list shaped like this (illustrative data):

```json
[
  {
    "id": "22222222-2222-4222-8222-222222222221",
    "name": "Grainger Library First Floor",
    "description": "Study space",
    "buildingId": "11111111-1111-4111-8111-111111111111",
    "building": "Grainger Engineering Library",
    "latitude": 40.112688,
    "longitude": -88.226885,
    "spotType": "Library"
  }
]
```

| Status | Meaning |
| --- | --- |
| `200` | The request succeeded. |
| `201` | A resource was created; use this for a future creation endpoint. |
| `400` | The input is invalid, such as an unsupported spot type. |
| `401` | A valid sign-in token is missing. |
| `403` | The user is signed in but lacks permission; use this when implementing permission checks. |
| `404` | A route or requested resource was not found. |
| `500` | An unexpected backend error occurred. |
| `503` | A needed service is unavailable; authentication can return this here. |

## Where does the code go?

The backend groups code by **feature**, such as spots or buildings:

```text
backend/
  src/
    server.ts                    Starts listening for HTTP requests
    app.ts                       Configures Express and mounts feature routers
    features/
      spots/
        spots.routes.ts          Matches a method and path to a controller
        spots.controller.ts      Reads request input and sends the HTTP response
        spots.service.ts         Applies application rules and prepares data
        spots.repository.ts      Runs SQL and returns database rows
      buildings/                 Another feature with the same structure
      health/                    A simpler feature without a repository
    middleware/
      requireAuth.ts             Verifies tokens before protected routes
      notFound.ts                Responds when no route matches
      errorHandler.ts            Handles unexpected errors
    services/
      db.ts                      Shared Postgres connection pool
      supabase.ts                Shared Supabase client for authentication
  tests/
    features/                    Tests for endpoint behavior
    support/                     Shared test setup
```

Database migrations and seed data live in `supabase/` at the repository root.

## Route → controller → service → repository

Each layer has a specific job:

| Layer | Question it answers | Spots example |
| --- | --- | --- |
| Route | Which function handles this method and path? | Send `GET /api/spots` to `getSpotsHandler`. |
| Controller | What did the caller send, and what HTTP response should we return? | Read and validate `spotType`, then return JSON or `400`. |
| Service | What application rules and data preparation are needed? | Retrieve spots and convert coordinates to numbers. |
| Repository | How do we read or write the database? | Run SQL to select spots and their building information. |

```text
Request → auth middleware → route → controller → service → repository → Postgres
                                      |            ^           ^          |
                                      |            |           └── rows ──┘
                                      |            └── results ─┘
Response ←────────────────────────────┘
```

Data returns from the repository to the service to the controller. The controller sends the response to the frontend.

**Middleware** runs along the request's path and can either continue to the next step or respond early. For example, `requireAuth` rejects a missing or invalid token before the controller runs. `express.json()` parses JSON request bodies, and the error middleware handles unexpected failures.

Keep HTTP details (`req`, `res`, status codes) in controllers, application rules in services, and SQL in repositories. This keeps each part small and makes changes easier to follow.

The shared `src/services/` folder contains tools used across features, such as the database connection. Feature-specific services live inside their feature folders. A service may initially just call a repository; it provides a place for rules as the feature grows. A feature that does not use the database, such as health, does not need a repository.

## Follow a real request through the code

Use `GET /api/spots?spotType=Library` as an example. This endpoint already exists, so you can open the linked files and follow along.

### 1. Express mounts the router

In [src/app.ts](src/app.ts), authentication comes before protected routers:

```ts
app.use("/api", requireAuth);
app.use("/api/spots", spotsRouter);
```

The health router is mounted before authentication so it stays public. Add new protected routers after `requireAuth` and before `notFound` and `errorHandler`.

### 2. The route selects a controller

In [spots.routes.ts](src/features/spots/spots.routes.ts):

```ts
spotsRouter.get("/", getSpotsHandler);
```

The `/` is relative to the mount path. Combined with `/api/spots` in `app.ts`, this handles `GET /api/spots`. Query parameters do not need their own route.

### 3. The controller reads and validates the request

In [spots.controller.ts](src/features/spots/spots.controller.ts), `getSpotsHandler` reads `req.query.spotType`. It checks that the filter is a single string and is one of the supported types. Invalid input returns `400` immediately.

After validation, it calls the service and sends the result:

```ts
const spots = await getSpots(spotType);
res.json(spots);
```

`await` waits for an asynchronous operation, such as a database query, to finish before using its result. `res.json()` sends JSON; the successful response here defaults to `200`.

TypeScript types help while coding, but incoming HTTP data still needs validation when the request arrives. A caller can send values your types did not expect.

### 4. The service prepares the data

In [spots.service.ts](src/features/spots/spots.service.ts), `getSpots` calls the repository's `findSpots(spotType)`. It checks the returned spot types and converts latitude and longitude from database strings to JavaScript numbers.

The frontend gets a consistent shape without knowing how the database represents coordinates. Future application rules belong here too, such as deciding whether a user may perform an operation.

### 5. The repository queries Postgres

In [spots.repository.ts](src/features/spots/spots.repository.ts), `findSpots` uses the shared `db` connection pool. A pool reuses database connections across requests.

The query selects spots, joins their building information, and adds this condition when a filter is present:

```sql
WHERE s.spot_type = $1
```

The filter value is passed separately to `db.query`, as `["Library"]` in this example. `$1` is a placeholder for the first supplied value. This is a **parameterized query**: input is treated as data instead of executable SQL. Always use parameters for user-supplied values; do not insert those values into SQL strings.

The repository returns `result.rows`. The service prepares those rows, the controller sends JSON, and the frontend displays the results.

## How to do a backend ticket

A **ticket** describes a requested change. Its **acceptance criteria** describe the observable behavior that makes the change complete.

Suppose a ticket says: “Let users filter spots by spot type.” This feature already exists, so use it as a worked example for your next ticket.

### 1. Write down the expected behavior

Identify the inputs, output, permissions, and error cases before coding. For this example:

- `GET /api/spots` returns all spots.
- `GET /api/spots?spotType=Library` returns library spots.
- An unsupported type or multiple `spotType` values returns `400`.
- Missing or invalid authentication returns `401`.
- No matches returns `200` with `[]`, an empty list.
- The response keeps the field names and coordinate types the frontend expects.

This agreement is the **API contract**. Clarify unclear behavior with the ticket author or frontend developer before building around a guess.

### 2. Find the closest existing feature

Read its route, controller, service, repository, and tests. For this ticket, start in `src/features/spots/` and [spots.test.ts](tests/features/spots/spots.test.ts). Follow the project's existing patterns and extend an existing endpoint when the change belongs to it.

For a new feature, create a folder under `src/features/`, add the layers it needs, and import and mount its router in `src/app.ts`. Follow the existing `.js` import suffixes even in TypeScript source files.

### 3. Decide whether the database needs to change

Filtering on `spot_type` uses an existing column, so this example needs no database change. A ticket requiring a new table or column needs a **migration**: a saved SQL change that other developers can apply to get the same database structure.

From the repository root:

```bash
npx supabase migration new add_example_column
```

Edit the generated SQL file under `supabase/migrations/`, then apply pending migrations locally:

```bash
npm run db:up
```

Commit the migration with your code. Once a migration has been shared and applied, make later schema changes in a new migration.

`npm run db:reset` rebuilds the local database from migrations and reloads seed data. **It clears existing local data.** Normal API restarts do not require a reset.

### 4. Implement the change through the layers

One useful order is to start at the database and work toward the request:

1. **Repository:** accept an optional filter and pass it to a parameterized SQL query.
2. **Service:** accept the validated filter, call the repository, and preserve the expected response types.
3. **Controller:** read the filter, reject invalid input, and call the service.
4. **Route:** connect the method and path to the controller. The existing spots route already handles query filters, so this ticket needs no new route.

For a write endpoint, also validate body fields, check the user's permission to change the affected records, and choose the success status and response body. Send JSON request bodies with `Content-Type: application/json`.

### 5. Try the endpoint manually

Buildings and spots require a real Supabase access token from a signed-in user's session, such as the session created by the mobile app's sign-in flow. The publishable key used in setup is not a user access token.

Replace the placeholder with your local session's access token:

```bash
curl "http://localhost:3000/api/spots?spotType=Library" -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Check both the status code and response body. Also try an unsupported type and a request without the authorization header.

Current endpoints:

| Method and path | Authentication | Behavior |
| --- | --- | --- |
| `GET /api/health` | Public | Checks API health. |
| `GET /api/buildings` | Required | Returns buildings. |
| `GET /api/spots` | Required | Returns spots, optionally filtered by `spotType`. |

Supported spot types are `Cafe`, `Library`, `University Housing`, `Restaurant`, `Outdoor`, and `Lounge`. Omitting the filter returns all spots.

### 6. Add or update tests and run checks

The existing tests use **Supertest** to send requests to the Express app and **Jest** to check results. Shared setup simulates authentication, and spots tests replace database queries with controlled results. These tests check API behavior without a real database. Manually trying the local stack also checks that the SQL works with Postgres.

Cover the ticket's success case and meaningful failures: invalid input, missing authentication, empty results, and permissions where relevant. For a filter, verify that its value reaches the database query as a parameter.

From the repository root:

```bash
npm run backend:typecheck
npm --prefix backend test
```

The first command checks TypeScript without starting the server. The second runs the backend tests.

### 7. Review your work and open a pull request

Review your diff, remove temporary debugging output, and make sure `.env` is not included. Update endpoint documentation if the contract changed. In the pull request, explain the resulting behavior, link the ticket, and state which checks you ran. Include a sample request and response when that helps the frontend developer use the endpoint.

## Authentication and authorization are different

**Authentication** asks “Who are you?” The `requireAuth` middleware verifies the Supabase token with `auth.getClaims()` and puts the verified identity in `req.user`.

**Authorization** asks “Are you allowed to do this?” Signing in does not grant access to every record. For personal or restricted data, check the verified user's access in the controller/service workflow and constrain database operations appropriately. A user ID supplied in a request body is not proof of identity.

The backend connects through `DATABASE_URL` using the `postgres` role, which bypasses **Row Level Security**, database rules that can otherwise restrict access to individual rows. Backend permission checks are necessary for restricted data. Keep database credentials in the backend environment file; never put them in the mobile app or commit `.env`.

## When something goes wrong

| Symptom | What to check |
| --- | --- |
| Cannot connect to the API | Is `npm run backend:dev` running, and is the URL/port correct? |
| `401` on buildings or spots | Send a valid, unexpired user token in `Authorization: Bearer ...`. |
| `400` on a spots filter | Use the exact supported spelling and a single `spotType` value. |
| `404` | Check the HTTP method, path, and router mount in `src/app.ts`. |
| `500` | Read the backend terminal error; check `.env`, database availability, and applied migrations. |
| `503` during authentication | Check that Supabase is running and its URL is configured correctly. |

On a phone, `localhost` refers to the phone itself. To reach a backend on your computer, configure the frontend with your computer's reachable network address.
