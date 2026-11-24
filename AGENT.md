# AGENT.md: Web-Pulse-Analytics repo remediation

Instructions for a coding agent working on `heyshreee/Web-Pulse-Analytics`.
Source: professional-style audit done on 2026-11-22. Work through the tasks in order. Open one PR per task from a feature branch. Never push directly to `main`.

## Repo context

- Monorepo: `apps/marketing`, `apps/v1`, `apps/v2` (React + Vite), `backend` (Express 5, Node 22), `supabase/migrations`, `docs/`, `scripts/`.
- Branches that exist: `main`, `development`. CI and deploy workflows also reference `beta`, which does NOT exist.
- Releases/tags: none. CHANGELOG has only `[Unreleased]` and `[0.0.0]`.
- Versions in conflict: README badge says 2.0.0, root `package.json` says 1.0.0.

## Ground rules

1. Conventional Commits only (`feat:`, `fix:`, `docs:`, `chore:`, `ci:`, `test:`, `refactor:`). Imperative mood, small focused commits.
2. One task = one branch (`docs/readme-sync`, `ci/branch-protection-docs`, etc.) = one PR with a real description (what, why, how to test). Link audit item numbers.
3. Do not touch `.env` files, secrets, or production deploy credentials. Do not run Supabase migrations.
4. Do not merge major dependency bumps blindly. Verify lint + build + tests pass first.
5. If a fact cannot be verified from the repo, do not guess. Add a `TODO(verify)` note in the PR instead.
6. Do not fabricate screenshots, badges, or test results.

## Tasks

### P0: High priority

**T1. Branch protection / ruleset for `main`** (audit #1)
GitHub reports both branches as unprotected. Direct "Merge branch 'development'" pushes to `main` were seen on Nov 18.
- The agent cannot change repo settings without admin access. Produce `docs/branch-protection.md` with exact steps and a ready-to-import ruleset JSON for `main`:
  - Require a PR before merging (1 approval, or 0 for solo with the PR requirement kept).
  - Require status check `CI` (the aggregate job in `ci.yml`) to pass.
  - Block force pushes and deletions.
  - Require linear history (squash or rebase merges).
- Add a short link to this doc from `CONTRIBUTING.md`.
- Done when: doc exists, matches the real job names in `.github/workflows/ci.yml`.

**T2. Make the README match reality** (audit #2)
- Replace the `frontend/` structure with the real `apps/marketing`, `apps/v1`, `apps/v2`, `backend`, `supabase`, `docs`, `scripts`, `.github` layout.
- Fix the Quick Start: correct directories, the real dev ports (see root `package.json` scripts: v2 runs on 5175), and the backend port currently in `.env.example` (commit history says the default was moved to 3000; confirm in the file).
- Fix the tracker snippet and REST example: use a placeholder like `https://YOUR_API_HOST/api/track/script.js`, not `localhost:5000`.
- Resolve the v1 vs v2 story in ONE place: state which app is the default stable experience (PR #96 set V1 as default) and which is beta/in progress. Remove the claim that v2.0 is "the active, production-ready release" unless that is true.
- Add a Screenshots section with placeholders (`docs/images/…`) and a TODO for the owner to supply real images.
- Remove the "Repository created on January 17, 2026" clutter from the license section and badge.
- Fix the typo "Web Pluse" in the backend root route (`backend/src/app.js`).
- Done when: every path, port, and command in the README works on a fresh clone.

**T3. Single source of truth for versioning** (audit #3)
- Pick the real current version with the owner (default proposal: `v2.0.0` for the v2 line, or `v1.0.0` if V1 is the stable default).
- Align: README badge, root `package.json`, CHANGELOG, repo description.
- Convert CHANGELOG `[Unreleased]` into a dated release section and start a fresh `[Unreleased]`.
- Verify `.github/workflows/release.yml` triggers on a tag and drafts a GitHub Release. Fix it if broken.
- Do NOT create the tag yourself. Output the exact `git tag -a vX.Y.Z -m "…"` and `git push origin vX.Y.Z` commands for the owner.

**T4. Fix SECURITY.md and phantom branches** (audit #4)
- Update the supported-versions table to match real branches (`main`, plus `development` as pre-release).
- Remove or clearly mark `v1`/`v2` release branches that do not exist, unless the owner creates them.
- Either remove `beta` from `ci.yml`, `deploy*.yml`, and docs, or add a note that it is planned. Keep `docs/branching-strategy.md` consistent with whatever is chosen.

### P1: Medium priority

**T5. Dependabot handling** (audit #5)
- 17 of the latest 20 PRs were Dependabot PRs closed unmerged (e.g. ESLint 10, Tailwind 4, tsparticles 4, vite plugin react 6).
- Edit `.github/dependabot.yml`: add `ignore` rules for known major bumps that need a manual migration, keep minor/patch grouped, and set `open-pull-requests-limit`.
- Open a separate PR that merges the safe minor/patch groups only after `npm ci`, lint, build, and tests pass.
- Document the policy in `CONTRIBUTING.md` ("majors are migrated deliberately, not auto-merged").

**T6. Test coverage** (audit #6)
- Backend currently has `backend/test/health.test.js` and `security.test.js` only. Add tests for: tracking ingestion validation, CSRF rejection on state-changing routes, `authLimiter` behavior, and open-redirect/return-URL validation.
- Frontends only get lint + build in CI. Add a minimal test runner (Vitest) to `apps/v1` and `apps/v2` with at least one smoke test each, then add a `Test` step to the matching CI jobs.
- Done when: `npm run test:backend` passes locally, CI runs the new steps, and no required check is skipped silently.

**T7. CSP and security-header cleanup** (audit #7, #8, #9)
- In `backend/src/app.js` the CSP `connect-src` allows bare `ws:`/`wss:`, `https://*.vercel.app`, and `localhost:*` in all environments. Tighten it:
  - Make `localhost` entries conditional on `NODE_ENV !== 'production'`.
  - Replace `*.vercel.app` with the exact deployment hostnames from env/config.
  - Replace bare `ws:`/`wss:` with the specific Supabase and API websocket hosts.
- Move the hardcoded Supabase project host (`brjltpxgthgjiaufycvc.supabase.co`) to an env var (derive from `SUPABASE_URL`).
- Note in the PR that Helmet CSP on a JSON API has limited effect. Check the CSP actually served with the frontends (`vercel.json` / hosting headers) and propose the same tightening there.
- Privacy check: search `apps/` and `backend/` for calls to `api.ipify.org`, `ipwho.is`, `ipapi.co`. If visitor IPs are sent to these third parties, report it in the PR and either remove it or update the README privacy claims to match. Do not assert the claims are true without evidence.
- Add or extend tests in `security.test.js` for the new header behavior.

### P2: Cosmetic / hygiene

**T8. Backend structure** (audit cosmetic)
- Merge `backend/src/middleware/` and `backend/src/middlewares/` into one folder (`middlewares/` matches the README). Update all imports (`app.js` imports from both). Run the syntax check and tests.

**T9. Issue/PR hygiene**
- Update PR template to require: summary, linked issue, test evidence.
- Add labels (`bug`, `enhancement`, `security`, `good first issue`, `dependencies`) via a `docs/labels.md` or a labels sync file. Existing README links to `good first issue`.
- Draft clearer titles for future issues; do not rewrite closed history.

**T10. Commit privacy and signing**
- Add a short section in `CONTRIBUTING.md` on keeping the commit email private (use the GitHub noreply address) and on SSH/GPG commit signing for the "Verified" badge.
- Do not rewrite history.

## Known unknowns (do not assume)

- Full source beyond `backend/src/app.js` has not been reviewed.
- Git history has not been scanned for leaked secrets. If you have `gitleaks` available, run `gitleaks detect --config .gitleaks.toml` and report findings. Do not print secret values in PR text.
- Commit signing status, real branch rulesets, and the privacy features (DNT, cookieless mode, hashed IPs) are unverified.

## Definition of done (whole effort)

- `main` protected; all merges via PR with passing `CI`.
- README, SECURITY.md, CHANGELOG, `package.json`, and repo description tell one consistent story.
- A tagged release exists (created by the owner using the provided commands).
- Dependabot policy documented and active; no stale majors silently ignored.
- Backend tests cover auth, CSRF, rate limiting, and tracking validation; frontends have smoke tests in CI.
- CSP tightened and privacy claims verified or corrected.



# **WebPulse Analytics — Complete Product & Plan Architecture**

PRODUCT BLUEPRINT · VERSION 1.0 · NOVEMBER 2026

WebPulse Analytics should be designed as a **privacy-first, developer-focused web analytics SaaS platform** with four commercial subscription tiers, one enterprise tier, and independently controlled release access.

The architecture must separate five things:

1. **Subscription** – What the customer pays for.
2. **Entitlements** – What features the customer can use.
3. **Quotas** – How much the customer can consume.
4. **Release access** – Whether they can access Stable, Beta or Alpha.
5. **Usage enforcement** – How the backend controls resource consumption.

Do not combine these into a single `plan === "pro"` condition. That becomes difficult to maintain as the product grows.

# **1. Product architecture**

# **WEBPULSE ANALYTICS**

PRIVACY-FIRST WEB INTELLIGENCE PLATFORM

**Marketing**

www\.webpulseanalytics.tech

Public

Landing page, pricing, documentation, signup, login.

**Backend API**

api.webpulseanalytics.tech

Core service

Authentication, tracking, billing, quotas, analytics.

**V1 Stable**

app.webpulseanalytics.tech

Production

Stable analytics dashboard for customers.

**V2 Beta**

beta.webpulseanalytics.tech

Controlled access

Experimental dashboard and new features.

**WebPulse CRM / Admin**

Internal business management

Customers · Subscriptions · Payments · Support · Audit · Feature access

**Shared entitlement and subscription service**

One authoritative source for all product access decisions

**Database + Analytics Storage**

PostgreSQL · Event ingestion · Aggregations · Usage records

### **Domain responsibilities**

| Domain                        | Responsibility                                |
| ----------------------------- | --------------------------------------------- |
| `webpulseanalytics.tech`      | Marketing and public website                  |
| `app.webpulseanalytics.tech`  | V1 stable application                         |
| `beta.webpulseanalytics.tech` | V2 beta application                           |
| `api.webpulseanalytics.tech`  | Shared backend API                            |
| CRM/Admin                     | Internal subscription and customer management |

**Important:** V1 and V2 should not have separate subscription databases. Both should use the same backend entitlement service.

# **2. Complete subscription plans**

The latest five-tier structure is:

**01. Nano**

Free forever

# **₹0&#x20;**/ month

$0 USD

Entry-level analytics for personal websites and testing.

**02. Lite**

# **₹199&#x20;**/ month

Suggested regional price: $2.49 USD

Affordable analytics for individual developers and small websites.

**03. Pro**

Popular

# **₹699&#x20;**/ month

Suggested regional price: $8.99 USD

Advanced analytics, API access and V2 beta access.

**04. Max**

Power users

# **₹1,999&#x20;**/ month

Suggested regional price: $24.99 USD

Full analytics capabilities, beta and invitation-only alpha access.

**05. Enterprise**

# **Custom pricing**

Custom commercial agreement

For companies requiring custom capacity, security and support.

These are the latest proposed standard prices, not verified live prices from your pricing page. USD amounts are suggested regional price points, not exact currency conversions.

## **2.1 Resource allocation**

| Resource          | Nano    | Lite    | Pro      | Max       |
| ----------------- | ------- | ------- | -------- | --------- |
| Monthly events    | 10K     | 100K    | 1M       | 5M        |
| Projects          | 1       | 3       | 10       | 50        |
| Origins / domains | 1       | 3       | 10       | 25        |
| Data retention    | 7 days  | 30 days | 90 days  | 12 months |
| Dashboard refresh | 60 sec  | 15 sec  | 5 sec    | 1 sec     |
| Team members      | 1       | 1       | 3        | 10        |
| Saved reports     | Basic   | Basic   | 5        | Unlimited |
| API access        | Basic   | Basic   | Full     | Full      |
| Export            | Limited | Limited | Advanced | Advanced  |
| Live logs         | No      | No      | Yes      | Yes       |

Enterprise receives negotiated limits.

These are product entitlement limits, not promises of guaranteed throughput. In particular, one-second dashboard refresh does not mean every event is processed and displayed within one second.

## **2.2 API and ingestion rate limits**

Keep API request limits separate from monthly event quotas.

Recommended initial limits:

| Limit                         | Nano   | Lite    | Pro     | Max       |
| ----------------------------- | ------ | ------- | ------- | --------- |
| Tracking ingestion            | 10 EPS | 25 EPS  | 100 EPS | 250 EPS   |
| General API                   | 30/min | 120/min | 600/min | 1,800/min |
| Burst capacity                | 20     | 50      | 200     | 500       |
| Concurrent dashboard requests | 2      | 5       | 15      | 30        |

EPS = events per second. These are proposed starting limits for capacity testing, not measured infrastructure guarantees. Enterprise limits should be negotiated.

Implement token-bucket rate limiting with per-project and per-API-key controls. Add IP-based protection for abusive traffic, without relying on IP as the sole customer identity.

# **3. Feature architecture by plan**

| Feature                 | Nano  | Lite    | Pro   | Max      | Enterprise |
| ----------------------- | ----- | ------- | ----- | -------- | ---------- |
| Basic visitor analytics | ✓     | ✓       | ✓     | ✓        | ✓          |
| Page views              | ✓     | ✓       | ✓     | ✓        | ✓          |
| Referrers               | ✓     | ✓       | ✓     | ✓        | ✓          |
| Device analytics        | ✓     | ✓       | ✓     | ✓        | ✓          |
| Geographic analytics    | Basic | ✓       | ✓     | ✓        | ✓          |
| Custom date ranges      | -     | ✓       | ✓     | ✓        | ✓          |
| Advanced filters        | -     | Basic   | ✓     | ✓        | ✓          |
| Real-time dashboard     | -     | -       | ✓     | ✓        | ✓          |
| Live event logs         | -     | -       | ✓     | ✓        | ✓          |
| Analytics API           | Basic | Basic   | Full  | Full     | Custom     |
| CSV exports             | -     | Limited | ✓     | ✓        | ✓          |
| Custom dashboards       | -     | -       | Basic | ✓        | ✓          |
| Advanced reports        | -     | -       | ✓     | ✓        | ✓          |
| Team management         | -     | -       | ✓     | ✓        | ✓          |
| Role-based access       | -     | -       | Basic | Advanced | Custom     |
| Webhooks/integrations   | -     | -       | Basic | Advanced | Custom     |
| Custom domains          | -     | -       | -     | ✓        | ✓          |
| Priority support        | -     | -       | -     | ✓        | ✓          |
| SLA                     | -     | -       | -     | -        | Contract   |

This matrix should become your central product entitlement catalogue, not just a pricing-page table.

# **4. Release access architecture: Stable, Beta and Alpha**

This is independent of subscription pricing.

**Stable — V1**

All paid and free tiers

Production release

- Nano: Access
- Lite: Access
- Pro: Access
- Max: Access
- Enterprise: Access

**Beta — V2**

Pro and above

Early access to upcoming features

- Nano: No access
- Lite: No access
- Pro: Access
- Max: Access
- Enterprise: Configurable

**Alpha — Experimental**

Invitation only

Unstable features and experimental capabilities

- Nano: No access
- Lite: No access
- Pro: No access
- Max: Invitation required
- Enterprise: Explicitly granted

### **Access decision**

Do not implement:

```
if user.plan == "pro":    allow_beta = True
```

Instead:

```
def can_access_release(user, release):    subscription = get_active_subscription(user.id)    entitlements = get_effective_entitlements(user.id)    if release == "stable":        return subscription.is_valid    if release == "beta":        return entitlements.get("release.beta", False)    if release == "alpha":        return (            entitlements.get("release.alpha", False)            and has_valid_alpha_invitation(user.id)        )    return False
```

This is conceptual code; actual production authorization must also validate account status, subscription status, entitlement expiry and organization membership.

**Critical rule:** Paying for Max should make someone eligible for alpha invitations, not automatically grant access to every experimental feature.

# **5. Subscription and billing architecture**

This is the most important backend component because it controls the commercial side of WebPulse.

**WebPulse Admin / CRM**

Create plans · Manage subscriptions · Apply discounts

**Subscription Management Service**

Plan catalogue · Subscription lifecycle · Billing records

**Payment Provider**

Razorpay / Stripe · Checkout · Payment verification

**Verified Webhook Processor**

Signature verification · Idempotency · Event processing

**Entitlement Engine**

Resolve effective permissions and resource limits

**V1 / V2**

Feature access

**API**

Quota enforcement

## **5.1 Subscription lifecycle**

Your backend must support these states:

| Status                 | Meaning                        |
| ---------------------- | ------------------------------ |
| `trialing`             | Active trial                   |
| `active`               | Paid subscription active       |
| `past_due`             | Payment overdue                |
| `grace_period`         | Temporary recovery window      |
| `cancel_at_period_end` | Cancellation scheduled         |
| `canceled`             | Subscription ended             |
| `expired`              | Subscription validity ended    |
| `paused`               | Temporarily suspended          |
| `incomplete`           | Checkout/payment not completed |

Never grant a paid subscription based on the frontend's payment success screen.

The payment provider webhook must be the authoritative confirmation of payment.

## **5.2 Billing workflow**

1. Customer selects a plan.
2. Backend retrieves the current plan version.
3. Backend calculates the final price.
4. Backend creates a payment order or checkout session.
5. Customer completes payment.
6. Provider sends a webhook.
7. Backend verifies the signature.
8. Backend checks webhook idempotency.
9. Payment is recorded.
10. Subscription becomes active.
11. Entitlements are recalculated.
12. Customer receives access.

### **Failed payment**

- Mark subscription `past_due`.
- Notify the customer.
- Allow a defined grace period.
- Restrict premium functionality after grace expires.
- Preserve historical analytics.
- Restore entitlements after verified successful payment.

Do not delete customer data when a subscription expires.

# **6. Database architecture**

Use PostgreSQL as the source of truth for accounts, plans, billing, permissions and usage.

Recommended schema:

| Table                    | Responsibility                    |
| ------------------------ | --------------------------------- |
| `users`                  | Customer accounts                 |
| `organizations`          | Customer organizations            |
| `organization_members`   | Team membership                   |
| `plans`                  | Nano, Lite, Pro, Max, Enterprise  |
| `plan_versions`          | Versioned plan limits             |
| `plan_features`          | Feature definitions               |
| `plan_entitlements`      | Features and limits per plan      |
| `subscriptions`          | Subscription lifecycle            |
| `subscription_items`     | Purchased products/add-ons        |
| `payments`               | Payment transactions              |
| `invoices`               | Billing documents                 |
| `discounts`              | Promotional campaigns             |
| `subscription_discounts` | Applied discounts                 |
| `usage_records`          | Consumption records               |
| `usage_aggregates`       | Monthly and daily usage           |
| `quota_alerts`           | 80%, 90%, 100% alerts             |
| `feature_flags`          | Release-level feature switches    |
| `user_entitlements`      | Custom user-level overrides       |
| `alpha_invitations`      | Alpha eligibility and invitations |
| `webhook_events`         | Provider event processing         |
| `audit_logs`             | Administrative activity           |

### **Important relationships**

\#chatgpt-mermaid-\_r_1ja\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_1ja\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1ja\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1ja\_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-\_r_1ja\_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1ja\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_1ja\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_1ja\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_1ja\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_1ja\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_1ja\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_1ja\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1ja\_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1ja\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_1ja\_ p{margin:0;}#chatgpt-mermaid-\_r_1ja\_ .entityBox{fill:rgb(51, 24, 37);stroke:rgb(171, 79, 122);}#chatgpt-mermaid-\_r_1ja\_ .relationshipLabelBox{fill:rgb(48, 48, 48);opacity:0.7;background-color:rgb(48, 48, 48);}#chatgpt-mermaid-\_r_1ja\_ .relationshipLabelBox rect{opacity:0.5;}#chatgpt-mermaid-\_r_1ja\_ .labelBkg{background-color:rgba(48, 48, 48, 0.5);}#chatgpt-mermaid-\_r_1ja\_ .edgeLabel{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_1ja\_ .edgeLabel .label rect{fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_1ja\_ .edgeLabel .label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1ja\_ .edgeLabel .label{fill:rgb(171, 79, 122);font-size:14px;}#chatgpt-mermaid-\_r_1ja\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1ja\_ .edge-pattern-dashed{stroke-dasharray:8,8;}#chatgpt-mermaid-\_r_1ja\_ .node rect,#chatgpt-mermaid-\_r_1ja\_ .node circle,#chatgpt-mermaid-\_r_1ja\_ .node ellipse,#chatgpt-mermaid-\_r_1ja\_ .node polygon{fill:rgb(51, 24, 37);stroke:rgb(171, 79, 122);stroke-width:1px;}#chatgpt-mermaid-\_r_1ja\_ .relationshipLine{stroke:rgb(175, 175, 175);stroke-width:1px;fill:none;}#chatgpt-mermaid-\_r_1ja\_ .marker{fill:none!important;stroke:rgb(175, 175, 175)!important;stroke-width:1;}#chatgpt-mermaid-\_r_1ja\_ [data-look=neo].labelBkg{background-color:rgba(48, 48, 48, 0.5);}#chatgpt-mermaid-\_r_1ja\_ .node .neo-node{stroke:rgb(171, 79, 122);}#chatgpt-mermaid-\_r_1ja\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_1ja\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_1ja\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_1ja\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1ja\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_1ja\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_1ja\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_1ja\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1ja\_ [data-look="neo"].node .neo-line path{stroke:rgb(171, 79, 122);filter:none;}#chatgpt-mermaid-\_r_1ja\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_1ja\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1ja\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_1ja\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_1ja\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1ja\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_1ja\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1ja\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}USERSSUBSCRIPTIONSORGANIZATION_MEMBERSORGANIZATIONSPLANSPLAN_VERSIONSPLAN_ENTITLEMENTSPAYMENTSUSAGE_RECORDSINVOICESSUBSCRIPTION_DISCOUNTSDISCOUNTSUSER_ENTITLEMENTSALPHA_INVITATIONSWEBHOOK_EVENTSAUDIT_LOGSownsjoinscontainsownsversionsdefinesreceivesconsumesgeneratesusesappliesoverridesreceivesrecords

### **Database design rules**

- Store monetary amounts as integer minor units, such as paise.
- Store currency separately (`INR`, `USD`).
- Version plans instead of overwriting limits on active subscriptions.
- Store payment-provider identifiers with unique constraints.
- Keep immutable payment records.
- Keep an audit trail of administrative changes.
- Use database transactions for payment-to-subscription transitions.
- Never trust client-provided plan IDs or quota values without server-side validation.

## **6.1 Entitlement resolution**

The entitlement engine should combine:

1. Base plan entitlements.
2. Subscription status.
3. Organization-level entitlements.
4. Purchased add-ons.
5. Promotional grants.
6. Admin overrides.
7. Expiration dates.

Example:

```
{
  "account_id": "account_123",
  "plan": "pro",
  "subscription_status": "active",
  "release_access": {
    "stable": true,
    "beta": true,
    "alpha": false
  },
  "limits": {
    "monthly_events": 1000000,
    "projects": 10,
    "origins": 10,
    "team_members": 3,
    "retention_days": 90
  },
  "features": {
    "live_logs": true,
    "analytics_api": true,
    "csv_export": true,
    "advanced_reports": true
  }
}
```

This should be generated by the backend. Do not let the browser construct or modify this object to obtain permissions.

# **7. Usage and quota enforcement**

WebPulse must have a dedicated usage-management layer.

### **Usage flow**

**Website tracking SDK**

**Ingestion API**

Validate tracking key · origin · payload

**Quota / rate-limit check**

Plan limits · Monthly usage · Burst capacity

**Event processing**

Validate · Normalize · Deduplicate

**Analytics storage**

**Usage aggregation**

Update account and project consumption

### **Quota warning system**

| Usage     | Action                        |
| --------- | ----------------------------- |
| 0–79%     | Normal operation              |
| 80%       | First warning                 |
| 90%       | Second warning                |
| 100%      | Quota reached notification    |
| Over 100% | Apply configured quota policy |

At 100%, the system must follow a documented policy:

- Stop accepting billable events, or
- Allow a limited grace/overage allowance if explicitly purchased.

Do not silently charge customers for overages.

### **Customer dashboard**

Display:

- Events consumed this month.
- Monthly event limit.
- Percentage used.
- Remaining events.
- Current plan.
- Next billing date.
- Project count.
- Domain count.
- Retention period.
- Upgrade option.

Example:

**Monthly usage**

90% used

# **900,000&#x20;**/ 1,000,000

100,000 events remaining

Pro plan

Projects

**4 / 10**

Origins

**6 / 10**

Retention

**90 days**

# **8. Complete backend service architecture**

Do not put all functionality into one large FastAPI or Express route. Keep clear service boundaries, even if you deploy them initially as one backend application.

| Service              | Responsibility                           |
| -------------------- | ---------------------------------------- |
| Authentication       | Login, signup, sessions, OAuth           |
| Organization         | Accounts, projects, team members         |
| Project management   | Project creation and domain registration |
| Tracking ingestion   | Accept website events                    |
| Event processing     | Validate and normalize events            |
| Analytics engine     | Page views, visitors, referrers, reports |
| Realtime engine      | Live events and dashboard updates        |
| Subscription service | Plan and subscription lifecycle          |
| Billing service      | Payments, invoices, refunds              |
| Entitlement engine   | Feature and release permissions          |
| Usage service        | Quotas, consumption, alerts              |
| Feature flag service | Enable or disable features               |
| Notification service | Email and in-app alerts                  |
| Admin service        | Internal management and audit            |
| Export service       | CSV and report generation                |
| API key service      | Create, rotate and revoke keys           |

### **Recommended API structure**

Use versioned APIs.

| Endpoint                                   | Purpose                 |
| ------------------------------------------ | ----------------------- |
| `POST /api/v1/auth/signup`                 | Register                |
| `POST /api/v1/auth/login`                  | Login                   |
| `GET /api/v1/account/me`                   | Account details         |
| `GET /api/v1/plans`                        | Public plans            |
| `GET /api/v1/subscription`                 | Current subscription    |
| `POST /api/v1/billing/checkout`            | Create checkout         |
| `POST /api/v1/billing/webhooks/{provider}` | Payment webhook         |
| `GET /api/v1/entitlements`                 | Effective permissions   |
| `GET /api/v1/usage`                        | Current usage           |
| `GET /api/v1/usage/history`                | Usage history           |
| `POST /api/v1/projects`                    | Create project          |
| `GET /api/v1/projects`                     | List projects           |
| `POST /api/v1/track`                       | Receive analytics event |
| `GET /api/v1/analytics/overview`           | Analytics overview      |
| `GET /api/v1/analytics/realtime`           | Real-time analytics     |
| `GET /api/v1/analytics/pages`              | Page analytics          |
| `GET /api/v1/analytics/referrers`          | Referrer analytics      |
| `GET /api/v1/analytics/devices`            | Device analytics        |
| `POST /api/v1/exports`                     | Generate report         |

Internal administrative endpoints should be separately protected:

```
/api/v1/admin/users
/api/v1/admin/plans
/api/v1/admin/subscriptions
/api/v1/admin/payments
/api/v1/admin/discounts
/api/v1/admin/entitlements
/api/v1/admin/feature-flags
/api/v1/admin/usage
/api/v1/admin/alpha-invitations
/api/v1/admin/audit-logs
```

All admin APIs require server-side authorization. Hiding admin pages in React is not security.

# **9. WebPulse CRM and Admin architecture**

Since you are building a separate WebPulse CRM, it should be the business management layer rather than a second analytics backend.

**CRM responsibilities:**

| Module                  | Capabilities                      |
| ----------------------- | --------------------------------- |
| Customer management     | Customer profiles, account status |
| Subscription management | Change plans, cancel, renew       |
| Payment management      | Payments, refunds, invoices       |
| Pricing management      | Plan prices and versions          |
| Discount management     | Coupons and launch promotions     |
| Entitlement management  | Custom permissions and limits     |
| Beta management         | Beta access approval              |
| Alpha management        | Invitations and expiration        |
| Usage management        | Consumption and quota violations  |
| Support management      | Customer tickets                  |
| Audit management        | Admin action history              |
| Business analytics      | MRR, ARR, churn, conversion       |

### **Admin roles**

| Role            | Permissions                |
| --------------- | -------------------------- |
| Owner           | Full control               |
| Super Admin     | Platform-wide management   |
| Billing Admin   | Billing and subscriptions  |
| Support Admin   | Customer support           |
| Security Admin  | Audit, access and security |
| Read-only Admin | View-only access           |

Use role-based access control (RBAC) and enforce it on every administrative API.

### **CRM integration**

**WebPulse CRM**

Internal control panel

**WebPulse API**

Authenticated internal integration

**WebPulse PostgreSQL**

Single authoritative commercial records

My recommendation: CRM should communicate with WebPulse through authenticated internal APIs. It should not directly modify subscription tables or bypass the subscription service.

# **10. Launch discounts and promotional architecture**

Your pricing engine should support discounts without changing the underlying plan price.

For example:

| Plan | Standard price | Launch discount | Launch price |
| ---- | -------------- | --------------- | ------------ |
| Nano | ₹0             | 0%              | ₹0           |
| Lite | ₹199           | 50%             | ₹99.50       |
| Pro  | ₹699           | 50%             | ₹349.50      |
| Max  | ₹1,999         | 50%             | ₹999.50      |

Illustrative launch campaign, not a finalized promotion.

I would not recommend a permanent 95% discount. It makes your original prices meaningless and creates a problem when you need to charge sustainable rates.

Instead, support:

- Launch discount.
- First-month discount.
- Annual subscription discount.
- Student/developer promotion.
- Referral coupon.
- Custom enterprise discount.

### **Discount data model**

```
{
  "code": "WEBPULSE_LAUNCH",
  "type": "percentage",
  "value": 50,
  "applies_to": ["lite", "pro", "max"],
  "billing_cycles": 1,
  "max_redemptions": 500,
  "valid_from": "2026-12-01",
  "valid_until": "2027-01-31",
  "active": true
}
```

Enforce expiry, redemption limits and stacking rules on the backend. Preserve the original price and the applied discount in the invoice.

# **11. Security architecture**

Because WebPulse handles customer websites and their visitor analytics, security must be a core architectural requirement.

| Area           | Required control                             |
| -------------- | -------------------------------------------- |
| Authentication | Secure session/token management              |
| Authorization  | Server-side RBAC and organization isolation  |
| Tracking       | Project-specific public tracking identifiers |
| API security   | Rate limiting, validation, abuse prevention  |
| Payments       | Signed webhooks and idempotency              |
| Database       | Row-level authorization and tenant isolation |
| Secrets        | Server-side secret storage                   |
| Admin          | MFA, audit logs, least privilege             |
| Exports        | Authorization, expiry and secure downloads   |
| Realtime       | Validate project and organization access     |
| Privacy        | Data minimization and retention enforcement  |
| Backups        | Encrypted backups and recovery tests         |

### **Important tracking security distinction**

Your browser tracking ID is not a secret API credential.

A public website visitor can inspect JavaScript and network requests. Therefore:

- Use public project identifiers for tracking.
- Verify allowed origins.
- Validate every incoming event.
- Apply payload-size limits.
- Apply ingestion rate limits.
- Prevent cross-project event injection.
- Do not expose private API keys in frontend code.

Origin validation is not authentication. Non-browser clients can spoof origin headers. Combine it with project identifiers, abuse detection, quotas and anomaly monitoring.

### **Privacy architecture**

For WebPulse's privacy-first positioning:

- Avoid unnecessary personal data collection.
- Minimize IP address storage.
- Define retention and deletion policies.
- Avoid third-party advertising trackers.
- Document cookie and storage behavior.
- Provide customer data export and deletion.
- Make privacy claims match the actual implementation.

Do not advertise zero-cookie or anonymous analytics unless the tracking SDK and backend genuinely operate that way.

# **12. Infrastructure and deployment architecture**

Your existing Vercel deployment separation is a good starting point.

| Component    | Deployment                  | Purpose                 |
| ------------ | --------------------------- | ----------------------- |
| Marketing    | Vercel                      | Public website          |
| V1           | Vercel                      | Stable dashboard        |
| V2           | Vercel                      | Beta dashboard          |
| Backend      | Existing backend deployment | Shared API              |
| CRM          | Separate deployment         | Internal administration |
| Database     | PostgreSQL / Supabase       | Primary data            |
| File storage | Object storage              | Exports and invoices    |

### **GitHub branch architecture**

Based on your existing WebPulse workflow:

\#chatgpt-mermaid-\_r_1ki\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_1ki\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1ki\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1ki\_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-\_r_1ki\_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1ki\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_1ki\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_1ki\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_1ki\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_1ki\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_1ki\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_1ki\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1ki\_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1ki\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_1ki\_ p{margin:0;}#chatgpt-mermaid-\_r_1ki\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1ki\_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1ki\_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1ki\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_1ki\_ .label text,#chatgpt-mermaid-\_r_1ki\_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1ki\_ .node rect,#chatgpt-mermaid-\_r_1ki\_ .node circle,#chatgpt-mermaid-\_r_1ki\_ .node ellipse,#chatgpt-mermaid-\_r_1ki\_ .node polygon,#chatgpt-mermaid-\_r_1ki\_ .node path{fill:rgb(51, 24, 37);stroke:rgb(171, 79, 122);stroke-width:1px;}#chatgpt-mermaid-\_r_1ki\_ .rough-node .label text,#chatgpt-mermaid-\_r_1ki\_ .node .label text,#chatgpt-mermaid-\_r_1ki\_ .image-shape .label,#chatgpt-mermaid-\_r_1ki\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_1ki\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_1ki\_ .rough-node .label,#chatgpt-mermaid-\_r_1ki\_ .node .label,#chatgpt-mermaid-\_r_1ki\_ .image-shape .label,#chatgpt-mermaid-\_r_1ki\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_1ki\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_1ki\_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1ki\_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1ki\_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-\_r_1ki\_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-\_r_1ki\_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_1ki\_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_1ki\_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_1ki\_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-\_r_1ki\_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-\_r_1ki\_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1ki\_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1ki\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_1ki\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1ki\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_1ki\_ .icon-shape,#chatgpt-mermaid-\_r_1ki\_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_1ki\_ .icon-shape p,#chatgpt-mermaid-\_r_1ki\_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-\_r_1ki\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_1ki\_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_1ki\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_1ki\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_1ki\_ .node .neo-node{stroke:rgb(171, 79, 122);}#chatgpt-mermaid-\_r_1ki\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_1ki\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_1ki\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_1ki\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1ki\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_1ki\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_1ki\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_1ki\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1ki\_ [data-look="neo"].node .neo-line path{stroke:rgb(171, 79, 122);filter:none;}#chatgpt-mermaid-\_r_1ki\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_1ki\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1ki\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_1ki\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_1ki\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1ki\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_1ki\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1ki\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(255, 186, 218);}#chatgpt-mermaid-\_r_1ki\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(255, 186, 218);}#chatgpt-mermaid-\_r_1ki\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_1ki\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_1ki\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(41, 16, 28);stroke:rgb(95, 53, 72);stroke-width:1px;}#chatgpt-mermaid-\_r_1ki\_ .node rect,#chatgpt-mermaid-\_r_1ki\_ .node circle,#chatgpt-mermaid-\_r_1ki\_ .node ellipse,#chatgpt-mermaid-\_r_1ki\_ .node polygon,#chatgpt-mermaid-\_r_1ki\_ .node path{fill:rgb(77, 31, 52);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_1ki\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_1ki\_ .mermaid-decision .label-container{fill:rgb(41, 16, 28);stroke:rgb(95, 53, 72);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_1ki\_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_1ki\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1ki\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}main - Source of truthmarketing - Public websitev1 - Stable dashboardv2 - Beta dashboardbackend - Shared APIwebpulse-crm - SeparaterepositoryAuthenticated API

Keep the production deployment independent from experimental releases.

Recommended release policy:

- `main`: reviewed, integrated source.
- `marketing`: public marketing deployment.
- `v1`: stable production dashboard.
- `v2`: beta dashboard.
- Backend: separately versioned and deployed.
- CRM: independent repository and deployment.

Do not allow V2 to introduce breaking changes to the V1 API. Use backward-compatible API contracts and version migrations.

# **13. Recommended technology architecture**

| Layer                 | Recommendation                                  |
| --------------------- | ----------------------------------------------- |
| Frontend              | React + Vite + TypeScript                       |
| Backend               | Your existing backend framework                 |
| Primary database      | PostgreSQL                                      |
| Database platform     | Supabase, if retained in your existing setup    |
| Authentication        | Centralized authentication service              |
| Realtime              | WebSocket / Socket.IO                           |
| Cache / rate limiting | Redis when required                             |
| Payment India         | Razorpay                                        |
| International payment | Stripe, subject to availability and eligibility |
| Storage               | S3-compatible object storage                    |
| Deployment            | Vercel + backend hosting                        |
| Monitoring            | Structured logs, error monitoring               |
| CI/CD                 | GitHub Actions                                  |
| API documentation     | OpenAPI / Swagger                               |

**Important architectural decision:** You do not need microservices immediately.

Start with a modular monolith and separate worker processes where required. Split services only when real scaling, deployment or reliability requirements justify it.

For analytics storage, PostgreSQL can support your initial release. Introduce a dedicated analytical database such as ClickHouse when event volume and query patterns demonstrate that PostgreSQL is becoming a bottleneck.

# **14. Complete customer journey**

This is how all the components should work together.

\#chatgpt-mermaid-\_r_1kj\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_1kj\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1kj\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_1kj\_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-\_r_1kj\_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1kj\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_1kj\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_1kj\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_1kj\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_1kj\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_1kj\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_1kj\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1kj\_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1kj\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_1kj\_ p{margin:0;}#chatgpt-mermaid-\_r_1kj\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1kj\_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1kj\_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1kj\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_1kj\_ .label text,#chatgpt-mermaid-\_r_1kj\_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1kj\_ .node rect,#chatgpt-mermaid-\_r_1kj\_ .node circle,#chatgpt-mermaid-\_r_1kj\_ .node ellipse,#chatgpt-mermaid-\_r_1kj\_ .node polygon,#chatgpt-mermaid-\_r_1kj\_ .node path{fill:rgb(51, 24, 37);stroke:rgb(171, 79, 122);stroke-width:1px;}#chatgpt-mermaid-\_r_1kj\_ .rough-node .label text,#chatgpt-mermaid-\_r_1kj\_ .node .label text,#chatgpt-mermaid-\_r_1kj\_ .image-shape .label,#chatgpt-mermaid-\_r_1kj\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_1kj\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_1kj\_ .rough-node .label,#chatgpt-mermaid-\_r_1kj\_ .node .label,#chatgpt-mermaid-\_r_1kj\_ .image-shape .label,#chatgpt-mermaid-\_r_1kj\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_1kj\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_1kj\_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1kj\_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1kj\_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-\_r_1kj\_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-\_r_1kj\_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_1kj\_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_1kj\_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_1kj\_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-\_r_1kj\_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-\_r_1kj\_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1kj\_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1kj\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_1kj\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-\_r_1kj\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_1kj\_ .icon-shape,#chatgpt-mermaid-\_r_1kj\_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-\_r_1kj\_ .icon-shape p,#chatgpt-mermaid-\_r_1kj\_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-\_r_1kj\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_1kj\_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-\_r_1kj\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_1kj\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_1kj\_ .node .neo-node{stroke:rgb(171, 79, 122);}#chatgpt-mermaid-\_r_1kj\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_1kj\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_1kj\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_1kj\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1kj\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_1kj\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_1kj\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_1kj\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1kj\_ [data-look="neo"].node .neo-line path{stroke:rgb(171, 79, 122);filter:none;}#chatgpt-mermaid-\_r_1kj\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_1kj\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1kj\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_1kj\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_1kj\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1kj\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_1kj\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_1kj\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(255, 186, 218);}#chatgpt-mermaid-\_r_1kj\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(255, 186, 218);}#chatgpt-mermaid-\_r_1kj\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_1kj\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_1kj\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(41, 16, 28);stroke:rgb(95, 53, 72);stroke-width:1px;}#chatgpt-mermaid-\_r_1kj\_ .node rect,#chatgpt-mermaid-\_r_1kj\_ .node circle,#chatgpt-mermaid-\_r_1kj\_ .node ellipse,#chatgpt-mermaid-\_r_1kj\_ .node polygon,#chatgpt-mermaid-\_r_1kj\_ .node path{fill:rgb(77, 31, 52);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_1kj\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_1kj\_ .mermaid-decision .label-container{fill:rgb(41, 16, 28);stroke:rgb(95, 53, 72);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_1kj\_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_1kj\_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-\_r_1kj\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Customer visits websiteSignup / LoginCreate organizationSelect subscriptionPayment required?Activate NanoPayment checkoutVerified payment webhookActivate subscriptionEntitlement engineOpen V1 StableBeta eligible?Open V2 BetaShow upgrade optionCreate analytics projectInstall tracking SDKIngest eventsValidate and enforce quotasProcess and store eventsAnalytics dashboardUsage monitoring80 / 90 / 100% alertsNoYesYesNo

# **15. Product roadmap**

I would build this in the following order. Do not build every advanced feature simultaneously.

1. **Phase 1 — Core platform**

   Highest priority
   - Authentication and organizations.
   - Project and domain management.
   - Tracking SDK.
   - Event ingestion.
   - Basic analytics.
   - V1 stable dashboard.
   - Database isolation.
2. **Phase 2 — Commercial foundation**
   - Five-tier plan catalogue.
   - Versioned entitlements.
   - Subscription lifecycle.
   - Razorpay integration.
   - Payment webhooks.
   - Monthly usage aggregation.
   - Quota enforcement.
   - Customer billing dashboard.
3. **Phase 3 — Advanced analytics**
   - Realtime dashboard.
   - Live event logs.
   - Advanced filters.
   - Export functionality.
   - API access.
   - Custom reports.
   - Notifications.
4. **Phase 4 — V2 Beta**

   Pro / Max access
   - New dashboard architecture.
   - Experimental analytics capabilities.
   - Feature flag integration.
   - Beta access control.
   - Feedback and issue reporting.
5. **Phase 5 — CRM and Administration**
   - Customer management.
   - Subscription management.
   - Discount campaigns.
   - Entitlement overrides.
   - Alpha invitations.
   - Audit logs.
   - Business analytics.
6. **Phase 6 — Scale and Enterprise**
   - Advanced team permissions.
   - Custom domains.
   - Higher ingestion capacity.
   - Advanced integrations.
   - Enterprise security controls.
   - SLA and support processes.
   - Dedicated infrastructure where justified.

# **16. Final architecture decisions**

These are the decisions I recommend treating as your product's architectural baseline.

| Decision              | Recommended approach                               |
| --------------------- | -------------------------------------------------- |
| Product tiers         | Nano, Lite, Pro, Max, Enterprise                   |
| Subscription source   | Central backend subscription service               |
| Entitlement source    | Central entitlement engine                         |
| Stable access         | All tiers                                          |
| Beta access           | Pro, Max, Enterprise when enabled                  |
| Alpha access          | Max invitation-only; Enterprise explicitly granted |
| Quotas                | Server-side enforcement                            |
| Usage reset           | Subscription billing-period based                  |
| Payment verification  | Signed, idempotent webhooks                        |
| CRM                   | Separate repository                                |
| V1/V2                 | Separate frontend deployments                      |
| Backend               | Shared API                                         |
| Database              | Shared commercial source of truth                  |
| Analytics storage     | PostgreSQL initially                               |
| Feature rollout       | Feature flags                                      |
| Security              | Tenant isolation and RBAC                          |
| Plan changes          | Versioned entitlements                             |
| Expired subscriptions | Preserve historical customer data                  |

## **17. The most important architectural mistake to avoid**

Do not build five independent subscription systems for five plans.

Build one subscription engine that reads configurable plans.

For example:

```
Subscription Engine
    |
    +-- Nano
    +-- Lite
    +-- Pro
    +-- Max
    +-- Enterprise
          |
          v
    Entitlement Engine
          |
          +-- Feature permissions
          +-- Project limits
          +-- Event quotas
          +-- API rate limits
          +-- Data retention
          +-- Team limits
          +-- Stable access
          +-- Beta access
          +-- Alpha access
          |
          v
    V1 / V2 / API / CRM
```

If you introduce a new plan called `Developer`, you should only need to configure its price and entitlements. You should not need to rewrite authentication, billing, tracking or dashboard authorization.

## **18. What I would prioritize before public launch**

## **Production readiness checklist**

0 / 15 completed

0%

Central subscription service working

Plan and entitlement versioning

Payment webhook signature verification

Idempotent payment processing

Backend quota enforcement

Project and organization isolation

V1 and V2 release authorization

Beta and alpha invitation management

Usage aggregation and monthly resets

80%, 90% and 100% quota notifications

Admin RBAC and audit logging

Subscription cancellation and expiry handling

Database backup and recovery testing

Privacy and data deletion workflows

End-to-end billing and authorization tests

## **My final recommendation**

Build WebPulse as three connected product layers:

1. **Product layer:** Marketing, V1 Stable, V2 Beta and tracking SDK.
2. **Commercial layer:** Plans, subscriptions, payments, entitlements and usage.
3. **Management layer:** CRM, administration, support and security.

The commercial layer is the foundation. If it is incorrectly designed, every future feature, subscription upgrade, beta release and quota change becomes harder.

**Your immediate next step should be implementing the central subscription and entitlement engine before adding more premium features.** This is what will make Nano, Lite, Pro, Max and Enterprise manageable without rewriting the application every time your pricing changes.

Architecture basis: your latest five-tier proposal and the earlier WebPulse V1/V2 deployment decisions. Pricing and throughput figures above are proposed configuration values, not verified production capabilities.