# Getting Started

This guide helps you run Web Pulse Analytics locally. By the end, you'll have the
frontend, backend, and database configured and talking to each other.

- [Prerequisites](#prerequisites)
- [1. Clone and install](#1-clone-and-install)
- [2. Configure backend](#2-configure-backend)
- [3. Configure frontend](#3-configure-frontend)
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

# Frontend dependencies
cd ../frontend && npm install
```

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
| `FRONTEND_URL` | URL where frontend runs | `http://localhost:5173` |
| `SUPABASE_URL` | Your Supabase project URL | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service_role key (server-side only) | `<service-role-key>` |

`SUPABASE_SERVICE_KEY` must never be exposed to the browser.

The rest are optional — leave them blank until you need those features. For more detail, see [docs/security.md](security.md).

## 3. Configure frontend

Create `.env` in `frontend/`:

```bash
cd ../frontend
cp .env.example .env
```

| Variable | What it is | Example |
| --- | --- | --- |
| `VITE_API_URL` | Backend API base | `http://localhost:5000` |
| `VITE_SUPABASE_URL` | Supabase URL (public) | `https://<ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (public) | `<anon-key>` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) | `<google-client-id>` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key ID (optional) | `<razorpay-key-id>` |

Only `VITE_*` vars are exposed to the browser. No secrets belong here.

## 4. Database setup (Supabase)

SQL migrations are stored in [`supabase/migrations/`](../supabase/migrations/). You can apply them using the Supabase CLI (`supabase db push`/`db reset`) or by running them in the Supabase SQL Editor in order of timestamp.

Key files:

1. `20261001000001_core_schema.sql` — core tables
2. `20261001000002_analytics_tables.sql` — analytics schema
3. `20261001000003_indexes.sql` — indexes
4. `20261001000004_analytics_functions.sql` — functions
5. `20261001000005_rls_security.sql` — RLS policies
6. `20261008000001_fix_security_and_performance_linter.sql` — fixes

> ⚠️ Migrations are never auto-deployed by the release workflow. Apply them manually to each environment and review changes.

Once applied, confirm RLS is enabled on tables that store user/visitor data. The expected baseline is documented in [database-schema.md](database-schema.md).

## 5. Run the applications

Open two terminals:

```bash
# Terminal 1 — backend
cd backend && npm run dev
```

Backend starts on `http://localhost:5000`. Health: `GET /`.

```bash
# Terminal 2 — frontend
cd frontend && npm run dev
```

Frontend starts on `http://localhost:5173`.

## 6. Verify the setup

- Frontend: `http://localhost:5173` should load
- Backend health: `curl http://localhost:5000` returns a short API status message
- With a valid Supabase connection, signup/login flow should work
- Real-time dashboard updates require Socket.IO connectivity between frontend and backend

## 7. Tracking a website

Web Pulse Analytics exposes a public tracking endpoint and a small tracker script.

### Tracker script (recommended)

Serve via the API:

```html
<script src="http://localhost:5000/api/track/TRACKING_ID/script.js"></script>
```

Replace `TRACKING_ID` with your project's tracking ID (generated when creating a project in the dashboard).

The script will send page views and basic metadata to `POST /api/track/:trackingId`.

### Manual tracking (REST)

```http
POST http://localhost:5000/api/track/:trackingId
Content-Type: application/json

{
  "page": "/pricing",
  "referrer": "https://google.com"
}
```

See [tracking-guide.md](tracking-guide.md) for details, payload validation, CORS restrictions, and event tracking.

## 8. Troubleshooting

| Symptom | Check |
| --- | --- |
| CORS errors from tracking | `FRONTEND_URL` in backend, and the page's origin. Tracking CORS is handled per-route. |
| JWT/auth failures | `JWT_SECRET` set and consistent; cookies/credentials allowed. |
| Socket.IO disconnected | Check `VITE_API_URL` and CSP `connect-src` (see `backend/src/app.js`). |
| Supabase connection fails | `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` correct; no network restrictions. |
| Empty analytics | Ensure the tracking script is loaded and events are POSTing to `/api/track`. |

More answers in [troubleshooting.md](troubleshooting.md).
