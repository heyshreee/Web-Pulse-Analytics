<!--
  Thanks for contributing to Web Pulse Analytics!
  All pull requests must meet these requirements before merging into development or main.
  Please fill out all required sections. Incomplete PRs will be requested for more information.
-->

## Summary

<!-- What does this change and why? Explain the problem and the solution. -->

## Linked Issue / Reference

<!--
  Every PR must link an issue or audit tracking item.
  Examples:
    Closes #123
    Fixes #456
    Ref: Audit task #9 (issue hygiene)
-->

## Area

<!-- Check all that apply: -->

- [ ] Marketing site (`apps/marketing`)
- [ ] Stable V1 dashboard (`apps/v1`)
- [ ] Beta V2 dashboard (`apps/v2`)
- [ ] Backend API (`backend/src`)
- [ ] Tracking ingestion (`backend/src/controllers/visitor.controller.js`, `routes/v1/track.routes.js`)
- [ ] Real-time (`Socket.IO`)
- [ ] Database / Supabase (`supabase/migrations`)
- [ ] Tooling, CI, or Documentation (`.github`, `docs/`, `scripts/`)

## Release Line / Target

<!--
  Target branch rules:
  - All feature and bugfix PRs must target `development`.
  - Only production promotions and hotfix PRs target `main`.
  - Planned staging for V2 beta: `beta`.
  Note: apps/v1 (stable) and apps/v2 (beta) are directories within the monorepo, not separate git branches.
-->

- [ ] `development` (Standard integration branch)
- [ ] `main` (Production release branch — requires owner review)
- [ ] `beta` (Planned V2 preview track)

## What Changed

<!-- Bullet list of concrete, technical changes made in this PR. -->

- 

## Test Evidence (Required)

<!--
  Mandatory: All PRs must provide evidence of testing before merge.
  Do not submit without running tests or write "not tested".
-->

### Automated Test Runs

- [ ] `npm run check:backend` (Syntax check across backend/src)
- [ ] `npm run test:backend` (Backend Node.js test suite)
- [ ] `npm run test:v1` (Vitest smoke tests for V1)
- [ ] `npm run test:v2` (Vitest smoke tests for V2)
- [ ] `npm run test:all` (Full test runner across all packages)
- [ ] `npm run lint:all` (ESLint across all frontends)
- [ ] `npm run build:all` (Production build verification for all frontends)

### Test Output / Verification Evidence

```text
<!-- Paste terminal test output, test summary counts, or manual verification steps here -->
```

## Migrations / Database

<!-- Database migrations are security-sensitive and require code owner review. -->

- [ ] This PR does **not** include database migrations
- [ ] This PR includes migrations in `supabase/migrations/`
  - [ ] Migration is additive (no destructive drops without migration path)
  - [ ] Row Level Security (RLS) is enabled and policies are defined

## Security & Privacy Checklist

- [ ] No secrets, `.env` files, API keys, tokens, or credentials are committed
- [ ] No real visitor data, raw IP addresses, or production PII are included
- [ ] Authentication, authorization, and rate limits are preserved or tightened
- [ ] Input validation is enforced on public endpoints
- [ ] No required CI checks are disabled or bypassed with `continue-on-error`

## Screenshots / Visual Evidence

<!-- Strongly recommended for UI changes in apps/marketing, apps/v1, or apps/v2. -->
