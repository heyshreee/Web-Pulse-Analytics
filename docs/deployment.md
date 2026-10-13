# Deployment

This guide covers deploying Web Pulse Analytics in production. The frontend is a static
build; the backend is a Node.js app. The database lives in Supabase. Migrations are
**never** auto-applied by the release workflow.

- [Architecture summary](#architecture-summary)
- [Prerequisites](#prerequisites)
- [1. Deploy the backend](#1-deploy-the-backend)
- [2. Deploy the frontend](#2-deploy-the-frontend)
- [3. Apply database migrations](#3-apply-database-migrations)
- [4. Configure DNS and HTTPS](#4-configure-dns-and-https)
- [5. Post-deploy checks](#5-post-deploy-checks)
- [6. Rollback](#6-rollback)
- [7. Security checklist](#7-security-checklist)

## Architecture summary

| Component | What | Notes |
| --- | --- | --- |
| Frontend | React + Vite SPA | Build to `frontend/dist/`, serve statically (CDN) |
| Backend | Express 5 + Socket.IO | Node.js 22, listens on `PORT` |
| Database | Supabase (Postgres) | Migrations applied manually |
| Tracking | Public `/api/track/*` | Ingest from any allowed origin per project config |

## Prerequisites

- Supabase project with migrations applied (see [database-schema.md](database-schema.md))
- Hosting for backend (Render, Railway, Fly.io, Render, EC2, etc.)
- Hosting for frontend (Vercel, Netlify, Cloudflare Pages, etc.)
- Domain (optional) with HTTPS
- Third-party keys (only if using those features)

## 1. Deploy the backend

### Environment variables

Set these in your backend host:

| Variable | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | Yes | `production` |
| `PORT` | Yes | Host usually sets automatically; ensure app respects it |
| `FRONTEND_URL` | Yes | Your deployed frontend URL (e.g. `https://app.example.com`) |
| `JWT_SECRET` | Yes | Strong random string; rotate carefully |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | **Service role** — server-side only; never expose to browser |
| `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` | Optional | For Google OAuth |
| `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` | Optional | For billing |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SUPPORT_EMAIL`, `PRIVACY_EMAIL` | Optional | Email |
| `CLOUDINARY_*` | Optional | Media |
| `TELEGRAM_BOT_TOKEN` | Optional | Notifications |

### Build/run

- Install: `npm ci` (use lockfile)
- Start: `npm start` (`node src/server.js`)
- Health check: `GET /` should return API status

### Socket.IO

Ensure your host supports WebSockets and keeps connections alive. The backend sets CORS
for Socket.IO to allow `FRONTEND_URL`, `localhost:5173`, and `obs-tracker.netlify.app/` by
default — adjust if using different domains.

### CSP / CORS

Update CSP `connect-src`/`img-src` in `backend/src/app.js` if you serve assets from
different CDNs. Update tracking CORS if you need to restrict ingest domains further.

## 2. Deploy the frontend

### Build

```bash
cd frontend
npm ci
npm run build
```

Output goes to `frontend/dist/`. This is a static SPA — any path should fallback to
`index.html` (configure your host's SPA fallback).

### Environment variables (build-time)

Set in your frontend host (Vite reads `VITE_*` at build time):

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Backend URL (e.g. `https://api.example.com`) |
| `VITE_SUPABASE_URL` | Yes | Supabase URL (public) |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon key (public) |
| `VITE_GOOGLE_CLIENT_ID` | Optional | Google OAuth |
| `VITE_RAZORPAY_KEY_ID` | Optional | Razorpay |

Never put secrets here.

### Hosts

- **Vercel/Netlify**: connect repo, set build command `npm run build` (root `frontend/`),
  output dir `dist`. Enable SPA redirect to `/index.html`.
- **Cloudflare Pages**: same; add `_redirects` if needed (`/* /index.html 200`).
- **Static hosting + CDN**: upload `dist/` and configure 404 → index.html.

## 3. Apply database migrations

Migrations in `supabase/migrations/` must be applied **manually**. Do not rely on CI/CD
to run them.

Options:

1. **Supabase CLI** (recommended)
   ```bash
   # from repo root
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
2. **SQL Editor** — run each migration in order (by timestamp) in Supabase Dashboard →
   SQL Editor. Review before running in production.

**Checklist before applying to production:**

- [ ] Back up your database (Supabase has point-in-time recovery depending on plan)
- [ ] Review diffs for each new migration
- [ ] Confirm RLS policies are correct and not overly permissive
- [ ] Ensure migrations are additive; avoid dropping data
- [ ] Test on a staging Supabase project first

> The release workflow (`release.yml`) only packages the frontend build and creates a
> GitHub Release — it does **not** deploy migrations. This is intentional.

## 4. Configure DNS and HTTPS

- Point your domain (e.g. `app.example.com`) to the frontend host.
- Point `api.example.com` to the backend host.
- Use HTTPS everywhere. Enforce `secure` cookies in production (`NODE_ENV=production`).
- Update `FRONTEND_URL` in backend to your frontend domain.
- Update `VITE_API_URL` in frontend to your backend domain.

If using Cloudflare, be careful with caching API responses (never cache dynamic `/api/*`).
Also note WebSocket behavior through proxies.

## 5. Post-deploy checks

Smoke test the production deployment:

1. **Frontend loads**: `https://app.example.com` renders without console errors
2. **Backend health**: `https://api.example.com/` returns API status
3. **Auth flow**: register/login, logout, session persistence
4. **Projects**: create a project, copy tracking ID
5. **Tracking**: add script to a test page on an allowed origin; verify `POST` succeeds
6. **Analytics**: page view appears in dashboard; Socket.IO updates live visitors
7. **CORS/CSRF**: mutating `/api/v1/*` requests include CSRF token and succeed
8. **Security headers**: check with `curl -I https://api.example.com/` (Helmet headers present)

## 6. Rollback

- **Frontend**: redeploy a previous build from your host, or revert the Git commit and
  rebuild.
- **Backend**: redeploy a previous image/version from your host. Keep `.env` consistent
  with the deployed version.
- **Database**: **do not** blindly roll back migrations. Write a forward-fixing migration
  instead. If data was modified, restore from a backup if necessary.
- **Releases**: GitHub Releases are immutable; you can publish a new patch release
  (`vX.Y.Z+1`) to fix forward.

## 7. Security checklist

- [ ] `NODE_ENV=production`, HTTPS only, secure cookies
- [ ] `SUPABASE_SERVICE_KEY` is server-side only; not in frontend env
- [ ] `JWT_SECRET` is strong and unique per environment
- [ ] No secrets committed; `.env` files ignored
- [ ] RLS enabled on all user/visitor tables; policies reviewed
- [ ] Rate limiting enabled on tracking/abuse-prone routes
- [ ] CSP tightened for production (remove localhost if not needed)
- [ ] CORS: tracking CORS restricted to your domains; global CORS reviewed
- [ ] CSRF enabled on mutating v1 routes (except `/track`)
- [ ] Monitoring/logging configured (without logging PII/secrets)
- [ ] Dependabot alerts enabled; CI security checks passing

See [security.md](security.md) for more detail.