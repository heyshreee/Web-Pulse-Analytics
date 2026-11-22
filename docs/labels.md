# Repository Labels and Issue Hygiene

This document defines the issue and pull request labeling taxonomy, triage lifecycle, and title conventions for `heyshreee/Web-Pulse-Analytics`.

---

## 1. Label Taxonomy

The repository maintains standard labels for categorizing issues and pull requests.

| Label | Color | Description | When to Use |
| :--- | :--- | :--- | :--- |
| `bug` | `#d73a4a` | Something isn't working as intended | Defects, unhandled exceptions, incorrect calculations, UI errors |
| `enhancement` | `#a2eeef` | New feature or request | New analytics features, dashboard views, tracker enhancements |
| `security` | `#b60205` | Security hardening or vulnerability fix | Auth fixes, CSRF/CORS tightening, rate-limiting, dependency CVEs |
| `good first issue` | `#7057ff` | Good for newcomers | Well-scoped starter tasks with clear acceptance criteria |
| `help wanted` | `#008672` | Extra attention or community help is needed | Complex investigations or community contributions needed |
| `dependencies` | `#0366d6` | Pull requests that update a dependency file | Dependabot PRs or manual package upgrades |
| `documentation` | `#0075ca` | Improvements or additions to documentation | README, docs/*, guides, inline JSDoc, API reference |
| `ci` | `#e99695` | CI/CD workflows and automated checks | GitHub Actions workflows, test scripts, linter configs |
| `refactor` | `#cfd3d7` | Code refactoring without behavior change | Directory reorganization, dead code removal, cleanup |
| `needs-triage` | `#ededed` | Awaiting maintainer review | Applied automatically to new incoming issues |

---

## 2. Issue Title Guidelines

Issue titles should be concise, professional, and descriptive. Anyone scanning the issue tracker should immediately understand the area and problem.

### Title Format

```text
[<area>]: <imperative summary of defect or feature>
```

Valid area prefixes:
- `[marketing]` — `apps/marketing`
- `[v1]` — `apps/v1` dashboard
- `[v2]` — `apps/v2` dashboard
- `[backend]` — Express API, controllers, services
- `[tracker]` — Ingestion endpoint or client tracker script
- `[realtime]` — Socket.IO events and rooms
- `[db]` — Supabase migrations and RLS policies
- `[ci]` — GitHub Actions, dependabot, scripts
- `[docs]` — Project documentation

### Examples

| Bad Title | Good Title | Reason |
| :--- | :--- | :--- |
| `bug` | `[backend]: return 400 when tracking payload lacks valid project_id` | Specifies area, condition, and expected outcome |
| `dashboard broken` | `[v1]: date range picker throws TypeError on undefined preset` | Identifies exact component and failure mode |
| `v2 changes` | `[v2]: add retention cohort matrix to analytics overview` | Explicit feature scope |
| `update ci` | `[ci]: run vitest smoke tests in v1 and v2 CI jobs` | Exact pipeline improvement |
| `typo` | `[docs]: fix backend port reference in Quick Start guide` | Clear scope and target file |

---

## 3. Issue Triage Lifecycle

1. **Submission**: User or contributor opens an issue using `.github/ISSUE_TEMPLATE/bug_report.yml` or `feature_request.yml`. The `needs-triage` label is attached.
2. **Review**: Maintainer checks preflight requirements, reproducibility, and classification.
3. **Categorization**:
   - Assign appropriate type label (`bug`, `enhancement`, `security`, `documentation`).
   - If suitable for a new contributor, attach `good first issue`.
   - Remove `needs-triage`.
4. **Resolution**:
   - Reference the issue in a feature branch PR (`Closes #<id>` or `Fixes #<id>`).
   - When the PR is merged into `development`, the issue is automatically closed or verified.

> [!NOTE]
> **Historical Integrity**: Do not rewrite titles or descriptions of past closed issues or PRs. Apply these standards consistently to all new issues and PRs going forward.
