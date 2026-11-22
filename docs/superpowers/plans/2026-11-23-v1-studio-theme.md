# V1 Pages Studio Theme Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all user-facing views in `apps/v1` to the stark monochrome **v0 Playground Studio** design system specified in `DESIGN.md`.

**Architecture:** 
1. Upgrade global utility classes in `apps/v1/src/index.css` (`.card`, `.btn-primary`, `.btn-secondary`, `.input`, `.page-header`, etc.) to map directly to `--wp-*` design tokens, eliminating legacy purple gradients and heavy shadows across all pages.
2. Refactor each route page into dedicated `.wp-panel` structures with architectural 1px hairlines, tabular monospace counters (`Geist Mono`), stark white primary actions, and clean empty states.
3. Keep the 100dvh desktop layout discipline intact with zero scroll jitter.

**Tech Stack:** React 19, Tailwind CSS 3, Vite, Recharts, Lucide React, Geist / Geist Mono typography.

**Spec:** [DESIGN.md](file:///f:/codebase/web-pulse/DESIGN.md)

---

## Global Constraints

- **Canvas & Surface:** Canvas must be `#000000` (dark) / `#ffffff` (light); panels must be `#0a0a0a` (dark) / `#ffffff` (light).
- **Structural Hairlines:** 1px solid `#222222` (dark) / `#e5e5e5` (light). No box shadows or neon glow effects.
- **Action Hierarchy:** Primary CTA is pure white `#ffffff` with black text (dark mode); secondary CTA is transparent with 1px border.
- **Status Color:** Color is restricted exclusively to live status (`#10b981`), warnings (`#f59e0b`), and danger (`#ef4444`).
- **Typography:** Sans-serif: `Geist`; Monospace / numbers: `Geist Mono` with `tabular-nums`.
- **Small Percentages:** Any non-zero metric below 0.1% must render as `<0.1%`.
- **Commit Discipline:** Every single change must be verified via `npm --prefix apps/v1 run lint` and `npm --prefix apps/v1 run build` and committed with clear scope.

---

## Review Focus

1. **Hydration and Route Transitions:** Page transitions must not flicker between old purple states and studio monochrome.
2. **Form Controls:** All `<input>`, `<select>`, and `<textarea>` elements must use dark `#0a0a0a` background with `#222222` border and `#ededed` text in dark mode.
3. **Table & List Density:** Tables and list rows must have 1px hairlines without broken layout clipping on mobile or narrow desktop.
4. **Data Consistency:** Tracking IDs must follow lowercase `trk_...` and API keys must follow `wp_sk_...`.
5. **Empty States:** Empty lists must use the dot-matrix `.wp-studio-canvas` with centered dashed border frames.

---

## Tasks

### Task 1: Base CSS Studio Harmonization (`apps/v1/src/index.css`)

**Files:**
- Modify: `apps/v1/src/index.css`

**Interfaces:**
- Consumes: CSS variables in `:root` and `.dark` (`--wp-bg-canvas`, `--wp-bg-surface`, `--wp-border-default`, `--wp-text-primary`, etc.)
- Produces: Updated global classes `.card`, `.card-subtle`, `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.input`, `.label`, `.page-header`, `.page-header-icon`, `.page-title`, `.page-sub`, `.table-head`, `.table-td`, `.badge-*`.

- [ ] **Step 1: Inspect legacy utility definitions in `apps/v1/src/index.css`**
- [ ] **Step 2: Update `.btn-primary`, `.btn-secondary`, `.btn-ghost` to use `--wp-accent-solid` and `--wp-border-default`**
- [ ] **Step 3: Update `.card`, `.card-subtle`, `.card-hero`, and `.card-hover` to use `--wp-bg-surface` and `--wp-border-default`**
- [ ] **Step 4: Update `.input`, `.label`, `.field-hint`, `.page-header`, and table styles to studio tokens**
- [ ] **Step 5: Verify build & lint**
Run: `npm --prefix apps/v1 run lint ; if ($LASTEXITCODE -eq 0) { npm --prefix apps/v1 run build }`
Expected: 0 errors, build succeeds.
- [ ] **Step 6: Commit**
`git add apps/v1/src/index.css`
`git commit -m "style(v1): align global utility classes with studio tokens in index.css"`

---

### Task 2: Projects Directory Page Modernization (`apps/v1/src/pages/Projects.jsx`)

**Files:**
- Modify: `apps/v1/src/pages/Projects.jsx`

**Interfaces:**
- Consumes: `useOutletContext()`, `apiRequest('/projects')`, `apiRequest('/analytics/projects/:id/overview')`
- Produces: Clean studio toolbar, search bar, grid cards with `.wp-panel`, list view with hairline rows, modal with studio inputs.

- [ ] **Step 1: Read current `Projects.jsx` implementation**
- [ ] **Step 2: Refactor toolbar with search bar, view mode switch (Grid/List), and `+ New Project` button**
- [ ] **Step 3: Refactor project grid cards to use `.wp-panel`, `.wp-panel-header`, tabular numbers, and live dot**
- [ ] **Step 4: Refactor project list view to high-density table with monospace tracking IDs and live dot status**
- [ ] **Step 5: Refactor project creation modal to studio inputs and buttons**
- [ ] **Step 6: Verify build & lint**
Run: `npm --prefix apps/v1 run lint ; if ($LASTEXITCODE -eq 0) { npm --prefix apps/v1 run build }`
Expected: 0 errors, build succeeds.
- [ ] **Step 7: Commit**
`git add apps/v1/src/pages/Projects.jsx`
`git commit -m "feat(v1): modernize projects directory view to studio theme"`

---

### Task 3: API Keys Management Page Modernization (`apps/v1/src/pages/APIKeys.jsx`)

**Files:**
- Modify: `apps/v1/src/pages/APIKeys.jsx`

**Interfaces:**
- Consumes: `apiRequest('/projects')`, `useToast`
- Produces: Personal Access Token panel, Project Tracking IDs panel with `wp_sk_...` and `trk_...` format, copy chips, and studio skeleton.

- [ ] **Step 1: Read current `APIKeys.jsx` implementation**
- [ ] **Step 2: Update Personal Access Token card to `.wp-panel` with copyable code chip and status badge**
- [ ] **Step 3: Update Project Tracking IDs list to `.wp-panel` rows with monospace tokens, copy button, and link to project**
- [ ] **Step 4: Update skeleton loader to match studio panel dimensions**
- [ ] **Step 5: Verify build & lint**
Run: `npm --prefix apps/v1 run lint ; if ($LASTEXITCODE -eq 0) { npm --prefix apps/v1 run build }`
Expected: 0 errors, build succeeds.
- [ ] **Step 6: Commit**
`git add apps/v1/src/pages/APIKeys.jsx`
`git commit -m "feat(v1): modernize API keys view to studio theme"`

---

### Task 4: Activity Log & Project Event Streams (`apps/v1/src/pages/ProjectActivity.jsx`, `apps/v1/src/pages/ActivityLog.jsx`)

**Files:**
- Modify: `apps/v1/src/pages/ProjectActivity.jsx`
- Modify: `apps/v1/src/pages/ActivityLog.jsx`

**Interfaces:**
- Consumes: `apiRequest('/projects/:id/logs')` or global activity feed, socket `activity_new`
- Produces: Studio filter controls (styled selects), live streaming toggle with `.wp-live-dot`, event table with monospace timestamps and payloads, pagination.

- [ ] **Step 1: Read `ProjectActivity.jsx` and `ActivityLog.jsx`**
- [ ] **Step 2: Replace unstyled browser selects with styled studio controls (`All Events`, `Last 24h`)**
- [ ] **Step 3: Update log feed table to high-density monospace layout with `.wp-panel` and hairline borders**
- [ ] **Step 4: Update Live feed toggle button with green `.wp-live-dot` pulsing when active**
- [ ] **Step 5: Verify build & lint**
Run: `npm --prefix apps/v1 run lint ; if ($LASTEXITCODE -eq 0) { npm --prefix apps/v1 run build }`
Expected: 0 errors, build succeeds.
- [ ] **Step 6: Commit**
`git add apps/v1/src/pages/ProjectActivity.jsx apps/v1/src/pages/ActivityLog.jsx`
`git commit -m "feat(v1): modernize activity logs and live event streams to studio theme"`

---

### Task 5: Billing & Quota Page Modernization (`apps/v1/src/pages/Billing.jsx`)

**Files:**
- Modify: `apps/v1/src/pages/Billing.jsx`

**Interfaces:**
- Consumes: `apiRequest('/usage')`, `apiRequest('/payment/history')`, plans data
- Produces: Current plan summary `.wp-panel`, usage meters with 3px tracks, plan comparison cards in stark monochrome, payment history table.

- [ ] **Step 1: Read `Billing.jsx` implementation**
- [ ] **Step 2: Update Current Plan & Usage card to `.wp-panel` with `<0.1%` percentage threshold and 3px meter tracks**
- [ ] **Step 3: Refactor plan tier cards into stark monochrome cards (remove purple gradients and glows; active plan has subtle indicator)**
- [ ] **Step 4: Update payment history table with monospace transaction IDs, dates, and amounts**
- [ ] **Step 5: Verify build & lint**
Run: `npm --prefix apps/v1 run lint ; if ($LASTEXITCODE -eq 0) { npm --prefix apps/v1 run build }`
Expected: 0 errors, build succeeds.
- [ ] **Step 6: Commit**
`git add apps/v1/src/pages/Billing.jsx`
`git commit -m "feat(v1): modernize billing and quota management to studio theme"`

---

### Task 6: Project Detail & Sub-Tabs (`ProjectDetail.jsx` and `components/project/*`)

**Files:**
- Modify: `apps/v1/src/pages/ProjectDetail.jsx`
- Modify: `apps/v1/src/components/project/ProjectHeader.jsx`
- Modify: `apps/v1/src/components/project/ProjectTabs.jsx`
- Modify: `apps/v1/src/components/project/tabs/OverviewTab.jsx`
- Modify: `apps/v1/src/components/project/tabs/AnalyticsTab.jsx`
- Modify: `apps/v1/src/components/project/tabs/IntegrationTab.jsx`
- Modify: `apps/v1/src/components/project/tabs/SettingsTab.jsx`

**Interfaces:**
- Consumes: Project telemetry, hooks `useProjectData`, `useProjectSocket`
- Produces: Studio project header with tracking ID chip, flat tab bar, monochrome analytics charts, snippet viewer, and project settings panel.

- [ ] **Step 1: Read `ProjectDetail.jsx`, `ProjectHeader.jsx`, and `ProjectTabs.jsx`**
- [ ] **Step 2: Refactor `ProjectHeader.jsx` and `ProjectTabs.jsx` into studio navbar with back link and flat tabs**
- [ ] **Step 3: Refactor `OverviewTab.jsx` and `AnalyticsTab.jsx` to use `.wp-panel`, `--wp-chart-1` monochrome area chart, and tabular counters**
- [ ] **Step 4: Refactor `IntegrationTab.jsx` with code snippet panels and language tabs**
- [ ] **Step 5: Refactor `SettingsTab.jsx` and modal dialogs to studio design**
- [ ] **Step 6: Verify build & lint**
Run: `npm --prefix apps/v1 run lint ; if ($LASTEXITCODE -eq 0) { npm --prefix apps/v1 run build }`
Expected: 0 errors, build succeeds.
- [ ] **Step 7: Commit**
`git add apps/v1/src/pages/ProjectDetail.jsx apps/v1/src/components/project/`
`git commit -m "feat(v1): modernize project detail view and telemetry tabs to studio theme"`

---

### Task 7: Account Settings Page Modernization (`apps/v1/src/pages/Settings.jsx`)

**Files:**
- Modify: `apps/v1/src/pages/Settings.jsx`

**Interfaces:**
- Consumes: `useOutletContext()`, `apiRequest('/auth/me')`, user profile settings
- Produces: Left settings nav rail matching studio 30px nav items, content cards in `.wp-panel`, inputs, and action buttons.

- [ ] **Step 1: Read `Settings.jsx` navigation and tab panels**
- [ ] **Step 2: Refactor settings sidebar navigation to match studio control rail style**
- [ ] **Step 3: Update Profile, Security, Notifications, Usage, and Teams panels to `.wp-panel` with studio form inputs**
- [ ] **Step 4: Update action buttons to `.wp-btn-primary` and `.wp-btn-secondary`**
- [ ] **Step 5: Verify build & lint**
Run: `npm --prefix apps/v1 run lint ; if ($LASTEXITCODE -eq 0) { npm --prefix apps/v1 run build }`
Expected: 0 errors, build succeeds.
- [ ] **Step 6: Commit**
`git add apps/v1/src/pages/Settings.jsx`
`git commit -m "feat(v1): modernize account settings to studio theme"`

---

### Task 8: Authentication Screens & Auth Shell Modernization (`AuthShell.jsx`, `Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`, `VerifyEmail.jsx`)

**Files:**
- Modify: `apps/v1/src/components/AuthShell.jsx`
- Modify: `apps/v1/src/pages/Login.jsx`
- Modify: `apps/v1/src/pages/Register.jsx`
- Modify: `apps/v1/src/pages/ForgotPassword.jsx`
- Modify: `apps/v1/src/pages/ResetPassword.jsx`
- Modify: `apps/v1/src/pages/VerifyEmail.jsx`

**Interfaces:**
- Consumes: Auth endpoints (`/auth/login`, `/auth/register`, Google SSO)
- Produces: Clean `#000000` canvas with `.wp-studio-canvas` dot matrix, centered `#0a0a0a` panel with 1px border, stark white action buttons, and monospace security chips.

- [ ] **Step 1: Read `AuthShell.jsx`, `Login.jsx`, and `Register.jsx`**
- [ ] **Step 2: Refactor `AuthShell.jsx` to use `.wp-studio-canvas`, studio brand mark, and `.wp-panel`**
- [ ] **Step 3: Update input fields, Google SSO button, and primary submit buttons in all auth screens**
- [ ] **Step 4: Verify build & lint**
Run: `npm --prefix apps/v1 run lint ; if ($LASTEXITCODE -eq 0) { npm --prefix apps/v1 run build }`
Expected: 0 errors, build succeeds.
- [ ] **Step 5: Commit**
`git add apps/v1/src/components/AuthShell.jsx apps/v1/src/pages/Login.jsx apps/v1/src/pages/Register.jsx apps/v1/src/pages/ForgotPassword.jsx apps/v1/src/pages/ResetPassword.jsx apps/v1/src/pages/VerifyEmail.jsx`
`git commit -m "feat(v1): modernize auth shell and login/register flows to studio theme"`

---

### Task 9: Shared Report & 404 Pages (`ShareReport.jsx`, `NotFound.jsx`)

**Files:**
- Modify: `apps/v1/src/pages/ShareReport.jsx`
- Modify: `apps/v1/src/pages/NotFound.jsx`

**Interfaces:**
- Consumes: `apiRequest('/analytics/share/:token')`
- Produces: Public view and 404 page styled to studio specifications.

- [ ] **Step 1: Read `ShareReport.jsx` and `NotFound.jsx`**
- [ ] **Step 2: Update `ShareReport.jsx` with studio top bar, KPI strip, and momentum charts**
- [ ] **Step 3: Update `NotFound.jsx` to clean studio canvas with monospace error code and return action**
- [ ] **Step 4: Verify build & lint**
Run: `npm --prefix apps/v1 run lint ; if ($LASTEXITCODE -eq 0) { npm --prefix apps/v1 run build }`
Expected: 0 errors, build succeeds.
- [ ] **Step 5: Commit**
`git add apps/v1/src/pages/ShareReport.jsx apps/v1/src/pages/NotFound.jsx`
`git commit -m "feat(v1): modernize shared report and 404 page to studio theme"`

---

### Task 10: Complete Verification & Development Branch Push

**Files:**
- Verification only

- [ ] **Step 1: Run comprehensive lint across entire codebase**
Run: `npm --prefix apps/v1 run lint`
Expected: 0 errors.
- [ ] **Step 2: Run production build**
Run: `npm --prefix apps/v1 run build`
Expected: Exit code 0, all chunks compiled.
- [ ] **Step 3: Check git status and branch sync**
Run: `git status`
- [ ] **Step 4: Push all feature commits to origin development**
Run: `git push origin development`
Expected: Branch `development` up-to-date with remote.
