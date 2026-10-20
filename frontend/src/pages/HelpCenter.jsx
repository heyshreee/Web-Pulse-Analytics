import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    ArrowUpRight,
    BarChart3,
    BookOpen,
    ChevronDown,
    Code2,
    CreditCard,
    ExternalLink,
    Folder,
    Github,
    Info,
    KeyRound,
    LifeBuoy,
    MessagesSquare,
    Rocket,
    Search,
    SearchX,
    Send,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Terminal,
    User,
    Wrench,
    X,
} from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import Reveal from '../components/marketing/Reveal';
import CodeSnippet from '../components/marketing/CodeSnippet';

const API_DOMAIN = 'https://api.webpulse.app';
const ISSUES_URL = 'https://github.com/heyshreee/Web-Pulse-Analytics/issues';

const SEARCH_STOPWORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'can', 'do', 'does',
    'for', 'from', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'my', 'not', 'of',
    'on', 'or', 'the', 'to', 'was', 'what', 'when', 'where', 'which', 'why', 'with',
    'you', 'your',
]);

const categories = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        subtitle: 'Install tracking and see your first data',
        icon: Rocket,
        items: [
            {
                id: 'create-project',
                q: 'How do I create my first project?',
                summary: "A project is the container for one website's tracking configuration and analytics. Every project gets its own public Tracking ID.",
                steps: [
                    'Sign in to the console and open Projects.',
                    'Choose New project, enter a name (letters, numbers, hyphens, and underscores only), and optionally add an allowed domain.',
                    'Open the project to copy its Tracking ID. Plan limits apply: Free includes 1 project; paid plans include 5, 15, or 100.',
                ],
                note: {
                    tone: 'info',
                    text: 'Project names must use only letters, numbers, hyphens, and underscores. Each account starts on the Free plan.',
                },
                links: [
                    { to: '/docs/getting-started#quick-start', label: 'Quick start guide' },
                    { to: '/dashboard/projects', label: 'Open projects' },
                ],
                seeAlso: ['getting-started--install-tracker'],
                keywords: ['new project', 'setup', 'first project', 'create', 'start'],
            },
            {
                id: 'install-tracker',
                q: 'How do I install tracking on my website?',
                summary: "Load the tracker from your WebPulse API domain, initialize it with the project's Tracking ID, and send a page view. Place the snippet on every page you want to measure.",
                code: `<script src="${API_DOMAIN}/api/v1/track/script.js"></script>
<script>
  tracker('init', 'YOUR_TRACKING_ID');
  tracker('track', 'page_view');
</script>`,
                note: {
                    tone: 'info',
                    text: 'If you self-host the API, replace `https://api.webpulse.app` with your own API origin. The script must load before `tracker(...)` is called.',
                },
                links: [
                    { to: '/docs/tracking#installation', label: 'Installation guide' },
                    { to: '/docs/javascript#tracker', label: 'JavaScript tracker reference' },
                ],
                seeAlso: ['getting-started--verify-tracking', 'troubleshooting--script-not-loading'],
                keywords: ['install', 'snippet', 'script tag', 'setup', 'integration', 'tracker'],
            },
            {
                id: 'find-tracking-id',
                q: 'Where do I find my Tracking ID?',
                summary: "Open the project's Settings tab, or use API Keys in the sidebar. The Tracking ID is shown with a copy button and is safe to expose in client-side code.",
                steps: [
                    'Open Projects and select the project.',
                    'Go to Settings, or choose API Keys from the dashboard sidebar.',
                    'Copy the Tracking ID exactly. It is the same identifier the tracker uses in `init` and the API uses as `x-api-key`.',
                ],
                links: [
                    { to: '/dashboard/api-key', label: 'Open API Keys' },
                    { to: '/docs/tracking#tracking-id', label: 'Tracking ID documentation' },
                ],
                seeAlso: ['api--api-key'],
                keywords: ['tracking id', 'find', 'copy', 'project settings', 'api key', 'identifier'],
            },
            {
                id: 'verify-tracking',
                q: 'How do I verify that tracking is working?',
                summary: `Open your site with DevTools → Network and look for a POST to \`/api/v1/track/events\`. A 200 response with \`{"success":true}\` means WebPulse accepted the event.`,
                steps: [
                    'Confirm the tracker script returned 200 and `window.tracker` exists in the console.',
                    'Load a tracked page and check that the request payload contains your exact Tracking ID.',
                    'Open the project dashboard. Accepted activity should appear in recent activity, and live visitors update within about 10 seconds.',
                ],
                note: {
                    tone: 'info',
                    text: 'A bot-filtered request can also return `{"success":true}` with `bot:true`. It was accepted but intentionally not stored.',
                },
                links: [
                    { to: '/docs/api/events', label: 'Track Events reference' },
                    { to: '/docs/api#errors', label: 'API errors reference' },
                ],
                seeAlso: ['troubleshooting--dashboard-stale', 'tracking-events--events-not-showing'],
                keywords: ['test', 'verify', 'working', 'network', 'debug', 'check', 'devtools'],
            },
            {
                id: 'data-delay',
                q: 'How quickly does data appear in the dashboard?',
                summary: 'Accepted events are written immediately. The console listens for Socket.IO updates and also polls project stats every 10 seconds, so a new event normally appears within a few seconds while the dashboard is open.',
                note: {
                    tone: 'info',
                    text: 'There is no plan-based refresh SLA in V1. Free, Basic, Pro, and Business all use the same 10-second polling fallback; real-time delivery depends on the Socket.IO connection.',
                },
                links: [
                    { to: '/docs/api/analytics', label: 'Analytics API reference' },
                    { to: '/dashboard/projects', label: 'Open your dashboard' },
                ],
                seeAlso: ['analytics--realtime'],
                keywords: ['delay', 'real time', 'refresh', 'appear', 'polling', 'socket', 'slow'],
            },
        ],
    },
    {
        id: 'tracking-events',
        title: 'Tracking & Events',
        subtitle: 'Page views, custom events, and why counts differ',
        icon: Send,
        items: [
            {
                id: 'events-not-showing',
                q: "Why aren't my events appearing in the dashboard?",
                summary: 'Work through the request path in order: the script must load, the ID must match, the project must be active, and the event must be accepted.',
                steps: [
                    'Check DevTools → Network for `GET /api/v1/track/script.js` returning 200.',
                    "Confirm `tracker('init', ...)` runs before `tracker('track', ...)`, and the ID matches project Settings exactly. Tracking IDs are case-sensitive.",
                    'Look at the `POST /api/v1/track/events` response. `401` means the key is missing; `404` means it was not recognized; `403` means the project is disabled or over its limit.',
                    'Make sure the project is active and your monthly event allowance is not exhausted.',
                    'Test in a normal window with extensions disabled. Ad blockers and privacy browsers can block tracking requests.',
                ],
                note: {
                    tone: 'warning',
                    text: 'The current tracker uses `/api/v1/track/events`. Allowed-origin rules apply to the legacy path-based endpoints, not this standard endpoint.',
                },
                links: [
                    { to: '/docs/tracking#installation', label: 'Installation guide' },
                    { to: '/docs/api#errors', label: 'API errors reference' },
                ],
                seeAlso: ['troubleshooting--script-not-loading', 'tracking-events--invalid-id', 'troubleshooting--rate-limited'],
                keywords: ['missing events', 'no data', 'not tracking', 'debug', 'zero', 'events not showing'],
            },
            {
                id: 'send-page-view',
                q: 'How do I record a page view?',
                summary: "After `tracker('init', ...)`, call `tracker('track', 'page_view')` each time you want to count a page. The tracker adds the URL, referrer, and user agent automatically.",
                code: `tracker('init', 'YOUR_TRACKING_ID');
tracker('track', 'page_view');`,
                note: {
                    tone: 'info',
                    text: "For single-page apps, call it again when the route changes. If you load the ID-specific script at `/:trackingId/script.js`, it initializes itself and sends one page view on load.",
                },
                links: [
                    { to: '/docs/tracking#page-views', label: 'Page views documentation' },
                ],
                seeAlso: ['tracking-events--custom-events', 'api--react'],
                keywords: ['page view', 'pageview', 'track page', 'spa', 'route change'],
            },
            {
                id: 'custom-events',
                q: 'Can I send custom events and properties?',
                summary: 'Yes — the tracker accepts any event name and an optional data object. However, V1 does not store the event name or custom properties.',
                code: `tracker('track', 'pricing_cta_clicked', {
  plan: 'pro',
  source: 'footer'
});`,
                note: {
                    tone: 'warning',
                    text: 'Every accepted request is stored as a page view row. The event name and extra properties are accepted on the wire but are not persisted or shown as separate events in analytics.',
                },
                links: [
                    { to: '/docs/tracking/events', label: 'Custom events documentation' },
                ],
                seeAlso: ['billing--usage-reset'],
                keywords: ['custom event', 'properties', 'metadata', 'event name', 'click', 'signup'],
            },
            {
                id: 'duplicate-hits',
                q: 'Why do some events get ignored as duplicates?',
                summary: 'WebPulse de-duplicates rapid hits from the same visitor key. The standard endpoint ignores identical hits within 2 seconds; the legacy path endpoint uses a 5-second window.',
                note: {
                    tone: 'info',
                    text: 'Deduplication is keyed by a hash of IP address, user agent, and project. Two people behind the same IP and browser can collide, just as one person changing networks can appear as a new visitor.',
                },
                links: [
                    { to: '/docs/tracking#page-views', label: 'How page views are counted' },
                ],
                seeAlso: ['tracking-events--count-mismatch'],
                keywords: ['duplicate', 'dedupe', 'ignored', 'repeated', 'two seconds'],
            },
            {
                id: 'invalid-id',
                q: 'What happens when my Tracking ID is invalid?',
                summary: 'The exact error depends on which endpoint you call and whether the key is missing, unknown, or blocked.',
                table: {
                    headers: ['Status', 'Code', 'What it means'],
                    rows: [
                        ['401', '`UNAUTHORIZED`', 'No key was supplied to `POST /track/events`.'],
                        ['404', '`INVALID_API_KEY`', 'The key sent to `POST /track/events` does not match a project.'],
                        ['404', '`INVALID_TRACKING_ID`', 'The ID in the legacy `/track/:trackingId` path does not match a project.'],
                        ['403', '`FORBIDDEN`', 'The project is disabled.'],
                        ['403', '`LIMIT_EXCEEDED`', 'The monthly event or storage limit is reached.'],
                    ],
                },
                note: {
                    tone: 'info',
                    text: "Copy the ID from the project's Settings tab. IDs are public but must match exactly; leading or trailing whitespace produces an unknown key.",
                },
                links: [
                    { to: '/docs/api#errors', label: 'API errors reference' },
                ],
                seeAlso: ['billing--limit-reached', 'troubleshooting--blocked-request'],
                keywords: ['invalid', '401', '404', 'unauthorized', 'tracking id not working', 'api key rejected'],
            },
            {
                id: 'count-mismatch',
                q: 'Why is my event count different from another analytics tool?',
                summary: 'Different tools define and filter events differently. WebPulse filters known bots, removes rapid duplicates, and only counts requests that reach its API.',
                bullets: [
                    'Known bots are filtered before storage.',
                    'Rapid repeat hits from the same key are ignored: 2 seconds on the standard endpoint, 5 seconds on legacy path tracking.',
                    'Ad blockers, privacy extensions, and CSP rules can stop the tracker from loading.',
                    'Unique visitors are derived from an IP + user-agent + project hash, not a cookie, so definitions differ from cookie-based tools.',
                    'Every accepted request becomes a page view, including custom events; other tools may separate those.',
                ],
                note: {
                    tone: 'info',
                    text: "Compare the same date range and timezone, and use WebPulse's own event count as the source of truth for usage.",
                },
                links: [
                    { to: '/docs/tracking#page-views', label: 'How page views are counted' },
                ],
                seeAlso: ['analytics--visitor-count'],
                keywords: ['discrepancy', 'google analytics', 'higher', 'lower', 'difference', 'counts don\'t match'],
            },
        ],
    },
    {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        subtitle: 'Diagnose common tracking and dashboard issues',
        icon: Wrench,
        items: [
            {
                id: 'script-not-loading',
                q: "The tracker script won't load",
                summary: "A 404 or blocked script means no events can be sent. Check the URL, the API origin, and the browser's content policy.",
                steps: [
                    'Open the script URL directly in a new tab. It should return JavaScript, not a 404 page.',
                    'Use the API origin your deployment actually serves. The default snippet points at `https://api.webpulse.app`.',
                    'Check the browser console for CSP violations and allow the API origin in `script-src` and `connect-src`.',
                    'Disable ad blockers or privacy extensions for the test, and confirm the request is HTTPS if your site is HTTPS.',
                ],
                links: [
                    { to: '/docs/tracking#installation', label: 'Installation guide' },
                ],
                seeAlso: ['getting-started--install-tracker', 'troubleshooting--works-locally'],
                keywords: ['script', '404', 'csp', 'content security policy', 'blocked', 'load'],
            },
            {
                id: 'works-locally',
                q: 'Tracking works locally but not in production',
                summary: 'The most common causes are a different API origin, the wrong Tracking ID, or an allowed-origin mismatch.',
                steps: [
                    "Confirm production uses the same project's Tracking ID. Separate staging and production projects need separate IDs.",
                    'Check that the production API URL is reachable over HTTPS and is not blocked by CSP.',
                    "For legacy path-based tracking, add the exact production origin (scheme + host + port) to the project's Allowed Origins.",
                    'If you use the standard `/track/events` endpoint, project allowed origins are not enforced by the API today; keep checking the ID, project state, and usage limit.',
                ],
                note: {
                    tone: 'warning',
                    text: 'Allowed origins are not authentication. The Tracking ID is public and can be copied from your page source.',
                },
                links: [
                    { to: '/docs/security#allowed-origins', label: 'Allowed origins documentation' },
                ],
                seeAlso: ['projects--allowed-origins', 'tracking-events--events-not-showing'],
                keywords: ['production', 'localhost', 'deploy', 'live', 'not working', 'origin'],
            },
            {
                id: 'dashboard-stale',
                q: "The dashboard isn't updating",
                summary: 'Confirm events are actually being accepted, then check the live connection.',
                steps: [
                    'Open DevTools and verify `POST /api/v1/track/events` returns `{ "success": true }`.',
                    'Check that the project is active and has not reached its event or storage limit.',
                    'Reload the project page. The dashboard subscribes over Socket.IO and falls back to a 10-second poll.',
                    'Look for `visitor_update` traffic in the browser network panel or console.',
                ],
                links: [
                    { to: '/docs/api/analytics', label: 'Analytics API reference' },
                ],
                seeAlso: ['analytics--realtime', 'getting-started--data-delay'],
                keywords: ['dashboard', 'refresh', 'live', 'stale', 'not updating', 'socket'],
            },
            {
                id: 'rate-limited',
                q: "I'm getting HTTP 429 responses",
                summary: 'Tracking endpoints are rate-limited to 100 requests per IP address per 15-minute window. A 429 response is plain text, not the usual JSON error shape.',
                steps: [
                    'Wait for the current 15-minute window to reset.',
                    'Batch or reduce page-view calls; avoid sending an event on every tiny interaction.',
                    'If you are sending from a server or shared IP, account for all traffic from that IP sharing the same limit.',
                ],
                note: {
                    tone: 'info',
                    text: 'The limiter applies to public tracking routes. Repeated 429s can also appear in project activity as `rate_limit.hit`.',
                },
                links: [
                    { to: '/docs/api#errors', label: 'API errors reference' },
                ],
                seeAlso: ['tracking-events--events-not-showing'],
                keywords: ['429', 'too many requests', 'rate limit', 'throttled', 'limit'],
            },
            {
                id: 'blocked-request',
                q: 'A request is blocked by allowed origins',
                summary: "For legacy path-based tracking, WebPulse compares the request origin with the project's Allowed Origins list and rejects mismatches.",
                table: {
                    headers: ['Status', 'Code', 'What it means'],
                    rows: [
                        ['403', '`CORS_BLOCKED`', "The browser origin is not in the project's allowed list."],
                        ['403', '`ORIGIN_NOT_ALLOWED`', 'The request reached the controller but its hostname is not allowed.'],
                        ['403', '`INVALID_ORIGIN`', 'The `Origin` or `Referer` header could not be parsed.'],
                    ],
                },
                steps: [
                    "Open the project's Integration tab and add the exact production origin, including `https://` and any non-default port.",
                    'Remove trailing paths. Allowed entries are origins such as `https://example.com`, not full URLs.',
                    'Keep the list within your plan limit: 1 on Free, 3 on Basic, 10 on Pro, 100 on Business.',
                ],
                note: {
                    tone: 'warning',
                    text: 'Requests with no `Origin` header bypass this browser check. The standard `/api/v1/track/events` endpoint does not currently enforce project allowed origins.',
                },
                links: [
                    { to: '/docs/security#allowed-origins', label: 'Allowed origins documentation' },
                ],
                seeAlso: ['projects--allowed-origins', 'troubleshooting--works-locally'],
                keywords: ['cors', 'origin', 'blocked', '403', 'allowed origins', 'domain'],
            },
        ],
    },
    {
        id: 'analytics',
        title: 'Analytics & Dashboard',
        subtitle: 'Read the numbers and understand the methodology',
        icon: BarChart3,
        items: [
            {
                id: 'visitor-count',
                q: 'How are unique visitors counted?',
                summary: 'Unique visitors are counted from visitor records, which are keyed by a SHA-256 hash of IP address + user agent + project. WebPulse does not set an analytics cookie.',
                note: {
                    tone: 'info',
                    text: 'There is no inactivity timeout that retires a visitor key. The same person on a new network or browser becomes a new visitor; multiple people behind one IP and browser can be merged.',
                },
                links: [
                    { to: '/docs/tracking#sessions', label: 'Sessions documentation' },
                ],
                seeAlso: ['analytics--sessions', 'security--cookies'],
                keywords: ['unique visitors', 'visitor count', 'cookie', 'hash', 'fingerprint'],
            },
            {
                id: 'sessions',
                q: 'What counts as a session?',
                summary: 'A session is the visitor record produced from the same IP + user-agent + project hash. Repeated activity updates that record\'s `last_seen` instead of creating a new visitor.',
                note: {
                    tone: 'info',
                    text: 'V1 does not use a cookie or a 30-minute inactivity window to start a new session. A session key persists as long as the hash stays the same.',
                },
                links: [
                    { to: '/docs/tracking#sessions', label: 'Sessions documentation' },
                ],
                seeAlso: ['analytics--visitor-count'],
                keywords: ['session', 'visit', 'timeout', 'inactivity', 'cookie'],
            },
            {
                id: 'realtime',
                q: 'How real-time is the live dashboard?',
                summary: 'The project dashboard receives `visitor_update` events over Socket.IO and also refreshes stats every 10 seconds as a fallback. Live visitors counts visitor records seen in the last 5 minutes.',
                steps: [
                    'Socket.IO delivers new events while the dashboard is open.',
                    'The 10-second poll catches updates if the socket disconnects.',
                    'There is no plan-based SLA or per-plan refresh interval in the V1 implementation.',
                ],
                note: {
                    tone: 'info',
                    text: 'If the dashboard is closed, events are still stored; only the live display stops updating.',
                },
                links: [
                    { to: '/docs/api/analytics', label: 'Analytics API reference' },
                ],
                seeAlso: ['getting-started--data-delay'],
                keywords: ['real time', 'live', 'dashboard refresh', 'socket', '10 seconds', 'sla'],
            },
            {
                id: 'traffic-sources',
                q: 'How are traffic sources classified?',
                summary: 'WebPulse groups events by the hostname of the `referrer` field. Events with no referrer are grouped as Direct.',
                bullets: [
                    '`document.referrer` is captured by the tracker when the event is sent.',
                    'A full referrer URL is reduced to its hostname for the top-sources chart.',
                    'A malformed referrer is shown as-is. An empty referrer becomes Direct.',
                    'UTM parameters are not used for source grouping today.',
                ],
                note: {
                    tone: 'info',
                    text: "Referrer data depends on browser privacy settings and the source site's referrer policy. `Referrer-Policy: no-referrer` on the linking page produces Direct traffic.",
                },
                links: [
                    { to: '/docs/tracking#page-views', label: 'Page views documentation' },
                ],
                seeAlso: ['analytics--date-ranges'],
                keywords: ['referrer', 'traffic source', 'direct', 'utm', 'campaign', 'hostname'],
            },
            {
                id: 'date-ranges',
                q: 'Which date ranges can I view?',
                summary: "Project analytics offer 24 hours, 7 days, and 30 days. The selected timezone is used to bucket traffic into hours or days.",
                steps: [
                    "Use the range control in the project's Analytics tab.",
                    'The overview shows page views over time, unique visitors, top referrers, devices, and top pages for that range.',
                    'Geography, live visitors, and recent activity are available in the project dashboard and activity views.',
                ],
                note: {
                    tone: 'info',
                    text: 'Analytics records are kept until the project is deleted; there is no configurable retention window in V1.',
                },
                links: [
                    { to: '/docs/getting-started#quick-start', label: 'Getting started guide' },
                ],
                seeAlso: ['security--retention'],
                keywords: ['date range', '24h', '7d', '30d', 'historical', 'timezone', 'history'],
            },
        ],
    },
    {
        id: 'api',
        title: 'API & Developer',
        subtitle: 'Public tracking endpoints and console sessions',
        icon: Code2,
        items: [
            {
                id: 'auth',
                q: 'How do I authenticate API requests?',
                summary: "WebPulse has two access levels: public tracking endpoints use the project's Tracking ID, while console endpoints require a signed-in session.",
                table: {
                    headers: ['Access', 'Used by', 'Credential'],
                    rows: [
                        ['Public tracking', 'Tracker, event and count endpoints', '`x-api-key: YOUR_TRACKING_ID`'],
                        ['Console session', 'Dashboard and project/account endpoints', 'Signed-in console session'],
                    ],
                },
                note: {
                    tone: 'info',
                    text: 'There is no separate secret project API key in V1. Personal access tokens are marked Coming Soon on the API Keys page.',
                },
                links: [
                    { to: '/docs/api/authentication', label: 'Authentication documentation' },
                ],
                seeAlso: ['api--api-key', 'security--tracking-id-public'],
                keywords: ['auth', 'authentication', 'api key', 'session', 'token', 'bearer'],
            },
            {
                id: 'api-key',
                q: 'Where do I find my API key, and is it secret?',
                summary: "The API key for public endpoints is the project's Tracking ID. It is shown in project Settings and on the API Keys page, and it is public by design.",
                steps: [
                    'Open the project → Settings, or API Keys in the sidebar.',
                    'Use the copy button and send the value as `x-api-key`.',
                    'Treat it as an identifier, not a password; it will be visible in browser code.',
                ],
                note: {
                    tone: 'warning',
                    text: 'Do not reuse your account password or session token as a tracking key. A separate secret key or personal access token is not available yet.',
                },
                links: [
                    { to: '/dashboard/api-key', label: 'Open API Keys' },
                    { to: '/docs/security#api-keys', label: 'API keys documentation' },
                ],
                seeAlso: ['security--tracking-id-public', 'getting-started--find-tracking-id'],
                keywords: ['api key', 'secret', 'tracking id', 'find key', 'public key'],
            },
            {
                id: 'send-event',
                q: 'How do I send an event through the API?',
                summary: 'POST a JSON body to `/api/v1/track/events` with your Tracking ID in the `x-api-key` header. Clients that cannot set headers can send the same value as an `apiKey` body field or `?apiKey=` query parameter.',
                code: `curl -X POST "${API_DOMAIN}/api/v1/track/events" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_TRACKING_ID" \\
  -d '{
    "event": "page_view",
    "url": "https://example.com/pricing",
    "referrer": "https://google.com",
    "title": "Pricing"
  }'`,
                note: {
                    tone: 'info',
                    text: 'The endpoint returns `{"success":true}` on success. Custom event names and extra fields are accepted but not stored as separate events.',
                },
                links: [
                    { to: '/docs/api/events', label: 'Track Events reference' },
                ],
                seeAlso: ['tracking-events--custom-events', 'api--errors'],
                keywords: ['post event', 'curl', 'rest', 'send event', 'json'],
            },
            {
                id: 'analytics-count',
                q: 'How do I read a view count through the API?',
                summary: "Call `GET /api/v1/analytics/count` with your Tracking ID. Without a filter it returns the project's total counter; with `?url=` it counts matching page URLs.",
                code: `curl "${API_DOMAIN}/api/v1/analytics/count?url=/pricing" \\
  -H "x-api-key: YOUR_TRACKING_ID"`,
                note: {
                    tone: 'warning',
                    text: 'The `url` filter uses a case-insensitive substring match, so `/pricing` also matches `/pricing/enterprise`.',
                },
                links: [
                    { to: '/docs/api/analytics', label: 'Analytics API reference' },
                ],
                seeAlso: ['api--errors'],
                keywords: ['analytics api', 'count', 'page count', 'view count', 'rest'],
            },
            {
                id: 'errors',
                q: 'What do API error responses mean?',
                summary: 'Most JSON endpoints return `{ success: false, error, code }`. Use `code` for program logic and the HTTP status for transport-level handling.',
                table: {
                    headers: ['Status', 'Code', 'Typical cause'],
                    rows: [
                        ['400', '`BAD_REQUEST`', 'Malformed JSON or missing/invalid parameters.'],
                        ['401', '`UNAUTHORIZED`', 'No key supplied to a tracking endpoint.'],
                        ['403', '`FORBIDDEN`', 'The project is disabled.'],
                        ['403', '`LIMIT_EXCEEDED`', 'Monthly or storage allowance reached.'],
                        ['404', '`NOT_FOUND` / `INVALID_API_KEY`', 'Unknown route, project, or key.'],
                        ['429', '—', 'Rate limit hit. The body is plain text.'],
                    ],
                },
                note: {
                    tone: 'info',
                    text: 'The rate limit is 100 requests per IP per 15 minutes across public tracking routes.',
                },
                links: [
                    { to: '/docs/api#errors', label: 'API errors reference' },
                ],
                seeAlso: ['tracking-events--invalid-id', 'troubleshooting--rate-limited'],
                keywords: ['errors', 'status code', 'response', '400', '401', '403', '404', '429'],
            },
            {
                id: 'react',
                q: 'How do I track route changes in React?',
                summary: 'Load the tracker once, initialize it with your Tracking ID, then send a page view whenever the route changes. Avoid sending on every render.',
                code: `import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function usePageViews() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.tracker?.('track', 'page_view');
  }, [pathname]);
}`,
                note: {
                    tone: 'info',
                    text: "If the script with `tracker('init', ...)` runs before React mounts, the hook can call `track` immediately. If you initialize inside React, guard against a duplicate initial page view.",
                },
                links: [
                    { to: '/docs/guides/react', label: 'React guide' },
                    { to: '/docs/javascript#tracker', label: 'JavaScript tracker reference' },
                ],
                seeAlso: ['getting-started--install-tracker'],
                keywords: ['react', 'spa', 'route changes', 'useeffect', 'react router'],
            },
        ],
    },
    {
        id: 'projects',
        title: 'Projects & Configuration',
        subtitle: 'Manage projects, domains, and share links',
        icon: Folder,
        items: [
            {
                id: 'edit-project',
                q: 'How do I rename or configure a project?',
                summary: 'Open the project → Settings tab. You can rename it, choose a timezone, copy the Tracking ID, toggle tracking, and adjust notifications.',
                steps: [
                    'Names may contain letters, numbers, hyphens, and underscores.',
                    'Timezones affect how analytics buckets traffic into days and hours.',
                    'Use Integration for allowed origins; use Billing for plan limits.',
                ],
                links: [
                    { to: '/dashboard/projects', label: 'Open projects' },
                    { to: '/docs/getting-started', label: 'Getting started guide' },
                ],
                seeAlso: ['projects--allowed-origins'],
                keywords: ['rename', 'project settings', 'timezone', 'configure', 'notifications'],
            },
            {
                id: 'allowed-origins',
                q: 'How do I configure allowed origins?',
                summary: 'Open the project → Integration tab → Allowed Origins. Add one origin per entry, for example `https://example.com`, and save the project.',
                steps: [
                    'Include the scheme and port but not a path: `https://app.example.com:8443`.',
                    "The browser's origin must match an entry for legacy path-based tracking. Wildcards are not supported.",
                    'Plan limits apply per project: 1 on Free, 3 on Basic, 10 on Pro, 100 on Business.',
                ],
                note: {
                    tone: 'warning',
                    text: 'The standard `/api/v1/track/events` endpoint used by the current tracker does not enforce project allowed origins yet. These entries restrict the legacy `/track/:trackingId` routes.',
                },
                links: [
                    { to: '/docs/security#allowed-origins', label: 'Allowed origins documentation' },
                ],
                seeAlso: ['troubleshooting--blocked-request'],
                keywords: ['allowed origins', 'domains', 'cors', 'whitelist', 'configure'],
            },
            {
                id: 'disable-project',
                q: 'How do I pause tracking for a project?',
                summary: "Turn off the project's Active toggle in Settings. New tracking requests are rejected while the project is disabled; existing analytics data stays available.",
                steps: [
                    'Open the project → Settings and switch the project to inactive.',
                    'The tracker will keep sending, but WebPulse will reject events while the project is disabled.',
                    'Re-enable it at any time; data collected before the pause is unchanged.',
                ],
                links: [
                    { to: '/dashboard/projects', label: 'Open projects' },
                ],
                seeAlso: ['projects--delete-project'],
                keywords: ['pause', 'disable', 'inactive', 'stop tracking', 'turn off'],
            },
            {
                id: 'delete-project',
                q: 'How do I delete a project and its data?',
                summary: 'Project deletion is immediate and permanent. It removes the project, page views, visitors, counters, monthly usage records, and project activity for that project.',
                steps: [
                    'Open the project → Settings → Danger Zone.',
                    'Confirm the deletion. There is no grace period and no restore.',
                    'Account-level audit logs and payment records are not removed by project deletion.',
                ],
                note: {
                    tone: 'warning',
                    text: 'Deleting a project cannot be undone. Save anything you need before confirming.',
                },
                links: [
                    { to: '/privacy#retention', label: 'Data retention policy' },
                ],
                seeAlso: ['security--retention', 'account--delete-account'],
                keywords: ['delete project', 'remove data', 'permanent', 'danger zone', 'cascade'],
            },
            {
                id: 'share-project',
                q: 'Can I share a read-only report?',
                summary: "Yes, on plans that include public reports. Open the project and choose Share to generate a read-only link; anyone with the link can view that project's dashboard.",
                steps: [
                    'Open the project and choose Share.',
                    'Generate the link and copy it. Regenerating invalidates the old link.',
                    'Use Disable sharing to revoke access.',
                ],
                note: {
                    tone: 'info',
                    text: 'Public reports are available on Pro (up to 5) and Business (up to 100). Free and Basic do not include them. Anyone with the link can view the report.',
                },
                links: [
                    { to: '/pricing', label: 'Compare plans' },
                ],
                seeAlso: ['billing--plans'],
                keywords: ['share', 'public report', 'read only', 'link', 'share token'],
            },
        ],
    },
    {
        id: 'account',
        title: 'Authentication & Account',
        subtitle: 'Sign-in, verification, and account security',
        icon: User,
        items: [
            {
                id: 'create-account',
                q: 'How do I create an account?',
                summary: 'Register with an email and password, or continue with Google. Email sign-ups must verify a 6-digit code before they can sign in.',
                steps: [
                    'Open the Register page and enter your details. Passwords must be at least 6 characters.',
                    'Check your inbox for a 6-digit verification code and enter it on the verification screen. Codes expire after 10 minutes.',
                    "After verification, you're signed in and can create your first project.",
                ],
                note: {
                    tone: 'info',
                    text: 'Google sign-ups are treated as verified because Google has already confirmed the email address.',
                },
                links: [
                    { to: '/register', label: 'Create an account' },
                ],
                seeAlso: ['account--verify-email'],
                keywords: ['sign up', 'register', 'create account', 'google', 'password'],
            },
            {
                id: 'verify-email',
                q: 'How do I verify my email?',
                summary: 'Enter the 6-digit code sent to your email. The code is valid for 10 minutes; request a new one if it expires.',
                steps: [
                    'After registering, open the verification screen and enter the code.',
                    'If the code expired, choose Resend verification and use the newest email.',
                    'Sign in with Google instead if your account was created through Google; those accounts are verified automatically.',
                ],
                links: [
                    { to: '/verify-email', label: 'Open verification' },
                ],
                seeAlso: ['account--no-email'],
                keywords: ['verify email', 'otp', 'code', '6-digit', 'expired', 'verification'],
            },
            {
                id: 'no-email',
                q: "I didn't receive my verification email",
                summary: 'Check spam and promotions, confirm the address, then request a fresh code. Only the most recent code is valid.',
                steps: [
                    'Search all inbox folders for an email from WebPulse and confirm you registered with that address.',
                    'Choose Resend verification on the verification screen; the new code replaces the old one.',
                    'If nothing arrives, open a GitHub issue and avoid posting personal information or verification codes.',
                ],
                note: {
                    tone: 'warning',
                    text: 'Never post passwords, session tokens, or verification codes in a public issue.',
                },
                links: [
                    { to: '/verify-email', label: 'Open verification' },
                    { href: ISSUES_URL, label: 'Open a GitHub issue' },
                ],
                seeAlso: ['account--verify-email'],
                keywords: ['no email', 'not received', 'spam', 'resend', 'verification email'],
            },
            {
                id: 'reset-password',
                q: 'How do I reset a forgotten password?',
                summary: 'Use the Forgot password flow to request a reset link by email. The link opens a page where you choose a new password.',
                steps: [
                    'Open Forgot password and enter the email on your account.',
                    'Follow the link in the email. If it has expired, request another.',
                    'Choose a new password of at least 6 characters, then sign in again.',
                ],
                note: {
                    tone: 'info',
                    text: 'Reset links are time-limited. If no account exists for the address, the request returns an error rather than sending mail.',
                },
                links: [
                    { to: '/forgot-password', label: 'Reset your password' },
                ],
                seeAlso: ['account--password-sessions'],
                keywords: ['forgot password', 'reset', 'locked out', 'email link'],
            },
            {
                id: 'password-sessions',
                q: 'How do I change my password or sign out other sessions?',
                summary: 'Open Settings → Security. Change your password from there and review or revoke active sessions.',
                steps: [
                    'Open Dashboard → Settings → Security.',
                    'Enter your current password, then the new password twice.',
                    "Under Active Sessions, revoke any session you don't recognize. Revoking signs that session out.",
                ],
                note: {
                    tone: 'warning',
                    text: 'If you think your account is compromised, change your password and revoke other sessions immediately.',
                },
                links: [
                    { to: '/dashboard/settings/security', label: 'Open security settings' },
                ],
                seeAlso: ['account--reset-password'],
                keywords: ['change password', 'active sessions', 'sign out', 'security', 'revoke'],
            },
            {
                id: 'delete-account',
                q: 'Can I delete my account?',
                summary: 'Account deletion is not self-service in V1. It must be requested through the contact channel in the Privacy Policy.',
                steps: [
                    'Review your projects and delete any you no longer need.',
                    'Open the Privacy Policy and use the contact section to submit the request.',
                    'Include the account email in the request, but never include your password or session token.',
                ],
                note: {
                    tone: 'warning',
                    text: 'Deleting individual projects is immediate but does not delete your WebPulse account. Account deletion is handled separately.',
                },
                links: [
                    { to: '/privacy#contact', label: 'Privacy contact' },
                    { to: '/privacy#retention', label: 'Data retention policy' },
                ],
                seeAlso: ['projects--delete-project', 'security--retention'],
                keywords: ['delete account', 'close account', 'privacy', 'gdpr', 'remove account'],
            },
        ],
    },
    {
        id: 'security',
        title: 'Security & Privacy',
        subtitle: 'Data handling, retention, and access',
        icon: Shield,
        items: [
            {
                id: 'tracking-id-public',
                q: 'Is my Tracking ID a secret?',
                summary: 'No. The Tracking ID identifies your project and is designed to be visible in client-side code and network requests.',
                bullets: [
                    'Use it in the browser, in `x-api-key` headers, and in legacy path URLs.',
                    'Anyone who can load your site can read it; that does not give them access to your console or account.',
                    'There is no separate secret project API key in V1. Personal access tokens are Coming Soon.',
                ],
                note: {
                    tone: 'warning',
                    text: 'Keep your account password, session cookie, and bearer token private. Those are different from the public Tracking ID.',
                },
                links: [
                    { to: '/docs/security#api-keys', label: 'API keys documentation' },
                ],
                seeAlso: ['api--api-key'],
                keywords: ['secret', 'public', 'safe', 'exposed', 'api key security', 'credentials'],
            },
            {
                id: 'data-collected',
                q: 'What data does WebPulse collect?',
                summary: 'WebPulse stores event context, visitor metadata, and derived device/location information.',
                bullets: [
                    'Event: page URL, referrer, page title, and timestamp. The request may also include an event name and custom fields, which are not stored.',
                    'Visitor: a session key derived from IP + user agent + project, IP address, user agent, and last-seen time.',
                    'Derived: approximate country, city, device type, browser, and operating system.',
                    'Account and project: email, name, plan, project settings, usage counters, payments, and activity logs.',
                ],
                note: {
                    tone: 'info',
                    text: 'WebPulse does not set an analytics cookie. Check the Privacy Policy for the full data-handling description.',
                },
                links: [
                    { to: '/privacy', label: 'Privacy Policy' },
                    { to: '/docs/security', label: 'Security guide' },
                ],
                seeAlso: ['security--cookies', 'security--retention'],
                keywords: ['data collected', 'privacy', 'ip', 'location', 'user agent', 'personal data'],
            },
            {
                id: 'cookies',
                q: 'Does WebPulse use cookies or local storage?',
                summary: 'Analytics itself does not set a cookie. Visitor identity is derived from a hash of IP address, user agent, and project.',
                bullets: [
                    'The tracker does not write cookies or localStorage for analytics.',
                    'The console uses an HttpOnly session cookie for sign-in, which is unrelated to visitor tracking.',
                    "Because there is no analytics cookie, clearing cookies doesn't reset a visitor, but changing IP or user agent does create a new key.",
                ],
                links: [
                    { to: '/privacy', label: 'Privacy Policy' },
                    { to: '/docs/tracking#sessions', label: 'Sessions documentation' },
                ],
                seeAlso: ['analytics--visitor-count'],
                keywords: ['cookies', 'local storage', 'consent', 'cookie banner', 'tracking'],
            },
            {
                id: 'retention',
                q: 'How long is analytics data retained?',
                summary: 'Analytics records stay in your account until the project is deleted. V1 has no configurable retention window and no automatic time-based deletion.',
                steps: [
                    'Page views, visitors, counters, monthly usage, and project activity are removed when their project is deleted.',
                    'Project activity logs are capped at 1,000 entries; older entries are removed as new ones arrive.',
                    'Account-level records such as payments and audit logs remain after a project is deleted.',
                ],
                note: {
                    tone: 'warning',
                    text: 'If you need records for compliance, save them before deleting a project. Deletion is immediate and cannot be restored.',
                },
                links: [
                    { to: '/privacy#retention', label: 'Data retention policy' },
                    { to: '/docs/security', label: 'Security guide' },
                ],
                seeAlso: ['projects--delete-project'],
                keywords: ['retention', 'how long', 'delete automatically', 'storage', 'gdpr', 'data retention'],
            },
            {
                id: 'secure-integration',
                q: 'How should I secure my WebPulse integration?',
                summary: 'Treat the Tracking ID as public and everything else as private.',
                steps: [
                    'Keep console sessions, bearer tokens, and account passwords out of client-side code.',
                    'Serve your site and API requests over HTTPS.',
                    "Set allowed origins for legacy path tracking, but don't treat them as authentication.",
                    'Use CSP rules that permit your API origin in `script-src` and `connect-src`.',
                    'Review monthly usage and upgrade before hitting an event or storage limit.',
                ],
                links: [
                    { to: '/docs/security#best-practices', label: 'Security best practices' },
                    { to: '/privacy', label: 'Privacy Policy' },
                ],
                seeAlso: ['security--tracking-id-public', 'projects--allowed-origins'],
                keywords: ['security', 'https', 'csp', 'best practices', 'credentials', 'secure'],
            },
        ],
    },
    {
        id: 'billing',
        title: 'Billing & Plans',
        subtitle: 'Plans, usage limits, and payments',
        icon: CreditCard,
        items: [
            {
                id: 'plans',
                q: 'What plans are available?',
                summary: 'WebPulse has four plans. All prices are in INR per month; paid plans are purchased as one-time Razorpay orders.',
                table: {
                    headers: ['Plan', 'Price', 'Events / month', 'Projects', 'Allowed domains / project'],
                    rows: [
                        ['Free', '₹0', '1,000', '1', '1'],
                        ['Basic', '₹299', '50,000', '5', '3'],
                        ['Pro', '₹999', '500,000', '15', '10'],
                        ['Business', '₹2,999', '5,000,000', '100', '100'],
                    ],
                },
                note: {
                    tone: 'info',
                    text: 'There is no subscription, no annual billing and no automatic renewal. A paid plan stays active until you change it or close your account; the monthly event allowance resets on the first day of each calendar month. Storage limits also apply: 1 GB, 5 GB, 15 GB, and 100 GB.',
                },
                links: [
                    { to: '/pricing', label: 'View pricing' },
                    { to: '/dashboard/billing', label: 'Open billing' },
                ],
                seeAlso: ['billing--usage-reset'],
                keywords: ['plans', 'pricing', 'cost', 'free', 'basic', 'pro', 'business', 'limits'],
            },
            {
                id: 'upgrade',
                q: 'How do I upgrade my plan?',
                summary: 'Choose a plan in Billing and complete the Razorpay checkout. Your account is updated only after the payment signature is verified.',
                steps: [
                    'Open Dashboard → Billing → Choose your plan.',
                    'Complete the Razorpay order. The payment is verified server-side before the plan changes.',
                    'The new limits apply immediately. A receipt is added to Payment History and emailed to your account address.',
                ],
                note: {
                    tone: 'info',
                    text: 'If you already have a paid plan, selecting a different paid plan creates a new full-price order. There is no proration or credit for the unused portion.',
                },
                links: [
                    { to: '/dashboard/billing', label: 'Open billing' },
                ],
                seeAlso: ['billing--downgrade', 'billing--receipts'],
                keywords: ['upgrade', 'payment', 'razorpay', 'checkout', 'plan change'],
            },
            {
                id: 'downgrade',
                q: 'How do I downgrade my plan?',
                summary: 'The console supports a direct downgrade to Free. Moving from one paid plan to another is handled as a new paid order, not a prorated downgrade.',
                steps: [
                    'Open Dashboard → Billing and select the Free plan.',
                    'Confirm the downgrade. Free limits apply immediately: 1 project, 1 allowed domain, and 1,000 events per month.',
                    'Existing projects and data are not deleted automatically when the plan changes.',
                ],
                note: {
                    tone: 'warning',
                    text: 'Paid-to-paid changes do not prorate or credit the unused part of your current plan. Complete a new order for the target plan.',
                },
                links: [
                    { to: '/dashboard/billing', label: 'Open billing' },
                    { to: '/pricing', label: 'Compare plans' },
                ],
                seeAlso: ['billing--plans'],
                keywords: ['downgrade', 'cancel', 'free plan', 'switch plan', 'proration', 'refund'],
            },
            {
                id: 'usage-reset',
                q: 'How is monthly usage counted, and when does it reset?',
                summary: "Every accepted tracking request counts as one event against the account's shared monthly allowance. The month is calculated in UTC and resets on the first day of the next UTC month.",
                steps: [
                    'All projects on the account share one monthly event allowance.',
                    'Bot-filtered and duplicate requests are not counted; every accepted custom event is.',
                    'Usage is keyed by `YYYY-MM` in UTC. On the 1st, a new usage row starts at zero.',
                    'Project, allowed-domain, and storage limits also apply to your plan.',
                ],
                links: [
                    { to: '/dashboard/billing', label: 'View usage in billing' },
                    { to: '/docs/tracking#page-views', label: 'How page views are counted' },
                ],
                seeAlso: ['billing--limit-reached'],
                keywords: ['usage', 'monthly', 'reset', 'quota', 'events', 'billing cycle', 'utc'],
            },
            {
                id: 'limit-reached',
                q: 'What happens when I reach my event limit?',
                summary: 'Tracking requests return `403 LIMIT_EXCEEDED` until the allowance resets or you upgrade. Existing analytics remain visible.',
                steps: [
                    'Check Billing to see whether the monthly event or storage limit was reached.',
                    'Wait for the UTC month to reset, upgrade the plan, or delete projects you no longer need to release storage.',
                    'After upgrading, tracking resumes as soon as the payment is verified.',
                ],
                note: {
                    tone: 'warning',
                    text: 'Bot-filtered and duplicate requests never consume usage, but accepted custom events count toward the same limit as page views.',
                },
                links: [
                    { to: '/dashboard/billing', label: 'Open billing' },
                    { to: '/pricing', label: 'Compare plans' },
                ],
                seeAlso: ['billing--downgrade'],
                keywords: ['limit reached', 'quota exceeded', 'blocked', '403', 'upgrade', 'storage limit'],
            },
            {
                id: 'receipts',
                q: 'Where can I find receipts and payment history?',
                summary: 'Payment History in Billing lists your orders. You can download each receipt as a PDF or resend it to your account email.',
                steps: [
                    'Open Dashboard → Billing → Payment History.',
                    'Choose Download to save the PDF, or Email to send it to your account address.',
                    'Each paid plan is a separate one-time Razorpay order; listed prices exclude applicable taxes.',
                ],
                note: {
                    tone: 'info',
                    text: 'Refunds are reviewed case by case under the Terms of Service; there is no automatic refund flow.',
                },
                links: [
                    { to: '/dashboard/billing', label: 'Open billing' },
                    { to: '/terms#billing', label: 'Billing terms' },
                ],
                seeAlso: ['billing--upgrade'],
                keywords: ['receipt', 'invoice', 'payment history', 'download', 'email', 'razorpay', 'billing'],
            },
        ],
    },
];

const FAQ_INDEX = categories.flatMap((category, categoryIndex) =>
    category.items.map((item, itemIndex) => ({
        key: `${category.id}--${item.id}`,
        item,
        category,
        categoryIndex,
        itemIndex,
        title: normalizeSearchText(item.q),
        keywords: normalizeSearchText((item.keywords || []).join(' ')),
        categoryText: normalizeSearchText(`${category.title} ${category.subtitle}`),
        body: normalizeSearchText(
            [
                item.summary,
                ...(item.steps || []),
                ...(item.bullets || []),
                item.code,
                item.note?.title,
                item.note?.text,
                ...(item.table?.headers || []),
                ...((item.table?.rows || []).flat()),
                ...((item.links || []).map((link) => link.label)),
            ]
                .filter(Boolean)
                .join(' ')
        ),
    }))
);

const FAQ_MAP = new Map(FAQ_INDEX.map((entry) => [entry.key, entry]));
const TOTAL_ANSWERS = FAQ_INDEX.length;

const POPULAR_QUESTIONS = [
    'getting-started--find-tracking-id',
    'tracking-events--events-not-showing',
    'tracking-events--custom-events',
    'analytics--visitor-count',
    'billing--limit-reached',
    'projects--delete-project',
];

const QUICK_ACTIONS = [
    {
        title: 'Install tracking',
        description: 'Add the script and send your first page view.',
        icon: Rocket,
        to: '/docs/tracking#installation',
    },
    {
        title: 'Find your Tracking ID',
        description: 'Locate the public ID used by the tracker and API.',
        icon: KeyRound,
        faq: 'getting-started--find-tracking-id',
    },
    {
        title: 'Fix missing events',
        description: 'Work through the common causes, fastest first.',
        icon: Wrench,
        faq: 'tracking-events--events-not-showing',
    },
    {
        title: 'Explore the API',
        description: 'Send events and read counts from your backend.',
        icon: Code2,
        to: '/docs/api',
    },
];

const DOC_LINKS = [
    {
        title: 'Documentation',
        description: 'Setup, tracking concepts, and integration guides.',
        icon: BookOpen,
        to: '/docs',
    },
    {
        title: 'API reference',
        description: 'Authentication, endpoints, and error codes.',
        icon: Terminal,
        to: '/docs/api',
    },
    {
        title: 'Security guide',
        description: 'Credentials, origins, and integration best practices.',
        icon: ShieldCheck,
        to: '/docs/security',
    },
];

const SEARCH_SUGGESTIONS = ['tracking ID', 'allowed origins', 'rate limit', 'custom events'];

function normalizeSearchText(value) {
    return String(value ?? '')
        .toLowerCase()
        .replace(/[’']/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function getSearchTokens(query) {
    const normalized = normalizeSearchText(query);
    if (!normalized) return [];
    const raw = normalized.split(' ');
    const meaningful = raw.filter((token) => !SEARCH_STOPWORDS.has(token));
    return meaningful.length > 0 ? meaningful : raw;
}

function wordMatches(text, token) {
    if (!text || !token) return false;
    return text.split(' ').some((word) => {
        if (word === token) return true;
        if (token.length >= 3 && word.startsWith(token)) return true;
        if (word.length >= 3 && token.startsWith(word)) return true;
        return word.length >= 4 && token.length >= 4 && word.slice(0, 4) === token.slice(0, 4);
    });
}

function searchFaqs(query) {
    const phrase = normalizeSearchText(query);
    const tokens = getSearchTokens(query);
    if (!phrase || tokens.length === 0) return [];

    return FAQ_INDEX.map((entry) => {
        const tokenScores = tokens.map((token) => {
            let score = 0;
            if (wordMatches(entry.title, token)) score += 40;
            if (wordMatches(entry.keywords, token)) score += 16;
            if (wordMatches(entry.categoryText, token)) score += 8;
            if (wordMatches(entry.body, token)) score += 4;
            return score;
        });

        if (tokenScores.some((score) => score === 0)) return null;

        let score = tokenScores.reduce((total, value) => total + value, 0);
        if (entry.title === phrase) score += 120;
        else if (entry.title.includes(phrase)) score += 60;
        if (entry.keywords.includes(phrase)) score += 24;
        if (tokens.every((token) => wordMatches(entry.title, token))) score += 30;

        return { ...entry, score };
    })
        .filter(Boolean)
        .sort(
            (a, b) =>
                b.score - a.score ||
                a.categoryIndex - b.categoryIndex ||
                a.itemIndex - b.itemIndex
        );
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getScrollBehavior() {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

function Inline({ text }) {
    const parts = String(text ?? '')
        .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
        .filter(Boolean);

    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={index} className="font-semibold text-slate-100">
                    {part.slice(2, -2)}
                </strong>
            );
        }

        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code
                    key={index}
                    className="rounded-md border border-white/[0.06] bg-white/[0.05] px-1.5 py-0.5 font-mono text-[0.85em] text-violet-300"
                >
                    {part.slice(1, -1)}
                </code>
            );
        }

        return <span key={index}>{part}</span>;
    });
}

function HighlightText({ text, tokens }) {
    if (!tokens.length) return text;

    const escaped = [...new Set(tokens)]
        .sort((a, b) => b.length - a.length)
        .map((token) => `\\b${escapeRegExp(token)}`)
        .join('|');

    if (!escaped) return text;

    const regex = new RegExp(`(${escaped})`, 'gi');
    const lowerTokens = tokens.map((token) => token.toLowerCase());

    return String(text)
        .split(regex)
        .map((part, index) => {
            if (!part) return null;
            const isMatch = lowerTokens.some((token) => part.toLowerCase().startsWith(token));
            return isMatch ? (
                <mark key={index} className="rounded bg-violet-500/25 px-0.5 text-violet-100">
                    {part}
                </mark>
            ) : (
                <span key={index}>{part}</span>
            );
        });
}

function Callout({ note }) {
    if (!note) return null;

    const warning = note.tone === 'warning';
    const Icon = warning ? ShieldAlert : Info;

    return (
        <div
            role="note"
            className={`flex items-start gap-3 rounded-xl border p-4 ${
                warning
                    ? 'border-amber-400/20 bg-amber-400/[0.06]'
                    : 'border-violet-400/20 bg-violet-500/[0.06]'
            }`}
        >
            <Icon
                className={`mt-0.5 h-4 w-4 shrink-0 ${warning ? 'text-amber-300' : 'text-violet-300'}`}
                aria-hidden="true"
            />
            <div className="min-w-0">
                {note.title && (
                    <p className="mb-1 text-sm font-semibold text-slate-100">{note.title}</p>
                )}
                <p className="text-sm leading-relaxed text-slate-300">
                    <Inline text={note.text} />
                </p>
            </div>
        </div>
    );
}

function DataTable({ table }) {
    if (!table) return null;

    return (
        <div className="mkt-panel">
            <p className="border-b border-white/[0.06] px-4 py-2 text-[11px] text-slate-500 sm:hidden">
                Swipe or scroll horizontally to see all columns
            </p>
            <div
                className="overflow-x-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500/60"
                tabIndex={0}
                role="region"
                aria-label={table.headers.join(', ')}
            >
                <table className="w-full min-w-[34rem] text-left text-sm">
                    <thead>
                        <tr className="border-b border-white/[0.07] text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            {table.headers.map((header) => (
                                <th key={header} scope="col" className="bg-white/[0.02] px-4 py-3">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {table.rows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-t border-white/[0.05]">
                                {row.map((cell, cellIndex) => (
                                    <td
                                        key={cellIndex}
                                        className="px-4 py-3 align-top leading-relaxed text-slate-300"
                                    >
                                        <Inline text={cell} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AnswerLinks({ links }) {
    if (!links?.length) return null;

    return (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {links.map((link) =>
                link.href ? (
                    <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mkt-link !text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                    >
                        {link.label} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                ) : (
                    <Link
                        key={link.to}
                        to={link.to}
                        className="mkt-link !text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                    >
                        {link.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                )
            )}
        </div>
    );
}

function AnswerBody({ item, onOpenFaq }) {
    const related = (item.seeAlso || [])
        .map((key) => FAQ_MAP.get(key))
        .filter(Boolean);

    return (
        <div className="space-y-4 border-l-2 border-violet-400/30 pl-4 sm:pl-5">
            {item.summary && (
                <p className="text-sm leading-relaxed text-slate-300">
                    <Inline text={item.summary} />
                </p>
            )}

            {item.bullets?.length > 0 && (
                <ul className="space-y-2">
                    {item.bullets.map((bullet, index) => (
                        <li
                            key={index}
                            className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-300"
                        >
                            <span
                                aria-hidden="true"
                                className="mt-2 h-1 w-1 shrink-0 rounded-full bg-violet-400"
                            />
                            <span>
                                <Inline text={bullet} />
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {item.steps?.length > 0 && (
                <ol className="space-y-2.5">
                    {item.steps.map((step, index) => (
                        <li
                            key={index}
                            className="flex items-start gap-3 text-sm leading-relaxed text-slate-300"
                        >
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-[10px] font-semibold text-violet-300">
                                {index + 1}
                            </span>
                            <span>
                                <Inline text={step} />
                            </span>
                        </li>
                    ))}
                </ol>
            )}

            {item.code && (
                <div className="mkt-panel">
                    <div className="border-b border-white/[0.06] px-4 py-2.5">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Example
                        </span>
                    </div>
                    <CodeSnippet code={item.code} />
                </div>
            )}

            {item.table && <DataTable table={item.table} />}
            {item.note && <Callout note={item.note} />}
            <AnswerLinks links={item.links} />

            {related.length > 0 && (
                <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Related answers
                    </p>
                    <div className="flex flex-col gap-1.5">
                        {related.map((entry) => (
                            <button
                                key={entry.key}
                                type="button"
                                onClick={() => onOpenFaq(entry.key)}
                                className="group inline-flex items-start gap-2 text-left text-sm font-medium text-violet-300 transition-colors hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                            >
                                <ArrowRight
                                    className="mt-1 h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                                    aria-hidden="true"
                                />
                                <span>{entry.item.q}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ActionCard({ action }) {
    const Icon = action.icon;
    const className =
        'group mkt-card mkt-card-hover flex h-full w-full items-start gap-3.5 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60';

    const content = (
        <>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                <Icon className="h-4 w-4 text-violet-300" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-100">{action.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                    {action.description}
                </span>
            </span>
            <ArrowRight
                className="mt-1 h-4 w-4 shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-300"
                aria-hidden="true"
            />
        </>
    );

    if (action.to) {
        return (
            <Link to={action.to} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button type="button" onClick={action.onClick} className={className}>
            {content}
        </button>
    );
}

function SectionHeading({ eyebrow, title, description, id }) {
    return (
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="mkt-eyebrow mb-2">{eyebrow}</p>
                <h2 id={id} className="mkt-h2 !text-2xl sm:!text-3xl">
                    {title}
                </h2>
            </div>
            {description && (
                <p className="max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
            )}
        </div>
    );
}

function SearchResultCard({
    entry,
    index,
    isActive,
    isOpen,
    tokens,
    onToggle,
    onKeyDown,
    onOpenFaq,
    buttonRef,
}) {
    const Icon = entry.category.icon;
    const answerId = `search-answer-${entry.key}`;
    const questionId = `search-question-${entry.key}`;

    return (
        <div
            className={`mkt-card overflow-hidden transition-colors ${
                isActive
                    ? 'border-violet-400/40 bg-violet-500/[0.035]'
                    : 'hover:border-white/[0.18]'
            }`}
        >
            <h3>
                <button
                    ref={buttonRef}
                    id={questionId}
                    type="button"
                    onClick={onToggle}
                    onKeyDown={onKeyDown}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    className="group flex w-full items-start justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500/60"
                >
                    <span className="min-w-0 flex-1">
                        <span className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                <Icon className="h-3 w-3" aria-hidden="true" />
                                {entry.category.title}
                            </span>
                            {index === 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-300">
                                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                                    Best match
                                </span>
                            )}
                        </span>
                        <span className="block text-sm font-semibold leading-relaxed text-slate-100 transition-colors group-hover:text-violet-100">
                            <HighlightText text={entry.item.q} tokens={tokens} />
                        </span>
                        {!isOpen && (
                            <span className="mt-1.5 line-clamp-2 block text-sm leading-relaxed text-slate-500">
                                <Inline text={entry.item.summary} />
                            </span>
                        )}
                    </span>
                    <ChevronDown
                        className={`mt-1 h-4 w-4 shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-violet-300' : 'text-slate-600'
                        }`}
                        aria-hidden="true"
                    />
                </button>
            </h3>
            <div
                id={answerId}
                role="region"
                aria-labelledby={questionId}
                hidden={!isOpen}
                className="border-t border-white/[0.06] px-5 py-5"
            >
                <AnswerBody item={entry.item} onOpenFaq={onOpenFaq} />
            </div>
        </div>
    );
}

function CategoryCard({ category, openKey, onToggle, onOpenFaq }) {
    const Icon = category.icon;

    return (
        <section
            id={category.id}
            aria-labelledby={`${category.id}-title`}
            className="mkt-card scroll-mt-28 overflow-hidden"
        >
            <div className="flex items-start gap-3 border-b border-white/[0.06] px-5 py-5 sm:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                    <Icon className="h-4 w-4 text-violet-300" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                    <h3
                        id={`${category.id}-title`}
                        className="text-base font-semibold tracking-tight text-slate-100"
                    >
                        {category.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">{category.subtitle}</p>
                </div>
                <span className="mkt-chip hidden shrink-0 !text-[11px] sm:inline-flex">
                    {category.items.length} answers
                </span>
            </div>

            <div className="divide-y divide-white/[0.06]">
                {category.items.map((item) => {
                    const key = `${category.id}--${item.id}`;
                    const isOpen = openKey === key;
                    const questionId = `faq-question-${key}`;
                    const answerId = `faq-answer-${key}`;

                    return (
                        <div
                            key={key}
                            id={`faq-${key}`}
                            className={`scroll-mt-28 ${isOpen ? 'bg-violet-500/[0.025]' : ''}`}
                        >
                            <h4>
                                <button
                                    id={questionId}
                                    type="button"
                                    onClick={() => onToggle(key)}
                                    aria-expanded={isOpen}
                                    aria-controls={answerId}
                                    className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500/60 sm:px-6"
                                >
                                    <span
                                        className={`text-sm leading-relaxed transition-colors ${
                                            isOpen
                                                ? 'font-medium text-violet-200'
                                                : 'text-slate-300 group-hover:text-violet-200'
                                        }`}
                                    >
                                        {item.q}
                                    </span>
                                    <ChevronDown
                                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                                            isOpen ? 'rotate-180 text-violet-300' : 'text-slate-600'
                                        }`}
                                        aria-hidden="true"
                                    />
                                </button>
                            </h4>
                            <div
                                id={answerId}
                                role="region"
                                aria-labelledby={questionId}
                                hidden={!isOpen}
                                className="px-5 pb-6 sm:px-6"
                            >
                                <AnswerBody item={item} onOpenFaq={onOpenFaq} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

function CategoryTile({ category, onSelect }) {
    const Icon = category.icon;

    return (
        <button
            type="button"
            onClick={() => onSelect(category.id)}
            className="group mkt-card mkt-card-hover flex items-center gap-3 p-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
        >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10">
                <Icon className="h-4 w-4 text-violet-300" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-snug text-slate-200">
                    {category.title}
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-500">
                    {category.items.length} answers
                </span>
            </span>
            <ArrowRight
                className="h-3.5 w-3.5 shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-300"
                aria-hidden="true"
            />
        </button>
    );
}

function EmptySearch({ query, onClear, onSuggestion }) {
    return (
        <div className="mkt-card px-6 py-10 text-center sm:py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                <SearchX className="h-5 w-5 text-violet-300" aria-hidden="true" />
            </div>
            <h3 className="mkt-h3 mt-5 !text-xl">No answers for “{query}”</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                Try a broader phrase, check the spelling, or browse the documentation.
            </p>

            <div className="mt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Try one of these
                </p>
                <div className="mt-2.5 flex flex-wrap justify-center gap-2">
                    {SEARCH_SUGGESTIONS.map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => onSuggestion(suggestion)}
                            className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
                <button type="button" onClick={onClear} className="mkt-btn mkt-btn-primary mkt-btn-md">
                    Browse all answers
                </button>
                <Link to="/docs" className="mkt-btn mkt-btn-secondary mkt-btn-md">
                    Open documentation <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
            </div>
        </div>
    );
}

function DocCard({ doc }) {
    const Icon = doc.icon;

    return (
        <Link
            to={doc.to}
            className="group mkt-card mkt-card-hover flex items-start gap-3 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
        >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10">
                <Icon className="h-4 w-4 text-violet-300" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-100">{doc.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                    {doc.description}
                </span>
            </span>
            <ArrowRight
                className="mt-1 h-4 w-4 shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-300"
                aria-hidden="true"
            />
        </Link>
    );
}

export default function HelpCenter() {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [openKey, setOpenKey] = useState(null);
    const searchRef = useRef(null);
    const resultRefs = useRef([]);

    const isSearching = normalizeSearchText(query).length > 0;
    const tokens = getSearchTokens(query);
    const results = isSearching ? searchFaqs(query) : [];
    const displayQuery = query.trim();
    const resultLabel = results.length === 1 ? 'answer' : 'answers';

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;

            const target = event.target;
            const tag = target?.tagName;
            if (
                tag === 'INPUT' ||
                tag === 'TEXTAREA' ||
                tag === 'SELECT' ||
                target?.isContentEditable
            ) {
                return;
            }

            event.preventDefault();
            searchRef.current?.focus();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const updateQuery = (value) => {
        setQuery(value);

        if (!normalizeSearchText(value)) {
            setActiveIndex(0);
            setOpenKey(null);
            return;
        }

        const nextResults = searchFaqs(value);
        setActiveIndex(0);
        setOpenKey(nextResults[0]?.key ?? null);
    };

    const clearSearch = () => {
        setQuery('');
        setActiveIndex(0);
        setOpenKey(null);
        window.requestAnimationFrame(() => searchRef.current?.focus());
    };

    const scrollToCategory = (id) => {
        const element = document.getElementById(id);
        if (!element) return;
        element.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' });
    };

    const openFaq = (key) => {
        setQuery('');
        setActiveIndex(0);
        setOpenKey(key);

        window.setTimeout(() => {
            const element = document.getElementById(`faq-${key}`);
            if (!element) return;

            element.scrollIntoView({ behavior: getScrollBehavior(), block: 'center' });
            document.getElementById(`faq-question-${key}`)?.focus({ preventScroll: true });
        }, 80);
    };

    const toggleFaq = (key) => {
        setOpenKey((current) => (current === key ? null : key));
    };

    const moveSelection = (index) => {
        if (results.length === 0) return;

        const nextIndex = Math.max(0, Math.min(index, results.length - 1));
        setActiveIndex(nextIndex);
        setOpenKey(results[nextIndex].key);

        window.requestAnimationFrame(() => {
            const button = resultRefs.current[nextIndex];
            if (!button) return;
            button.focus({ preventScroll: true });
            button.scrollIntoView({ behavior: getScrollBehavior(), block: 'nearest' });
        });
    };

    const handleSearchKeyDown = (event) => {
        if (!isSearching || event.nativeEvent.isComposing) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            moveSelection(0);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            moveSelection(results.length - 1);
        } else if (event.key === 'Home') {
            event.preventDefault();
            moveSelection(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            moveSelection(results.length - 1);
        } else if (event.key === 'Enter' && results.length > 0) {
            event.preventDefault();
            moveSelection(activeIndex);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            clearSearch();
        }
    };

    const handleResultKeyDown = (event, index) => {
        if (event.nativeEvent.isComposing) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            moveSelection(index + 1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            moveSelection(index - 1);
        } else if (event.key === 'Home') {
            event.preventDefault();
            moveSelection(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            moveSelection(results.length - 1);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            clearSearch();
        }
    };

    const handleResultToggle = (index, key) => {
        setActiveIndex(index);
        setOpenKey((current) => (current === key ? null : key));
    };

    const chooseSuggestion = (suggestion) => {
        updateQuery(suggestion);
        window.requestAnimationFrame(() => searchRef.current?.focus());
    };

    const quickActions = QUICK_ACTIONS.map((action) => ({
        ...action,
        onClick: action.faq ? () => openFaq(action.faq) : undefined,
    }));

    return (
        <MarketingShell>
            <section className="relative overflow-hidden pb-6 pt-14 sm:pt-20">
                <div
                    aria-hidden="true"
                    className="mkt-glow left-1/2 top-[-220px] h-[420px] w-[780px] max-w-[120vw] -translate-x-1/2 bg-violet-600/25"
                />

                <div className="mkt-container relative">
                    <Reveal className="mx-auto max-w-3xl text-center">
                        <p className="mkt-eyebrow justify-center">Help Center</p>
                        <h1 className="mkt-h1 mt-4">
                            How can we <span className="mkt-accent-text">help?</span>
                        </h1>
                        <p className="mkt-lead mx-auto mt-5 max-w-2xl">
                            Find clear answers about tracking, analytics, the API, and billing.
                            Search {TOTAL_ANSWERS} answers or browse by topic.
                        </p>
                        <p className="mt-3 text-xs text-slate-500">
                            Every answer reflects how WebPulse V1 behaves today.
                        </p>

                        <div className="mx-auto mt-8 max-w-2xl">
                            <label htmlFor="help-search" className="sr-only">
                                Search WebPulse help
                            </label>
                            <div className="relative">
                                <Search
                                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                                    aria-hidden="true"
                                />
                                <input
                                    ref={searchRef}
                                    id="help-search"
                                    type="text"
                                    inputMode="search"
                                    autoComplete="off"
                                    spellCheck="false"
                                    value={query}
                                    onChange={(event) => updateQuery(event.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    placeholder={`Search ${TOTAL_ANSWERS} answers — try "tracking ID" or "rate limit"`}
                                    aria-describedby="help-search-hint"
                                    aria-controls="help-search-results"
                                    aria-keyshortcuts="/"
                                    className={`mkt-field !border-violet-400/20 !bg-[#070A10]/80 !py-4 !pl-12 !text-base shadow-[0_18px_50px_-30px_rgba(139,92,246,0.65)] ${
                                        query ? '!pr-14' : '!pr-16'
                                    }`}
                                />
                                {query ? (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        aria-label="Clear search"
                                        className="absolute right-2.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                ) : (
                                    <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/[0.1] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-slate-500 sm:block">
                                        /
                                    </kbd>
                                )}
                            </div>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-left text-xs text-slate-500">
                                <p id="help-search-hint">
                                    {TOTAL_ANSWERS} answers across {categories.length} categories
                                </p>
                                <p className="hidden items-center gap-1.5 sm:flex">
                                    <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1 py-0.5 font-mono text-[10px]">↑</kbd>
                                    <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1 py-0.5 font-mono text-[10px]">↓</kbd>
                                    browse
                                    <span aria-hidden="true">·</span>
                                    <kbd className="rounded border border-white/[0.1] bg-white/[0.04] px-1 py-0.5 font-mono text-[10px]">Esc</kbd>
                                    clear
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    {!isSearching && (
                        <Reveal delay={80} className="mx-auto mt-10 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {quickActions.map((action) => (
                                <ActionCard key={action.title} action={action} />
                            ))}
                        </Reveal>
                    )}
                </div>
            </section>

            <section className="relative pb-24 pt-8 sm:pt-10" aria-label="Help topics">
                <div className="mkt-container">
                    {isSearching ? (
                        <div id="help-search-results" className="mx-auto max-w-3xl">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <p className="mkt-eyebrow mb-2">Search results</p>
                                    <h2 className="mkt-h2 !text-2xl sm:!text-3xl">
                                        {results.length > 0
                                            ? `${results.length} ${resultLabel} found`
                                            : 'No answers found'}
                                    </h2>
                                    <p className="mt-1 break-words text-sm text-slate-500">
                                        for “{displayQuery}”
                                    </p>
                                    {results.length > 0 && (
                                        <p className="mt-3 text-xs text-slate-500">
                                            Use ↑ ↓ to browse, Enter to jump, and Esc to clear.
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="mkt-btn mkt-btn-secondary mkt-btn-sm self-start sm:self-auto"
                                >
                                    Clear search
                                </button>
                            </div>

                            <p className="sr-only" role="status" aria-live="polite">
                                {results.length} {resultLabel} found for {displayQuery}.
                            </p>

                            {results.length > 0 ? (
                                <>
                                    <ol className="mt-6 space-y-3" aria-label="Search results">
                                        {results.map((entry, index) => (
                                            <li key={entry.key}>
                                                <SearchResultCard
                                                    entry={entry}
                                                    index={index}
                                                    isActive={index === activeIndex}
                                                    isOpen={openKey === entry.key}
                                                    tokens={tokens}
                                                    onToggle={() => handleResultToggle(index, entry.key)}
                                                    onKeyDown={(event) =>
                                                        handleResultKeyDown(event, index)
                                                    }
                                                    onOpenFaq={openFaq}
                                                    buttonRef={(element) => {
                                                        resultRefs.current[index] = element;
                                                    }}
                                                />
                                            </li>
                                        ))}
                                    </ol>

                                    <div className="mt-6 flex flex-col gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-sm text-slate-400">
                                            Not finding what you need?
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={clearSearch}
                                                className="text-sm font-semibold text-slate-300 transition-colors hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                            >
                                                Browse all topics
                                            </button>
                                            <Link to="/docs" className="mkt-link !text-sm">
                                                Read the docs{' '}
                                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="mt-6">
                                    <EmptySearch
                                        query={displayQuery}
                                        onClear={clearSearch}
                                        onSuggestion={chooseSuggestion}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-14">
                            <Reveal as="section" aria-labelledby="popular-heading">
                                <SectionHeading
                                    eyebrow="Most asked"
                                    title="Popular questions"
                                    description="The answers people look for first."
                                    id="popular-heading"
                                />
                                <div className="grid gap-2.5 sm:grid-cols-2">
                                    {POPULAR_QUESTIONS.map((key, index) => {
                                        const entry = FAQ_MAP.get(key);
                                        if (!entry) return null;

                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => openFaq(key)}
                                                className="group mkt-card mkt-card-hover flex items-start gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                            >
                                                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-violet-400/20 bg-violet-500/10 font-mono text-[10px] font-semibold text-violet-300">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                                        {entry.category.title}
                                                    </span>
                                                    <span className="mt-1 block text-sm font-medium leading-relaxed text-slate-200 transition-colors group-hover:text-violet-200">
                                                        {entry.item.q}
                                                    </span>
                                                </span>
                                                <ArrowUpRight
                                                    className="mt-0.5 h-4 w-4 shrink-0 text-slate-600 transition-colors group-hover:text-violet-300"
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </Reveal>

                            <Reveal as="section" aria-labelledby="categories-heading" delay={80}>
                                <SectionHeading
                                    eyebrow="Browse"
                                    title="Pick a category"
                                    description="Nine topics, from first install to billing."
                                    id="categories-heading"
                                />
                                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                    {categories.map((category) => (
                                        <CategoryTile
                                            key={category.id}
                                            category={category}
                                            onSelect={scrollToCategory}
                                        />
                                    ))}
                                </div>
                            </Reveal>

                            <section
                                aria-labelledby="all-answers-heading"
                                className="mx-auto max-w-4xl"
                            >
                                <Reveal>
                                    <SectionHeading
                                        eyebrow="All answers"
                                        title="Browse every answer"
                                        description="Expand a question to see the full answer, examples, and related links."
                                        id="all-answers-heading"
                                    />
                                </Reveal>
                                <div className="space-y-4">
                                    {categories.map((category) => (
                                        <CategoryCard
                                            key={category.id}
                                            category={category}
                                            openKey={openKey}
                                            onToggle={toggleFaq}
                                            onOpenFaq={openFaq}
                                        />
                                    ))}
                                </div>
                            </section>

                            <Reveal
                                as="section"
                                aria-labelledby="docs-heading"
                                className="mx-auto max-w-5xl"
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                    <div>
                                        <p className="mkt-eyebrow mb-2">Go deeper</p>
                                        <h2
                                            id="docs-heading"
                                            className="mkt-h2 !text-2xl sm:!text-3xl"
                                        >
                                            Related documentation
                                        </h2>
                                    </div>
                                    <Link to="/docs" className="mkt-link !text-sm">
                                        Browse all docs{' '}
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </div>
                                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                    {DOC_LINKS.map((doc) => (
                                        <DocCard key={doc.title} doc={doc} />
                                    ))}
                                </div>
                            </Reveal>

                            <Reveal className="mx-auto max-w-5xl">
                                <div className="mkt-panel relative overflow-hidden p-6 sm:p-8">
                                    <div
                                        aria-hidden="true"
                                        className="mkt-glow right-[-120px] top-[-120px] h-[280px] w-[420px] bg-violet-600/20"
                                    />
                                    <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                        <div className="max-w-xl">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                                                    <LifeBuoy
                                                        className="h-5 w-5 text-violet-300"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                                <p className="mkt-eyebrow">Support</p>
                                            </div>
                                            <h2 className="mkt-h3 mt-3 !text-2xl">Still stuck?</h2>
                                            <p className="mkt-body mt-2">
                                                WebPulse is built in the open. Read the docs, ask
                                                the community, or open a GitHub issue with what you
                                                tried.
                                            </p>
                                            <p className="mt-3 text-xs text-slate-500">
                                                Help content reflects the V1 implementation and may
                                                change as WebPulse evolves.
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row md:flex-col lg:flex-row">
                                            <Link
                                                to="/docs"
                                                className="mkt-btn mkt-btn-primary mkt-btn-md w-full sm:w-auto"
                                            >
                                                <BookOpen
                                                    className="h-4 w-4"
                                                    aria-hidden="true"
                                                />
                                                Browse docs
                                            </Link>
                                            <Link
                                                to="/community"
                                                className="mkt-btn mkt-btn-secondary mkt-btn-md w-full sm:w-auto"
                                            >
                                                <MessagesSquare
                                                    className="h-4 w-4"
                                                    aria-hidden="true"
                                                />
                                                Community
                                            </Link>
                                            <a
                                                href={ISSUES_URL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mkt-btn mkt-btn-secondary mkt-btn-md w-full sm:w-auto"
                                            >
                                                <Github
                                                    className="h-4 w-4"
                                                    aria-hidden="true"
                                                />
                                                GitHub issues
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    )}
                </div>
            </section>
        </MarketingShell>
    );
}
