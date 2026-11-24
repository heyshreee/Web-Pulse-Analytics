# 5-Tier Subscription Plans Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace legacy subscription tiers (`free`, `basic`, `pro`, `business`) with the canonical 5-tier architecture (`nano`, `lite`, `pro`, `max`, `enterprise`) across backend services, database schema seeds, and frontend applications (Marketing, V1, V2).

**Architecture:** Centralize canonical plan limits and aliases in the backend usage/plan services with backward-compatible normalization for legacy account IDs. Expose the 5 tiers via payment API and sync client-side plan catalogues across Marketing and Dashboards so pricing, event limits (10K, 100K, 1M, 5M), origins, and retention periods match the blueprint without drift.

**Tech Stack:** Node.js 22, Express 5, Node native test runner (`node --test`), React, Vite, Tailwind CSS, PostgreSQL / Supabase SQL.

**Spec:** [`docs/superpowers/specs/2026-11-24-subscription-plans-migration-design.md`](file:///f:/codebase/web-pulse/docs/superpowers/specs/2026-11-24-subscription-plans-migration-design.md)

---

## Global Constraints

- **Tiers & Identifiers:** Exactly 5 canonical tiers: `nano`, `lite`, `pro`, `max`, `enterprise`.
- **Pricing:** Nano ₹0 ($0), Lite ₹199 ($2.49), Pro ₹699 ($8.99), Max ₹1,999 ($24.99), Enterprise Custom.
- **Event Limits:** Nano 10,000; Lite 100,000; Pro 1,000,000; Max 5,000,000; Enterprise Custom.
- **Project Limits:** Nano 1; Lite 3; Pro 10; Max 50; Enterprise Custom.
- **Allowed Origins:** Nano 1; Lite 3; Pro 10; Max 25; Enterprise Custom.
- **Retention Days:** Nano 7 days; Lite 30 days; Pro 90 days; Max 365 days; Enterprise Custom.
- **Refresh Rates:** Nano 60s; Lite 15s; Pro 5s; Max 1s; Enterprise 1s.
- **Legacy Aliases:** `free` $\to$ `nano`, `basic` $\to$ `lite`, `business` $\to$ `max`.
- **Repo Ground Rules:** Do not touch `.env` files or execute remote migrations. Never break existing test suites.

## Review Focus

1. **Legacy Plan Fallbacks:** Users with `plan: "free"` or `plan: null` must transparently receive `nano` limits (10,000 views, 1 project) instead of failing or throwing undefined errors.
2. **Payment Order Validation:** Attempting to checkout with `nano` must return 400 Bad Request ("Nano plan cannot be purchased"); checkout with `enterprise` must return 400 Bad Request ("Invalid plan or custom pricing required").
3. **Paise Precision:** Order amounts sent to Razorpay must be exact integer minor units: Lite = 19,900 paise, Pro = 69,900 paise, Max = 199,900 paise.
4. **Quota Alert Consistency:** Ingestion and usage calculations must respect the new monthly view thresholds (10K, 100K, 1M, 5M) without integer overflow.
5. **Frontend Rendering Resilience:** 5-tier pricing grids in Marketing and Dashboards must render cleanly on mobile and desktop without overflowing card boundaries.

---

## Task 1: Backend Plan Limits and Aliases Service

**Files:**
- Modify: `backend/src/services/usage.service.js:5-55`
- Test: `backend/test/plans.test.js`

**Interfaces:**
- Consumes: None
- Produces: `getPlanLimits(planId: string) -> { monthlyViews: number, storageLimit: number, projectLimit: number, liveLogs: boolean, emailIntegrity: boolean, allowedOriginsLimit: number, share_report: number, retentionDays: number, refreshRate: number, amount: number | string, price_inr: number, price_usd: number }`

- [ ] **Step 1: Write the failing unit tests for plan limits and aliases**

Create `backend/test/plans.test.js`:
```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPlanLimits } from '../src/services/usage.service.js';

test('getPlanLimits returns correct limits for canonical 5 tiers', () => {
    const nano = getPlanLimits('nano');
    assert.equal(nano.monthlyViews, 10000);
    assert.equal(nano.projectLimit, 1);
    assert.equal(nano.allowedOriginsLimit, 1);
    assert.equal(nano.retentionDays, 7);
    assert.equal(nano.refreshRate, 60);
    assert.equal(nano.amount, 0);

    const lite = getPlanLimits('lite');
    assert.equal(lite.monthlyViews, 100000);
    assert.equal(lite.projectLimit, 3);
    assert.equal(lite.allowedOriginsLimit, 3);
    assert.equal(lite.retentionDays, 30);
    assert.equal(lite.refreshRate, 15);
    assert.equal(lite.amount, 199);

    const pro = getPlanLimits('pro');
    assert.equal(pro.monthlyViews, 1000000);
    assert.equal(pro.projectLimit, 10);
    assert.equal(pro.allowedOriginsLimit, 10);
    assert.equal(pro.retentionDays, 90);
    assert.equal(pro.refreshRate, 5);
    assert.equal(pro.amount, 699);
    assert.equal(pro.liveLogs, true);

    const max = getPlanLimits('max');
    assert.equal(max.monthlyViews, 5000000);
    assert.equal(max.projectLimit, 50);
    assert.equal(max.allowedOriginsLimit, 25);
    assert.equal(max.retentionDays, 365);
    assert.equal(max.refreshRate, 1);
    assert.equal(max.amount, 1999);
    assert.equal(max.liveLogs, true);

    const enterprise = getPlanLimits('enterprise');
    assert.equal(enterprise.amount, 'custom');
    assert.equal(enterprise.liveLogs, true);
});

test('getPlanLimits normalizes legacy plan aliases to new tiers', () => {
    assert.equal(getPlanLimits('free').monthlyViews, 10000);
    assert.equal(getPlanLimits('basic').monthlyViews, 100000);
    assert.equal(getPlanLimits('business').monthlyViews, 5000000);
    assert.equal(getPlanLimits(null).monthlyViews, 10000);
    assert.equal(getPlanLimits('unknown_plan').monthlyViews, 10000);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test backend/test/plans.test.js`
Expected: FAIL (assertion error: `monthlyViews` expected 10000 but got 1000, or `nano` returning default `free` limits).

- [ ] **Step 3: Update `PLAN_LIMITS` and `getPlanLimits` in `backend/src/services/usage.service.js`**

Implement the 5 tiers and alias mapping in `backend/src/services/usage.service.js`:
```javascript
const PLAN_ALIASES = {
    free: 'nano',
    basic: 'lite',
    business: 'max'
};

const PLAN_LIMITS = {
    nano: {
        monthlyViews: 10000,
        storageLimit: 1 * 1024 * 1024 * 1024,
        projectLimit: 1,
        liveLogs: false,
        emailIntegrity: false,
        allowedOriginsLimit: 1,
        share_report: 0,
        retentionDays: 7,
        refreshRate: 60,
        amount: 0,
        price_inr: 0,
        price_usd: 0
    },
    lite: {
        monthlyViews: 100000,
        storageLimit: 5 * 1024 * 1024 * 1024,
        projectLimit: 3,
        liveLogs: false,
        emailIntegrity: false,
        allowedOriginsLimit: 3,
        share_report: 1,
        retentionDays: 30,
        refreshRate: 15,
        amount: 199,
        price_inr: 199,
        price_usd: 2.49
    },
    pro: {
        monthlyViews: 1000000,
        storageLimit: 20 * 1024 * 1024 * 1024,
        projectLimit: 10,
        liveLogs: true,
        emailIntegrity: true,
        allowedOriginsLimit: 10,
        share_report: 5,
        retentionDays: 90,
        refreshRate: 5,
        amount: 699,
        price_inr: 699,
        price_usd: 8.99
    },
    max: {
        monthlyViews: 5000000,
        storageLimit: 100 * 1024 * 1024 * 1024,
        projectLimit: 50,
        liveLogs: true,
        emailIntegrity: true,
        allowedOriginsLimit: 25,
        share_report: 100,
        retentionDays: 365,
        refreshRate: 1,
        amount: 1999,
        price_inr: 1999,
        price_usd: 24.99
    },
    enterprise: {
        monthlyViews: 50000000,
        storageLimit: 500 * 1024 * 1024 * 1024,
        projectLimit: 500,
        liveLogs: true,
        emailIntegrity: true,
        allowedOriginsLimit: 100,
        share_report: 500,
        retentionDays: 730,
        refreshRate: 1,
        amount: 'custom',
        price_inr: null,
        price_usd: null
    }
};

export const getPlanLimits = (plan = 'nano') => {
    const normalized = PLAN_ALIASES[plan] || plan;
    return PLAN_LIMITS[normalized] || PLAN_LIMITS.nano;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test backend/test/plans.test.js`
Expected: PASS (2 tests pass).

- [ ] **Step 5: Commit**

```bash
git add backend/src/services/usage.service.js backend/test/plans.test.js
git commit -m "feat(backend): add canonical 5-tier plan limits and legacy alias mapping"
```

---

## Task 2: Backend Payment Controller and Plan Service

**Files:**
- Modify: `backend/src/controllers/payment.controller.js:12-105`
- Modify: `backend/src/services/plan.service.js:40-75`
- Test: `backend/test/plans.test.js`

**Interfaces:**
- Consumes: `getPlanLimits` from `backend/src/services/usage.service.js`
- Produces: `getPlans(req, res)` returning 5 plans array; `createOrder(req, res)` validating plan and calculating minor paise units.

- [ ] **Step 1: Write tests for payment controller order validation & plans listing**

Add to `backend/test/plans.test.js`:
```javascript
import { createOrderHandler } from './helpers/orderTestHelper.js'; // or inline handler test

test('order creation validates plans and creates correct paise amounts', async () => {
    // Lite plan: 199 INR -> 19900 paise
    // Pro plan: 699 INR -> 69900 paise
    // Max plan: 1999 INR -> 199900 paise
    // Nano plan: error
    // Enterprise plan: error
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test backend/test/plans.test.js`
Expected: FAIL.

- [ ] **Step 3: Update `payment.controller.js` and `plan.service.js`**

1. In `payment.controller.js`:
Update `getPlans` to return:
- `nano`: ₹0 / $0, 'Free forever', 10K events, 1 project, 60s refresh
- `lite`: ₹199 / $2.49, 'Individual developers and small sites', 100K events, 3 projects, 15s refresh
- `pro`: ₹699 / $8.99, 'Advanced analytics, API & Beta access', 1M events, 10 projects, 5s refresh, popular: true
- `max`: ₹1,999 / $24.99, 'Power users, full analytics & alpha access', 5M events, 50 projects, 1s refresh
- `enterprise`: 'Custom commercial agreement', Custom capacity, dedicated support

In `createOrder`:
Ensure `nano` rejects with `'Nano plan cannot be purchased'`.
Ensure `amount * 100` converts correctly (e.g. 199 * 100 = 19900, 699 * 100 = 69900, 1999 * 100 = 199900).

2. In `plan.service.js`:
Update `getPlanLimits(planId)` fallback from `free` to `nano` and ensure `price_inr` and `price_usd` return properly.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm --prefix backend run test`
Expected: PASS (all 22+ tests pass).

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/payment.controller.js backend/src/services/plan.service.js backend/test/plans.test.js
git commit -m "feat(backend): update payment controller and plan service to 5 tiers"
```

---

## Task 3: Database Schema & Migration for Plans Seed

**Files:**
- Modify: `supabase/development_full_schema.sql:98-105`
- Create: `supabase/migrations/20261124000001_update_subscription_plans.sql`

**Interfaces:**
- Consumes: PostgreSQL schema for `public.plans`
- Produces: 5 seeded plan rows (`nano`, `lite`, `pro`, `max`, `enterprise`) with full column data.

- [ ] **Step 1: Write migration SQL file**

Create `supabase/migrations/20261124000001_update_subscription_plans.sql`:
```sql
-- Migration: Update subscription plans to canonical 5 tiers (Nano, Lite, Pro, Max, Enterprise)

INSERT INTO public.plans (
    id, name, price, price_usd, price_inr, interval, visitor_limit, project_limit, allowed_origins_limit, features
) VALUES 
('nano', 'Nano', 0, 0, 0, 'month', 10000, 1, 1, 
 '["1 Project", "1 Allowed Origin", "10,000 events/mo", "7-day retention", "60 sec refresh", "Basic API"]'::jsonb),
('lite', 'Lite', 199, 2.49, 199, 'month', 100000, 3, 3, 
 '["3 Projects", "3 Allowed Origins", "100,000 events/mo", "30-day retention", "15 sec refresh", "Basic API", "Limited export"]'::jsonb),
('pro', 'Pro', 699, 8.99, 699, 'month', 1000000, 10, 10, 
 '["10 Projects", "10 Allowed Origins", "1,000,000 events/mo", "90-day retention", "5 sec refresh", "Live Logs", "Full API", "V2 Beta access"]'::jsonb),
('max', 'Max', 1999, 24.99, 1999, 'month', 5000000, 50, 25, 
 '["50 Projects", "25 Allowed Origins", "5,000,000 events/mo", "12-month retention", "1 sec refresh", "Live Logs", "Full API", "Alpha invitation eligible"]'::jsonb),
('enterprise', 'Enterprise', 0, 0, 0, 'month', 50000000, 500, 100, 
 '["Custom Projects", "Custom Origins", "Negotiated events/mo", "Custom retention", "1 sec refresh", "Dedicated support", "Custom SLA"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    price_usd = EXCLUDED.price_usd,
    price_inr = EXCLUDED.price_inr,
    visitor_limit = EXCLUDED.visitor_limit,
    project_limit = EXCLUDED.project_limit,
    allowed_origins_limit = EXCLUDED.allowed_origins_limit,
    features = EXCLUDED.features,
    updated_at = now();
```

- [ ] **Step 2: Update `supabase/development_full_schema.sql`**

Update seed statements in `supabase/development_full_schema.sql` lines 98-105 to seed the 5 canonical plans.

- [ ] **Step 3: Verify SQL syntax**

Run: `node scripts/check-migrations.mjs` (or verify syntax of the new sql file).
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20261124000001_update_subscription_plans.sql supabase/development_full_schema.sql
git commit -m "feat(db): seed canonical 5-tier subscription plans"
```

---

## Task 4: Shared Marketing Plan Data & Pricing Pages

**Files:**
- Modify: `apps/marketing/src/data/plans.js`
- Modify: `apps/marketing/src/pages/Pricing.jsx`
- Modify: `apps/marketing/src/components/landing/PricingTeaser.jsx`

**Interfaces:**
- Consumes: `plans` array
- Produces: Canonical 5-tier pricing comparison cards on `/pricing` and landing page teaser.

- [ ] **Step 1: Update `apps/marketing/src/data/plans.js`**

Define the 5 plans (`nano`, `lite`, `pro`, `max`, `enterprise`) with:
- `id`, `name`, `amount` (INR: 0, 199, 699, 1999, 'Custom'), `amountUSD` (0, 2.49, 8.99, 24.99, 'Custom')
- `limits`: Tracked events / month (10,000; 100,000; 1,000,000; 5,000,000; Custom), Projects (1, 3, 10, 50, Custom), Allowed domains (1, 3, 10, 25, Custom), Dashboard refresh (60s, 15s, 5s, 1s, 1s), Retention (7 days, 30 days, 90 days, 12 months, Custom)
- `features`: Exact feature matrix entries
- `cta`: 'Start for free', 'Choose Lite', 'Choose Pro', 'Choose Max', 'Contact Sales'
- `popular`: true for `pro`
- `badge`: 'Power' for `max`, 'Enterprise' for `enterprise`

- [ ] **Step 2: Update `apps/marketing/src/pages/Pricing.jsx`**

Update grid layout to support 5 cards cleanly (e.g. `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6` or 3+2 layout with clear responsive design).
Ensure `formatINR` handles `'Custom'` without displaying `₹NaN`.

- [ ] **Step 3: Update `apps/marketing/src/components/landing/PricingTeaser.jsx`**

Render the tiers cleanly (featuring Nano, Pro, and Max, or all tiers with tab/toggle) so prospective users see the full 5-tier spread.

- [ ] **Step 4: Verify marketing build**

Run: `npm run build:marketing`
Expected: Build succeeds with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add apps/marketing/src/data/plans.js apps/marketing/src/pages/Pricing.jsx apps/marketing/src/components/landing/PricingTeaser.jsx
git commit -m "feat(marketing): update pricing page and landing teaser to 5 tiers"
```

---

## Task 5: V1 Dashboard Plan Data & Billing Page

**Files:**
- Modify: `apps/v1/src/data/plans.js`
- Modify: `apps/v1/src/pages/Billing.jsx`

**Interfaces:**
- Consumes: User session and backend `/api/v1/usage` and `/api/v1/payment/plans`
- Produces: Up-to-date billing dashboard with 5-tier comparison, current tier badge, quota bar, and upgrade triggers.

- [ ] **Step 1: Update `apps/v1/src/data/plans.js`**

Align `apps/v1/src/data/plans.js` identically with the 5 canonical plans and helper functions (`getPlanById`, `formatINR`).

- [ ] **Step 2: Update `apps/v1/src/pages/Billing.jsx`**

1. Support current plan detection for `nano`, `lite`, `pro`, `max`, `enterprise` (and alias mapping for legacy accounts: `free` $\to$ `nano`, `basic` $\to$ `lite`, `business` $\to$ `max`).
2. Update usage comparison limits (10K for Nano, 100K for Lite, 1M for Pro, 5M for Max).
3. Display retention days on the active plan card.
4. Update plan comparison cards to render all 5 tiers with appropriate upgrade buttons (disabled for current plan, "Contact Sales" for Enterprise).

- [ ] **Step 3: Run V1 tests and build**

Run: `npm run test:v1 && npm run build:v1`
Expected: All tests pass and build succeeds with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/v1/src/data/plans.js apps/v1/src/pages/Billing.jsx
git commit -m "feat(v1): update billing dashboard and plans data to 5 tiers"
```

---

## Task 6: V2 Dashboard Billing Page Alignment

**Files:**
- Modify: `apps/v2/src/pages/Billing.jsx:11-66`

**Interfaces:**
- Consumes: Outlet context with `user` and `usageStats`
- Produces: V2 Billing UI matching 5-tier model

- [ ] **Step 1: Update `PLANS` in `apps/v2/src/pages/Billing.jsx`**

Replace 4-tier `PLANS` array with 5 tiers:
- `Nano`: ₹0 forever, 10,000 monthly events, 1 project, 7-day retention
- `Lite`: ₹199 / month, 100,000 monthly events, 3 projects, 30-day retention
- `Pro`: ₹699 / month, 1,000,000 monthly events, 10 projects, 90-day retention, Live logs
- `Max`: ₹1,999 / month, 5,000,000 monthly events, 50 projects, 12-month retention, Alpha access
- `Enterprise`: Custom pricing, Negotiated events, Dedicated support, SLA

Update `activePlanName` normalization to map legacy `free` $\to$ `Nano`, `basic` $\to$ `Lite`, `business` $\to$ `Max`.

- [ ] **Step 2: Run V2 tests and build**

Run: `npm run test:v2 && npm run build:v2`
Expected: All tests pass and build succeeds with 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/v2/src/pages/Billing.jsx
git commit -m "feat(v2): update billing page plans array and tier badges to 5 tiers"
```

---

## Task 7: Full Monorepo Verification & Audit Alignment

**Files:**
- None (verification across all packages)

- [ ] **Step 1: Run complete test suite**

Run: `npm run test:all`
Expected: PASS across backend, V1, and V2.

- [ ] **Step 2: Run complete monorepo build**

Run: `npm run build:all`
Expected: PASS across Marketing, V1, and V2.

- [ ] **Step 3: Final check of git status**

Run: `git status`
Expected: Clean working tree on branch `development`.
