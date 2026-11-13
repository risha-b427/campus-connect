# API documentation

The local API base URL is `http://localhost:3000`. Routes are grouped by their base resource path:

| Method | Route | Authentication | Documentation |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | [Health](routes/health.md) |
| GET | `/api/buildings` | Supabase access token | [Buildings](routes/buildings.md) |
| GET | `/api/spots` | Supabase access token | [Spots](routes/spots.md) |
| GET | `/api/spots/:id` | Supabase access token | [Single spot](routes/spots.md#get-apispotsid) |
| GET | `/api/feed` | Supabase access token | [Feed](routes/feed.md) |

Keep all methods for a resource in the same file (for example, future
`GET /api/check-ins` and `POST /api/check-ins` belong in `routes/check-ins.md`),
with a section for each method and path.

These are the currently implemented routes. Check-in and rating submission
endpoints are not implemented yet.

## Authentication

Protected routes require a valid Supabase user access token:

```http
Authorization: Bearer <supabase-access-token>
```

The backend verifies the token and derives the signed-in user's identity from it.
Missing, expired, or invalid tokens return `401 Unauthorized` with a
`WWW-Authenticate: Bearer` header:

```json
{ "message": "A valid Supabase access token is required" }
```

If token verification reports that the authentication service is unavailable,
the API returns `503 Service Unavailable`:

```json
{ "message": "Authentication service is unavailable" }
```

## Errors

Errors use a JSON object with a `message` field. Route-specific validation errors
are documented on each resource page. Unexpected server errors return `500`:

```json
{ "message": "Internal server error" }
```

See the [backend README](../README.md) for setup, running the server, and tests.
