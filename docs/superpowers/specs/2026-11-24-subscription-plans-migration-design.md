# Design Document: WebPulse Analytics 5-Tier Subscription Plans Migration

**Date:** 2026-11-24  
**Topic:** Migration from legacy 4-tier model (`free`, `basic`, `pro`, `business`) to new canonical 5-tier architecture (`nano`, `lite`, `pro`, `max`, `enterprise`).  
**Status:** Pending Approval  

---

## 1. Intent and Why

WebPulse Analytics is transitioning to a privacy-first, developer-focused web analytics SaaS platform with 5 commercial subscription tiers and architectural separation of subscription, entitlements, quotas, release access (Stable/Beta/Alpha), and usage enforcement.

To establish the commercial baseline, the entire plan configuration across frontend applications (Marketing, V1, V2), backend services, and database schemas must be updated to the new 5-tier structure immediately.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- Replace legacy plans (`free`, `basic`, `pro`, `business`) with canonical 5 tiers: `nano`, `lite`, `pro`, `max`, `enterprise`.
- Standardize pricing (INR and suggested USD) and resource limits (monthly events, projects, origins, retention, dashboard refresh rates, team members, API access, exports, and live logs) across all touchpoints.
- Ensure 100% backward compatibility for existing user records stored as `free`, `basic`, `pro`, or `business` via alias resolution (`free` -> `nano`, `basic` -> `lite`, `business` -> `max`).
- Synchronize plan data across `apps/marketing`, `apps/v1`, `apps/v2`, `backend` (`payment.controller.js`, `usage.service.js`, `plan.service.js`), and `supabase/development_full_schema.sql`.

### Non-Goals
- Implementing the dynamic database-driven multi-table entitlement engine (`plan_versions`, `plan_entitlements`, `user_entitlements`, etc.) in this initial step. (This is Phase 2 of the roadmap).
- Modifying remote production Supabase instances directly (per repository ground rule #3).
- Building the Alpha invitation or CRM portal in this step.

### Anti-Goals
- Hardcoding `plan === "pro"` shortcuts that block future plan renames or tier expansions.
- Breaking existing user sessions or project creation for accounts that still hold legacy plan IDs.
- Fabricating unverified pricing or limits that deviate from the Product Architecture Blueprint.

---

## 3. Constraints
- **Ground Rule #3 in AGENT.md:** Do not touch `.env` files or execute remote database migrations. Schema updates are made in `supabase/development_full_schema.sql` and migration scripts.
- **Node & Framework Compatibility:** Marketing, V1, and V2 use React + Vite + Tailwind/CSS; backend uses Express 5 + Node 22.
- **Currency:** Primary currency is INR (₹) minor units in Razorpay, with display in INR and suggested USD.

---

## 4. Approaches Considered

| Approach | Description | Pros | Cons | Decision |
|---|---|---|---|---|
| **Approach 1: Canonical Codebase & Schema Migration with Legacy Aliases** | Update canonical plan definitions across Marketing, V1, V2, Backend controllers, Usage services, and Supabase seed data, with fallback normalization for legacy keys. | Fast, cohesive, zero breaking changes for existing users, unifies all 5 tiers immediately across UI and API. | Doesn't yet introduce dynamic DB-driven plan versioning tables. | **ACCEPTED (Option A)** |
| **Approach 2: Heavyweight Multi-Table DB Schema Overhaul First** | Implement `plan_versions`, `plan_entitlements`, and `subscription_items` tables and rewrite all backend queries before updating the frontend. | Purist relational design from day 1. | High friction, breaks current frontend contracts, violates phased roadmap where plan definitions are stabilized first. | REJECTED |
| **Approach 3: Frontend-Only Display Changes** | Only update `apps/marketing` and `apps/v1` pricing text without touching backend enforcement. | Very fast. | Violates blueprint requirement that backend is authoritative; leads to quota/pricing mismatch during checkout. | REJECTED |

---

## 5. Specification: Canonical 5-Tier Model

### Tier Matrix

| Dimension | Nano (Free) | Lite | Pro (Popular) | Max (Power) | Enterprise |
|---|---|---|---|---|---|
| **ID** | `nano` | `lite` | `pro` | `max` | `enterprise` |
| **Price INR** | ₹0 | ₹199 | ₹699 | ₹1,999 | Custom |
| **Price USD** | $0 | $2.49 | $8.99 | $24.99 | Custom |
| **Interval** | Month | Month | Month | Month | Custom / Annual |
| **Monthly Events** | 10,000 (10K) | 100,000 (100K) | 1,000,000 (1M) | 5,000,000 (5M) | Custom / Negotiated |
| **Projects** | 1 | 3 | 10 | 50 | Custom |
| **Origins / Project** | 1 | 3 | 10 | 25 | Custom |
| **Retention** | 7 days | 30 days | 90 days | 365 days (12 mo) | Custom / Negotiated |
| **Refresh Interval** | 60 seconds | 15 seconds | 5 seconds | 1 second | 1 second / Real-time |
| **Team Members** | 1 | 1 | 3 | 10 | Custom |
| **Saved Reports** | Basic | Basic | 5 | Unlimited | Custom |
| **API Access** | Basic | Basic | Full | Full | Custom |
| **Export** | Limited (CSV) | Limited (CSV) | Advanced | Advanced | Custom |
| **Live Logs** | No | No | Yes | Yes | Yes |
| **Ingestion Rate** | 10 EPS | 25 EPS | 100 EPS | 250 EPS | Custom / Dedicated |
| **General API Rate**| 30 / min | 120 / min | 600 / min | 1,800 / min | Custom |
| **Burst Capacity** | 20 | 50 | 200 | 500 | Custom |
| **Release Access** | Stable | Stable | Stable + Beta | Stable + Beta + Alpha (Invite) | Stable + Beta + Alpha |

---

## 6. Detailed Implementation Changes

### 6.1 Shared & Frontend Data Definitions
- **`apps/marketing/src/data/plans.js`**: Update export `plans` to include all 5 tiers with complete badges, limits, descriptions, and CTA types. Add `formatUSD` / currency switch support if needed.
- **`apps/marketing/src/pages/Pricing.jsx`**: Adjust grid rendering to gracefully display the 5 tiers (e.g. 5-column responsive layout or segmented view).
- **`apps/marketing/src/components/landing/PricingTeaser.jsx`**: Feature Nano, Pro, and Max in the 3-card teaser, or render all 5 with Pro highlighted.
- **`apps/v1/src/data/plans.js`**: Update `plans` array and `formatINR` / `getPlanById` functions.
- **`apps/v1/src/pages/Billing.jsx`**: Render the 5 tiers with upgrade action handlers, proper event limits (10K, 100K, 1M, 5M), and retention days.
- **`apps/v2/src/pages/Billing.jsx`**: Replace the static 4-card `PLANS` array with the 5 new tiers matching the rest of the ecosystem.

### 6.2 Backend Services & Controllers
- **`backend/src/services/usage.service.js`**:
  - Update `PLAN_LIMITS` object keys to `nano`, `lite`, `pro`, `max`, `enterprise`.
  - Add alias lookup in `getPlanLimits(planId)`:
    ```js
    const PLAN_ALIASES = { free: 'nano', basic: 'lite', business: 'max' };
    ```
  - Map updated limits: `monthlyViews` (10K, 100K, 1M, 5M), `projectLimit`, `allowedOriginsLimit`, `retentionDays`, `liveLogs`, `refreshRate`.
- **`backend/src/controllers/payment.controller.js`**:
  - Update `getPlans` endpoint to return the 5 plans with exact INR and USD amounts and metadata.
  - In `createOrder`, validate plan selection, handle `nano` as free (error on purchase), `enterprise` as contact sales, and calculate amount in paise for `lite` (19900), `pro` (69900), and `max` (199900).
- **`backend/src/services/plan.service.js`**:
  - Update cached query fallback and column mappings to accommodate new fields (`price_usd`, `price_inr`, `retention_days`, `refresh_rate`).

### 6.3 Database Schema & Seeds
- **`supabase/development_full_schema.sql`**:
  - Update `public.plans` seed data with rows for `nano`, `lite`, `pro`, `max`, `enterprise`.
  - Maintain idempotent `INSERT ... ON CONFLICT (id) DO UPDATE` so schemas are self-healing.
- **`supabase/migrations/20261124000001_update_subscription_plans.sql`**:
  - Provide a clean migration script that inserts or updates the 5 plans and maps any existing legacy user rows.

---

## 7. What's Left to the Builder
- Visual spacing in `Pricing.jsx` for 5 cards on small screens.
- Contact sales link/modal behavior for Enterprise plan.
- Unit and integration tests verification for `npm run test:backend` and frontend builds.
