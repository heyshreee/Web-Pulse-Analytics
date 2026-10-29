# Deployment

This guide covers deploying Web Pulse Analytics in production. The repository contains
three independent static frontends (`apps/marketing`, `apps/v1`, `apps/v2`), one
long-lived Node.js backend, and Supabase Postgres migrations. Migrations are **never**
auto-applied by CI or the release workflow.

- [Architecture summary](#architecture-summary)
- [Prerequisites](#prerequisites)
- [1. Deploy the backend](#1-deploy-the-backend)
- [2. Deploy the frontends](#2-deploy-the-frontends)
- [3. Apply database migrations](#3-apply-database-migrations)
- [4. Configure DNS, cookies, and HTTPS](#4-configure-dns-cookies-and-https)
- [5. Post-deploy checks](#5-post-deploy-checks)
- [6. Rollback](#6-rollback)
- [7. Vercel migration checklist](#7-vercel-migration-checklist)
- [8. Security checklist](#8-security-checklist)

## Architecture summary

| Component | What | Deployment target |
| --- | --- | --- |
| Marketing | React + Vite SPA | Static host (Vercel/Netlify/Cloudflare Pages/CDN) |
| V1 dashboard | React + Vite SPA | Static host, separate project from V2 |
| V2 dashboard | React + Vite SPA | Static host, separate project from V1 |
| Backend | Express 5 + Socket.IO | Long-lived Node 22 host (Render, Railway, Fly, VPS, EC2) |
| Database | Supabase (Postgres) | Supabase project; migrations applied manually |
| Tracking | Public `/api/track/*` | Served by the backend |

The backend is **not Vercel-suitable**: it relies on persistent Socket.IO connections,
an hourly `setInterval` cleanup job, and `geoip-lite`'s local database loaded at startup.
`backend/vercel.json` is left in the repository untouched, but do not use it for a new
deployment. Deploy the backend to a Node host that supports long-lived processes and
WebSockets.

The three frontends are independent Vite apps with their own `package.json`,
`package-lock.json`, `vite.config.js`, and `vercel.json` (SPA rewrites included). They do
not share a root workspace, so each host project should use its app directory as the
root.

## Prerequisites

- Supabase project with migrations applied (see [database-schema.md](database-schema.md))
- A long-lived Node 22 host for the backend
- Static hosting accounts/projects for the three frontends
- HTTPS domains (custom domains strongly recommended; see the cookie note below)
- Third-party keys only if using those features (Google OAuth, Razorpay, Resend,
  Cloudinary, Telegram)

## 1. Deploy the backend

### Host requirements

- Node.js 22 (Node 20+ should work, but CI uses 22)
- WebSocket upgrade support
- Long-lived process (no serverless function timeout)
- Outbound HTTPS to Supabase and third-party APIs
- A health check against `GET /`

### Build/run

```bash
cd backend
npm ci
npm start          # node src/server.js
```

Set the host's start command to `npm start` and the health check path to `/`. Do not run
database migrations from the backend start command.

### Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | Yes | `production` |
| `PORT` | Usually host-provided | The app reads `PORT` and defaults to `5000` |
| `FRONTEND_URL` | Yes | Primary dashboard origin used for email links, tracking CORS, and the Socket.IO whitelist (for example `https://app.example.com`) |
| `JWT_SECRET` | Yes | Strong random string; rotating it invalidates sessions |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | **Service role** — server-side only; never expose to a browser |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Optional | Billing |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SUPPORT_EMAIL`, `PRIVACY_EMAIL` | Optional | Email |
| `CLOUDINARY_*` | Optional | Media uploads |
| `TELEGRAM_BOT_TOKEN` | Optional | Notifications |

`backend/.env.example` is the source of truth for names. Never commit real values.

### Socket.IO and multiple frontend origins

`backend/src/server.js` currently whitelists one `FRONTEND_URL` plus localhost and a
legacy Netlify origin. If V1 and V2 are deployed to **different** origins, add both
production origins to the Socket.IO CORS configuration before cutover. Otherwise HTTP
requests may work while the dashboard's live WebSocket connection is rejected.

`FRONTEND_URL` is also used for password-reset/email links, so point it at the primary
dashboard (normally V2) and keep the Socket.IO allowlist explicit.

### CSP / CORS

- Update CSP `connect-src`/`img-src` in `backend/src/app.js` if you add CDNs or API
  origins.
- Global HTTP CORS is currently permissive with credentials. Treat that as a known
  security risk and review it before exposing the API broadly.
- Tracking CORS is handled separately in `backend/src/middleware/trackingCors.js`.

## 2. Deploy the frontends

Create **three separate hosting projects**. Do not point two production domains at the
same V1/V2 build.

### Common settings

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Root directory | `apps/marketing`, `apps/v1`, or `apps/v2` |
| Install command | `npm ci` (or host default) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 22 |
| SPA fallback | Already provided by each app's `vercel.json` on Vercel; configure equivalent rewrites on other hosts |

### Build-time environment variables

Vite bakes `VITE_*` values into the bundle at build time. Rebuild after changing them.

| Variable | Marketing | V1 | V2 | Notes |
| --- | :---: | :---: | :---: | --- |
| `VITE_API_URL` | Yes | Yes | Yes | Backend API base, e.g. `https://api.example.com/api` |
| `VITE_APP_URL` | Yes | — | — | Dashboard URL used by marketing login/register/dashboard redirects |
| `VITE_SUPABASE_URL` | Yes | Yes | Yes | Public Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Yes | Yes | Public anon key |
| `VITE_GOOGLE_CLIENT_ID` | Optional | Optional | Optional | Google OAuth |
| `VITE_RAZORPAY_KEY_ID` | Optional | Optional | Optional | Razorpay checkout |

Never put `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, OAuth client secrets, or other private
keys in a frontend project. Only `VITE_*` values are exposed, and anything prefixed with
`VITE_` is public.

### Marketing redirect target

`VITE_APP_URL` controls where marketing's `/login`, `/register`, and `/dashboard/*`
routes send users. Point it at the V2 dashboard (or whichever dashboard is primary).
If unset, marketing falls back to its own landing page.

## 3. Apply database migrations

Migrations in `supabase/migrations/` must be applied **manually**. Do not rely on CI/CD
or the backend process to run them.

Options:

1. **Supabase CLI** (recommended)
   ```bash
   # from a configured checkout
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
2. **SQL Editor** — run each migration in timestamp order in Supabase Dashboard → SQL
   Editor. Review before running in production.

Current order:

1. `20261001000001_core_schema.sql`
2. `20261001000002_analytics_tables.sql`
3. `20261001000003_indexes.sql`
4. `20261001000004_analytics_functions.sql`
5. `20261001000005_rls_security.sql`
6. `20261008000001_fix_security_and_performance_linter.sql`
7. `20261020000001_user_sessions.sql`

**Checklist before applying to production:**

- [ ] Back up the database (Supabase point-in-time recovery depending on plan)
- [ ] Review every new migration diff
- [ ] Confirm RLS policies are correct and not overly permissive
- [ ] Confirm migrations are additive; avoid dropping data
- [ ] Test on a staging Supabase project first
- [ ] Apply migrations before deploying application code that depends on them

> The release workflow (`release.yml`) only packages frontend builds and creates a
> GitHub Release. It does **not** deploy migrations or production apps.

## 4. Configure DNS, cookies, and HTTPS

- Point the marketing domain (e.g. `www.example.com`) at the marketing project.
- Point the V1 and V2 dashboard domains at their respective projects.
- Point `api.example.com` at the backend host.
- Use HTTPS everywhere.

### Cookies and cross-origin sessions

In production the backend sets the auth cookie with `httpOnly`, `Secure`, and
`SameSite=None`. This allows the dashboards and API to run on different origins, but it
also means:

- Every frontend and the API must be served over HTTPS.
- Browser third-party-cookie blocking can break sessions when the dashboard and API are
  on unrelated registrable domains (for example separate `*.vercel.app` hostnames).
  Prefer custom domains under one parent domain, such as `app.example.com`,
  `v1.example.com`, and `api.example.com`.
- If V1 and V2 live on separate origins, verify **both** can authenticate and open a
  Socket.IO connection. Update the Socket.IO allowlist as described above.

### Backend origin settings

- Set `FRONTEND_URL` to the primary dashboard origin.
- Update `VITE_API_URL` in each frontend to the backend origin plus `/api`.
- If the API domain changes, update all three frontend projects and redeploy them.

## 5. Post-deploy checks

Run these against the preview/staging deployment before changing production domains.

1. **Frontends load**: marketing, V1, and V2 each render without console errors.
2. **Deep links work**: refresh `/dashboard`, `/pricing`, and a nested dashboard route;
   the host must serve `index.html`, not a 404.
3. **Backend health**: `GET https://api.example.com/` returns the API status message.
4. **Auth flow**: register/login, refresh the page, logout. Verify the cookie is set with
   `Secure` and `SameSite=None` in production.
5. **Cross-origin API**: mutating requests include `X-Requested-With` and succeed from
   both dashboard origins.
6. **Projects**: create a project, copy its tracking ID.
7. **Tracking**: add the script to a test page on an allowed origin; verify
   `POST /api/track/:trackingId` succeeds.
8. **Analytics**: a page view appears in the dashboard.
9. **Real-time**: Socket.IO connects from each dashboard origin and live counts update.
10. **Marketing redirects**: `/login` and `/register` go to `VITE_APP_URL`.
11. **Security headers**: `curl -I https://api.example.com/` shows Helmet headers and the
    expected CSP.

## 6. Rollback

- **Frontend**: promote the previous deployment or redeploy the previous commit. If a
  domain was reassigned, point it back to the old project.
- **Backend**: redeploy the previous image/version. Keep `.env` compatible with the
  version being restored.
- **Database**: **do not** blindly roll back migrations. Write a forward-fixing migration
  instead. Restore from a backup only if data was damaged.
- **Release**: GitHub Releases are immutable; publish a new patch release to fix forward.

Because the monorepo restructure did not change Vercel production settings, the safest
rollback is to leave existing projects serving production and simply not promote the new
projects until every check passes.

## 7. Vercel migration checklist

> The project names and URLs below are **examples, not verified production values**.
> Do not create, rename, or delete production projects/domains as part of this checklist
> without an explicit change window.

### Before creating projects

- [ ] Confirm the migration branch is reviewed and CI is green.
- [ ] Confirm `npm run build:all` and `npm run lint:all` pass locally.
- [ ] Confirm the backend is deployed and healthy on a long-lived Node host.
- [ ] Record current production project IDs, domains, and environment-variable names.
- [ ] Back up the Supabase database and review pending migrations.
- [ ] Decide the final domains for marketing, V1, V2, and API.

### Create preview projects (no production domains yet)

For each app, create a separate Vercel project from the same repository:

| Example project | Root Directory | Build | Output |
| --- | --- | --- | --- |
| `webpulse-marketing-preview` | `apps/marketing` | `npm run build` | `dist` |
| `webpulse-v1-preview` | `apps/v1` | `npm run build` | `dist` |
| `webpulse-v2-preview` | `apps/v2` | `npm run build` | `dist` |

- [ ] Framework preset: Vite.
- [ ] Node.js version: 22.
- [ ] Confirm the project uses the app's own lockfile (no root workspace install).
- [ ] Set the environment variables from the table above, using preview backend URLs.
- [ ] Keep production domains detached until preview verification passes.

### Verify previews

- [ ] Marketing loads and its login/register links point at the preview dashboard.
- [ ] V1 loads, logs in, and can call the preview backend.
- [ ] V2 loads, logs in, and can call the preview backend.
- [ ] Both dashboards open a Socket.IO connection to the preview backend (check browser
      devtools; a CORS/handshake error is a blocker).
- [ ] Cookies are accepted in the preview environment.
- [ ] Tracking ingest works from a test page.
- [ ] Deep links survive a refresh.
- [ ] No console errors caused by CSP or mixed content.

### Cutover (separate change window)

- [ ] Add custom domains to the new projects; keep the old deployments available.
- [ ] Update backend `FRONTEND_URL` and the Socket.IO origin allowlist for the final
      dashboard origins.
- [ ] Update `VITE_API_URL` in all three frontend projects to the production API.
- [ ] Update marketing `VITE_APP_URL` to the production dashboard.
- [ ] Redeploy all three frontends (Vite env changes require a rebuild).
- [ ] Re-run the post-deploy checks against production.
- [ ] Only then remove or archive old projects/domains.

### Rollback for Vercel

- [ ] Reassign the domain to the previous project/deployment.
- [ ] Restore the previous environment-variable values and redeploy if they changed.
- [ ] Do not delete the old projects until the new ones have been stable for an agreed
      observation period.

## 8. Security checklist

- [ ] `NODE_ENV=production`, HTTPS only, `Secure` cookies
- [ ] `SUPABASE_SERVICE_KEY` is server-side only; not in any frontend env
- [ ] `JWT_SECRET` is strong and unique per environment
- [ ] No secrets committed; `.env` files ignored
- [ ] RLS enabled on all user/visitor tables; policies reviewed
- [ ] Rate limiting enabled on tracking/abuse-prone routes
- [ ] CSP tightened for production (remove localhost if not needed)
- [ ] CORS reviewed, especially the global permissive policy and Socket.IO allowlist
- [ ] CSRF header enforced on mutating v1 routes (except `/track`)
- [ ] Monitoring/logging configured without PII/secrets
- [ ] Dependabot alerts enabled; CI security checks passing

See [security.md](security.md) for more detail.
