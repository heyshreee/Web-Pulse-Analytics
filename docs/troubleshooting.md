# Troubleshooting

Common issues and how to resolve them when running or deploying Web Pulse Analytics
locally/production.

- [Local development](#local-development)
- [Tracking / ingestion](#tracking--ingestion)
- [Authentication & sessions](#authentication--sessions)
- [Socket.IO / real-time](#socketio--real-time)
- [Supabase / database](#supabase--database)
- [Frontend build/lint](#frontend-buildlint)
- [Backend errors](#backend-errors)
- [Production deployment](#production-deployment)
- [Getting more help](#getting-more-help)

## Local development

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Missing required environment variable: JWT_SECRET` | Backend `.env` missing vars | Copy `backend/.env.example` to `.env` and fill required values |
| Frontend can't reach backend | Wrong `VITE_API_URL` | Set `VITE_API_URL=http://localhost:5000` in `frontend/.env` |
| Port already in use (5000/5173) | Another process bound | Change `PORT` in backend `.env` or `vite --port` |
| CORS errors in browser console | `FRONTEND_URL` mismatch or global CORS | Ensure `FRONTEND_URL=http://localhost:5173` in backend `.env`; restart backend |

## Tracking / ingestion

| Symptom | Cause | Fix |
| --- | --- | --- |
| Script 404: `/api/track/:id/script.js` | Wrong tracking ID or backend URL | Verify project exists and use correct ID; curl the URL directly |
| Events not recorded | Origin/referrer rejected | Check `trackingCors` middleware; test from an allowed origin; ensure domain matches project config |
| CORS preflight fails on `POST /api/track/:id` | Browser request from disallowed origin | Add your test domain to allowed origins or test from same origin; see [tracking-guide.md](tracking-guide.md) |
| SPA routes not tracked | Script only fires on load | Fire a manual `POST /api/track/:trackingId` on route changes with `{ "page": location.pathname }` |
| Rate limited (429) | Too many requests | Wait/retry; tune `express-rate-limit` in dev if needed |

## Authentication & sessions

| Symptom | Cause | Fix |
| --- | --- | --- |
| Login returns 401/403 | Wrong credentials or account not verified | Check Supabase Auth/users; verify email if enabled |
| CSRF errors on mutating requests | Missing/invalid CSRF token | Frontend must send CSRF token for non-GET v1 routes (except `/track`). Clear cookies and retry |
| Logged out immediately | `JWT_SECRET` changed or cookies not sent | Keep `JWT_SECRET` stable; ensure `credentials: 'include'` in fetch; check `secure` flag (use `false` on http://localhost) |
| Google OAuth fails | `VITE_GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` misconfigured | Match redirect URIs in Google Cloud Console to backend/frontend URLs |

## Socket.IO / real-time

| Symptom | Cause | Fix |
| --- | --- | --- |
| Dashboard shows "disconnected" | Socket can't connect to backend | Check `VITE_API_URL` is correct; backend CORS allows frontend origin; WebSocket allowed through proxy/firewall |
| Live visitors don't update | Not joined to project room or events not emitted | Ensure tracking event was ingested; check `visitorSocket.js` handlers and `global.io` usage |
| 400 during handshake | CORS blocked | Update Socket.IO CORS whitelist in `server.js` to include your frontend origin |
| Reconnects constantly | Proxy dropping WS | Use `wss://` in production behind HTTPS; disable buffering on proxy (e.g. nginx `proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade;`) |

## Supabase / database

| Symptom | Cause | Fix |
| --- | --- | --- |
| `relation does not exist` | Migrations not applied | Apply migrations in order via Supabase CLI or SQL Editor |
| RLS blocks reads/writes | Missing policies or using anon key client-side for writes | Writes to analytics happen server-side with `SUPABASE_SERVICE_KEY`. Client must use anon key only for allowed queries; verify policies |
| `permission denied for schema public` | Service key role incorrect | Use `SUPABASE_SERVICE_KEY` (service_role) on backend, never anon |
| Duplicate key / unique constraint | Backfill or ID collision | Check migration backfill logic; don't edit applied migrations — add a new one |
| Slow analytics queries | Missing indexes | Verify indexes from migration 003 exist; run `EXPLAIN ANALYZE` on slow queries |

## Frontend build/lint

| Symptom | Cause | Fix |
| --- | --- | --- |
| `npm run lint` fails | ESLint errors/warnings | Fix reported issues. The config is flat (`eslint.config.js`); some rules relaxed (see config) |
| `npm run build` fails | Type/import errors or chunk size | Check console output; fix imports; adjust `build.chunkSizeWarningLimit` only if justified |
| Blank page after build | SPA fallback missing | Configure host to serve `index.html` for all routes (history API fallback) |
| Env vars missing at runtime | Using `VITE_*` incorrectly | `VITE_*` are baked at build time; rebuild after changing `.env` |

## Backend errors

| Symptom | Cause | Fix |
| --- | --- | --- |
| `AppError` with message | Expected business logic failure | Read message; check auth/project ownership/validation |
| Unhandled `ValidationError` | Payload doesn't match validators | Validate shape against [api-reference.md](api-reference.md) and [tracking-guide.md](tracking-guide.md) |
| `ECONNREFUSED` connecting to Supabase | Wrong URL/key or network | Verify `SUPABASE_URL`/`SUPABASE_SERVICE_KEY`; check firewall/VPN |
| Memory/heap warnings | Large query results | Add pagination/limits; avoid loading all rows; check `created_at` filters |

## Production deployment

| Symptom | Cause | Fix |
| --- | --- | --- |
| Mixed content (http/https) | `VITE_API_URL` or `FRONTEND_URL` uses http | Use `https://` for both in production |
| Cookies not set | `secure` true on http or `sameSite` wrong | In production `NODE_ENV=production` sets secure cookies; must serve over HTTPS |
| CSP blocks resources | Missing domains in `connect-src`/`img-src` | Update CSP in `backend/src/app.js` for your CDNs/domains |
| WebSocket fails behind proxy | No WS upgrade headers | Configure proxy (nginx/Cloudflare) to pass `Upgrade`/`Connection: upgrade` and use HTTP/1.1 |
| 502/504 from backend | Cold start or timeout | Check host logs; increase timeout; ensure `npm start` works; verify `PORT` binding |
| Migrations missing in prod | Forgot manual apply | Apply migrations via CLI/SQL Editor before/after deploy (never auto-applied) |

## Getting more help

- Read the docs: [getting-started.md](getting-started.md), [architecture.md](architecture.md),
  [api-reference.md](api-reference.md), [tracking-guide.md](tracking-guide.md),
  [database-schema.md](database-schema.md), [deployment.md](deployment.md), [security.md](security.md)
- Contributing/setup questions: [CONTRIBUTING.md](../CONTRIBUTING.md)
- Usage/support: [SUPPORT.md](../SUPPORT.md)
- Bugs/features: open an issue via [GitHub Issues](https://github.com/heyshreee/Web-Pulse-Analytics/issues)
- Security: private reporting only via [SECURITY.md](../SECURITY.md)

Include reproduction steps, logs (redacted), environment details, and commit SHA when
reporting issues.
