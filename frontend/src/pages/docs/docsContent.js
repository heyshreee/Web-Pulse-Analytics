export const API_DOMAIN = 'https://api.webpulse.app';

export const docsContent = {
    'getting-started': {
        title: 'Getting Started',
        description: 'Set up WebPulse tracking and see your first analytics in minutes.',
        sections: [
            {
                id: 'introduction',
                heading: 'Introduction',
                blocks: [
                    {
                        type: 'p',
                        text: 'WebPulse collects website activity — page views and custom events — and makes it available through a real-time dashboard and a small REST API. Everything is tied to a project: a project owns its tracking configuration, its analytics data, and a `tracking ID` used by the tracker and the API.'
                    },
                    {
                        type: 'p',
                        text: 'This guide covers the core workflow: create a project, add tracking, send events, and view analytics.'
                    }
                ]
            },
            {
                id: 'quick-start',
                heading: 'Quick Start',
                blocks: [
                    {
                        type: 'steps',
                        items: [
                            {
                                title: 'Create a project',
                                desc: 'Sign in to your WebPulse console and create a project. WebPulse generates a tracking ID for that project, which you will use to configure tracking and authenticate public API requests.'
                            },
                            {
                                title: 'Add the tracker to your website',
                                desc: 'Add the tracking script and initialize it with your tracking ID.',
                                code: {
                                    lang: 'html',
                                    code: `<script src="${API_DOMAIN}/api/v1/track/script.js"></script>\n<script>\n  tracker('init', 'YOUR_TRACKING_ID');\n  tracker('track', 'page_view');\n</script>`
                                }
                            },
                            {
                                title: 'Open your dashboard',
                                desc: 'Once events arrive, your project overview in the console shows real-time visitors, page views, referrers, devices, and top pages.'
                            },
                            {
                                title: 'Query analytics by API (optional)',
                                desc: 'Retrieve view counts directly from your backend.',
                                code: {
                                    lang: 'bash',
                                    code: `curl "${API_DOMAIN}/api/v1/analytics/count?url=/pricing" \\\n  -H "x-api-key: YOUR_TRACKING_ID"`
                                }
                            }
                        ]
                    },
                    {
                        type: 'callout',
                        tone: 'info',
                        title: 'Deployed domain',
                        text: `Replace ${API_DOMAIN} with the API domain your deployment actually uses before pointing production traffic at it.`
                    }
                ]
            },
            {
                id: 'concepts',
                heading: 'Concepts',
                blocks: [
                    {
                        type: 'ul',
                        items: [
                            '`Tracking ID` — a public identifier for your project. The tracking script and the public API use it (as the `x-api-key` header) to attribute events to a project.',
                            '`Events` — the unit of tracking. A page view (`page_view`) is the default; you can also send custom events.',
                            '`Sessions` — visitors are grouped into sessions so activity can be understood as visits, not an undifferentiated stream of events.',
                            '`Allowed origins` — restrict browser-based tracking to domains you approve in your project settings.',
                            '`Console credentials` — protected project and account credentials for authenticated (server-side) requests. Never ship these to the browser.'
                        ]
                    }
                ]
            }
        ]
    },
    'tracking': {
        title: 'Tracking',
        description: 'Collect page views and custom events from your website.',
        sections: [
            {
                id: 'installation',
                heading: 'Installation',
                blocks: [
                    {
                        type: 'p',
                        text: 'Add the WebPulse tracker to your page with a single script tag and configure it with your tracking ID:'
                    },
                    {
                        type: 'code',
                        lang: 'html',
                        title: 'Tracking snippet',
                        code: `<script src="${API_DOMAIN}/api/v1/track/script.js"></script>\n<script>\n  tracker('init', 'YOUR_TRACKING_ID');\n  tracker('track', 'page_view');\n</script>`
                    },
                    {
                        type: 'p',
                        text: 'Place the snippet on every page you want to track. The tracker is a small standalone function with no dependencies; it sends events with `navigator.sendBeacon` when available and falls back to `fetch` with `keepalive`.'
                    },
                    {
                        type: 'callout',
                        tone: 'info',
                        title: 'Served from your API',
                        text: `The tracking script is served at ${API_DOMAIN}/api/v1/track/script.js. Replace the domain with the one your deployment actually uses.`
                    }
                ]
            },
            {
                id: 'tracking-id',
                heading: 'Tracking ID',
                blocks: [
                    {
                        type: 'p',
                        text: 'Every project has a tracking ID shown in the project settings. It identifies the project whenever events are sent.'
                    },
                    {
                        type: 'p',
                        text: 'The tracking ID is **public**: it travels in the browser and in API request headers. Treat it as an identifier, never a secret. Requests made with it are still subject to your plan usage limits and, for browser tracking, allowed-origin checks.'
                    },
                    {
                        type: 'ul',
                        items: [
                            'Tracker: passed to `tracker(\'init\', ...)`.',
                            'REST API: sent as the `x-api-key` header.',
                            'Legacy endpoints: embedded in the URL path (`/track/:trackingId`).'
                        ]
                    }
                ]
            },
            {
                id: 'page-views',
                heading: 'Page Views',
                blocks: [
                    {
                        type: 'p',
                        text: '`tracker(\'track\', \'page_view\')` records a page view. The tracker automatically attaches the page URL, the referring document, and the visitor\'s user agent.'
                    },
                    {
                        type: 'ul',
                        items: [
                            '`url` — the page\'s current URL.',
                            '`referrer` — the referring document, if any.',
                            '`userAgent` — the visitor\'s browser user agent.'
                        ]
                    },
                    {
                        type: 'p',
                        text: 'The view is counted against your monthly view allowance and appears in your project analytics. WebPulse filters known bots and de-duplicates rapid repeat hits on the same visitor key.'
                    }
                ]
            },
            {
                id: 'sessions',
                heading: 'Sessions',
                blocks: [
                    {
                        type: 'p',
                        text: 'WebPulse groups visitor activity into sessions so you can reason about visits rather than an undifferentiated event stream. Sessions are derived server-side from the visitor key produced for a request (based on the visitor\'s IP, user agent, and your project).'
                    },
                    {
                        type: 'p',
                        text: 'Sessions appear throughout the console: live visitors, project activity, and the analytics overview. Repeated activity from the same visitor refreshes their session instead of creating a new one.'
                    }
                ]
            }
        ]
    },
    'tracking-events': {
        title: 'Custom Events',
        description: 'Send events beyond page views.',
        sections: [
            {
                id: 'custom-events',
                heading: 'Custom Events',
                blocks: [
                    {
                        type: 'p',
                        text: 'Besides page views, the tracker can send any named event:'
                    },
                    {
                        type: 'code',
                        lang: 'javascript',
                        code: `tracker('track', 'signup_form_viewed');`
                    },
                    {
                        type: 'p',
                        text: 'Pass extra data as a third argument; the tracker merges it into the payload sent to the API:'
                    },
                    {
                        type: 'code',
                        lang: 'javascript',
                        code: `tracker('track', 'pricing_cta_clicked', { plan: 'pro', source: 'footer' });`
                    },
                    {
                        type: 'callout',
                        tone: 'warning',
                        title: 'Stored fields',
                        text: 'Only the fields documented in the Track Events API reference — `event`, `url`, `referrer`, and `title` — are persisted. Additional fields are accepted on the wire but are not stored today.'
                    },
                    {
                        type: 'p',
                        text: 'Custom events follow the same path as page views: they are subject to bot filtering, duplicate protection, and your monthly usage limits.'
                    }
                ]
            }
        ]
    },
    'api': {
        title: 'API Reference',
        description: 'Send events and retrieve analytics programmatically.',
        sections: [
            {
                id: 'overview',
                heading: 'Overview',
                blocks: [
                    {
                        type: 'p',
                        text: `The WebPulse API is a REST API served under the \`/api/v1\` prefix. The base URL is \`${API_DOMAIN}\` — replace it with the API domain your deployment uses before pointing production traffic at it.`
                    },
                    {
                        type: 'p',
                        text: 'There is no public WebSocket API at this time. Real-time updates are consumed through the WebPulse console.'
                    },
                    {
                        type: 'p',
                        text: 'Two access levels exist:'
                    },
                    {
                        type: 'ul',
                        items: [
                            '`Public (tracking ID)` — the tracker and public endpoints authenticate with your project\'s tracking ID. Safe to send from the browser.',
                            '`Console session (protected)` — project and account endpoints require a signed-in console session. These back the dashboard and should not be called from client-side code in your applications.'
                        ]
                    }
                ]
            },
            {
                id: 'endpoints',
                heading: 'Endpoints',
                blocks: [
                    {
                        type: 'p',
                        text: 'Public endpoints:'
                    },
                    {
                        type: 'table',
                        headers: ['Method', 'Path', 'Auth', 'Description'],
                        rows: [
                            ['POST', '/track/events', 'x-api-key', 'Send a page view or custom event'],
                            ['GET', '/track/script.js', '—', 'Tracking script'],
                            ['POST', '/track/:trackingId', 'path ID (legacy)', 'Send an event with the ID in the URL'],
                            ['GET', '/track/:trackingId', 'path ID (legacy)', 'View count for a project'],
                            ['GET', '/analytics/count', 'x-api-key', 'View count, optionally filtered by URL']
                        ]
                    },
                    {
                        type: 'callout',
                        tone: 'info',
                        title: 'Legacy vs standard',
                        text: 'New integrations should use the standard endpoints (`POST /track/events`, `GET /analytics/count`). The path-based `/track/:trackingId` endpoints exist for compatibility.'
                    },
                    {
                        type: 'p',
                        text: 'Authenticated console endpoints (used by the WebPulse dashboard):'
                    },
                    {
                        type: 'table',
                        headers: ['Method', 'Path', 'Description'],
                        rows: [
                            ['GET', '/analytics/overview', 'Dashboard overview stats'],
                            ['GET', '/analytics/projects/:id/overview', 'Project overview stats'],
                            ['GET', '/analytics/projects/:id/traffic', 'Detailed traffic stats'],
                            ['GET', '/analytics/projects/:id/pages', 'Top pages'],
                            ['GET', '/analytics/projects/:id/activity', 'Recent project activity']
                        ]
                    }
                ]
            },
            {
                id: 'errors',
                heading: 'Errors',
                blocks: [
                    {
                        type: 'p',
                        text: 'Errors use a consistent shape:'
                    },
                    {
                        type: 'code',
                        lang: 'json',
                        title: 'Error response',
                        code: `{\n  "success": false,\n  "error": "Invalid API key",\n  "code": "INVALID_API_KEY"\n}`
                    },
                    {
                        type: 'p',
                        text: '`code` is a machine-readable error code when available:'
                    },
                    {
                        type: 'table',
                        headers: ['Status', 'Code', 'Meaning'],
                        rows: [
                            ['400', 'BAD_REQUEST', 'Malformed request or invalid parameters'],
                            ['401', 'UNAUTHORIZED', 'Missing or invalid authentication'],
                            ['401', 'INVALID_API_KEY', 'Tracking ID not recognized'],
                            ['403', 'FORBIDDEN', 'Project disabled or origin not allowed'],
                            ['403', 'LIMIT_EXCEEDED', 'Plan usage limit reached'],
                            ['404', 'NOT_FOUND', 'Route, project, or resource not found'],
                            ['429', '—', 'Too many requests (rate limit)']
                        ]
                    },
                    {
                        type: 'p',
                        text: 'Tracking endpoints return `{ "success": true }` on success; see the Track Events and Analytics references for their response bodies.'
                    }
                ]
            }
        ]
    },
    'api-authentication': {
        title: 'API Authentication',
        description: 'Public tracking IDs versus protected console sessions.',
        sections: [
            {
                id: 'tracking-id-auth',
                heading: 'Tracking ID (public)',
                blocks: [
                    {
                        type: 'p',
                        text: 'Public tracking endpoints authenticate with your project tracking ID in the `x-api-key` header:'
                    },
                    {
                        type: 'code',
                        lang: 'bash',
                        title: 'Header example',
                        code: `GET ${API_DOMAIN}/api/v1/analytics/count\nx-api-key: YOUR_TRACKING_ID`
                    },
                    {
                        type: 'p',
                        text: 'The tracking ID is public by design — it identifies your project in the browser. Use the same ID for every public call; the rate limiter and your plan usage limits still apply.'
                    }
                ]
            },
            {
                id: 'console-auth',
                heading: 'Console session (protected)',
                blocks: [
                    {
                        type: 'p',
                        text: 'Endpoints in the `analytics` namespace that return project or account data require a signed-in console session. These are consumed by your WebPulse dashboard and are not meant for client-side browser calls in your applications.'
                    },
                    {
                        type: 'callout',
                        tone: 'warning',
                        title: 'Security warning',
                        text: 'Never expose console credentials in browser-side JavaScript, public repositories, or client applications. Keep server-side credentials on your server.'
                    }
                ]
            },
            {
                id: 'legacy',
                heading: 'Legacy path-based tracking',
                blocks: [
                    {
                        type: 'p',
                        text: 'Legacy tracking endpoints accept the tracking ID in the URL path (`/track/:trackingId`). They are maintained for compatibility; new integrations should prefer `POST /track/events` with the `x-api-key` header.'
                    }
                ]
            }
        ]
    },
    'api-events': {
        title: 'Track Events API',
        description: 'Send page views and custom events',
        sections: [
            {
                id: 'track-events',
                heading: 'POST /track/events',
                blocks: [
                    {
                        type: 'p',
                        text: 'Send a single tracking event to WebPulse.'
                    },
                    {
                        type: 'code',
                        lang: 'bash',
                        title: 'Endpoint',
                        code: `POST ${API_DOMAIN}/api/v1/track/events\nx-api-key: YOUR_TRACKING_ID\nContent-Type: application/json`
                    },
                    {
                        type: 'code',
                        lang: 'json',
                        title: 'Request body',
                        code: `{\n  "event": "page_view",\n  "url": "https://example.com/pricing",\n  "referrer": "https://google.com",\n  "title": "Pricing — Example"\n}`
                    },
                    {
                        type: 'p',
                        text: 'Parameters:'
                    },
                    {
                        type: 'table',
                        headers: ['Parameter', 'Type', 'Description'],
                        rows: [
                            ['event', 'string', 'Event name, e.g. `page_view`'],
                            ['url', 'string', 'Page URL the event occurred on'],
                            ['referrer', 'string', 'Referring URL, if any'],
                            ['title', 'string', 'Optional page title'],
                            ['userAgent', 'string', 'Optional user agent; defaults to the request header']
                        ]
                    },
                    {
                        type: 'callout',
                        tone: 'warning',
                        title: 'Stored fields',
                        text: 'Only the fields in the table above are persisted. Extra fields in the request body are accepted on the wire but are not stored.'
                    },
                    {
                        type: 'code',
                        lang: 'json',
                        title: 'Response',
                        code: `{ "success": true }`
                    },
                    {
                        type: 'p',
                        text: 'Server-side processing: known bots are filtered, rapid duplicate hits on the same visitor key are dropped, the hit is credited to the project\'s monthly usage, and a visitor record plus a page view are stored.'
                    }
                ]
            },
            {
                id: 'legacy-track',
                heading: 'Legacy: POST /track/:trackingId',
                blocks: [
                    {
                        type: 'p',
                        text: 'A compatibility endpoint that sends the tracking ID in the URL path instead of the `x-api-key` header.'
                    },
                    {
                        type: 'code',
                        lang: 'bash',
                        title: 'Endpoint',
                        code: `POST ${API_DOMAIN}/api/v1/track/YOUR_TRACKING_ID`
                    }
                ]
            }
        ]
    },
    'api-analytics': {
        title: 'Analytics API',
        description: 'Retrieve view counts and project analytics.',
        sections: [
            {
                id: 'count',
                heading: 'GET /analytics/count',
                blocks: [
                    {
                        type: 'p',
                        text: 'Get the total view count for a project.'
                    },
                    {
                        type: 'code',
                        lang: 'bash',
                        title: 'Endpoint',
                        code: `GET ${API_DOMAIN}/api/v1/analytics/count\nx-api-key: YOUR_TRACKING_ID`
                    },
                    {
                        type: 'code',
                        lang: 'json',
                        title: 'Response',
                        code: `{\n  "count": 1284\n}`
                    },
                    {
                        type: 'p',
                        text: 'Filter by page path with `url`. The value is matched against page URLs, so a path such as `/pricing` counts views for that page:'
                    },
                    {
                        type: 'code',
                        lang: 'bash',
                        title: 'Filtered endpoint',
                        code: `GET ${API_DOMAIN}/api/v1/analytics/count?url=/pricing\nx-api-key: YOUR_TRACKING_ID`
                    }
                ]
            },
            {
                id: 'overview',
                heading: 'GET /analytics/overview',
                blocks: [
                    {
                        type: 'p',
                        text: 'Protected endpoint that returns account-level dashboard statistics: real-time visitors, traffic over time, recent activity, top referrers, unique visitors, device breakdown, and top pages.'
                    },
                    {
                        type: 'callout',
                        tone: 'info',
                        title: 'Console session required',
                        text: 'This endpoint requires a signed-in console session and backs the WebPulse dashboard. Call it from your backend when you need account-level analytics.'
                    }
                ]
            },
            {
                id: 'project',
                heading: 'Project analytics',
                blocks: [
                    {
                        type: 'p',
                        text: 'Protected project endpoints return the same class of analytics scoped to a single project:'
                    },
                    {
                        type: 'table',
                        headers: ['Endpoint', 'Returns'],
                        rows: [
                            ['/analytics/projects/:id/overview', 'Project summary'],
                            ['/analytics/projects/:id/traffic', 'Detailed traffic stats'],
                            ['/analytics/projects/:id/pages', 'Top pages'],
                            ['/analytics/projects/:id/activity', 'Recent activity']
                        ]
                    }
                ]
            }
        ]
    },
    'javascript': {
        title: 'JavaScript Tracker',
        description: 'Integrate WebPulse into your frontend with a single function.',
        sections: [
            {
                id: 'tracker',
                heading: 'The tracker function',
                blocks: [
                    {
                        type: 'p',
                        text: `Loading \`${API_DOMAIN}/api/v1/track/script.js\` exposes a global \`window.tracker\` function with two commands:`
                    },
                    {
                        type: 'code',
                        lang: 'javascript',
                        code: `tracker('init', 'YOUR_TRACKING_ID');\ntracker('track', 'page_view');`
                    },
                    {
                        type: 'p',
                        text: '`init` sets the tracking ID for subsequent calls; `track` sends an event.'
                    }
                ]
            },
            {
                id: 'configuration',
                heading: 'Configuration',
                blocks: [
                    {
                        type: 'ul',
                        items: [
                            '`Script URL` — load the tracker from `' + API_DOMAIN + '/api/v1/track/script.js` (use your deployment\'s domain).',
                            '`Initialization` — call `init` with your tracking ID before tracking events.',
                            '`Auto-init` — when the tracking ID is included in the script URL (`/track/:trackingId/script.js`), the tracker initializes itself and sends a `page_view` on load.',
                            '`Transport` — events are sent with `navigator.sendBeacon` when available, falling back to `fetch` with `keepalive`.'
                        ]
                    }
                ]
            },
            {
                id: 'events',
                heading: 'Events',
                blocks: [
                    {
                        type: 'p',
                        text: 'Every event carries `event`, `url` (from `window.location.href`), `referrer` (from `document.referrer`), and your user agent. Pass extra fields as the third argument; they merge into the payload sent to the API.'
                    },
                    {
                        type: 'code',
                        lang: 'javascript',
                        code: `tracker('init', 'YOUR_TRACKING_ID');\ntracker('track', 'page_view');\ntracker('track', 'pricing_cta_clicked', { plan: 'pro' });`
                    },
                    {
                        type: 'callout',
                        tone: 'warning',
                        title: 'Stored fields',
                        text: 'Only `event`, `url`, `referrer`, and `title` are persisted. Extra fields are accepted but not stored today.'
                    }
                ]
            }
        ]
    },
    'guides': {
        title: 'Developer Guides',
        description: 'Practical guides for integrating WebPulse.',
        sections: [
            {
                id: 'guides',
                heading: 'Guides',
                blocks: [
                    {
                        type: 'p',
                        text: 'Step-by-step guides for common integration scenarios.'
                    },
                    {
                        type: 'links',
                        items: [
                            { to: '/docs/guides/react', label: 'Add WebPulse to a React application', desc: 'Track route changes and custom interactions in a Single Page App.' },
                            { to: '/docs/guides#javascript-website', label: 'Add WebPulse to a JavaScript website', desc: 'Plain-JS setup for page views and interaction events.' },
                            { to: '/docs/guides#custom-events', label: 'Track custom events end to end', desc: 'From tracker call to your project activity feed.' },
                            { to: '/docs/guides#analytics-api', label: 'Query analytics through the API', desc: 'Retrieve counts and account-level analytics.' }
                        ]
                    }
                ]
            },
            {
                id: 'javascript-website',
                heading: 'Add WebPulse to a JavaScript website',
                blocks: [
                    {
                        type: 'p',
                        text: 'Add the tracker and initialize it once, then fire events on user interaction:'
                    },
                    {
                        type: 'code',
                        lang: 'html',
                        title: 'index.html',
                        code: `<script src="${API_DOMAIN}/api/v1/track/script.js"></script>\n<script>\n  tracker('init', 'YOUR_TRACKING_ID');\n  tracker('track', 'page_view');\n\n  document.getElementById('download').addEventListener('click', () => {\n    tracker('track', 'download_clicked', { version: 'v2' });\n  });\n</script>`
                    }
                ]
            },
            {
                id: 'custom-events',
                heading: 'Track custom events end to end',
                blocks: [
                    {
                        type: 'p',
                        text: 'Custom events start as a tracker call and end in your project activity:'
                    },
                    {
                        type: 'code',
                        lang: 'javascript',
                        code: `tracker('init', 'YOUR_TRACKING_ID');\ntracker('track', 'download_clicked', { version: 'v2' });`
                    },
                    {
                        type: 'p',
                        text: 'Custom events count toward your monthly usage the same way page views do, and they appear in your project activity feed.'
                    }
                ]
            },
            {
                id: 'analytics-api',
                heading: 'Query analytics through the API',
                blocks: [
                    {
                        type: 'code',
                        lang: 'bash',
                        title: 'Public endpoints',
                        code: `# Total views\ncurl "${API_DOMAIN}/api/v1/analytics/count" \\\n  -H "x-api-key: YOUR_TRACKING_ID"\n\n# Views for one page\ncurl "${API_DOMAIN}/api/v1/analytics/count?url=/pricing" \\\n  -H "x-api-key: YOUR_TRACKING_ID"`
                    },
                    {
                        type: 'p',
                        text: 'For richer account-level analytics, authenticate with a console session and call `/analytics/overview`, or the project-scoped `/analytics/projects/:id/*` endpoints, from your backend.'
                    }
                ]
            }
        ]
    },
    'guide-react': {
        title: 'Add WebPulse to a React application',
        description: 'Track route changes and events in a Single Page App.',
        sections: [
            {
                id: 'react-spa',
                heading: 'Tracking in an SPA',
                blocks: [
                    {
                        type: 'p',
                        text: 'Single Page Apps don\'t reload the page on navigation, so a one-time page load doesn\'t capture every view. The common pattern is to load the tracker once and send `page_view` whenever the route changes.'
                    }
                ]
            },
            {
                id: 'setup',
                heading: 'Setup',
                blocks: [
                    {
                        type: 'p',
                        text: 'Add the tracking script to `index.html`, then send a view on every route change:'
                    },
                    {
                        type: 'code',
                        lang: 'jsx',
                        title: 'usePageTracking',
                        code: `import { useEffect } from 'react';\nimport { useLocation } from 'react-router-dom';\n\nexport default function usePageTracking() {\n  const { pathname } = useLocation();\n\n  useEffect(() => {\n    window.tracker('init', 'YOUR_TRACKING_ID');\n    window.tracker('track', 'page_view');\n  }, [pathname]);\n}`
                    },
                    {
                        type: 'p',
                        text: 'Call `usePageTracking()` once in your root component so every navigation sends a `page_view`.'
                    }
                ]
            },
            {
                id: 'react-custom',
                heading: 'Custom events from React',
                blocks: [
                    {
                        type: 'p',
                        text: 'Fire custom events from handlers. Ensure `init` has been called before tracking events.'
                    },
                    {
                        type: 'code',
                        lang: 'jsx',
                        code: `<button\n  onClick={() => window.tracker('track', 'cta_clicked', { section: 'pricing' })}\n>\n  Get started\n</button>`
                    }
                ]
            }
        ]
    },
    'security': {
        title: 'Security Guide',
        description: 'Integrate analytics without exposing secrets.',
        sections: [
            {
                id: 'api-keys',
                heading: 'API keys & credentials',
                blocks: [
                    {
                        type: 'p',
                        text: 'WebPulse has two kinds of credentials:'
                    },
                    {
                        type: 'ul',
                        items: [
                            '`Tracking ID` — public. Identifies your project for tracking; safe in the browser; sent as `x-api-key`.',
                            '`Console credentials` — protected. Authorize account and project endpoints; never ship these to the browser.'
                        ]
                    }
                ]
            },
            {
                id: 'allowed-origins',
                heading: 'Allowed origins',
                blocks: [
                    {
                        type: 'p',
                        text: 'Project settings let you restrict browser-based tracking to approved origins. Tracking requests from origins outside the allow-list are rejected.'
                    },
                    {
                        type: 'callout',
                        tone: 'warning',
                        title: 'Not authentication',
                        text: 'Allowed origins are an abuse-control mechanism, not authentication. The tracking ID itself is public — anyone can read it from your page.'
                    }
                ]
            },
            {
                id: 'best-practices',
                heading: 'Best practices',
                blocks: [
                    {
                        type: 'ul',
                        items: [
                            'Serve tracking and API traffic over HTTPS.',
                            'Keep console and account credentials server-side, in environment variables or a secret manager.',
                            'Prefer the `x-api-key` header endpoints for client-side integration.',
                            'Review committed code and public repositories for leaked console credentials (the public tracking ID is fine to commit as a client-side constant).',
                            'Set allowed origins to your site\'s domains before running heavy browser tracking.',
                            'Monitor your monthly usage so integrations never hit `LIMIT_EXCEEDED` unexpectedly.'
                        ]
                    }
                ]
            }
        ]
    }
};