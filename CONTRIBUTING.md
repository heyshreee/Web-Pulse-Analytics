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
├── frontend/         # React 19 + Vite single-page app (dashboard + marketing + docs UI)
├── backend/          # Express 5 API, Socket.IO, services, Supabase access
├── supabase/         # SQL migrations (schema, functions, RLS policies)
├── docs/             # Project documentation
└── .github/          # Workflows, issue/PR templates, CODEOWNERS, dependabot
```

## Local setup

### Prerequisites

- **Node.js 20+** (Node 22 LTS recommended) and npm
- A **Supabase** project (Postgres) for the database
- Optional integrations (only needed for the features that use them): Razorpay,
  Google OAuth, Cloudinary, Resend, Telegram

### 1. Install dependencies

```bash
# backend
cd backend && npm install

# frontend
cd ../frontend && npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env      # then fill in real values
cp frontend/.env.example frontend/.env
```

Use the `.env.example` files as the source of truth for variable **names**. Never commit
real values. Backend variables are validated in `backend/src/config/env.js`.

### 3. Run the apps

```bash
# terminal 1
cd backend && npm run dev      # http://localhost:5000

# terminal 2
cd frontend && npm run dev     # http://localhost:5173
```

### 4. (Optional) Apply the database schema

Database migrations live in `supabase/migrations/`. See
[docs/database-schema.md](docs/database-schema.md) for how to apply them in your own
Supabase project.

## Branching and release lines

We keep the stable release and active UI work on separate lines so ongoing redesigns
cannot destabilize users.

| Branch | Purpose |
| --- | --- |
| `main` | Latest reviewed, stable state |
| `v1-stabilization` | Focused fixes that keep the current release stable |
| `v2-ui` | New interface/design work, kept isolated from V1 |
| `development` | Integration branch for day-to-day work |

Rules:

- **Do not merge V2 UI work into V1 branches.** Label and target those PRs with `v2-ui`.
- Open fixes that stabilize the current release against `v1-stabilization`.
- Never commit directly to `main`.

Create a branch from the line you are targeting:

```bash
git checkout v1-stabilization
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

Run the checks that exist for the area you changed. Do not skip them.

### Frontend (`frontend/`)

```bash
npm run lint     # ESLint
npm run build    # production build must succeed
```

A component/unit test runner is **not yet configured** for the frontend. If you add one,
wire it into `.github/workflows/ci.yml` and document the command here.

### Backend (`backend/`)

The backend currently has **no automated test suite** (the `test` script is a
placeholder). Until one exists, verify your change by:

- Starting the server (`npm run dev`) and exercising the affected endpoint.
- Confirming syntax: `find src -name '*.js' -print0 | xargs -0 -n1 node --check`.

If you introduce a test framework, update `backend/package.json` and CI in the same PR.

### What CI checks

`.github/workflows/ci.yml` installs both workspaces, lints and builds the frontend,
syntax-checks the backend, and runs backend tests once a real `test` script exists.
Security workflows run `npm audit`, CodeQL, and gitleaks. A PR cannot merge while a
required check is failing.

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
- **How** you tested it
- Whether **database migrations** are involved
- Whether it targets **V1** or **V2**

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

See [SECURITY.md](SECURITY.md) and [docs/security.md](docs/security.md).

## Database changes

- Migrations are **additive by default** and live in `supabase/migrations/`.
- Follow the existing timestamped naming convention.
- **RLS is mandatory** for any table that stores user or visitor data; add policies in
  the same migration as the table.
- Never edit an already-applied migration; add a new one.
- Migrations are **never** auto-deployed by the release workflow.

See [docs/database-schema.md](docs/database-schema.md).

## Getting help

- Usage questions → [SUPPORT.md](SUPPORT.md)
- Bugs and features → GitHub issues
- Security → private reporting only ([SECURITY.md](SECURITY.md))

By contributing, you agree that your contributions are licensed under the project's
[MIT License](LICENSE).
