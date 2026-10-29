# WebPulse Analytics: Monorepo Migration & Restructuring Report

**Branch:** `chore/monorepo-restructure` (local only)

**Base Commit:** `3eaf020d779bcf5509779255a148b6e5a940d3be` (`origin/main`)

**Migration Commit:** `465dd1e1a6d05247afc26c2884ea426712ae3b2b`

**Status:** Locally validated; not pushed, merged, or deployed

**Date:** October 29, 2026

---

## 1. Overview & Objectives

This document records the safe restructuring of the **WebPulse Analytics** repository
into independently maintainable applications without disrupting existing branches,
production deployments, or historical Git references.

The migration establishes clear boundaries:

- **`apps/marketing/`**: Standalone public website (landing, pricing, features, blog,
  docs, legal, help center, security).
- **`apps/v1/`**: Stable V1 dashboard, kept separate from V2 source.
- **`apps/v2/`**: V2 dashboard and expanded analytics views.
- **`backend/`**: Shared Express/Socket.IO API used by both dashboards.
- **`supabase/`**: Versioned SQL migrations, now tracked because they are required for
  self-hosting and already referenced throughout the docs.

No application source was merged across V1 and V2. No branch was force-pushed, deleted,
or rewritten. No Vercel setting, domain, environment variable, or production deployment
was changed.

---

## 2. Branch & Commit Mapping

Remote-tracking refs verified during the migration:

| Branch | Commit SHA | Role / Content |
| :--- | :--- | :--- |
| `origin/main` | `3eaf020d779bcf5509779255a148b6e5a940d3be` | Stable integrated release (V2 line) |
| `origin/development` | `52dd0d1c6c567219b928909c1723592aa64378e5` | Integration branch |
| `origin/v1` | `fef4a6ac6cb087ede94c08c0c6bde0c980304e65` | Stable V1 release |
| `origin/v1-dev` | `b9809bb28e6a2d062721fb871af91016a32a03e9` | V1 development |
| `origin/v2` | `d90be9a5b8a27b2a4280c8bfdfbe011a713d38cc` | V2 release |
| `origin/v2-dev` | `d90be9a5b8a27b2a4280c8bfdfbe011a713d38cc` | V2 development |

> The local `v2` ref in the working clone points at `17c83fa...` and is two commits
> behind `origin/v2`. This is pre-existing local state; it was not modified, and no
> branch was pushed or deleted.

---

## 3. Directory Restructuring & Extraction Summary

### A. `apps/v2` (V2 Dashboard)

- **Source:** Moved from `frontend/` on `main` (commit `b5073b8`).
- **Provenance:** Tree matches `origin/main:frontend`; only the package name was changed
  to `webpulse-v2`.
- **Validation:** Independent production build passes.

### B. `apps/v1` (Stable V1 Dashboard)

- **Source:** Extracted from `origin/v1:frontend` (`fef4a6ac`).
- **Provenance:** Tree matches `origin/v1:frontend`; only the package name was changed to
  `webpulse-v1`.
- **Validation:** Independent production build passes.

### C. `apps/marketing` (Canonical Marketing Website)

- **Source:** Extracted from the canonical redesign on `origin/v1:frontend`.
- **Pruned:** Console/dashboard views (`Dashboard.jsx`, `Projects.jsx`, `Billing.jsx`,
  `Settings.jsx`, `APIKeys.jsx`, `WorldMap.jsx`, and related components) were removed.
- **Retained:** Landing, features, pricing, blog, community, help center, security, legal,
  API overview, integrations, and the documentation rail.
- **Console redirects:** `/login`, `/register`, and `/dashboard/*` redirect to
  `VITE_APP_URL` (or the marketing landing page when unset).
- **Validation:** Independent production build passes.

### D. `backend/` (API & Background Services)

- Kept at the repository root. All controllers, routes, middleware, services, socket
  handlers, and server configuration are shared by Marketing, V1, and V2.
- A backward-compatible `POST/DELETE /api/v1/projects/:id/share-token` alias was added;
  both dashboards call that path while the backend previously exposed only
  `/:id/regenerate-token`. The existing route remains.
- `backend/vercel.json` was left untouched. It is **not** a supported deployment path; see
  section 5.

### E. Root Scripts & Tooling

- Root `package.json` provides delegating scripts for each app and the backend:
  - `dev:*`, `build:*`, `lint:*`, `preview:*`
  - `dev:backend`, `start:backend`, `test:backend`, `build:all`, `lint:all`,
    `check:backend`
- There are **no npm workspaces** at the root. Each app and the backend install and lock
  dependencies independently.
- `scripts/check-syntax.mjs` replaces the old Unix-only `find | xargs node --check`
  command with a cross-platform syntax checker.
- `backend/test/health.test.js` adds a real `node:test` smoke test (boot, health, 404) and
  replaces the placeholder `test` script.

### F. Supabase Migrations

- Removed the blanket `/supabase/` ignore rule. `supabase/.temp/` and
  `supabase/.branches/` remain ignored.
- Seven existing migration files are now tracked because self-hosting requires them and
  the docs already referenced them. No migration was modified or executed.

### G. Application Configuration

- Aligned `apps/marketing` and `apps/v1` ESLint configs with the V2 policy; fixed genuine
  lint errors instead of suppressing them.
- Updated all app `.env.example` files to `VITE_API_URL=http://localhost:5000/api`.
- Updated Vite proxy targets to `http://localhost:5000`; marketing dev server uses port
  `5174`.
- Made `getApiUrl()` accept a bare origin, an `/api` base, or a full `/api/v1` base.
- Documented that V1 and V2 both default to port `5173`.

### H. CI, Security, and Documentation

- `.github/workflows/ci.yml`: separate marketing, V1, V2, and backend jobs; no
  `continue-on-error`; backend syntax check and tests restored.
- `.github/workflows/security.yml`: audits all four workspaces.
- `.github/dependabot.yml`: points at `/apps/marketing`, `/apps/v1`, `/apps/v2`, and
  `/backend`.
- README, CONTRIBUTING, architecture, deployment, getting-started, security,
  troubleshooting, roadmap, PR template, issue template, SECURITY, and SUPPORT were
  updated for the monorepo layout and real branch names.
- `.gitattributes` enforces LF in the index to stop Windows/Linux CRLF churn.

---

## 4. Verification Results

All checks below were run locally on October 29, 2026 from the repository root.

| Check | Command | Result |
| :--- | :--- | :--- |
| Frontend lint | `npm run lint:all` | **PASS** — 0 errors; 3 marketing warnings, 12 V1 warnings, 3 V2 warnings (pre-existing hooks/fast-refresh warnings) |
| Frontend builds | `npm run build:all` | **PASS** — marketing 2,607 modules / 56.6s; V1 3,696 modules / 46.6s; V2 3,720 modules / 51.1s. Chunk-size warnings only |
| Backend syntax | `npm run check:backend` | **PASS** — 54 files checked |
| Backend tests | `npm run test:backend` | **PASS** — 1 test, 0 failures, ~67s locally |
| Workflow YAML | Parse all `.github/workflows/*.yml` + `dependabot.yml` | **PASS** |
| Diff hygiene | `git diff --cached --check` | **PASS for code/docs**; legacy SQL migrations retain trailing spaces and are tracked unchanged |

### What the checks do and do not cover

- The backend test is a **smoke test**, not comprehensive API/route coverage. It boots
  the Express app, checks `GET /`, and checks a 404. It does not exercise auth, projects,
  tracking ingest, payments, or Socket.IO.
- No browser E2E or component test suite is configured for any frontend.
- No Vercel preview deployment, production backend deployment, or live Supabase migration
  was performed. All deployment steps remain manual and unverified.
- The builds emit chunk-size warnings (some lazy-loaded chunks exceed 500 kB). These are
  pre-existing and non-blocking.

---

## 5. Backend Compatibility & Deployment Constraints

### Not Vercel-suitable

The backend depends on:

- Persistent Socket.IO connections,
- an hourly `setInterval` notification cleanup job,
- `geoip-lite` loading a local database at startup.

Deploy it to a long-lived Node.js host with WebSocket support (Render, Railway, Fly, EC2,
or a VPS). `backend/vercel.json` remains in the tree to avoid changing existing state, but
it should not be used for new deployments.

### API compatibility

- Both dashboards use `/api/v1/*` and `/api/track/*`; the shared backend serves both.
- The new `/:id/share-token` aliases close a contract gap found during the audit. The
  previous `/:id/regenerate-token` route is unchanged.
- V1 Settings calls `/api/v1/user/linked-accounts`, which is absent from both the V1 and
  current backends. This is a **pre-existing dead endpoint**, not a migration regression;
  the tab degrades without a server error. It should be fixed or removed in a separate
  change.

### Multiple frontend origins

`backend/src/server.js` whitelists one `FRONTEND_URL` (plus localhost and a legacy
Netlify origin) for Socket.IO. If V1 and V2 are deployed to different origins, both must be
added before cutover, or one dashboard's live connection will fail. HTTP API calls can
still work because global CORS is permissive.

### Known security risks carried over

- Global HTTP CORS allows every origin with credentials. This is pre-existing and should
  be tightened separately.
- Production auth cookies use `SameSite=None; Secure`, which is required for cross-origin
  dashboards but is sensitive to third-party-cookie blocking. Prefer custom domains under
  one parent domain.
- The backend test does not cover authorization or RLS behavior.

---

## 6. Vercel Migration Checklist

The full checklist is in [deployment.md](deployment.md#7-vercel-migration-checklist).
Summary:

1. **Preflight:** review the migration commit; confirm CI/builds pass; deploy the backend
   to a long-lived Node host; back up Supabase; record current Vercel project IDs, domains,
   and env-var names.
2. **Create preview projects:** one each for `apps/marketing`, `apps/v1`, and `apps/v2`.
   Framework preset Vite, Node 22, build `npm run build`, output `dist`. SPA rewrites are
   already provided by each app's `vercel.json`.
3. **Set build-time env vars:** `VITE_API_URL`, Supabase URL/anon key, plus
   `VITE_APP_URL` for marketing and optional OAuth/Razorpay IDs. Never add server secrets.
4. **Verify previews:** deep links, login/logout, cookie acceptance, cross-origin API,
   Socket.IO from both dashboard origins, tracking ingest, and CSP/mixed-content behavior.
5. **Cut over in a separate window:** add domains, update backend `FRONTEND_URL` and the
   Socket.IO allowlist, update frontend API URLs, redeploy, and re-run smoke checks.
6. **Rollback:** reassign the domain to the previous deployment; do not delete old
   projects until the new ones are stable.

> Proposed project names and URLs (for example `webpulse-marketing`, `webpulse-v1`,
> `webpulse-v2`) are examples only. No production URL was created, renamed, or verified.

---

## 7. Safe Rollback Procedure

All work is confined to the local `chore/monorepo-restructure` branch. No remote branch,
production tag, Vercel project, DNS record, or deployed asset was changed.

1. **Abandon the migration locally:**
   ```bash
   git checkout main
   git branch -D chore/monorepo-restructure
   ```
2. **Or reset the local branch to the base commit** (destroys uncommitted work):
   ```bash
   git reset --hard 3eaf020d779bcf5509779255a148b6e5a940d3be
   ```
3. **Verify the working tree and production:** `git status`; confirm Vercel projects still
   serve their existing deployments.
4. **Database:** never roll back migrations blindly. Write a forward-fixing migration or
   restore from a verified backup.
5. **Vercel:** if a domain was already moved, point it back to the previous project or
   deployment.

---

## 8. Remaining Risks & Follow-ups

- Add real backend route/auth/RLS tests; the current smoke test is not coverage.
- Add frontend component or E2E tests.
- Tighten global CORS and make the Socket.IO origin allowlist configurable for multiple
  dashboard origins.
- Resolve the missing `/user/linked-accounts` endpoint or remove the dead V1 UI call.
- Verify Supabase migrations against a staging project before production.
- Re-run dependency audits and browser checks in the target deployment environment.
- Remove or clearly mark the unused `backend/vercel.json` after confirming no existing
  project depends on it.
