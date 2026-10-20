# Tracking Guide

This guide explains how to install and use Web Pulse Analytics tracking. It covers
embedding the tracker script, manual REST calls, what data is collected, validation,
CORS/origin checks, custom events, and privacy/security considerations.

- [Quick start](#quick-start)
- [1. Get your Tracking ID](#1-get-your-tracking-id)
- [2. Install the tracker script](#2-install-the-tracker-script)
- [3. Manual tracking (REST API)](#3-manual-tracking-rest-api)
- [4. What is tracked](#4-what-is-tracked)
- [5. Payload schema](#5-payload-schema)
- [6. Custom events](#6-custom-events)
- [7. CORS, Origin, and Referrer validation](#7-cors-origin-and-referrer-validation)
- [8. Real-time updates](#8-real-time-updates)
- [9. Privacy and GDPR considerations](#9-privacy-and-gdpr-considerations)
- [10. Security hardening](#10-security-hardening)
- [11. Troubleshooting](#11-troubleshooting)

## Quick start

Add this to the `<head>` or end of `<body>` on every page you want to track:

```html
<script src="https://your-backend.example.com/api/track/YOUR_TRACKING_ID/script.js"></script>
```

For local development:

```html
<script src="http://localhost:5000/api/track/YOUR_TRACKING_ID/script.js"></script>
```

Once added, page views will be recorded automatically. The script sends data to
`POST /api/v1/track/events`.

## 1. Get your Tracking ID

In the Web Pulse Analytics dashboard:

1. Go to **Projects** → **Create Project** (or select an existing one)
2. Enter your website/domain name
3. The project is assigned a `trackingId` (e.g. `trk_xxxxxxxxxxxx`)
4. Use that ID in the script URL

## 2. Install the tracker script

The tracker script is served by the backend at:

```text
GET /api/track/:trackingId/script.js
```

Content-Type: `application/javascript`. It is a lightweight script (no external
dependencies) that:

- Detects the current page URL (`window.location.href`, including any query string)
- Reads referrer (`document.referrer`)
- Sends a POST to `/api/v1/track/events` on page load (and optionally on SPA route
  changes if you extend it)
- Sets and reads no cookies, uses no `localStorage` or `sessionStorage`, and performs
  no browser fingerprinting

> Caution: the script sends the page URL exactly as the browser shows it, including the
> query string. If a URL carries personal information in its query string, that
> information is recorded. Do not put personal information in a tracked URL.

> Note: For SPAs (React Router), the default script only fires on full page loads. If you
> need to track client-side route changes, you can call the REST endpoint manually (see
> section 3) or extend the script.

## 3. Manual tracking (REST API)

You can track visits/events directly via HTTP. This is useful for SPAs, mobile apps, or
server-side events.

### Track a page view

```http
POST /api/track/:trackingId
Content-Type: application/json

{
  "pageUrl": "https://example.com/pricing",
  "referrer": "https://google.com",
  "title": "Pricing"
}
```

> The legacy `:trackingId` endpoint reads `pageUrl`, `referrer`, and `title`. A `page`
> field is ignored. Prefer `POST /api/v1/track/events` (section 3a) for new
> integrations — it is the endpoint the tracker script itself calls.

### Track a custom event

```http
POST /api/track/:trackingId
Content-Type: application/json

{
  "pageUrl": "https://example.com/checkout",
  "referrer": "https://example.com",
  "title": "Checkout"
}
```

> The custom event **name** is not stored today, and neither are custom event fields.
> Both endpoints record a page view and the visitor fields listed in section 4, and
> nothing else from the payload.

### 3a. Track Events endpoint (recommended)

```http
POST /api/v1/track/events
x-api-key: YOUR_TRACKING_ID
Content-Type: application/json

{
  "event": "page_view",
  "url": "https://example.com/pricing",
  "referrer": "https://google.com",
  "title": "Pricing"
}
```

`url`, `referrer`, `title`, and `userAgent` are persisted. `event` and any additional
fields are accepted on the wire but are not stored today.

Both endpoints return `200 OK` on success (shape varies). Invalid payloads return `400`.

## 4. What is tracked

The backend derives additional metadata from the request:

- **IP address** — stored as collected, without truncation, in `visitors.ip_address` and
  in the project activity log. It is used for approximate geolocation and for abuse
  prevention and duplicate filtering. The lookup goes to `https://ipwho.is` over HTTPS,
  with an offline `geoip-lite` database as the fallback when that lookup fails. Only
  country and city are stored; latitude and longitude are derived on demand for display
  and are not persisted.
- **User-Agent** — parsed with `ua-parser-js` to extract browser, OS, device type.
- **Referrer** — stored as provided.
- **Page URL** — the full URL you send. Avoid sending URLs with tokens or other
  sensitive query parameters.
- **Session/Visitor** — derived server-side as a SHA-256 hash of the IP address, user
  agent, and project ID (see `visitor.controller.js` for the exact logic). The tracker
  uses no cookies, so this is a derived identifier rather than a cookie-backed one.

Do **not** embed personally identifiable information (emails, names, IDs, tokens,
search terms containing PII) in `url` or custom event fields. Those belong in your
authenticated app, not in the public tracking payload.

## 5. Payload schema

Fields expected by the current ingest logic:

| Field | Type | Required | Description | Stored? |
| --- | --- | --- | --- | --- |
| `url` | string | Recommended | Full URL of the viewed page (e.g. `https://example.com/blog/post-1`) | Yes |
| `referrer` | string | Optional | Referrer URL (or `""`) | Yes |
| `title` | string | Optional | Page title | Yes |
| `userAgent` | string | Optional | User agent; defaults to the request header | Yes (parsed) |
| `event` | string | Optional | Event name, e.g. `page_view` | No — accepted but discarded |
| anything else | any | Optional | Custom event fields | No — accepted but discarded |

The legacy `:trackingId` endpoint uses `pageUrl` in place of `url`. Additional fields
are accepted but not stored, and the tracking path does not apply the length checks in
`utils/validators.js`. Keep payloads small and non-sensitive.

## 6. Custom events

Custom events let you track actions (clicks, signups, downloads, conversions). Name
events with lowercase, hyphen or underscore (e.g. `signup_click`, `cta_clicked`,
`download_pdf`).

```json
{
  "event": "newsletter_subscribed",
  "url": "https://example.com/blog"
}
```

Custom events follow the same path as page views: they are subject to bot filtering,
duplicate protection, and the project's monthly usage limits, and they produce a page
view record. **The event name and any custom fields are not stored today**, so the
dashboard cannot currently report event names or event counts.

## 7. CORS, Origin, and Referrer validation

Tracking is public by design, but we restrict abusive requests:

- **Tracking CORS**: `backend/src/middleware/trackingCors.js` applies CORS rules to
  `/api/track/*` (different from global CORS). Only allowed origins may be permitted in
  browser requests; non-browser requests are handled appropriately.
- **Origin/Referrer checks**: the ingest path validates the request's origin/referrer
  against project configuration when present. This helps prevent spoofed requests from
  unrelated domains.
- **Rate limiting**: `express-rate-limit` protects tracking endpoints from spam/abuse.

If you're sending events server-side (non-browser), some browser-only checks don't apply.
Still, only call tracking endpoints for projects you own/control and validate your
server's egress.

## 8. Real-time updates

When a tracked event is ingested, the backend emits Socket.IO events (via `global.io`)
so the dashboard can update live visitor counts. The frontend connects to the backend
with `socket.io-client` and subscribes to project rooms.

No extra configuration is needed beyond running the backend and frontend together.

## 9. Privacy and GDPR considerations

Web Pulse Analytics collects **technical metadata**: the visitor's IP address (stored as
collected, without truncation), IP-derived location at country/city granularity, user
agent, referrer, page URL, and timestamps. The IP address and the page URL can be
personal information depending on the site you track, so treat the analytics data as
containing personal information. We do **not** intentionally collect names, emails,
passwords, or other sensitive personal data via the public tracker.

Recommendations before going to production:

- Update your **Privacy Policy** to disclose analytics collection, purpose, and data
  retention.
- Consider whether you need **consent** (GDPR/ePrivacy) in your jurisdiction. If consent
  is required, defer loading the tracker script until consent is granted.
- **Truncate IPs** if your compliance requires it. Today the ingest path stores the IP
  address as collected, with no truncation, so this needs a change to the ingest code
  before it can be relied on. Check your legal requirements.
- Avoid logging full payloads containing user input. Review backend logs and ensure
  `visitor.controller.js` doesn't log sensitive values. Note that project activity log
  entries do record the visitor IP address and the page URL.
- Respect **Do Not Track (DNT)** if you choose to honor it (not enforced by default;
  add a check in the tracker script if required).

See [security.md](security.md) for data handling boundaries.

## 10. Security hardening

- Never put service keys in the tracker or frontend. Only public `trackingId` is used.
- The tracker is a static JS served by your backend; serve over HTTPS in production.
- CSP on your tracked sites is fine — the script is loaded from your backend origin.
- Monitor rate limits and abuse. Block suspicious traffic at your edge if needed.
- If you rotate `trackingId` (regenerate share/token), old IDs stop working.

## 11. Troubleshooting

| Issue | Cause | Fix |
| --- | --- | --- |
| Script not loading (404) | Wrong `trackingId` or backend URL | Verify `trackingId` exists; check `GET /api/track/:id/script.js` returns JS |
| No events appear | CORS/origin rejected, or site not allowed | Check the project's domain config and `trackingCors` logs; ensure you're testing from an allowed origin |
| SPA routes not tracked | Script only runs on load | Fire `POST /api/v1/track/events` on route changes (manually) |
| Real-time not updating | Socket.IO disconnected | Verify `VITE_API_URL` matches backend, `ws:` allowed in CSP, and backend is reachable |
| High false traffic | Public endpoint abused | Tighten allowed referrers/origins, increase rate limiting, or block known bots |

For more, see [troubleshooting.md](troubleshooting.md).