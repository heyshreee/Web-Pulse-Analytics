# Security

This document outlines the security posture of Web Pulse Analytics, current controls,
known hardening areas, and how to report vulnerabilities.

- [Reporting vulnerabilities](#reporting-vulnerabilities)
- [Threat model summary](#threat-model-summary)
- [Authentication and authorization](#authentication-and-authorization)
- [Tracking ingestion (public endpoint)](#tracking-ingestion-public-endpoint)
- [Web security headers](#web-security-headers)
- [CSRF, CORS, and rate limiting](#csrf-cors-and-rate-limiting)
- [Secrets and environment variables](#secrets-and-environment-variables)
- [Database security (Supabase/RLS)](#database-security-supabaserds)
- [Data collection and privacy](#data-collection-and-privacy)
- [Dependency management](#dependency-management)
- [CI/CD security](#cicd-security)
- [Operational security](#operational-security)
- [Known gaps / future hardening](#known-gaps--future-hardening)

## Reporting vulnerabilities

Do **not** report security issues via public GitHub issues. Use private channels:

1. GitHub private vulnerability reporting: [Report a vulnerability](https://github.com/heyshreee/Web-Pulse-Analytics/security/advisories/new)
2. Or contact [`@heyshreee`](https://github.com/heyshreee) privately

See [SECURITY.md](../SECURITY.md) for full details on response timelines and process.

## Threat model summary

Key assets: user accounts, project configurations, analytics data (visitor/page/event),
API keys (third-party), and JWT secrets.

Top concerns:

- Abuse of public tracking endpoint (spam, forged events)
- Broken access control (accessing another user's project data)
- CSRF on mutating API routes
- Secret exposure (frontend bundle or git history)
- SQL injection (mitigated by parameterized queries via Supabase client)
- XSS (mitigated by React escaping + CSP)

## Authentication and authorization

- **JWT**: issued on login; used for authenticating requests. Tokens are stored/handled
  per the app's session model.
- **Auth middleware**: protects `/api/v1/*` routes that require login
- **Project ownership**: controllers enforce that the authenticated user owns or has
  access to the requested project (`projectController`, `visitorController` checks)
- **Role-based access**: `project_members.role` (owner/admin/editor/viewer) — enforced
  where applicable
- **OAuth**: Google OAuth supported (optional). Client ID exposed via `VITE_GOOGLE_CLIENT_ID`;
  `GOOGLE_CLIENT_SECRET` server-side only

## Tracking ingestion (public endpoint)

`/api/track/:trackingId/*` is intentionally public:

- **Script delivery**: `GET /api/track/:trackingId/script.js` serves a static tracker
- **Ingest**: `POST /api/track/:trackingId` accepts minimal JSON
- **Validation**: payloads validated (`utils/validators.js`); reject malformed/oversized
  input where possible
- **CORS**: dedicated `trackingCors.js` middleware (different from global CORS). Restricts
  origins/referrers for browser-based requests
- **Origin/referrer checks**: enforced against project configuration
- **Rate limiting**: applied to tracking endpoints to deter spam
- **No PII**: design avoids collecting emails/names; see [tracking-guide.md](tracking-guide.md)

## Web security headers

Applied via **Helmet** in `backend/src/app.js`:

- `Content-Security-Policy` (CSP): allows required sources — `self`, Supabase, OpenStreetMap
  tiles, Google auth domains, etc. Tighten for production by removing `localhost:*` if not needed.
- `X-Content-Type-Options`: `nosniff`
- `Strict-Transport-Security` (HSTS): recommended in production behind HTTPS
- `Referrer-Policy`, `X-Frame-Options` (via Helmet defaults)
- `Permissions-Policy` can be tightened if needed

Review CSP `connect-src`, `img-src`, `script-src` when adding third-party integrations.

## CSRF, CORS, and rate limiting

| Control | Where | Notes |
| --- | --- | --- |
| **CSRF** | `middleware/csrf.js` + `routes/v1/index.js` | Applied to all non-GET `/api/v1` routes **except** paths starting with `/track`. Mutating requests must include CSRF token. |
| **Global CORS** | `app.js` | Permissive with credentials (`origin: callback(null,true)` in the shown config) — acceptable if paired with auth + CSRF + tracking-specific CORS. Review if you restrict dashboard origins. |
| **Tracking CORS** | `middleware/trackingCors.js` | Tighter rules for `/api/track/*` to prevent cross-site abuse. |
| **Rate limiting** | `middleware/rateLimiter.js` + applied to tracking/auth-prone routes | Uses `express-rate-limit`. Configure stores/limits per environment. |

## Secrets and environment variables

- **Never commit secrets**: `.env`, `.env.*`, keys, tokens excluded by `.gitignore`.
- **Frontend**: only `VITE_*` exposed. Never put `SUPABASE_SERVICE_KEY`, `JWT_SECRET`,
  OAuth secrets in frontend.
- **Backend validation**: `backend/src/config/env.js` reads `.env` and fails fast if
  required vars missing (`JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`).
- **Rotation**: rotate `JWT_SECRET` and service keys with care (invalidates sessions).
- **Scanning**: gitleaks runs in CI (`.github/workflows/security.yml`) to catch accidental leaks.
- **Push protection**: enable in GitHub repo settings.

See `.env.example` files for the full list.

## Database security (Supabase/RLS)

- **RLS enabled**: on tables holding user/project/analytics data (migration 005).
- **Policies**: users can only access data for projects they belong to; profiles limited
  to self; notifications limited to self.
- **Service role bypass**: tracking ingestion uses `SUPABASE_SERVICE_KEY` server-side to
  insert analytics rows — this bypasses RLS and is intentional. **Never** expose this
  key client-side.
- **Least privilege**: prefer anon key on client, service key only on backend.
- **Migrations**: reviewed manually; never auto-deployed. Additive preferred.
- **Backups**: rely on Supabase backups/point-in-time recovery per your plan.

## Data collection and privacy

- **Minimal data**: page, referrer, derived geo (country/city from IP), UA-derived
  browser/OS/device, timestamps.
- **IP handling**: `geoip-lite` maps IP to location. If you need stronger privacy, consider
  truncating IPs or disabling city-level precision.
- **No PII by default**: avoid sending emails/names/tokens via tracker. Those go through
  authenticated flows.
- **Retention**: `project_settings.retention_days` (default 365). Implement deletion jobs
  if you need to enforce shorter retention.
- **DNT**: `project_settings.respect_dnt` exists; the app can honor Do Not Track if
  implemented in tracker logic.
- **Anonymization**: `project_settings.anonymize_ip` exists as a hook.
- **Transparency**: update your Privacy Policy before production use.

## Dependency management

- **npm ci** in CI with lockfiles ensures reproducible installs.
- **Dependabot**: runs weekly for npm (frontend/backend) and GitHub Actions
  (`.github/dependabot.yml`). Creates grouped minor/patch PRs.
- **Dependency review**: `.github/workflows/dependency-review.yml` fails PRs introducing
  dependencies with known high/critical vulnerabilities.
- **npm audit**: `security.yml` runs `npm audit --omit=dev --audit-level=high` for both
  workspaces on push/PR/schedule.
- **CodeQL**: static analysis for JavaScript/TypeScript on push/PR/schedule.

Review and merge dependency PRs promptly, especially security-related ones.

## CI/CD security

- **Minimal permissions**: workflows use least-privilege `permissions` blocks
- **Pinned actions**: prefer major-version pins (`@v4/@v3/@v2/@v9`) from trusted
  publishers (actions/*, github/codeql-action, softprops/*, gitleaks/*)
- **Concurrency**: CI cancels in-progress runs on new pushes
- **No secrets in logs**: avoid echoing env vars
- **Separate release**: `release.yml` only builds and publishes a GitHub Release; does
  **not** deploy migrations or push to production
- **Stale bot**: excludes `security` and roadmap labels from auto-close

## Operational security

- **Logs**: avoid logging full request bodies (especially tracking payloads), tokens, or
  keys. Redact in error logs.
- **Error handling**: centralized error handler returns generic messages in production
  where appropriate; stack traces not leaked to clients.
- **Cookies**: in production use `secure`, `httpOnly`, `sameSite` as appropriate.
- **CSP reporting** (optional): add `report-uri`/`report-to` if you want alerts.
- **Rate limit tuning**: adjust for real traffic; use a distributed store (Redis) if
  scaling horizontally.
- **Backpressure**: Socket.IO and HTTP timeouts should be reasonable.

## Known gaps / future hardening

- **Distributed rate limiting**: in-memory store won't work across multiple backend
  instances. Consider Redis.
- **Request body size limits**: ensure `express.json()` has a reasonable `limit`.
- **IP anonymization**: implement truncation (e.g. /24 for IPv4) if GDPR requires.
- **Content Security Policy**: tighten `script-src` (avoid `'unsafe-inline'` if possible)
  and add `upgrade-insecure-requests` in production.
- **HSTS preload**: enable only after stable HTTPS.
- **Security headers**: consider `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`,
  `Origin-Agent-Cluster`.
- **Automated dependency updates**: Dependabot is configured; also consider
  `npm audit fix` in a controlled workflow.
- **Secrets scanning**: gitleaks exists; also consider GitHub Advanced Security features
  if available.

Contributions that improve security are especially welcome. Follow
[CONTRIBUTING.md](../CONTRIBUTING.md) and report vulnerabilities privately.
