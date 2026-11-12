# Spots

Base path: `/api/spots`

[API documentation](../README.md)

## GET /api/spots

Returns study spots with building information, live check-in activity, and overall
ratings. Results are ordered by spot name, then ID.

**Authentication:** Required; see [authentication and shared errors](../README.md).
**Request body:** None.

### Query parameters

None. The endpoint returns all spots; query parameters are ignored. The frontend
can filter using the returned `spotType` field: `Cafe`, `Library`,
`University Housing`, `Restaurant`, `Outdoor`, or `Lounge`.

### Request

```http
GET /api/spots
Authorization: Bearer <supabase-access-token>
```

### Response

`200 OK`. Returns `[]` when there are no spots.

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
    "spotType": "Library",
    "activeCheckInCount": 3,
    "averageNoise": 4.3,
    "averageCrowdedness": 6.7,
    "averageRating": 3.5,
    "ratingCount": 2
  }
]
```

| Field | JSON type | Description |
| --- | --- | --- |
| `id` | string | Spot UUID |
| `name` | string | Specific study spot name |
| `description` | string or null | Spot description |
| `buildingId` | string | Associated building UUID |
| `building` | string | Building name |
| `latitude` | number | Spot latitude in degrees |
| `longitude` | number | Spot longitude in degrees |
| `spotType` | string | One of the supported spot types |
| `activeCheckInCount` | number | All users' check-ins with no checkout timestamp |
| `averageNoise` | number or null | Active sessions' average noise score, on a 1–10 scale |
| `averageCrowdedness` | number or null | Active sessions' average crowdedness score, on a 1–10 scale |
| `averageRating` | number or null | Average overall spot rating, on a 1–5 scale |
| `ratingCount` | number | Number of overall spot ratings |

All averages are calculated by the backend and rounded to one decimal. Averages
are `null` when there are no contributors, and counts are `0`. Non-null
aggregates and coordinates are JSON numbers.

Noise and crowdedness averages include only active sessions. Checkout removes
the session from subsequent live aggregates. These values reflect active app
check-ins, not measured physical occupancy; sessions do not expire automatically.

Overall ratings come from `public.ratings` independently of check-in activity.
They remain included after their authors check out.

### Errors

| Status | Message / meaning |
| --- | --- |
| `401` | Missing or invalid access token |
| `503` | Authentication service unavailable |
| `500` | Unexpected server error |

## GET /api/spots/:id

Returns the latest data for one spot, for example when a user clicks a map pin.
Each request reads current database values. Responses from this handler include
`Cache-Control: no-store` so clients and intermediaries do not store the response.

**Authentication:** Required; see [authentication and shared errors](../README.md).
**Request body:** None. **Query parameters:** None; query parameters are ignored.

### Path parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | Yes | Spot UUID in hyphenated UUID format |

### Request

```http
GET /api/spots/22222222-2222-4222-8222-222222222221
Authorization: Bearer <supabase-access-token>
```

### Response

`200 OK` with one object, rather than an array. Fields, aggregate calculations,
one-decimal rounding, numeric conversions, and null defaults are identical to
the list endpoint.

```json
{
  "id": "22222222-2222-4222-8222-222222222221",
  "name": "Grainger Library First Floor",
  "description": "Study space",
  "buildingId": "11111111-1111-4111-8111-111111111111",
  "building": "Grainger Engineering Library",
  "latitude": 40.112688,
  "longitude": -88.226885,
  "spotType": "Library",
  "activeCheckInCount": 3,
  "averageNoise": 4.3,
  "averageCrowdedness": 6.7,
  "averageRating": 3.5,
  "ratingCount": 2
}
```

### Errors

| Status | Message / meaning |
| --- | --- |
| `400` | `Invalid spot ID` for a malformed UUID |
| `404` | `Spot not found` for a valid UUID without a matching spot |
| `401` | Missing or invalid access token |
| `503` | Authentication service unavailable |
| `500` | Unexpected server error |
