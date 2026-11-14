# Check-ins

Base path: `/api/check-ins`

[API documentation](../README.md)

A check-in records that a user is studying at a spot. Users give an initial
busyness and noise score when they check in, and can update both scores and
leave an overall spot rating when they check out. A user can have only one
active check-in at a time.

## POST /api/check-ins

Checks the signed-in user in at a spot. The user comes from the access token;
any `userId` in the request body is ignored.

**Authentication:** Required; see [authentication and shared errors](../README.md).

### Request

```http
POST /api/check-ins
Authorization: Bearer <supabase-access-token>
Content-Type: application/json

{
  "spotId": "22222222-2222-4222-8222-222222222221",
  "note": "CS 225 MP",
  "busyness": 6,
  "noise": 4
}
```

| Field | JSON type | Required | Description |
| --- | --- | --- | --- |
| `spotId` | string | Yes | Spot UUID in hyphenated UUID format |
| `busyness` | number | Yes | Whole number from 1 to 10 |
| `noise` | number | Yes | Whole number from 1 to 10 |
| `note` | string | No | What the user is working on, up to 200 characters. Blank notes are stored as `null` |

### Response

`201 Created` with the new check-in.

```json
{
  "id": "33333333-3333-4333-8333-333333333331",
  "userId": "00000000-0000-4000-8000-000000000000",
  "userName": "Sam",
  "spotId": "22222222-2222-4222-8222-222222222221",
  "note": "CS 225 MP",
  "busyness": 6,
  "noise": 4,
  "startedAt": "2026-11-14T15:00:00.000Z",
  "endedAt": null
}
```

| Field | JSON type | Description |
| --- | --- | --- |
| `id` | string | Check-in UUID |
| `userId` | string | UUID of the user who checked in |
| `userName` | string | The user's display name, or `Student` if they have no profile |
| `spotId` | string | Spot UUID |
| `note` | string or null | What the user is working on |
| `busyness` | number | Crowdedness score, on a 1–10 scale |
| `noise` | number | Noise score, on a 1–10 scale |
| `startedAt` | string | ISO 8601 check-in time |
| `endedAt` | string or null | ISO 8601 checkout time; `null` while checked in |

### Errors

| Status | Message / meaning |
| --- | --- |
| `400` | `Invalid spot ID` for a missing or malformed UUID |
| `400` | `busyness and noise must be whole numbers from 1 to 10` |
| `400` | `note must be text of 200 characters or fewer` |
| `404` | `Spot not found` for a valid UUID without a matching spot |
| `409` | `You are already checked in`; check out first |
| `401` | Missing or invalid access token |
| `503` | Authentication service unavailable |
| `500` | Unexpected server error |

## PATCH /api/check-ins/:id/checkout

Ends the signed-in user's own active check-in. Both scores are updated to the
values sent, and an optional overall rating for the spot is saved. The check-in
update and the rating are saved together, so either both succeed or neither does.

**Authentication:** Required; see [authentication and shared errors](../README.md).

### Path parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | Yes | Check-in UUID in hyphenated UUID format |

### Request

```http
PATCH /api/check-ins/33333333-3333-4333-8333-333333333331/checkout
Authorization: Bearer <supabase-access-token>
Content-Type: application/json

{
  "busyness": 8,
  "noise": 3,
  "rating": 4
}
```

| Field | JSON type | Required | Description |
| --- | --- | --- | --- |
| `busyness` | number | Yes | Final crowdedness score, whole number from 1 to 10 |
| `noise` | number | Yes | Final noise score, whole number from 1 to 10 |
| `rating` | number | No | Overall spot rating, whole number from 1 to 5 |

An overall rating is stored in `public.ratings`, one per user per spot. A new
rating for the same spot replaces the user's previous one. Omitting `rating`
leaves any existing rating unchanged.

### Response

`200 OK` with the updated check-in. Fields are identical to
[POST /api/check-ins](#post-apicheck-ins), and `endedAt` is set.

```json
{
  "id": "33333333-3333-4333-8333-333333333331",
  "userId": "00000000-0000-4000-8000-000000000000",
  "userName": "Sam",
  "spotId": "22222222-2222-4222-8222-222222222221",
  "note": "CS 225 MP",
  "busyness": 8,
  "noise": 3,
  "startedAt": "2026-11-14T15:00:00.000Z",
  "endedAt": "2026-11-14T16:00:00.000Z"
}
```

### Errors

| Status | Message / meaning |
| --- | --- |
| `400` | `Invalid check-in ID` for a malformed UUID |
| `400` | `busyness and noise must be whole numbers from 1 to 10` |
| `400` | `rating must be a whole number from 1 to 5` |
| `404` | `Active check-in not found`; it does not exist, belongs to another user, or has already ended |
| `401` | Missing or invalid access token |
| `503` | Authentication service unavailable |
| `500` | Unexpected server error |

## GET /api/check-ins/active

Returns everyone who is checked in right now, newest first.

**Authentication:** Required; see [authentication and shared errors](../README.md).
**Request body:** None. **Query parameters:** None.

### Request

```http
GET /api/check-ins/active
Authorization: Bearer <supabase-access-token>
```

### Response

`200 OK`. Returns `[]` when nobody is checked in. Each item has the same fields
as [POST /api/check-ins](#post-apicheck-ins), with `endedAt` always `null`.

```json
[
  {
    "id": "33333333-3333-4333-8333-333333333331",
    "userId": "00000000-0000-4000-8000-000000000000",
    "userName": "Sam",
    "spotId": "22222222-2222-4222-8222-222222222221",
    "note": "CS 225 MP",
    "busyness": 6,
    "noise": 4,
    "startedAt": "2026-11-14T15:00:00.000Z",
    "endedAt": null
  }
]
```

Sessions do not expire automatically, so a user who forgets to check out stays
in this list.

### Errors

| Status | Message / meaning |
| --- | --- |
| `401` | Missing or invalid access token |
| `503` | Authentication service unavailable |
| `500` | Unexpected server error |