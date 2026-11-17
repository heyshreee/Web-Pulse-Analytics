# GitHub Environments Architecture & Configuration

This guide details the GitHub Environments architecture for **WebPulse Analytics**, establishing strict deployment boundaries, branch policies, secret segregation, and manual approval gates modeled after enterprise delivery standards.

---

## 1. Target Environments Overview

WebPulse Analytics employs three isolated GitHub Environments:

| Environment | Purpose | Canonical Branch | Deployment Target & Domain |
|---|---|---|---|
| **`development`** | Preview testing & internal validation | `development` | Ephemeral previews for Marketing, V1, V2, and dev API |
| **`beta`** | V2 Beta Dashboard preview | `beta` | `apps/v2` at `https://beta.webpulseanalytics.tech` |
| **`production`** | Live stable production infrastructure | `main` | Marketing (`webpulseanalytics.tech`), V1 (`app.webpulseanalytics.tech`), Backend (`api.webpulseanalytics.tech`) |

> [!IMPORTANT]
> **Product Hierarchy Guarantee**: `apps/v1` is the designated, stable production dashboard. `apps/v2` is explicitly an opt-in Beta dashboard and must **never** be deployed into the `production` environment. The deployment workflows strictly enforce this guard.
>
> **Branch Architecture Constraint**: `main` is the default repository branch and the sole deployment source for `production`. No separate `production` branch is created.

---

## 2. Environment Protection Rules

To configure protection rules in GitHub:
Navigate to **Settings** → **Environments** in your GitHub repository.

### `production` Environment
- **Deployment branches**: Restrict deployments exclusively to the `main` branch.
  - Rule: Selected branches → Add rule → `main`
- **Required reviewers**: Enable **Required reviewers**.
  - Add repository administrators / senior engineering leads (e.g. `@heyshreee`).
  - Deployments to production will pause until explicitly approved in the Actions UI.
- **Wait timer**: Optional 5-minute wait timer to allow rollback cancellation if upstream anomalies are detected.
- **Prevent self-review**: Enabled (if supported by GitHub plan).

### `beta` Environment
- **Deployment branches**: Restrict deployments exclusively to `beta` branch.
  - Rule: Selected branches → Add rule → `beta`
- **Required reviewers**: Optional (typically automated on merge to `beta`).

### `development` Environment
- **Deployment branches**: Restrict deployments to `development` branch.
  - Rule: Selected branches → Add rule → `development`
- **Required reviewers**: None (fast feedback loop for development preview).

---

## 3. Secret Segregation & Configuration Matrix

Secrets are strictly partitioned across environments. **Never share credentials between `production` and `development`.**

### Secrets Checklist

| Secret Name | Scope | Description |
|---|---|---|
| `VERCEL_TOKEN` | All environments | Vercel Automation Token with deploy permissions |
| `VERCEL_ORG_ID` | All environments | Vercel Team / Account Scope ID |
| `VERCEL_PROJECT_ID_MARKETING` | `development`, `production` | Vercel Project ID for `apps/marketing` |
| `VERCEL_PROJECT_ID_V1` | `development`, `production` | Vercel Project ID for `apps/v1` (Stable) |
| `VERCEL_PROJECT_ID_V2` | `development`, `beta` | Vercel Project ID for `apps/v2` (Beta) |
| `BACKEND_DEPLOY_WEBHOOK_URL` | `production`, `development` | Deploy trigger webhook for persistent Node.js host (Render / VPS) |
| `RAILWAY_TOKEN` | `production`, `development` | Alternative API token if hosting backend on Railway |
| `JWT_SECRET` | Backend Host / Secrets Manager | Strong unique secret per environment |
| `SUPABASE_SERVICE_KEY` | Backend Host / Secrets Manager | Server-only service role key (**NEVER** expose to frontends) |

> [!WARNING]
> Frontend applications only receive `VITE_*` public variables baked at build time. Never provide `SUPABASE_SERVICE_KEY` or `JWT_SECRET` to frontend Vercel projects or workflow steps.

---

## 4. Environment Variables (`vars`)

Environment-level configuration variables can be registered under **Settings** → **Environments** → *[Environment]* → **Environment variables**:

### `production` Variables
```ini
VITE_API_URL=https://api.webpulseanalytics.tech/api
VITE_SOCKET_URL=https://api.webpulseanalytics.tech
VITE_APP_URL=https://app.webpulseanalytics.tech
VITE_V1_APP_URL=https://app.webpulseanalytics.tech
VITE_V2_APP_URL=https://beta.webpulseanalytics.tech
VITE_MARKETING_URL=https://webpulseanalytics.tech
```

### `beta` Variables
```ini
VITE_API_URL=https://api.webpulseanalytics.tech/api
VITE_SOCKET_URL=https://api.webpulseanalytics.tech
VITE_V1_APP_URL=https://app.webpulseanalytics.tech
VITE_V2_APP_URL=https://beta.webpulseanalytics.tech
VITE_MARKETING_URL=https://webpulseanalytics.tech
```

### `development` Variables
```ini
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5173
VITE_V1_APP_URL=http://localhost:5173
VITE_V2_APP_URL=http://localhost:5175
VITE_MARKETING_URL=http://localhost:5174
```

---

## 5. Transitioning from Legacy Vercel Environments

Prior to this architecture, the Vercel GitHub App automatically registered 6 environments:
- `Preview – web-pulse-analytics`
- `Preview – web-pulse-analytics-backend`
- `Preview – web-pulse-analytics-v1`
- `Production – web-pulse-analytics`
- `Production – web-pulse-analytics-backend`
- `Production – web-pulse-analytics-v1`

### Policy on Historical Records
- **Preserve Deployment History**: In accordance with DevOps governance, **do not delete** existing GitHub deployment history or legacy environments. They document the historical progression of the repository.
- **Disable Automatic Vercel Git Deploys**: In each Vercel Project Dashboard (Marketing, V1, V2):
  1. Go to **Settings** → **Git**.
  2. Under **Connected Git Repository**, ensure that deployment triggers are driven via GitHub Actions, or restrict Production Branch deployments to manual Actions triggers to prevent unreviewed pushes from auto-deploying.
  3. Ensure the backend project on Vercel is decommissioned or detached from Git, as the backend **must not** run on serverless functions.

---

## 6. Manual Setup Guide (GitHub UI)

1. Open your repository on GitHub: `https://github.com/heyshreee/Web-Pulse-Analytics`.
2. Click **Settings** → **Environments**.
3. Click **New environment**:
   - Create `development`
   - Create `beta`
   - Create `production`
4. For each environment, configure the respective **Deployment branches** and **Secrets** as documented in Sections 2 and 3 above.
