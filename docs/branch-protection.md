# Branch Protection & GitHub Ruleset Configuration for `main`

> **Audit Reference**: Audit item #1 (`P0 - Branch protection / ruleset for main`)  
> **Target Branch**: `main` (`refs/heads/main`)  
> **Status**: Recommended configuration for repository administrator

---

## 1. Overview

Direct pushes to the `main` branch (such as unreviewed `Merge branch 'development'` commits) bypass automated verification and risk destabilizing production deployments.

Because repository settings and branch protection rules cannot be applied directly via git commits, this document provides the exact administrative steps and an importable GitHub Ruleset JSON to protect `main`.

### Target Governance Rules

- **Block direct pushes and deletions**: Code can only enter `main` through a Pull Request.
- **Block force pushes**: Preserves immutable history on production.
- **Require linear history**: Merges must use squash merge or rebase merge (eliminating merge bubble clutter).
- **Require status checks**: The aggregate `CI` job from `.github/workflows/ci.yml` must succeed before merging.
- **Require PR reviews**: 
  - **Team**: Require 1 approval.
  - **Solo maintainer**: Require 0 approvals, but keep the Pull Request requirement active to ensure CI triggers and status checks pass.

---

## 2. Option A: GitHub Ruleset (Recommended)

GitHub Repository Rulesets are GitHub's modern replacement for classic branch protection. They support export/import and flexible bypass controls.

### 2.1 Import via GitHub CLI (`gh`)

Run the following command using the GitHub CLI with repository admin privileges:

```bash
gh api --method POST repos/heyshreee/Web-Pulse-Analytics/rulesets \
  --input - << 'EOF'
{
  "name": "Protect main branch",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": [
        "refs/heads/main"
      ],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "deletion"
    },
    {
      "type": "non_fast_forward"
    },
    {
      "type": "required_linear_history"
    },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          {
            "context": "CI"
          }
        ]
      }
    }
  ],
  "bypass_actors": []
}
EOF
```

> [!TIP]
> **Solo Maintainer Adjustment**: If you are working solo and cannot approve your own PRs, change `"required_approving_review_count": 1` to `"required_approving_review_count": 0`. The pull request requirement remains enforced, guaranteeing that the `CI` status check must pass before merging.

### 2.2 Manual Web UI Setup for Rulesets

1. Go to repository **Settings** &rarr; **Rules** &rarr; **Rulesets**.
2. Click **New ruleset** &rarr; **New branch ruleset**.
3. Fill in the general settings:
   - **Ruleset Name**: `Protect main branch`
   - **Enforcement status**: **Active**
4. Set **Target branches**:
   - Click **Add target** &rarr; **Include default branch** (or select **Include by pattern** &rarr; `main`).
5. Configure **Rules**:
   - [x] **Restrict deletions**
   - [x] **Block force pushes**
   - [x] **Require linear history**
   - [x] **Require a pull request before merging**:
     - Required approvals: `1` (or `0` for solo maintainer)
     - Dismiss stale pull request approvals when new commits are pushed: **Enabled**
     - Require conversation resolution before merging: **Enabled**
   - [x] **Require status checks to pass**:
     - Check: **Require branches to be up to date before merging** (strict)
     - Add status check: Search for **`CI`** (defined in `.github/workflows/ci.yml`)
6. Click **Save changes**.

---

## 3. Option B: Classic Branch Protection Rules

If you prefer classic branch protection:

1. Navigate to **Settings** &rarr; **Branches**.
2. Under **Branch protection rules**, click **Add rule** (or **Edit** on `main`).
3. Set **Branch name pattern**: `main`
4. Enable the following settings:
   - [x] **Require a pull request before merging**:
     - Require approvals: `1` (or `0` for solo mode)
     - Dismiss stale pull request approvals when new commits are pushed
     - Require conversation resolution before merging
   - [x] **Require status checks to pass before merging**:
     - [x] **Require branches to be up to date before merging**
     - Search and select: **`CI`**
   - [x] **Require linear history**
   - [x] **Do not allow force pushes**
   - [x] **Do not allow deletions**
5. Click **Save changes**.

---

## 4. Status Check Reference

The status check specified above corresponds directly to the aggregate job in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):

```yaml
jobs:
  ci:
    name: CI
    needs: [marketing, v1, v2, backend, repo]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: All required checks passed
        ...
```

The job name is `CI`. Requiring `CI` ensures that all constituent workspace checks (`marketing`, `v1`, `v2`, `backend`, and `repo`) must pass before code can be merged into `main`.

---

## 5. Verification

To verify that the protection is active:

1. Attempt a direct push to `main` locally:
   ```bash
   git checkout main
   git commit --allow-empty -m "chore: test direct push protection"
   git push origin main
   ```
   **Expected result**: GitHub rejects the push with an error indicating that `main` is protected and changes must be made via a pull request.

2. Verify in a Pull Request:
   - Confirm that the `CI` status check appears in the PR check list.
   - Confirm that the merge button remains disabled until `CI` turns green.
