# Contributing to Web Pulse Analytics

Thanks for your interest in improving Web Pulse Analytics! This guide explains how to
set up the project, how we work, and what we expect from contributions.

Web Pulse Analytics is an early-stage project. We take correctness, security, and
reviewable history seriously, and we would rather merge a small, well-tested change
than a large, unclear one.

- [Ways to contribute](#ways-to-contribute)
- [Code of Conduct](#code-of-conduct)
- [Project layout](#project-layout)
- [Local setup](#local-setup)
- [Branching and release lines](#branching-and-release-lines)
- [Making a change](#making-a-change)
- [Testing and quality checks](#testing-and-quality-checks)
- [Commit and PR conventions](#commit-and-pr-conventions)
- [Security-sensitive areas](#security-sensitive-areas)
- [Database changes](#database-changes)
- [Getting help](#getting-help)

## Ways to contribute

- **Report a bug** — use the [bug report form](https://github.com/heyshreee/Web-Pulse-Analytics/issues/new?template=bug_report.yml).
- **Request a feature** — use the [feature request form](https://github.com/heyshreee/Web-Pulse-Analytics/issues/new?template=feature_request.yml).
- **Report a vulnerability** — **privately**, per [SECURITY.md](./SECURITY.md). Never in a public issue.
- **Improve docs** — docs live in [`docs/`](docs/) and alongside code in each package.
- **Write code** — look for [`good first issue`](https://github.com/heyshreee/Web-Pulse-Analytics/labels/good%20first%20issue) or `help wanted` labels.

## Code of Conduct

By participating, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).
Please read it before interacting with the project.

## Project layout

```
web-pulse/
├── apps/
│   ├── marketing/    # Public site: landing, pricing, features, blog, docs, legal
│   ├── v1/           # Stable V1 dashboard (independent React/Vite app)
│   └── v2/           # V2 dashboard (independent React/Vite app)
├── backend/          # Express 5 API, Socket.IO, services, Supabase access
├── supabase/         # SQL migrations (schema, functions, RLS policies)
├── scripts/          # Repository maintenance/check scripts
├── docs/             # Project documentation
└── .github/          # Workflows, issue/PR templates, CODEOWNERS, dependabot
```

Each application has its own `package.json` and lockfile. The root `package.json`
provides convenience scripts only; it does **not** define npm workspaces. Install
dependencies inside the app you are changing.

The backend is a long-lived Node.js service (Socket.IO, scheduled cleanup,
`geoip-lite` local database). It is not designed to run as a Vercel serverless
function; see [docs/deployment.md](docs/deployment.md).

## Local setup

### Prerequisites

- **Node.js 20+** (Node 22 LTS recommended) and npm
- A **Supabase** project (Postgres) for the database
- Optional integrations (only needed for the features that use them): Razorpay,
  Google OAuth, Cloudinary, Resend, Telegram

### 1. Install dependencies

Install only what you need:

```bash
# Backend
cd backend && npm install

# One or more frontends
cd ../apps/marketing && npm install
cd ../apps/v1 && npm install
cd ../apps/v2 && npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env        # then fill in real values
cp apps/marketing/.env.example apps/marketing/.env
cp apps/v1/.env.example apps/v1/.env
cp apps/v2/.env.example apps/v2/.env
```

Use the `.env.example` files as the source of truth for variable **names**. Never commit
real values. Backend variables are validated in `backend/src/config/env.js`.

`VITE_API_URL` accepts a bare origin, an `/api` base, or an `/api/v1` base. The
examples use `http://localhost:5000/api`.

### 3. Run the apps

```bash
# Terminal 1
npm run dev:backend       # http://localhost:5000

# Terminal 2 — pick a dashboard
npm run dev:v1            # http://localhost:5173
# or
npm run dev:v2            # http://localhost:5173

# Optional, alongside either dashboard
npm run dev:marketing     # http://localhost:5174
```

V1 and V2 both default to port `5173`. Run one at a time, or override the port:

```bash
npm --prefix apps/v1 run dev -- --port 5175
```

### 4. (Optional) Apply the database schema

Database migrations live in `supabase/migrations/`. See
[docs/database-schema.md](docs/database-schema.md) for how to apply them in your own
Supabase project. Migrations are never applied automatically by CI or a release.

## Branching and release lines

We keep V1 and V2 source separate so ongoing V2 work cannot destabilize the V1
release.

| Branch | Purpose |
| --- | --- |
| `main` | Latest reviewed, stable integrated release |
| `development` | Integration branch for day-to-day work |
| `v1` | Stable V1 release line |
| `v1-dev` | V1 development |
| `v2` | V2 release line |
| `v2-dev` | V2 development |

Rules:

- **Do not merge V1 and V2 source into each other.** Each app under `apps/` is the
  source of truth for its release line.
- Target V1 fixes at the V1 line (`v1`/`v1-dev`) and V2 work at the V2 line
  (`v2`/`v2-dev`). Use `development` for shared/tooling work.
- Never commit directly to `main`.
- Keep all existing branches; do not rewrite history or force-push.

Create a branch from the line you are targeting:

```bash
git checkout v1-dev
git checkout -b fix/tracking-origin-check
```

### Branch naming

```
feature/<short-name>       # new functionality
fix/<short-name>           # bug fixes
refactor/<short-name>      # internal changes, no behavior change
docs/<short-name>          # documentation
db/<short-name>            # migrations / schema
security/<short-name>      # security hardening
```

## Making a change

1. **Find or open an issue.** For anything non-trivial, discuss it first so we can agree
   on scope and the target release line.
2. **Branch** from the correct base (see above).
3. **Keep it focused.** One logical change per PR; small PRs get reviewed faster.
4. **Match existing style.** Follow the surrounding code and the ESLint config.
5. **Add tests when the change is testable.** If a test framework is not configured for
   the area you touched, describe how you verified the change instead (see below).
6. **Run the checks** locally before pushing.
7. **Open a pull request** using the template and link the issue (`Closes #123`).

## Testing and quality checks

Run the checks that exist for the package you changed. Do not skip them.

### Frontends (`apps/marketing`, `apps/v1`, `apps/v2`)

```bash
npm --prefix apps/marketing run lint
npm --prefix apps/marketing run build

npm --prefix apps/v1 run lint
npm --prefix apps/v1 run build

npm --prefix apps/v2 run lint
npm --prefix apps/v2 run build
```

From the repository root you can run all frontend checks at once:

```bash
npm run lint:all
npm run build:all
```

A component/unit test runner is **not yet configured** for any frontend app. If you add
one, wire it into `.github/workflows/ci.yml` and document the command here.

### Backend (`backend/`)

```bash
npm run check:backend   # node --check across backend/src
npm run test:backend    # node:test smoke tests (boot, health, 404)
```

The backend test suite is currently a small smoke test, not comprehensive coverage. If
you change a route or service, also start the server and exercise the affected flow.
The test takes longer on slow or network-mounted disks because `geoip-lite` loads its
local database at import time.

If you introduce a broader test framework, update `backend/package.json` and CI in the
same PR.

### What CI checks

`.github/workflows/ci.yml` has four independent jobs: marketing, V1, V2, and backend.
The frontend jobs run `npm ci`, lint, build, and upload `dist`; the backend job runs
`npm ci`, the syntax checker, and `npm test`. Security workflows run `npm audit`,
CodeQL, and gitleaks. A PR cannot merge while a required check is failing.

## Commit and PR conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <summary>
```

Common types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `security`.

Examples:

```
feat(analytics): add date-range filter to traffic aggregation
fix(tracking): reject requests with a mismatched Origin
docs(api-reference): document the /track ingest payload
security(auth): enforce project ownership on stats endpoints
```

In your PR description, always include:

- **What** changed and **why**
- **How** you tested it (commands and/or scenarios)
- Whether **database migrations** are involved
- Whether it targets **V1**, **V2**, the marketing site, or shared tooling

## Security-sensitive areas

Changes touching any of the following require review from a code owner and must be
called out explicitly in the PR:

- Authentication and authorization (`backend/src/middleware/`, `auth.controller.js`)
- Tracking ingestion (untrusted public input): `visitor.controller.js`,
  `routes/v1/track.routes.js`, `trackingCors.js`
- Database schema, RLS policies, and migrations (`supabase/`)
- CI, release, and security workflows (`.github/workflows/`)

Never:

- Commit secrets, `.env` files, tokens, or credentials.
- Include real visitor data or PII (redact logs and screenshots).
- Loosen authentication, authorization, CORS, CSRF, or rate limiting without review.
- Disable a failing check or add `continue-on-error` just to make CI green.

See [SECURITY.md](SECURITY.md) and [docs/security.md](docs/security.md).

## Database changes

- Migrations are **additive by default** and live in `supabase/migrations/`.
- Follow the existing timestamped naming convention.
- **RLS is mandatory** for any table that stores user or visitor data; add policies in
  the same migration as the table.
- Never edit an already-applied migration; add a new one.
- Migrations are **never** auto-deployed by CI or the release workflow.

See [docs/database-schema.md](docs/database-schema.md).

## Getting help

- Usage questions → [SUPPORT.md](SUPPORT.md)
- Bugs and features → GitHub issues
- Security → private reporting only ([SECURITY.md](SECURITY.md))

By contributing, you agree that your contributions are licensed under the project's
[MIT License](LICENSE).
