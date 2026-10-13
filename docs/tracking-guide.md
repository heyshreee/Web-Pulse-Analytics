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
`POST /api/track/:trackingId`.

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

- Detects page path (`location.pathname + location.search`)
- Reads referrer (`document.referrer`)
- Sends a POST to `/api/track/:trackingId` on page load (and optionally on SPA route
  changes if you extend it)
- Avoids collecting sensitive query parameters where possible

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
  "page": "/pricing",
  "referrer": "https://google.com"
}
```

### Track a custom event

```http
POST /api/track/:trackingId
Content-Type: application/json

{
  "event": "button_clicked",
  "page": "/checkout",
  "referrer": "https://example.com"
}
```

Both endpoints return `200 OK` on success (shape varies). Invalid payloads return `400`.

## 4. What is tracked

The backend derives additional metadata from the request:

- **IP address** — used for approximate geolocation via `geoip-lite` (country/city/region).
  IPs are not stored as raw PII in logs unless explicitly logged elsewhere.
- **User-Agent** — parsed with `ua-parser-js` to extract browser, OS, device type.
- **Referrer** — stored as provided (validated and normalized).
- **Page** — the path you send (or derived). Avoid sending full URLs with tokens.
- **Session/Visitor** — deduped and attributed server-side using cookies/heuristics
  (see `visitorController` for the exact logic).

Do **not** embed personally identifiable information (emails, names, IDs, tokens,
search terms containing PII) in `page` or `event` fields. Those belong in your
authenticated app, not in the public tracking payload.

## 5. Payload schema

Current minimal fields (as expected by the ingest logic):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `page` | string | Recommended | Path of the viewed page (e.g. `/`, `/blog/post-1`) |
| `referrer` | string | Optional | Referrer URL (or `""`) |
| `event` | string | Optional | Custom event name if not a page view |

Additional fields may be ignored or rejected. The controller validates types and lengths
(`utils/validators.js`). Keep payloads small and non-sensitive.

## 6. Custom events

Custom events let you track actions (clicks, signups, downloads, conversions). Name
events with lowercase, hyphen or underscore (e.g. `signup_click`, `cta_clicked`,
`download_pdf`).

```json
{
  "event": "newsletter_subscribed",
  "page": "/blog"
}
```

Events are stored and aggregated separately from page views. See the Analytics API for
retrieving event counts.

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

Web Pulse Analytics collects **technical, non-PII metadata** (IP-derived location at
country/city granularity, UA, referrer, page path, timestamps). We do **not**
intentionally collect names, emails, passwords, or sensitive personal data via the
public tracker.

Recommendations before going to production:

- Update your **Privacy Policy** to disclose analytics collection, purpose, and data
  retention.
- Consider whether you need **consent** (GDPR/ePrivacy) in your jurisdiction. If consent
  is required, defer loading the tracker script until consent is granted.
- **Anonymize IPs** if your compliance requires it (you can truncate IPs before
  geo-lookup or disable precise city-level storage). Check your legal requirements.
- Avoid logging full payloads containing user input. Review backend logs and ensure
  `visitorController` doesn't log sensitive values.
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
| SPA routes not tracked | Script only runs on load | Fire `POST /api/track/:id` on route changes (manually) |
| Real-time not updating | Socket.IO disconnected | Verify `VITE_API_URL` matches backend, `ws:` allowed in CSP, and backend is reachable |
| High false traffic | Public endpoint abused | Tighten allowed referrers/origins, increase rate limiting, or block known bots |

For more, see [troubleshooting.md](troubleshooting.md).