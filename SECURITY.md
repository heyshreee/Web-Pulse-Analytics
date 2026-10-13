# Security Policy

We take the security of Web Pulse Analytics and its users seriously. Thank you for
helping keep the project and its users safe.

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues,
pull requests, or discussions.**

Report privately using one of these channels:

1. **GitHub private vulnerability reporting** (preferred):
   [Report a vulnerability](https://github.com/heyshreee/Web-Pulse-Analytics/security/advisories/new)
2. If you cannot use the link above, contact the maintainer
   [`@heyshreee`](https://github.com/heyshreee) privately and ask for a secure channel.

### What to include

- A description of the issue and its impact
- Affected component and, if possible, the affected version/commit
- Step-by-step reproduction or a minimal proof of concept
- Any conditions required to exploit it

Do **not** include real visitor data, credentials, or other users' private
information.

### What to expect

- **Acknowledgement** within 3 business days
- An initial assessment and severity estimate within 7 business days
- Updates as we investigate, and coordination on disclosure timing
- Credit in the release notes if you would like it

Please give us reasonable time to release a fix before public disclosure. We will
not pursue legal action against researchers who act in good faith and follow this
policy.

## Supported versions

Web Pulse Analytics is pre-1.0. Security fixes are provided for the latest released
version and the active `v1-stabilization` line.

| Version | Supported |
| --- | --- |
| Latest release (`v1.x`) | ✅ |
| `v1-stabilization` branch (unreleased) | ✅ |
| Older / historical versions | ❌ |

If you depend on a specific commit, please state it in your report.

## How fixes are handled

1. We confirm the report and assign a severity.
2. A fix is developed on a private branch and reviewed by a code owner.
3. Where relevant, we add a regression test so the issue cannot silently return.
4. A patched release is published and the advisory is disclosed, crediting the
   reporter (unless they prefer to remain anonymous).

## Hardening already in place

- Authentication via JWT with CSRF protection on non-GET API routes
- Rate limiting on tracking and other abuse-prone endpoints
- Restricted CORS for tracking ingestion
- Helmet security headers
- **Row Level Security (RLS)** on Supabase tables that hold user/visitor data
- Secrets supplied via environment variables only — never committed

See [docs/security.md](docs/security.md) for the full posture and the areas we are
still hardening.

## Repository security features

Maintainers should keep the following enabled in GitHub settings:

- **Private vulnerability reporting**
- **Dependabot alerts** and **Dependabot security updates**
- **Secret scanning** and **push protection**

These supplement — but do not replace — the workflows in `.github/workflows/`.
