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