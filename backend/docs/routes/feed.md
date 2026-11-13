# Feed

Base path: `/api/feed`

[API documentation](../README.md)

## GET /api/feed

Returns recent check-ins by the signed-in user's connections, newest first.
Only check-ins from the last 7 days are included, up to 50 items. The user's own
check-ins are not included.

**Authentication:** Required; see [authentication and shared errors](../README.md).
**Parameters/body:** None.

Responses are sent with `Cache-Control: no-store` so a refresh always returns the
latest check-ins.

### Request

```http
GET /api/feed
Authorization: Bearer <supabase-access-token>
```

### Response

`200 OK`. Returns `[]` when no connections have checked in recently.

```json
[
  {
    "id": "33333333-3333-4333-8333-000000000002",
    "user": { "id": "00000000-0000-4000-8000-000000000001", "name": "Alex Kim" },
    "spot": { "id": "22222222-2222-4222-8222-222222222221", "name": "Grainger Library First Floor" },
    "checkedInAt": "2026-11-13T15:00:00.000Z",
    "checkedOutAt": null,
    "isActive": true
  }
]
```

| Field | JSON type | Description |
| --- | --- | --- |
| `id` | string | Check-in UUID |
| `user.id` | string | The connection's user UUID |
| `user.name` | string | The connection's display name, or `"Someone"` if they have no profile yet |
| `spot.id` | string | Spot UUID |
| `spot.name` | string | Spot name |
| `checkedInAt` | string | Check-in time (ISO 8601, UTC) |
| `checkedOutAt` | string \| null | Check-out time, or `null` if still checked in |
| `isActive` | boolean | `true` while the user is still checked in |

### Errors

| Status | Meaning |
| --- | --- |
| `401` | Missing or invalid access token |
| `503` | Authentication service unavailable |
| `500` | Unexpected server error |
