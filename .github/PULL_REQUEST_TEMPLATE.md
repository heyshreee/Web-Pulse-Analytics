<!--
  Thanks for contributing to Web Pulse Analytics!
  Please fill in every section. Incomplete PRs may be asked for more detail.
-->

## Summary

<!-- What does this change and why? Link the related issue with "Closes #123". -->

## Area

<!-- Tick everything that applies. -->

- [ ] Marketing site (`apps/marketing`)
- [ ] V1 dashboard (`apps/v1`)
- [ ] V2 dashboard (`apps/v2`)
- [ ] Backend (API, Socket.IO, services)
- [ ] Tracking (ingest endpoint, tracker script)
- [ ] Analytics (aggregation, filters, metrics)
- [ ] Database (Supabase schema / migrations / RLS)
- [ ] CI, tooling, or documentation

## Release line

<!-- Keep V1 and V2 source separate. -->

- [ ] V1 (`v1` / `v1-dev`) — stabilizing the current release
- [ ] V2 (`v2` / `v2-dev`) — new interface work
- [ ] Shared / integration (`development`) — tooling, docs, backend
- [ ] Both / neither

## What changed

<!-- Bullet list of the concrete changes. -->

-

## How this was tested

<!-- Commands you ran and/or scenarios you verified. Do not write "not tested". -->

- [ ] `npm run lint:all`
- [ ] `npm run build:all`
- [ ] `npm run check:backend`
- [ ] `npm run test:backend`
- [ ] `npm start --prefix backend` (or `npm run dev:backend`)
- [ ] Manual check of the affected flow (describe below)

<!-- Describe the manual verification and any edge cases. -->

## Migrations / database

<!-- Migrations are security-sensitive and must be reviewed. -->

- [ ] This PR does **not** include database migrations
- [ ] This PR includes migrations (list them and link to `docs/database-schema.md`)

<!-- If migrations are included: are they additive? Do they need a rollback plan? -->

## Security & privacy checklist

- [ ] No secrets, `.env` files, tokens, or credentials are included
- [ ] No real visitor data, PII, or production dumps are included
- [ ] Authorization / RLS changes (if any) are described above
- [ ] Tracking changes (if any) validate and restrict input

## Screenshots / recordings

<!-- Optional, but strongly recommended for UI changes. -->
