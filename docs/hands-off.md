# Hands-off — WebPulse Analytics operational boundaries

This document records what **must not** be changed, automated, or acted upon by
tooling, CI, or release automation without explicit human review and approval. It
exists to keep the monorepo migration and P0 security remediation safe, reversible,
and reviewable before any production cutover.

## 1. Core rule

**No destructive or production-impacting action happens without explicit approval.**
This includes force-pushes, branch deletions, merges into release branches, deployment
setting changes, secret exposure, production database migrations, and production
domain/DNS changes.

If a change is not clearly covered by an open pull request and a human "go," do not
run it.

## 2. Branches that must be preserved

These refs must never be force-pushed, deleted, or rewritten:

- `main` — production baseline
- `chore/monorepo-restructure` — active migration/P0 feature branch
- `v1`, `v1-dev`
- `v2`, `v2-dev`
- `development`

Local `v2` is 2 commits behind `origin/v2`; those missing commits only touch
`README.md` and `LICENSE`. No V2 source changes need porting, and `origin/v2` must
not be merged into `v2` or `main` blindly.

## 3. What automation and tooling must NOT do

### Git
- Do **not** force-push any branch.
- Do **not** delete any local or remote branch.
- Do **not** merge `chore/monorepo-restructure` into `main` outside a pull request.
- Do **not** reset `production` or any release branch history.
- Do **not** rewrite commits on shared branches.

### Backend / database
- Do **not** execute Supabase migrations against production. Migrations remain
  tracked under `supabase/migrations/` and are validated statically by
  `scripts/check-migrations.mjs` (no SQL is ever executed by CI).
- Do **not** reset the production database.
- Do **not** deploy the backend to Vercel serverless. Socket.IO, the hourly cleanup
  job, and `geoip-lite` make it unsuitable for serverless; use a long-lived Node host.
- Do **not** expose `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, or any `.env` value in
  commits, bundles, or logs. No tracked `.env` or secrets files exist.

### Frontend / Vercel
- Do **not** change production deployment settings, domains, or environment
  variables in Vercel.
- Do **not** add wildcard origins (e.g. `*.vercel.app`) to the backend CORS or
  Socket.IO allowlist. Every preview/dashboard origin must be listed explicitly in
  `FRONTEND_URLS`.
- Do **not** re-add the `includes('vercel.app')` socket guard that silently disabled
  live updates.

### Security controls (do not weaken)
- Credentialed API CORS (`backend/src/app.js`) must keep the explicit allowlist and
  `403 CORS_ORIGIN_DENIED` for disallowed browser origins.
- Socket.IO (`backend/src/server.js`) must keep `allowRequest` raw-WebSocket origin
  validation alongside its CORS config.
- Public tracking CORS (`backend/src/middleware/trackingCors.js`) must stay separate
  from authenticated API CORS and must never set
  `Access-Control-Allow-Credentials` for customer-site origins.
- Customer origins never receive credentials; dashboard origins are the only
  credentialed browser clients.

## 4. Release gates (require approval before proceeding)

| Gate | Condition |
|------|-----------|
| P0 local commit | Done — `chore/monorepo-restructure` commit `4c228f1` |
| Push to origin | Done — pushed to `origin/chore/monorepo-restructure` |
| GitHub Actions green | Done — CI (6/6 jobs) & Security (5/5 jobs) pass 100% |
| Branch hygiene | Done — 8 obsolete remote Dependabot branches and obsolete local branches removed; exact 7 release branches preserved |
| Deployment history cleanup | Done — 270 stale preview/backend deployments purged; 3 active production baselines preserved |
| Open PR against `main` | Ready — awaiting merge review |
| Backend hosting (long-lived Node) | Post-merge, separate change window |
| Vercel preview projects | Post-merge, separate change window |
| Integration tests | Post-merge, against staging |
| Supabase migration review | Static review only; no production execution |
| Production cutover | Separate, explicit approval window |

## 5. Commit and PR discipline

- Commit **only** to a feature branch after reviewing changes (`chore/monorepo-restructure`).
- Integrate via a pull request; never push directly to `main` or release branches.
- Review the diff before committing (P0 changes were reviewed: CORS, Socket.IO,
  V1 linked-accounts routes, bot-token redaction, share-token scoping, socket URL
  derivation, tests, lint, builds, migration hygiene, token purpose scoping, session store,
  rate limiting, and hermetic test runner).
- Do not repeat the migration or move files again; review and correct only verified
  problems.

## 6. Verified state (as of commit `4c228f1` / cleanup completion)

- GitHub Deployment history: 270 stale/preview deployments deleted; 3 active production baselines preserved (Production – web-pulse-analytics-v1 [ID 7204342064], Production – web-pulse-analytics [ID 7007260845], Production [ID 4280298323])
- Git branch audit: Cleaned 8 obsolete remote Dependabot branches and obsolete local branches; exact 7 canonical branches remain (`main`, `chore/monorepo-restructure`, `v1`, `v1-dev`, `v2`, `v2-dev`, `development`)
- Remote CI workflow (GitHub Actions): 6/6 jobs pass
  - Marketing (lint + build): pass
  - V1 Dashboard (lint + build): pass
  - V2 Dashboard (lint + build): pass
  - Backend (install + syntax + tests): pass
  - Repository hygiene (migrations): pass
  - Aggregate CI gate: pass
- Remote Security workflow (GitHub Actions): 5/5 jobs pass
  - Secret scanning (gitleaks with doc placeholder config): pass
  - Dependency audit (apps/marketing): pass
  - Dependency audit (apps/v1): pass
  - Dependency audit (apps/v2): pass
  - Dependency audit (backend): pass
- Backend tests: 12/12 pass (`backend/test/security.test.js`)
- `npm run lint:all`: 0 errors
- `npm run build:all`: all three apps pass production Vite builds
- `npm audit`: 0 vulnerabilities in all four workspaces
- 7 Supabase migrations statically validated; no SQL executed
- 56 backend source files pass syntax check (`scripts/check-syntax.mjs`)

## 7. What remains (do not start without approval)

1. Open PR `chore/monorepo-restructure` against `main` and complete review.
2. Backend hosting setup on a long-lived Node 22 host (Railway / Render / Fly / VPS).
3. Vercel preview projects for `apps/marketing`, `apps/v1`, and `apps/v2`.
4. Integration tests against staging environment.
5. Supabase migration review against a staging project (static verification; no production execution).

## 8. Escalation

Stop and ask for approval before any action listed in sections 2–4, or before any
change that affects production traffic, credentials, the database, or deployment
configuration. When in doubt, treat it as production-impacting.

---

**Maintained on:** `chore/monorepo-restructure`  
**Reviewed against:** `docs/security.md`, `docs/deployment.md`, `docs/migration-monorepo.md`
