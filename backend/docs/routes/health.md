# Health

Base path: `/api/health`

[API documentation](../README.md)

## GET /api/health

Returns a basic API liveness response. It does not check database connectivity
or Supabase availability.

**Authentication:** None. **Parameters/body:** None.

### Request

```http
GET /api/health
```

### Response

`200 OK`

```json
{ "status": "ok" }
```
