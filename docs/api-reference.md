# API Reference

This document is a practical overview of the Web Pulse Analytics HTTP + Socket.IO APIs.
It reflects the current implementation. Treat it as a living document — if you change a
route, controller, or payload, update this and `docs/tracking-guide.md` together.

- [Base URLs](#base-urls)
- [Authentication](#authentication)
- [Error format](#error-format)
- [Tracking API (public)](#tracking-api-public)
- [Analytics API (v1, authenticated)](#analytics-api-v1-authenticated)
- [Other v1 resources](#other-v1-resources)
- [Real-time (Socket.IO)](#real-time-socketio)
- [Security notes](#security-notes)

## Base URLs

- Local: `http://localhost:5000`
- API v1: `/api/v1`
- Public tracking: `/api/track`

## Authentication

Most `/api/v1/*` endpoints require authentication.

- **JWT cookie/session**: after login, the server issues a token (cookie-based flow is used
  in the app). The frontend sends credentials with requests where applicable.
- **CSRF**: non-GET `/api/v1` routes (except `/track` prefix) are protected by CSRF
  middleware. The frontend must include the CSRF token when making mutating requests.
- **Auth middleware**: controllers use `auth` middleware to enforce authenticated access.

Check the route files in `backend/src/routes/` for exact guards.

## Error format

Errors are returned by the centralized error handler (`middlewares/errorHandler.js`) and
typically follow:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "success": false
}
```

Validation and business logic errors return `400/401/403/404/409/500` as appropriate.

## Tracking API (public)

All tracking endpoints are **public** (no JWT required). However, CORS and origin
checks apply.

### `POST /api/track/:trackingId`

Capture a page view or event for the project identified by `trackingId`.

**Body (examples):**

```json
{
  "page": "/pricing",
  "referrer": "https://google.com"
}
```

Or for custom events:

```json
{
  "event": "signup_click",
  "page": "/signup",
  "referrer": "https://example.com"
}
```

**Validation notes:**

- `trackingId` must exist and belong to an active project
- Input is validated (`utils/validators.js`) and sanitized
- Origin/referrer checks are applied in the ingestion path

**Responses:**

- `200 OK` — event recorded (may return `{ success: true }`)
- `400 Bad Request` — invalid payload/trackingId

See [tracking-guide.md](tracking-guide.md) for the full, concrete payload and edge cases.

### `GET /api/track/:trackingId`

Return the current visitor count for the project (as exposed by the tracking API).

### `GET /api/track/:trackingId/script.js`

Returns the JavaScript tracker to embed on your site. It sends events to the same ingest
endpoint. Content-Type is `application/javascript`.

**Embed:**

```html
<script src="https://your-backend/api/track/YOUR_TRACKING_ID/script.js"></script>
```

For local dev: `http://localhost:5000/api/track/YOUR_TRACKING_ID/script.js`.

## Analytics API (v1, authenticated)

Mounted at `/api/v1/analytics`. Most endpoints require `auth` middleware.

### `GET /api/v1/analytics/overview`

Global dashboard overview across the user's projects. Returns KPI cards, top pages,
recent events, and other aggregated metrics.

**Auth:** required

**Response (shape is implementation-dependent):**
```json
{
  "totalVisitors": 1234,
  "totalPageViews": 5678,
  "bounceRate": 0.42,
  "avgSessionDuration": 32.5,
  "topPages": [...],
  "recentEvents": [...]
}
```

The exact fields reflect `visitorController.getDashboardStats` and may include
`visitors`, `sessions`, `eventsSummary`, `trafficData`, etc. See controller for current
shape.

### `GET /api/v1/analytics/projects/:id/overview`

Per-project overview.

**Params:** `id` (project ID)

**Auth:** required (owner or authorized access per project rules)

### `GET /api/v1/analytics/projects/:id/traffic`

Traffic breakdown for the project over time (daily/hourly buckets depending on range).

### `GET /api/v1/analytics/projects/:id/pages`

Top pages and page-level metrics for the project.

### `GET /api/v1/analytics/projects/:id/activity`

Recent activity stream (visits, events) for the project.

### `GET /api/v1/analytics/count`

Event count summary (as exposed by `visitorController.getEventCount`).

## Other v1 resources

The v1 router mounts several sub-routers. Common ones:

| Router | Base | Notes |
| --- | --- | --- |
| `auth` | `/api/v1/auth` | register/login/logout/verify/reset/oauth — CSRF applies to mutating |
| `projects` | `/api/v1/projects` | CRUD, stats, share tokens, verify installation |
| `user` | `/api/v1/user` | profile, avatar, password, sessions, preferences, usage |
| `analytics` | `/api/v1/analytics` | (above) |
| `track` | `/api/v1/track` | v1 track endpoints (see route file) |
| `payment` | `/api/v1/payment` | orders, verify, history, receipt, downgrade, email receipt |
| `notifications` | `/api/v1/notifications` | list/read/read-all/delete |
| `activity` | `/api/v1/activity` | project logs/activity |
| `usage` | `/api/v1/usage` | usage stats |
| `meta` | `/api/v1/meta` | meta endpoints |

Refer to each route file in `backend/src/routes/v1/` for the exact method list.

## Real-time (Socket.IO)

Server: `backend/src/socket/visitorSocket.js` attached to HTTP server. Client connects to
the backend origin with `credentials: true`.

Events (implementation-specific — inspect `visitorSocket.js` for the canonical list):

- Client joins rooms (e.g. per-project rooms) to receive updates.
- Server emits live visitor updates when `trackVisitorPublic` succeeds.

On the frontend, `socket.io-client` is used. Ensure `VITE_API_URL` matches the backend
and CSP `connect-src` allows `ws:`/`wss:` to the backend.

## Security notes

- **CSRF**: non-GET v1 routes skip CSRF only for paths starting with `/track` (public).
  Mutating v1 requests must include a valid CSRF token.
- **CORS**: global CORS is permissive with credentials; tracking routes use a dedicated
  `trackingCors` middleware to restrict origins/referrers for ingest safety.
- **Rate limiting**: applied to tracking and selected endpoints.
- **Secrets**: never put service keys in frontend. See [security.md](security.md).
- **Input validation**: all ingest payloads validated; reject malformed data.
- **RLS**: Supabase RLS enforces data isolation at the DB layer.

If you add endpoints, update this reference and consider security implications (authZ,
authN, rate limit, CORS, CSRF).
