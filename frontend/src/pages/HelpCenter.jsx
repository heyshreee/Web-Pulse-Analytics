import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Search, ChevronDown, Rocket, Send, Wrench,
    BarChart3, Code2, Folder, User, CreditCard, Shield, LifeBuoy
} from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import SectionHead from '../components/marketing/SectionHead';
import Reveal from '../components/marketing/Reveal';
import CodeSnippet from '../components/marketing/CodeSnippet';

const API_DOMAIN = 'https://api.webpulse.app';

const Inline = ({ text }) => {
    const parts = String(text).split(/(`[^`]+`)/g).filter(Boolean);
    return parts.map((part, i) =>
        part.startsWith('`') && part.endsWith('`') ? (
            <code key={i} className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[13px] text-violet-300">{part.slice(1, -1)}</code>
        ) : (
            <span key={i}>{part}</span>
        )
    );
};

const categories = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        subtitle: 'Start using WebPulse',
        icon: Rocket,
        items: [
            {
                q: 'How do I create a project?',
                a: 'Sign in to your WebPulse console, open Projects, and create a new project. WebPulse generates a tracking ID for the project automatically — you\'ll use it for tracking and for API requests.',
                link: { to: '/docs/getting-started', label: 'Getting started guide' }
            },
            {
                q: 'How do I install WebPulse tracking?',
                a: 'Add the snippet to every page you want to track, replacing `YOUR_TRACKING_ID` with your project\'s ID. Use the API domain your deployment actually serves.',
                code: `<script src="${API_DOMAIN}/api/v1/track/script.js"></script>\n<script>\n  tracker('init', 'YOUR_TRACKING_ID');\n  tracker('track', 'page_view');\n</script>`,
                link: { to: '/docs/tracking#installation', label: 'Tracking documentation' }
            },
            {
                q: 'Where can I find my Tracking ID?',
                a: 'Open your project in the console. The tracking ID appears in the project overview and settings. The same ID is used by the tracker (`init`) and by API requests (`x-api-key` header).',
                link: { to: '/docs/tracking#tracking-id', label: 'Tracking ID documentation' }
            },
            {
                q: 'How do I verify that tracking is working?',
                a: 'Open your browser DevTools, go to the Network tab, and load a tracked page. Look for a POST to `/track/events` (or a beacon). A response like `{"success": true}` means the event was accepted. New activity should then appear in your project dashboard.',
                link: { to: '/docs/api#overview', label: 'API overview' }
            },
            {
                q: 'How long does it take for data to appear?',
                a: 'Events are stored as soon as they are collected. Your dashboard refreshes on an interval that depends on your plan — Free refreshes every 60 seconds, Basic every 10 seconds, Pro every 1 second, and Business on a real-time/SLA basis.'
            }
        ]
    },
    {
        id: 'tracking-events',
        title: 'Tracking & Events',
        subtitle: 'Make sure your data arrives',
        icon: Send,
        items: [
            {
                q: 'Events aren\'t appearing in my dashboard',
                a: 'Work through this checklist: 1) the tracking script is loaded on the page, 2) `tracker(\'init\', ...)` uses your exact tracking ID, 3) the page was visited after the script was added, 4) the visitor\'s origin is in the project\'s allowed origins (especially in production), 5) your monthly view allowance isn\'t exhausted, and 6) the traffic isn\'t a known bot being filtered.'
            },
            {
                q: 'How do I track a page view?',
                a: 'Call `tracker(\'track\', \'page_view\')` after initialization. The tracker attaches the page URL, the referrer, and the visitor\'s user agent automatically.',
                link: { to: '/docs/tracking#page-views', label: 'Page views documentation' }
            },
            {
                q: 'How do I send a custom event?',
                a: 'Pass any event name, plus optional data: `tracker(\'track\', \'pricing_cta_clicked\', { plan: \'pro\' })`. Note that only the documented fields (`event`, `url`, `referrer`, `title`) are persisted today.',
                link: { to: '/docs/tracking/events', label: 'Custom events documentation' }
            },
            {
                q: 'My Tracking ID isn\'t working',
                a: 'Copy the tracking ID directly from your project settings — including it as-is with no extra spaces. If it\'s wrong or missing, tracking endpoints return `401 INVALID_API_KEY`. The tracking ID is matched exactly against your project.'
            },
            {
                q: 'How do I check whether the tracker is installed correctly?',
                a: 'In DevTools, confirm `GET /track/script.js` returns 200 and that `window.tracker` is defined in the console. Then confirm events reach `POST /track/events` when you interact with the page.'
            },
            {
                q: 'Why are events being rejected?',
                a: 'Rejections return a status + machine-readable code: `401` = missing or invalid tracking ID, `403 FORBIDDEN` = project disabled or origin not allowed, `403 LIMIT_EXCEEDED` = plan allowance reached, `429` = rate limit. Known bots are filtered silently.',
                link: { to: '/docs/api#errors', label: 'API errors reference' }
            },
            {
                q: 'Why is my event count different from my website traffic?',
                a: 'Counts differ for several reasons: WebPulse filters known bots, drops near-identical repeat hits within a short window (deduplication), and can be blocked by ad-blockers. Other tools also count page views, sessions, and unique visitors differently, so side-by-side numbers rarely match exactly.'
            }
        ]
    },
    {
        id: 'troubleshooting',
        title: 'Troubleshooting',
        subtitle: 'Fix common problems',
        icon: Wrench,
        items: [
            {
                q: 'Tracker script isn\'t loading',
                a: 'Confirm the script URL points at the API domain your deployment actually serves, that the request returns 200 (not 404), and that caching, HTTPS, or an ad-blocker isn\'t interfering.'
            },
            {
                q: 'Events aren\'t appearing',
                a: 'Start with the Tracking & Events checklist above. The three most common causes are an incorrect tracking ID in `init`, the production origin missing from allowed origins, and the monthly allowance being reached.'
            },
            {
                q: 'Dashboard isn\'t updating',
                a: 'The dashboard refreshes on your plan\'s interval (60s on Free, 10s on Basic, 1s on Pro). Confirm the project is active and try a hard refresh; live counts come from recently accepted events.'
            },
            {
                q: 'API request returns an error',
                a: 'Read the response body: `{ "success": false, "error": "...", "code": "..." }`. Common codes are `INVALID_API_KEY`, `FORBIDDEN`, `LIMIT_EXCEEDED`, and `NOT_FOUND`; `429` means the per-IP rate limit was hit (100 requests / 15 minutes).',
                link: { to: '/docs/api#errors', label: 'API errors reference' }
            },
            {
                q: 'Tracking works locally but not in production',
                a: 'Almost always an allowed-origins issue: browser tracking is restricted to the origins configured on the project. Add your production domain to the project\'s allowed origins (up to your plan\'s origin limit).',
                link: { to: '/docs/security#allowed-origins', label: 'Allowed origins documentation' }
            },
            {
                q: 'Incorrect visitor counts',
                a: 'Bot filtering and duplicate protection intentionally lower raw counts. Compare the same time period in the same tool; unique visitors are derived from visitor sessions, not page views.'
            },
            {
                q: 'Incorrect traffic-source data',
                a: 'Traffic sources come from the `referrer` field of each event. Events without a referrer group under Direct, and different referrer handling between tools explains most discrepancies.'
            },
            {
                q: 'Tracking ID is invalid',
                a: 'Copy the ID exactly from project settings — no added characters or whitespace. An unrecognized ID returns `401 INVALID_API_KEY`.'
            },
            {
                q: 'API key is rejected',
                a: 'API keys here are the project tracking IDs, sent in the `x-api-key` header. If rejected, check the key value, that the project is active, and that the request origin is allowed.'
            },
            {
                q: 'Allowed origin is blocking requests',
                a: 'Add the requesting origin to the project\'s allowed origins. Your plan limits how many origins you can configure (Free 1, Basic 3, Pro 10, Business 100).',
                link: { to: '/docs/security#allowed-origins', label: 'Allowed origins documentation' }
            }
        ]
    },
    {
        id: 'analytics',
        title: 'Analytics & Dashboard',
        subtitle: 'Understand your data',
        icon: BarChart3,
        items: [
            {
                q: 'How are visitors counted?',
                a: 'Unique visitors are derived from visitor/session records, keyed per project from the visitor\'s IP, user agent, and your tracking ID. Repeated activity within a session refreshes the same visitor record instead of creating new ones.'
            },
            {
                q: 'What is a session?',
                a: 'A session groups a visitor\'s activity so you can reason about visits rather than individual events. Sessions appear in live visitors, project activity, and the analytics overview.',
                link: { to: '/docs/tracking#sessions', label: 'Sessions documentation' }
            },
            {
                q: 'How are page views counted?',
                a: 'Each accepted `page_view` event creates a page view record and increments the project\'s counters and monthly usage. Monthly usage resets at the start of each calendar month.'
            },
            {
                q: 'Why does my analytics data look different from another analytics tool?',
                a: 'Methodology differs across tools. WebPulse filters bots, deduplicates repeat hits, and depends on events actually reaching it (ad-blockers block trackers). Definitions of views, unique visitors, and sessions also vary between products.'
            },
            {
                q: 'How do I view historical analytics?',
                a: 'Your project overview shows traffic over time, unique visitors, top referrers, device breakdown, and top pages for the selected period.'
            },
            {
                q: 'How do I interpret traffic sources?',
                a: 'Sources are grouped by the referrer hostname of each event. Events without a referrer are grouped as Direct; external links appear under their source domain.'
            },
            {
                q: 'How do I use the real-time dashboard?',
                a: 'The project overview includes real-time visitors, refreshed on your plan\'s interval. Activity picks up as soon as accepted events arrive.'
            }
        ]
    },
    {
        id: 'api-developer',
        title: 'API & Developer',
        subtitle: 'Build with WebPulse',
        icon: Code2,
        items: [
            {
                q: 'How do I authenticate API requests?',
                a: 'Public tracking endpoints use your project tracking ID in the `x-api-key` header. Protected analytics endpoints require a signed-in console session.',
                link: { to: '/docs/api/authentication', label: 'Authentication documentation' }
            },
            {
                q: 'Where do I find my API key?',
                a: 'Your API key is the project tracking ID, available in project settings and the API Keys section of the console. It\'s a public identifier, not a secret credential.'
            },
            {
                q: 'How do I send an event through the API?',
                a: '`POST /track/events` with the `x-api-key` header and a JSON body such as `{"event": "page_view", "url": "https://example.com"}`. It returns `{"success": true}` on success.',
                link: { to: '/docs/api/events', label: 'Track Events reference' }
            },
            {
                q: 'How do I retrieve analytics through the API?',
                a: '`GET /analytics/count` (with `x-api-key`) returns the view count, optionally filtered by page path with `?url=/pricing`. Account-level stats are served to signed-in sessions.',
                link: { to: '/docs/api/analytics', label: 'Analytics reference' }
            },
            {
                q: 'What happens when an API request fails?',
                a: 'Errors return `success: false` with an `error` message and a machine-readable `code`. Check `code` before logging — `INVALID_API_KEY`, `FORBIDDEN`, and `LIMIT_EXCEEDED` are the most common.',
                link: { to: '/docs/api#errors', label: 'API errors reference' }
            },
            {
                q: 'How do I protect my API key?',
                a: 'The tracking ID is public by design, so anyone can read it from your page. Protect your console/account credentials instead: keep them server-side, use the allowed-origins list, and serve over HTTPS.',
                link: { to: '/docs/security', label: 'Security guide' }
            },
            {
                q: 'How do I integrate WebPulse into React?',
                a: 'Load the tracker once and send `page_view` on route changes — see the React guide for a ready-made hook.',
                link: { to: '/docs/guides/react', label: 'React guide' }
            }
        ]
    },
    {
        id: 'projects',
        title: 'Projects & Configuration',
        subtitle: 'Manage your WebPulse projects',
        icon: Folder,
        items: [
            {
                q: 'How do I change project settings?',
                a: 'Open the project in your console and edit its settings — name, allowed origins, active state, and related configuration are updated from there.'
            },
            {
                q: 'How do I configure allowed origins?',
                a: 'In project settings, list the origins you want to allow for browser tracking (comma-separated). Requests from other origins are rejected. Your plan limits how many origins you can set.',
                link: { to: '/docs/security#allowed-origins', label: 'Allowed origins documentation' }
            },
            {
                q: 'How do I find my Tracking ID?',
                a: 'The tracking ID is shown in your project overview and settings. It\'s used by the tracker and as the `x-api-key` header for public API calls.'
            },
            {
                q: 'How do I manage API keys?',
                a: 'The API Keys section of the console lists your project keys (the tracking IDs). These are public identifiers used for tracking — treat them as identifiers, not secrets.'
            },
            {
                q: 'How do I delete a project?',
                a: 'Delete the project from its settings. The project is removed from your console and the tracker stops accepting events for it.'
            }
        ]
    },
    {
        id: 'account',
        title: 'Authentication & Account',
        subtitle: 'Manage your account',
        icon: User,
        items: [
            {
                q: 'How do I create an account?',
                a: 'Register with an email and password, or sign in with Google. After registering, verify your email to get full access to your account.'
            },
            {
                q: 'How do I verify my email?',
                a: 'Use the link from the verification email we send after registration. If you need it again, you can request a new verification email from your account.'
            },
            {
                q: 'I didn\'t receive my verification email',
                a: 'Check your spam folder first, then request a new verification email from your account. Make sure the address on your profile is correct.'
            },
            {
                q: 'How do I reset my password?',
                a: 'Use the forgot-password flow — we\'ll email you a reset link. Follow the link to choose a new password.',
                link: { to: '/forgot-password', label: 'Reset your password' }
            },
            {
                q: 'How do I change my password?',
                a: 'You can update your password from the Settings area of the console.'
            }
        ]
    },
    {
        id: 'security',
        title: 'Security & Privacy',
        subtitle: 'Protect your analytics',
        icon: Shield,
        items: [
            {
                q: 'How does WebPulse protect API keys?',
                a: 'The tracking ID is public by design — it only identifies your project. Account/console credentials are protected and must be kept server-side. Allowed origins and HTTPS reduce abuse of your tracking configuration.',
                link: { to: '/docs/security', label: 'Security guide' }
            },
            {
                q: 'What data does WebPulse collect?',
                a: 'For each event: the event name, page URL, referrer, page title, and user agent. Server-side, WebPulse also derives and stores an IP address, approximate country/city, device type, browser, and OS.'
            },
            {
                q: 'How does visitor tracking work?',
                a: 'The browser sends events to `POST /track/events` using `navigator.sendBeacon` when available and `fetch` otherwise. WebPulse validates the request, filters bots, checks usage limits, and stores the visit.'
            },
            {
                q: 'How do I restrict tracking to my domains?',
                a: 'Configure allowed origins on the project. Browser tracking from origins outside the allow-list is rejected.',
                link: { to: '/docs/security#allowed-origins', label: 'Allowed origins documentation' }
            },
            {
                q: 'How long is analytics data retained?',
                a: 'Monthly usage is aggregated per calendar month. We don\'t currently expose a configurable retention window or deletion control in the product.'
            },
            {
                q: 'How can I delete my project data?',
                a: 'Deleting a project removes it from your console and stops accepting tracking events for it.',
                link: { to: '/docs/security', label: 'See the security guide' }
            },
            {
                q: 'What information is stored about visitors?',
                a: 'Per visitor record: a session key, IP address, user agent, approximate country/city, device type, browser, OS, page URLs, referrer, and last-seen time.'
            }
        ]
    },
    {
        id: 'billing',
        title: 'Billing & Subscriptions',
        subtitle: 'Plans, usage, and payments',
        icon: CreditCard,
        items: [
            {
                q: 'What plans are available?',
                a: 'Free (1 project, 1 allowed origin, 1,000 events/mo), Basic (₹299/mo), Pro (₹999/mo), and Business (₹2,999/mo) with higher limits and faster dashboard refresh. See the pricing page for details.',
                link: { to: '/pricing', label: 'View pricing' }
            },
            {
                q: 'How do I upgrade my plan?',
                a: 'Open the Billing section, choose your plan, and complete the Razorpay payment. Your plan is updated once payment is verified, and you\'ll receive a receipt by email.',
                link: { to: '/dashboard/billing', label: 'Open billing' }
            },
            {
                q: 'How do I downgrade my plan?',
                a: 'Currently the product supports downgrading to the Free plan from the Billing section. Your limits then follow the Free tier.',
                link: { to: '/dashboard/billing', label: 'Open billing' }
            },
            {
                q: 'How does usage work?',
                a: 'Usage counts events per calendar month against your plan\'s monthly allowance. Your plan also caps the number of projects and allowed origins.',
                link: { to: '/docs/tracking#page-views', label: 'See how events are counted' }
            },
            {
                q: 'What happens when I reach my usage limit?',
                a: 'Tracking is rejected with `403 LIMIT_EXCEEDED` until the allowance resets at the next calendar month — or until you upgrade to a higher plan.'
            },
            {
                q: 'Where can I find my payment history and receipts?',
                a: 'The Billing section shows your payment history. Receipts can be downloaded as a PDF or emailed to you. Payments are processed as one-time Razorpay orders for the selected plan.'
            }
        ]
    }
];

function CategoryCard({ category }) {
    const [open, setOpen] = useState(null);

    return (
        <section id={category.id} className="mkt-card scroll-mt-24 p-6">
            <div className="mb-5 flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                    <category.icon className="h-5 w-5 text-violet-300" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-base font-semibold tracking-tight text-slate-100">{category.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{category.subtitle}</p>
                </div>
            </div>

            <div className="divide-y divide-white/[0.06]">
                {category.items.map((item) => {
                    const isOpen = open === item.q;
                    return (
                        <div key={item.q}>
                            <button
                                type="button"
                                onClick={() => setOpen(isOpen ? null : item.q)}
                                aria-expanded={isOpen}
                                className="group/q flex w-full items-center justify-between gap-3 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                            >
                                <span className={`text-sm transition-colors ${isOpen ? 'font-medium text-violet-300' : 'text-slate-300 group-hover/q:text-violet-200'}`}>
                                    {item.q}
                                </span>
                                <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                            </button>
                            {isOpen && (
                                <div className="pb-4">
                                    <p className="border-l-2 border-violet-400/40 pl-3 text-sm leading-relaxed text-slate-400">
                                        <Inline text={item.a} />
                                    </p>
                                    {item.code && (
                                        <div className="mkt-panel ml-3 mt-3">
                                            <CodeSnippet code={item.code} />
                                        </div>
                                    )}
                                    {item.link && (
                                        <Link to={item.link.to} className="mkt-link ml-3 mt-3 text-xs">
                                            {item.link.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default function HelpCenter() {
    const [query, setQuery] = useState('');

    const q = query.trim().toLowerCase();
    const results = q
        ? categories
              .map((category) => ({
                  ...category,
                  items: category.items.filter(
                      (item) =>
                          item.q.toLowerCase().includes(q) ||
                          item.a.toLowerCase().includes(q)
                  )
              }))
              .filter((category) => category.items.length > 0 || category.title.toLowerCase().includes(q) || category.subtitle.toLowerCase().includes(q))
        : categories;

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <MarketingShell>
            <section className="mkt-section">
                <div className="mkt-container">
                    <SectionHead
                        eyebrow="Help Center"
                        title={
                            <>
                                How can we <span className="mkt-accent-text">help?</span>
                            </>
                        }
                        description="Find answers about setting up WebPulse, tracking visitors, using your analytics, and managing your account."
                    />

                    <Reveal className="mx-auto mt-12 max-w-xl">
                        <label htmlFor="help-search" className="mkt-label sr-only">Search WebPulse help</label>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                            <input
                                id="help-search"
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search WebPulse help..."
                                className="mkt-field !py-3 !pl-11"
                            />
                        </div>
                    </Reveal>

                    <Reveal className="mt-8">
                        <div className="flex flex-wrap justify-center gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => scrollTo(category.id)}
                                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                >
                                    {category.title}
                                </button>
                            ))}
                        </div>
                    </Reveal>

                    <div className="mx-auto mt-12 max-w-4xl space-y-6">
                        {results.map((category) => (
                            <CategoryCard key={category.id} category={category} />
                        ))}
                        {results.length === 0 && (
                            <div className="mkt-card p-8 text-center">
                                <p className="text-sm text-slate-300">No help topics match &quot;{query}&quot;.</p>
                                <p className="mt-2 text-sm text-slate-500">Try a shorter phrase, or check the documentation and API reference below.</p>
                            </div>
                        )}
                    </div>

                    <Reveal className="mx-auto mt-20 max-w-4xl">
                        <div className="mkt-panel relative overflow-hidden px-6 py-12 text-center sm:px-12">
                            <div
                                aria-hidden="true"
                                className="mkt-glow left-1/2 top-[-160px] h-[320px] w-[560px] max-w-[110vw] -translate-x-1/2 bg-violet-600/20"
                            />
                            <div className="relative">
                                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                                    <LifeBuoy className="h-6 w-6 text-violet-300" aria-hidden="true" />
                                </div>
                                <h2 className="mkt-h3 !text-2xl sm:!text-3xl">Can&apos;t find what you&apos;re looking for?</h2>
                                <p className="mkt-body mx-auto mt-3 max-w-md">
                                    The documentation covers setup, tracking, the API, and security in depth.
                                </p>
                                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                                    <Link to="/docs" className="mkt-btn mkt-btn-primary mkt-btn-lg">
                                        Documentation <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                    <Link to="/docs/api" className="mkt-btn mkt-btn-secondary mkt-btn-lg">
                                        API Documentation <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
        </MarketingShell>
    );
}