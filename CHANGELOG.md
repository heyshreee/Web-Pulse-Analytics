# Changelog

All notable changes to Web Pulse Analytics are documented here. This project
follows [Semantic Versioning](https://semver.org/) in spirit. Since we're in the
pre-1.0.0 phase, breaking changes may occur frequently.

The format is inspired by [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added
- Repository governance: CI (lint/build/backend syntax checks), CodeQL, dependency
  review, secret scanning (gitleaks), release automation, and stale issue handling.
- Community files: CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, SUPPORT.md,
  ISSUE/PULL_REQUEST templates, CODEOWNERS, dependabot, FUNDING.
- Repository docs under `docs/` (getting started, architecture, API reference,
  tracking guide, database schema, deployment, security, troubleshooting, roadmap).
- Root `.env.example`, `.editorconfig`, `LICENSE` (MIT), and updated README.

### Changed
- Consolidated theme switch with View Transitions API (click-position circular reveal).
- Collapsed sidebar now animates (opacity + max-width + gap) instead of toggling `display:none`.
- Charts: tooltip repositioned to recharts' natural position; active dots/crosshair added.
- Analytics pages null-safe (show `—` instead of `NaN`/`null`), pass `loading` to KPI grid.
- Geography: new Visitor Network globe with country centroids; backend-only analytics.
- Notification loading stabilized with `useCallback`.

### Fixed
- Popover dropdowns anchor via ref (handles `display:contents` wrappers).
- Sidebar project switch alignment and smooth collapse/expand.
- Theme toggle origin set correctly from click coordinates.

### Security
- Hardened security posture documentation and private vulnerability reporting path.
- Added RLS policy documentation and clarified that migrations are never auto-deployed.

## [0.0.0] — Initial

Initial import of the Web Pulse Analytics monorepo (frontend + backend + supabase).
See commit history prior to the "Unreleased" section above for earlier work.
