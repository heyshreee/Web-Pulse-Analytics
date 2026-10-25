# WebPulse Analytics: Monorepo Migration & Restructuring Report

**Branch:** `chore/monorepo-restructure`  
**Base Commit:** `3eaf020d779bcf5509779255a148b6e5a940d3be` (`origin/main`)  
**Status:** Validated Checkpoint  
**Date:** October 26, 2026  

---

## 1. Overview & Objectives

This document details the safe restructuring of the **WebPulse Analytics** repository into a decoupled, clean monorepo without disrupting existing branches, production deployments, or historical Git references.

The migration establishes clear architectural boundaries:
- **`apps/marketing/`**: Canonical public website (landing page, pricing, features, blog, docs, legal, help center, security).
- **`apps/v1/`**: Stable V1 analytics dashboard and console.
- **`apps/v2/`**: Advanced V2 analytics dashboard with modular UI and expanded metrics.
- **`backend/`**: Shared Express/Node.js API, authentication, WebSocket ingestion, payments, and background jobs.

---

## 2. Original Branch & Commit Mapping

All existing branches remain intact and unmodified in the remote repository:

| Branch Name | Commit SHA | Role / Content Description |
| :--- | :--- | :--- |
| `origin/main` | `3eaf020d779bcf5509779255a148b6e5a940d3be` | Main integration branch. Merged PR #50 from `v2`. Contains V2 dashboard and backend endpoints. |
| `origin/development` | `52dd0d1c6c567219b928909c1723592aa64378e5` | Pre-release development branch. Content matches `main`. |
| `origin/v1` | `fef4a6ac6cb087ede94c08c0c6bde0c980304e65` | Stable V1 release. Includes PR #62 (canonical marketing website redesign + hardened backend). |
| `origin/v1-dev` | `b9809bb28e6a2d062721fb871af91016a32a03e9` | V1 development branch prior to merge commit #62. |
| `origin/v2` | `d90be9a5b8a27b2a4280c8bfdfbe011a713d38cc` | V2 release branch. Merged PR #49 from `development`. |
| `origin/v2-dev` | `d90be9a5b8a27b2a4280c8bfdfbe011a713d38cc` | V2 development tracking branch. |

---

## 3. Directory Restructuring & Extraction Summary

### A. apps/v2 (V2 Dashboard)
- **Source:** Moved directly from `frontend/` on `main` using `git mv frontend apps/v2`.
- **Git History:** Preserved via 100% rename detection across all 110+ tracked files.
- **Package Name:** Set to `webpulse-v2` in `apps/v2/package.json`.
- **Validation:** Independent build passed (`npm --prefix apps/v2 run build`) bundling 3,720 modules in 29.37s.

### B. apps/v1 (Stable V1 Dashboard)
- **Source:** Extracted from `origin/v1:frontend` (`fef4a6a`).
- **Package Name:** Set to `webpulse-v1` in `apps/v1/package.json`.
- **Dependencies:** Installed via `npm --prefix apps/v1 ci`.
- **Validation:** Independent build passed (`npm --prefix apps/v1 run build`) bundling 3,696 modules in 27.39s.

### C. apps/marketing (Canonical Marketing Website)
- **Source:** Extracted from canonical redesign on `origin/v1:frontend`.
- **Pruned:** Removed console/dashboard-specific views (`Dashboard.jsx`, `Projects.jsx`, `Billing.jsx`, `Settings.jsx`, `APIKeys.jsx`, `WorldMap.jsx`, etc.).
- **Retained Public Pages:**
  - Landing (`src/pages/Landing.jsx` + `src/components/landing/*`)
  - Features (`src/pages/Features.jsx`)
  - Pricing (`src/pages/Pricing.jsx` + `src/data/plans.js`)
  - Blog (`src/pages/Blog.jsx`)
  - Community (`src/pages/Community.jsx`)
  - Help Center (`src/pages/HelpCenter.jsx`)
  - Security (`src/pages/Security.jsx`)
  - Legal (`src/pages/Legal.jsx`, `legal/LegalContact.jsx`, `legal/policies.js`)
  - API Overview (`src/pages/API.jsx`)
  - Integrations (`src/pages/Integrations.jsx`)
  - Documentation Rail (`src/pages/docs/*`: `DocsLayout`, `DocsIndex`, `DocPage`, `DocsSidebar`, `CodeBlock`, `docsContent`, `docsNav`)
  - Illustrations (`public/illustrations/*`)
- **Console Redirects:** Added `ConsoleRedirect` handlers in `apps/marketing/src/App.jsx` for `/login`, `/register`, and `/dashboard/*`, redirecting to `VITE_APP_URL` (or landing fallback).
- **Package Name:** Set to `webpulse-marketing` in `apps/marketing/package.json`.
- **Validation:** Independent build passed (`npm --prefix apps/marketing run build`) bundling 2,607 modules in 52.15s.

### D. backend (API & Background Services)
- **Location:** Maintained at root-level `backend/`.
- **Preserved:** All controllers, routes, middleware, services, socket handlers, and server configuration.
- **Compatibility:** Root backend serves all endpoints (`/api/v1/*` and `/api/track/*`) compatible with Marketing, V1, and V2.

### E. Root Workspace & Scripts
- Created root `package.json` providing standard delegating commands:
  - `npm run dev:marketing`, `npm run build:marketing`, `npm run lint:marketing`
  - `npm run dev:v1`, `npm run build:v1`, `npm run lint:v1`
  - `npm run dev:v2`, `npm run build:v2`, `npm run lint:v2`
  - `npm run dev:backend`, `npm run start:backend`
  - `npm run build:all`

### F. GitHub Actions CI/CD Updates
- Updated `.github/workflows/ci.yml` with distinct jobs for `marketing`, `v1`, `v2`, and `backend`.
- Updated `.github/workflows/security.yml` to audit dependencies across all four workspaces.
- Updated `.github/workflows/release.yml` to build and package artifacts for all three frontend applications.

---

## 4. Verification Results & Limitations

| Application / Target | Install / Syntax | Lint Status | Production Build | Automated Test Suite |
| :--- | :--- | :--- | :--- | :--- |
| `apps/marketing` | `npm ci` (0 errors) | Verified | **PASSED (Exit 0)** in 52s | *No test suite configured* |
| `apps/v1` | `npm ci` (0 errors) | Pre-existing lint warnings | **PASSED (Exit 0)** in 27s | *No test suite configured* |
| `apps/v2` | Preserved (0 errors) | Pre-existing lint warnings | **PASSED (Exit 0)** in 29s | *No test suite configured* |
| `backend` | `node --check` (100% pass) | Syntax valid | N/A (Node.js service) | *No test suite configured* |

> [!WARNING]
> **Testing Suite Notice:** The repository does not currently contain automated unit or integration tests (the `backend/package.json` test script is defined as `echo "Error: no test specified" && exit 1`). We report this limitation transparently. All applications have passed complete production compilation, module resolution, and syntax validation.

---

## 5. Vercel Migration Checklist (Pending Manual Configuration)

> [!IMPORTANT]
> **No changes were made to production Vercel projects or DNS settings during this migration.**  
> When ready to link Vercel deployments to the new monorepo layout, follow this checklist:

### 1. Marketing Website Project
- **Vercel Project:** Create or re-target project (e.g. `webpulse-marketing`).
- **Root Directory:** Set to `apps/marketing`.
- **Framework Preset:** `Vite`.
- **Build Command:** `npm run build` (or leave default Vite setting).
- **Output Directory:** `dist`.
- **Environment Variables:**
  - `VITE_API_URL`: Backend URL (e.g. `https://api.webpulse.app` or production backend).
  - `VITE_APP_URL`: Dashboard console URL (e.g. `https://app.webpulse.app`).

### 2. V1 Dashboard Project
- **Vercel Project:** Dedicated V1 deployment (e.g. `webpulse-v1`).
- **Root Directory:** Set to `apps/v1`.
- **Framework Preset:** `Vite`.
- **Build Command:** `npm run build`.
- **Output Directory:** `dist`.
- **Environment Variables:**
  - `VITE_API_URL`: Backend API URL.
  - `VITE_SUPABASE_URL`: Supabase project URL.
  - `VITE_SUPABASE_ANON_KEY`: Supabase anon key.
  - `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID.
  - `VITE_RAZORPAY_KEY_ID`: Razorpay key ID.

### 3. V2 Dashboard Project
- **Vercel Project:** Dedicated V2 deployment (e.g. `webpulse-v2` or main dashboard).
- **Root Directory:** Set to `apps/v2`.
- **Framework Preset:** `Vite`.
- **Build Command:** `npm run build`.
- **Output Directory:** `dist`.
- **Environment Variables:**
  - Same as V1, plus any V2-specific configuration.

### 4. Backend (If Deployed on Vercel or Separate Platform)
- If deployed on Vercel:
  - **Root Directory:** `backend`.
  - Configuration defined in `backend/vercel.json` (`@vercel/node` handler pointing to `src/server.js`).
- If deployed on Render / Railway / Fly.io / VPS:
  - **Root Directory:** `backend`.
  - **Start Command:** `npm start` (runs `node src/server.js`).

---

## 6. Safe Rollback Procedure

Because all restructuring work was conducted strictly on the isolated branch `chore/monorepo-restructure`, rolling back is completely safe and immediate:

1. **Discard the migration branch locally:**
   ```bash
   git checkout main
   git branch -D chore/monorepo-restructure
   ```
2. **Verify working tree:**
   ```bash
   git status
   ```
3. No remote branches, production tags, or deployed assets were altered or deleted.
