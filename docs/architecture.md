# Architecture

Web Pulse Analytics is structured as a monorepo separating four distinct responsibilities:
a standalone public marketing website (`apps/marketing`), a stable V1 dashboard (`apps/v1`),
an advanced V2 dashboard (`apps/v2`), and a Node.js/Express backend (`backend`) with Socket.IO.
Data lives in Supabase (Postgres). The repository is designed to let each application run,
build, and deploy independently.

- [High-level overview](#high-level-overview)
- [Monorepo application layout](#monorepo-application-layout)
- [Backend architecture](#backend-architecture)
- [Real-time (Socket.IO)](#real-time-socketio)
- [Data model (Supabase)](#data-model-supabase)
- [Tracking flow](#tracking-flow)
- [Security boundaries](#security-boundaries)
- [Deployment overview](#deployment-overview)
- [Branching strategy](#branching-strategy)

## High-level overview

```
Browser (site being tracked) ──▶ /api/track/:id ──┐
                                                │
Marketing (apps/marketing) ──▶ Static Site      │
                                                │
V1 Dashboard (apps/v1) ──────▶ REST /api/v1/* ──► Backend │
                                                │ (Express)
V2 Dashboard (apps/v2) ──────▶ REST /api/v1/* ──►         │
                ▲                                         │
                └────────── WebSocket ◀── Socket.IO◀──────┘
                                    │
                                  Supabase
                                   (Postgres)
```

## Monorepo application layout

1. **`apps/marketing/`**: The canonical public website (landing page, product features, pricing,
   blog, documentation rail, security disclosure, legal policies, community, and help center).
2. **`apps/v1/`**: The stable V1 console and analytics dashboard.
3. **`apps/v2/`**: The modern V2 dashboard featuring the App Shell design system, 15+ metrics
   modules, interactive 3D globe visualizations, and session telemetry.
4. **`backend/`**: Express 5 API supporting both V1 and V2 consoles, background cron jobs,
   payment processing, email/telegram dispatch, and tracking event ingestion.

Each frontend application is an independent Vite SPA with its own `package.json`, `vite.config.js`,
and production build (`npm run build` generates a standalone `dist/`).

## Backend architecture

Key folders (`backend/src/`):

- `config/` — env, Supabase client, Razorpay, etc. `env.js` centralizes and validates
  required variables.
- `controllers/` — request handlers (auth, visitor, project, user, payment,
  notification, activity)
- `routes/` — REST routes organized under `routes/v1/` and `routes/v1/index.js` (v1
  router) plus `routes/v1/track.routes.js`
- `services/` — business logic (email, plans, usage, receipts, notifications)
- `middleware/` — auth, CSRF, rate limiting, tracking CORS, error handling
- `socket/` — Socket.IO setup and handlers (`visitorSocket.js`)
- `utils/` — helpers (ApiResponse, asyncHandler, jwt, validators, ip, uuid)
- `errors/` — AppError classes

Server (`server.js`): creates HTTP server, attaches Socket.IO, exposes `global.io`,
sets up background jobs (notification cleanup), and listens on `env.port`.

App (`app.js`): applies Helmet (tight CSP), CORS, cookie-parser, JSON body parsing,
mounts `/api/v1` and `/api/track`, health root, 404, and centralized error handler.

## Real-time (Socket.IO)

- Namespace/socket: initialized in `setupVisitorSocket(io)` (`socket/visitorSocket.js`).
- CORS whitelist includes `FRONTEND_URL`, `localhost:5173`, and `obs-tracker.netlify.app/`.
- Controllers can emit events via `global.io` when visitors are tracked or state changes.
- Dashboard pages subscribe to socket events to refresh live visitor counts without polling.

## Data model (Supabase)

Tables and relationships are defined in `supabase/migrations/`. Highlights:

- `users` — accounts, roles, auth-related fields
- `projects` — tracked sites, tracking_id, share tokens, ownership
- `page_views`, `events`, `sessions`, `visitors` — analytics entities
- `notifications` — user notifications
- `payments`, `plans`, `usage` — billing/quotas

**Row Level Security (RLS)** is applied per migration `20261001000005_rls_security.sql`.
Any future table holding user/visitor data must have RLS enabled and policies in the
same migration. See [database-schema.md](database-schema.md) for a full breakdown.

Functions/triggers live in `20261001000004_analytics_functions.sql`.

## Tracking flow

1. A page loads the tracker script: `GET /api/track/:trackingId/script.js`.
2. Script captures page, referrer, UA, and sends `POST /api/track/:trackingId` with JSON.
3. `visitorController.trackVisitorPublic` validates input (origin/referrer checks via
   middleware/logic), normalizes payload, stores page_view/event as appropriate, and
   updates session/visitor state.
4. Socket.IO broadcasts live visitor updates to subscribed dashboard clients.
5. Dashboard queries `/api/v1/analytics/*` for aggregated stats.

CORS for the tracking endpoint is handled per-route (`trackingCors.js`). Only GET
`/api/track/*` is served publicly; write endpoints enforce origin/referrer
validation where appropriate.

## Security boundaries

- **Browser-exposed secrets**: only `VITE_*` in `frontend/.env`. Never expose service keys.
- **Server-only keys**: `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, third-party secrets.
- **CSRF**: applied to non-GET `/api/v1` routes except `/track` prefix (public ingest).
- **CSP**: Helmet CSP allows required CDNs/sources (Supabase, OpenStreetMap tiles,
  Google auth domains, etc); tightened in `app.js`.
- **Rate limiting**: on tracking and abuse-prone routes (`express-rate-limit`).
- **AuthZ**: project ownership checks in controllers/services; RLS at DB layer.
- **Secrets**: never committed. Git is protected by `.gitignore` and gitleaks in CI.

See [security.md](security.md) for a complete treatment.

## Deployment overview

- **Frontend**: can be built (`npm run build`) and served as static files (Vercel/Netlify
  or any CDN). Set `VITE_API_URL` to the deployed backend.
- **Backend**: Node.js app (`npm start`) on a Node 22 host (Render, Railway, Fly, EC2).
  Ensure `PORT`, `FRONTEND_URL`, Supabase creds, and JWT secret are set.
- **Database**: Supabase project. Apply migrations manually (reviewed). Never let release
  workflow auto-apply migrations.

Environment variable parity between local and deployed is critical. See
[deployment.md](deployment.md).

## Branching strategy

| Branch | Role | Merge rules |
| --- | --- | --- |
| `main` | Stable release | PRs from `v1-stabilization` after review and CI pass |
| `v1-stabilization` | Stabilize current V1 | Bug fixes and minimal hardenings; no large V2 UI changes |
| `v2-ui` | New UI/design (V2) | Isolated redesign; must not merge into V1 lines |
| `development` | Integration | Day-to-day work; target release lines via PR |

All changes require a PR, review, and passing CI. See [CONTRIBUTING.md](../CONTRIBUTING.md).
