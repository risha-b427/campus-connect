# Buildings

Base path: `/api/buildings`

[API documentation](../README.md)

## GET /api/buildings

Returns all buildings ordered by name, then ID.

**Authentication:** Required; see [authentication and shared errors](../README.md).
**Parameters/body:** None.

### Request

```http
GET /api/buildings
Authorization: Bearer <supabase-access-token>
```

### Response

`200 OK`. Returns `[]` when there are no buildings.

```json
[
  {
    "id": "11111111-1111-4111-8111-111111111111",
    "name": "Grainger Engineering Library",
    "latitude": 40.112688,
    "longitude": -88.226885
  }
]
```

| Field | JSON type | Description |
| --- | --- | --- |
| `id` | string | Building UUID |
| `name` | string | Building name |
| `latitude` | number | Latitude in degrees |
| `longitude` | number | Longitude in degrees |

### Errors

| Status | Meaning |
| --- | --- |
| `401` | Missing or invalid access token |
| `503` | Authentication service unavailable |
| `500` | Unexpected server error |
