# Getting Started

This guide helps you run Web Pulse Analytics locally. By the end, you'll have one or
more frontends, the backend, and the database configured and talking to each other.

- [Prerequisites](#prerequisites)
- [1. Clone and install](#1-clone-and-install)
- [2. Configure backend](#2-configure-backend)
- [3. Configure frontends](#3-configure-frontends)
- [4. Database setup (Supabase)](#4-database-setup-supabase)
- [5. Run the applications](#5-run-the-applications)
- [6. Verify the setup](#6-verify-the-setup)
- [7. Tracking a website](#7-tracking-a-website)
- [8. Troubleshooting](#8-troubleshooting)

## Prerequisites

- Node.js 20+ (Node 22 LTS recommended)
- npm 10+
- A [Supabase](https://supabase.com/) project (free tier works for local development)
- Git

Optional services (only needed for those features):

- Google OAuth (authentication)
- Razorpay (payments/billing)
- Cloudinary (media uploads)
- Resend (email)
- Telegram (notifications)

## 1. Clone and install

```bash
git clone https://github.com/heyshreee/Web-Pulse-Analytics.git
cd Web-Pulse-Analytics

# Backend dependencies
cd backend && npm install

# Frontend dependencies — install the apps you need
cd ../apps/marketing && npm install
cd ../v1 && npm install
cd ../v2 && npm install
```

Each app has its own lockfile. There are no root npm workspaces.

## 2. Configure backend

Create a `.env` file in `backend/` from the example:

```bash
cd backend
cp .env.example .env
```

Fill in the minimum required values:

| Variable | What it is | Example |
| --- | --- | --- |
| `PORT` | Backend port | `5000` |
| `JWT_SECRET` | Long, random string for signing JWTs | `openssl rand -base64 32` |
| `FRONTEND_URL` | URL where the primary dashboard runs | `http://localhost:5173` |
| `FRONTEND_URLS` | Comma-separated trusted browser origins (marketing, V1, V2) | `http://localhost:5173,http://localhost:5174` |
| `SUPABASE_URL` | Your Supabase project URL | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service_role key (server-side only) | `<service-role-key>` |

`SUPABASE_SERVICE_KEY` must never be exposed to the browser.

The rest are optional — leave them blank until you need those features. For more detail,
see [security.md](security.md).

## 3. Configure frontends

Create a `.env` in each app you plan to run, from that app's `.env.example`:

```bash
cp apps/marketing/.env.example apps/marketing/.env
cp apps/v1/.env.example apps/v1/.env
cp apps/v2/.env.example apps/v2/.env
```

| Variable | What it is | Example |
| --- | --- | --- |
| `VITE_API_URL` | Backend API base | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Explicit Socket.IO origin (optional) | `http://localhost:5000` |
| `VITE_SUPABASE_URL` | Supabase URL (public) | `https://<ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (public) | `<anon-key>` |
| `VITE_APP_URL` | Dashboard URL used by marketing redirects (marketing only) | `http://localhost:5173` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) | `<google-client-id>` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key ID (optional) | `<razorpay-key-id>` |

Only `VITE_*` vars are exposed to the browser. No secrets belong here. `VITE_API_URL`
may be a bare origin, an `/api` base, or a full `/api/v1` base; the example values use
`/api`.

## 4. Database setup (Supabase)

SQL migrations are stored in [`supabase/migrations/`](../supabase/migrations/). Apply
them using the Supabase CLI (`supabase db push`) or by running them in the Supabase SQL
Editor in timestamp order.

Key files:

1. `20261001000001_core_schema.sql` — core tables
2. `20261001000002_analytics_tables.sql` — analytics schema
3. `20261001000003_indexes.sql` — indexes
4. `20261001000004_analytics_functions.sql` — functions
5. `20261001000005_rls_security.sql` — RLS policies
6. `20261008000001_fix_security_and_performance_linter.sql` — security/performance fixes
7. `20261020000001_user_sessions.sql` — user session tracking

> ⚠️ Migrations are never auto-deployed by CI or the release workflow. Apply them
> manually to each environment and review changes.

Once applied, confirm RLS is enabled on tables that store user/visitor data. The expected
baseline is documented in [database-schema.md](database-schema.md).

## 5. Run the applications

From the repository root, use the convenience scripts:

```bash
# Terminal 1 — backend (http://localhost:5000)
npm run dev:backend

# Terminal 2 — choose one dashboard (both default to http://localhost:5173)
npm run dev:v1
# or
npm run dev:v2

# Optional — marketing site (http://localhost:5174)
npm run dev:marketing
```

V1 and V2 share the default port `5173`, so run them one at a time unless you override
the port:

```bash
npm --prefix apps/v1 run dev -- --port 5175
```

You can also run an app directly:

```bash
cd apps/v2 && npm run dev
```

## 6. Verify the setup

- Marketing: `http://localhost:5174` loads.
- Dashboard: `http://localhost:5173` loads and can reach the API.
- Backend health: `curl http://localhost:5000` returns a short API status message.
- With a valid Supabase connection, signup/login works.
- Real-time dashboard updates require Socket.IO connectivity between the dashboard and
  backend. Check the browser console if live counts do not update.

Automated checks:

```bash
npm run lint:all
npm run build:all
npm run check:backend
npm run test:backend
```

The backend test is a smoke test (boot, health, 404), not full endpoint coverage.

## 7. Tracking a website

Web Pulse Analytics exposes a public tracking endpoint and a small tracker script.

### Tracker script (recommended)

Serve via the API:

```html
<script src="http://localhost:5000/api/track/TRACKING_ID/script.js"></script>
```

Replace `TRACKING_ID` with your project's tracking ID (generated when creating a project
in the dashboard).

The script sends page views and basic metadata to `POST /api/track/:trackingId`.

### Manual tracking (REST)

```http
POST http://localhost:5000/api/track/:trackingId
Content-Type: application/json

{
  "page": "/pricing",
  "referrer": "https://google.com"
}
```

See [tracking-guide.md](tracking-guide.md) for details on payload validation, CORS
restrictions, and event tracking.

## 8. Troubleshooting

| Symptom | Check |
| --- | --- |
| CORS errors from tracking | Add the page's origin to the project's `allowed_origins`. Tracking CORS is handled separately in `backend/src/middleware/trackingCors.js`. |
| JWT/auth failures | `JWT_SECRET` set and consistent; cookies/credentials allowed. |
| Socket.IO disconnected | Check `VITE_API_URL`/`VITE_SOCKET_URL`, the `FRONTEND_URLS` allowlist in `backend/src/config/origins.js`, and CSP `connect-src`. |
| Supabase connection fails | `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` correct; no network restrictions. |
| Empty analytics | Ensure the tracking script is loaded and events are POSTing to `/api/track`. |
| Port 5173 conflict | V1 and V2 both default to 5173; stop one or override the port. |

More answers in [troubleshooting.md](troubleshooting.md).
