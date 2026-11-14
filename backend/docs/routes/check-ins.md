# Check-ins

Base path: `/api/check-ins`

[API documentation](../README.md)

Every check-in endpoint acts as the signed-in user. The user ID always comes from
the access token; a user ID sent by the client is ignored. A user can have at most
one active check-in at a time.

Busyness and noise scores are given at check-in and can be updated at check-out.
Notes are not supported yet.

All endpoints return check-ins in the same shape:

```json
{
  "id": "33333333-3333-4333-8333-000000000001",
  "spot": { "id": "22222222-2222-4222-8222-222222222221", "name": "Grainger Library First Floor" },
  "checkedInAt": "2026-11-07T14:00:00.000Z",
  "checkedOutAt": null,
  "busyness": 6,
  "noise": 3,
  "isActive": true
}
```

| Field | JSON type | Description |
| --- | --- | --- |
| `id` | string | Check-in UUID |
| `spot.id` | string | Spot UUID |
| `spot.name` | string | Spot name |
| `checkedInAt` | string | Check-in time (ISO 8601, UTC) |
| `checkedOutAt` | string \| null | Check-out time, or `null` while active |
| `busyness` | number | Busyness score 1–10 (`crowd_level` column) |
| `noise` | number | Noise score 1–10 (`noise_level` column) |
| `isActive` | boolean | `true` until the user checks out |

## POST /api/check-ins

Checks the signed-in user in to a study spot.

**Authentication:** Required; see [authentication and shared errors](../README.md).

### Request

```http
POST /api/check-ins
Authorization: Bearer <supabase-access-token>
Content-Type: application/json

{ "spotId": "22222222-2222-4222-8222-222222222221", "busyness": 6, "noise": 3 }
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `spotId` | string | Yes | UUID of an existing spot |
| `busyness` | number | Yes | Whole number from 1 to 10 |
| `noise` | number | Yes | Whole number from 1 to 10 |

### Response

`201 Created` with the new check-in (`isActive: true`).

### Errors

| Status | Meaning |
| --- | --- |
| `400` | `spotId` missing or not a UUID, `busyness`/`noise` missing or not whole numbers 1–10, or the spot doesn't exist |
| `409` | The user already has an active check-in |
| `401` | Missing or invalid access token |

## PATCH /api/check-ins/:id/check-out

Checks out of one of the signed-in user's active check-ins and records the
check-out time. Busyness and noise are optional; any score sent replaces the one
given at check-in, and scores not sent are kept.

**Authentication:** Required; see [authentication and shared errors](../README.md).

### Request

```http
PATCH /api/check-ins/33333333-3333-4333-8333-000000000001/check-out
Authorization: Bearer <supabase-access-token>
Content-Type: application/json

{ "busyness": 6, "noise": 3 }
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `busyness` | number | No | Whole number from 1 to 10 |
| `noise` | number | No | Whole number from 1 to 10 |

The body can be empty (`{}`) to check out without changing scores.

### Response

`200 OK` with the completed check-in (`isActive: false`).

### Errors

| Status | Meaning |
| --- | --- |
| `400` | `:id` not a UUID, a `busyness`/`noise` value that isn't a whole number 1–10, or the check-in is already completed |
| `404` | The check-in doesn't exist or belongs to another user |
| `401` | Missing or invalid access token |

## GET /api/check-ins/me

Returns the signed-in user's check-ins, newest first.

**Authentication:** Required; see [authentication and shared errors](../README.md).
**Parameters/body:** None.

### Request

```http
GET /api/check-ins/me
Authorization: Bearer <supabase-access-token>
```

### Response

`200 OK` with an array of check-ins. Returns `[]` when the user has none.

### Errors

| Status | Meaning |
| --- | --- |
| `401` | Missing or invalid access token |
