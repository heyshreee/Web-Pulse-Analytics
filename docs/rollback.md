# WebPulse Analytics — Rollback & Disaster Recovery Procedures

This runbook establishes rapid, deterministic rollback procedures for all WebPulse Analytics services: static frontends (`marketing`, `v1`, `v2`), the persistent Node.js `backend`, and the `supabase` database.

---

## 1. Rollback Decision Matrix

| Severity | Impact | Primary Action | Target Resolution |
|---|---|---|---|
| **P0 (Critical Outage)** | Production API down, auth failing, data corruption risk | Immediate provider rollback to previous known-good deployment | < 5 minutes |
| **P1 (Major Degradation)** | Key dashboard route broken, tracking ingest impaired | Instant frontend rollback / backend service restart | < 15 minutes |
| **P2 (Minor / Cosmetic)** | Visual flaw, non-blocking bug in V2 Beta | Forward fix via standard PR and CI/CD promotion | Normal release cycle |

---

## 2. Frontend Rollback Procedures (Vercel)

Because `apps/marketing`, `apps/v1`, and `apps/v2` are independent Vite single-page applications deployed to Vercel, rollbacks can be executed in seconds.

### Option A: Instant Vercel Dashboard Rollback (Fastest)

1. Navigate to the respective Vercel project:
   - Marketing: `webpulse-marketing`
   - Stable Dashboard: `webpulse-v1`
   - Beta Dashboard: `webpulse-v2`
2. Go to the **Deployments** tab.
3. Locate the previous successful deployment (verified with green status).
4. Click the three dots (`...`) menu → Select **Promote to Production** (or **Rollback to this Deployment**).
5. Vercel instantly routes edge traffic to the selected deployment without rebuilding.

### Option B: GitHub Actions Workflow Dispatch

You can redeploy any previous commit directly via GitHub Actions:

1. In GitHub, go to **Actions** → **Deploy Orchestrator** (or app-specific workflow, e.g. **Deploy V1 Dashboard**).
2. Click **Run workflow**:
   - **Use workflow from**: Select the release commit or branch.
   - **Target GitHub Environment**: `production` (or `beta`).
   - **Target Application**: Select the affected application (e.g. `v1`).
3. Click **Run workflow**. The deployment pipeline will pull the specified commit, build, and deploy.

### Option C: Git Revert (Traceable History)

If the rollback needs to be permanently reflected in Git:

```bash
git checkout main
git pull origin main

# Create a revert commit of the faulty merge or commit
git revert -m 1 <MERGE_COMMIT_SHA>  # or git revert <COMMIT_SHA>

# Push to trigger automated deployment to production environment
git push origin main
```

---

## 3. Backend Rollback Procedures (Persistent Node.js)

The backend runs an Express 5 and Socket.IO server on a persistent hosting platform (Render, Railway, Fly.io, or VPS).

### On Render
1. Open the Render Dashboard → Select WebPulse Backend service.
2. Go to **Events** or **Deploys**.
3. Select the previous successful deploy.
4. Click **Rollback** to instantly activate the previous container image.

### On Railway
1. Open Railway project dashboard → Select backend service.
2. In the **Deployments** tab, find the previous successful deployment.
3. Click `...` → **Rollback to this deployment**.

### On Docker / VPS
If managed via Docker Compose or systemd:
```bash
# Pull or checkout previous known-good release tag
git checkout v1.0.0
docker compose down
docker compose up -d --build
```

---

## 4. Database Rollback Policy (Supabase Postgres)

> [!CAUTION]
> **Strict Database Migration Policy**:
> 1. Database migrations in `supabase/migrations/` are **never** executed automatically by CI/CD.
> 2. **Never** run destructive `DROP DATABASE`, `DROP SCHEMA`, or `DROP TABLE` commands in production.
> 3. **Fix Forward**: Standard practice is to author an additive, forward-fixing migration (e.g. `YYYYMMDDHHMMSS_fix_table_attribute.sql`) rather than attempting a reverse migration.

### In the Event of Schema Errors:
1. **Identify the Issue**: Check Supabase Dashboard → **Logs** → **Postgres Logs** or API error logs.
2. **Draft Forward Migration**: Write an additive SQL script that restores compatibility or relaxes constraining checks.
3. **Point-in-Time Recovery (PITR)**:
   - In catastrophic scenarios involving data loss or severe corruption, utilize Supabase Point-in-Time Recovery (PITR) to restore the database to a timestamp immediately prior to the incident:
   - Supabase Dashboard → **Project Settings** → **Database** → **Backups** → **Point-in-time Recovery**.

---

## 5. Post-Rollback Verification Checklist

Following any rollback execution, run the following verification steps:

- [ ] **Frontend Accessibility**: Verify that `https://webpulseanalytics.tech`, `https://app.webpulseanalytics.tech`, and `https://beta.webpulseanalytics.tech` load cleanly with HTTP 200.
- [ ] **No Console Errors**: Open browser DevTools; verify assets, chunks, and CSS bundle load without 404 or MIME-type errors.
- [ ] **Backend Health Check**:
  ```bash
  curl -I https://api.webpulseanalytics.tech/
  ```
  Must return HTTP 200 with JSON status.
- [ ] **Authentication & Cookies**: Log in via V1 dashboard (`https://app.webpulseanalytics.tech/login`). Verify HttpOnly session cookie is granted with `SameSite=None` and `Secure`.
- [ ] **Real-time WebSockets**: Confirm Socket.IO connects without CORS or handshake failure.
- [ ] **Incident Communication**: Notify engineering and stakeholders of recovery status and begin post-mortem documentation.
