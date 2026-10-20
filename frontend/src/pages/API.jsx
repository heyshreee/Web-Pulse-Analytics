import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowDown, ArrowRight, BookOpen, Check, ChevronRight, Code2,
    Copy, KeyRound, Lock, Server, Shield, Terminal, X, Zap
} from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import Reveal from '../components/marketing/Reveal';
import CodeSnippet from '../components/marketing/CodeSnippet';

const API_DOMAIN = 'https://api.webpulse.app';

const navItems = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'quickstart', label: 'Quick Start', icon: Zap },
    { id: 'auth', label: 'Authentication', icon: Lock },
    { id: 'endpoints', label: 'API Endpoints', icon: Server },
    { id: 'track-events', label: 'Track Events', icon: ChevronRight, nested: true },
    { id: 'analytics', label: 'Analytics', icon: ChevronRight, nested: true },
    { id: 'tracker', label: 'Tracker', icon: Code2 },
    { id: 'security', label: 'Security', icon: Shield },
];

/** Inline `code` chip used inside running copy. */
function InlineCode({ children }) {
    return (
        <code className="rounded-md border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 font-mono text-[13px] text-violet-300">
            {children}
        </code>
    );
}

/**
 * Static code block in a panel, with the same copy-to-clipboard affordance the
 * page shipped with. Rendering is delegated to the shared marketing CodeSnippet.
 */
function CodePanel({ code, language = 'javascript', title }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(code).catch(() => {});
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mkt-panel">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] bg-white/[0.02] px-4 py-2.5">
                <span className="flex items-center gap-2.5">
                    <span className="flex gap-1.5" aria-hidden="true">
                        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    </span>
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {title || language}
                    </span>
                </span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            Copy Code
                        </>
                    )}
                </button>
            </div>
            <CodeSnippet code={code} />
        </div>
    );
}

function Section({ id, title, icon, children }) {
    const Icon = icon;
    return (
        <Reveal as="section" id={id} className="scroll-mt-24">
            <div className="mb-8 flex items-center gap-4">
                {Icon && (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                        <Icon className="h-5 w-5 text-violet-300" aria-hidden="true" />
                    </div>
                )}
                <h2 className="mkt-h3">{title}</h2>
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </Reveal>
    );
}

function FlowBox({ label }) {
    return (
        <div className="w-full rounded-lg border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-center text-xs font-semibold text-violet-200">
            {label}
        </div>
    );
}

function FlowArrow({ label }) {
    return (
        <div className="my-1 flex items-center justify-center gap-2">
            {label && (
                <span className="text-[10px] uppercase tracking-widest text-slate-500">{label}</span>
            )}
            <ArrowDown className="h-4 w-4 text-slate-600" aria-hidden="true" />
        </div>
    );
}

function MethodBadge({ method }) {
    return (
        <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-300">
            {method}
        </span>
    );
}

/** One of the numbered steps in the quick-start section. */
function Step({ number, title, children }) {
    return (
        <div className="flex gap-5">
            <span className="metric-num flex h-10 w-10 flex-none items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10 text-sm font-semibold text-violet-300">
                {number}
            </span>
            <div className="min-w-0 flex-1">
                <h3 className="mkt-h4 !text-lg">{title}</h3>
                {children}
            </div>
        </div>
    );
}

export default function API() {
    const [activeSection, setActiveSection] = useState('overview');
    const [indicator, setIndicator] = useState(null);
    const navRef = useRef(null);
    const itemRefs = useRef({});

    useEffect(() => {
        const handleScroll = () => {
            const cutoff = 140;
            let current = 'overview';
            navItems.forEach((item) => {
                const el = document.getElementById(item.id);
                if (el && el.getBoundingClientRect().top <= cutoff) {
                    current = item.id;
                }
            });
            setActiveSection(current);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useLayoutEffect(() => {
        const btn = itemRefs.current[activeSection];
        const nav = navRef.current;
        if (btn && nav) {
            const navRect = nav.getBoundingClientRect();
            const btnRect = btn.getBoundingClientRect();
            setIndicator({
                top: btnRect.top - navRect.top,
                height: btnRect.height
            });
        }
    }, [activeSection]);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <MarketingShell>
            <section className="mkt-section">
                <div className="mkt-container">
                    <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12 xl:gap-16">
                        {/* Section navigation */}
                        <aside className="hidden lg:block">
                            <div className="sticky top-24">
                                <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    On this page
                                </p>
                                <nav
                                    ref={navRef}
                                    aria-label="API sections"
                                    className="relative space-y-1"
                                >
                                    {indicator && (
                                        <span
                                            aria-hidden="true"
                                            className="pointer-events-none absolute inset-x-0 rounded-lg bg-violet-600/90 transition-all duration-300 ease-out"
                                            style={{ top: indicator.top, height: indicator.height }}
                                        />
                                    )}
                                    {navItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeSection === item.id;
                                        const isGroupActive = item.id === 'endpoints' && (activeSection === 'track-events' || activeSection === 'analytics');
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                ref={(el) => { itemRefs.current[item.id] = el; }}
                                                onClick={() => scrollTo(item.id)}
                                                aria-current={isActive ? 'true' : undefined}
                                                className={`relative z-10 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
                                                    item.nested ? 'ml-4 text-[13px]' : ''
                                                } ${
                                                    isActive
                                                        ? 'text-white'
                                                        : isGroupActive
                                                            ? 'font-semibold text-violet-300'
                                                            : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                                                }`}
                                            >
                                                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                                {item.label}
                                            </button>
                                        );
                                    })}
                                </nav>

                                <div className="mt-6 space-y-1 border-t border-white/[0.07] pt-6">
                                    <Link
                                        to="/docs/api"
                                        className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                    >
                                        <BookOpen className="h-4 w-4 text-slate-500 transition-colors group-hover:text-violet-300" aria-hidden="true" />
                                        Read the API docs
                                        <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                                    </Link>
                                    <Link
                                        to="/docs/getting-started"
                                        className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                    >
                                        <Zap className="h-4 w-4 text-slate-500 transition-colors group-hover:text-violet-300" aria-hidden="true" />
                                        Getting started guide
                                    </Link>
                                </div>
                            </div>
                        </aside>

                        <div className="min-w-0">
                            {/* Hero */}
                            <Reveal>
                                <div className="flex flex-wrap items-center gap-3">
                                    <p className="mkt-eyebrow">WebPulse API</p>
                                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                                        <span className="mkt-live-dot !h-1.5 !w-1.5" aria-hidden="true" />
                                        API Operational
                                    </span>
                                </div>
                                <h1 className="mkt-h1 mt-5 !text-4xl sm:!text-5xl">
                                    Build with your <span className="mkt-accent-text">analytics data</span>.
                                </h1>
                                <p className="mkt-lead mt-5 max-w-2xl">
                                    Send events to WebPulse, retrieve analytics programmatically, and connect real-time website activity to your own applications and workflows.
                                </p>
                                <div className="mt-8">
                                    <Link to="/dashboard" className="mkt-btn mkt-btn-primary mkt-btn-md">
                                        Go to Console
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </div>
                            </Reveal>

                            {/* Compact section navigation on small screens */}
                            <div className="mt-12 lg:hidden">
                                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    On this page
                                </p>
                                <nav
                                    aria-label="API sections (compact)"
                                    className="flex gap-2 overflow-x-auto pb-1"
                                >
                                    {navItems.map((item) => {
                                        const isActive = activeSection === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => scrollTo(item.id)}
                                                aria-current={isActive ? 'true' : undefined}
                                                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
                                                    isActive
                                                        ? 'border-violet-400/40 bg-violet-600 text-white'
                                                        : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-slate-100'
                                                }`}
                                            >
                                                {item.label}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>

                            <div className="mt-16 space-y-20 divide-y divide-white/[0.06] lg:mt-20">
                                <Section id="overview" title="Analytics you can build on." icon={BookOpen}>
                                    <p className="text-lg leading-relaxed text-slate-300">
                                        WebPulse provides APIs for collecting website activity and accessing analytics data from your projects.
                                    </p>

                                    <div className="mkt-card p-6">
                                        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                            Use the API to:
                                        </h3>
                                        <ul className="mt-5 space-y-3">
                                            {[
                                                'Send page-view events',
                                                'Send custom events',
                                                'Retrieve analytics',
                                                'Integrate tracking into your application',
                                                'Build internal analytics tools',
                                                'Connect WebPulse with your existing backend'
                                            ].map((item) => (
                                                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                                                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
                                                        <Check className="h-3 w-3 text-emerald-300" aria-hidden="true" />
                                                    </span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <h3 className="mkt-h4 !text-lg">How WebPulse fits into your application</h3>
                                    <div className="mx-auto flex max-w-xs flex-col items-center">
                                        <FlowBox label="Visitor" />
                                        <FlowArrow />
                                        <FlowBox label="Your Website" />
                                        <FlowArrow label="tracking event" />
                                        <FlowBox label="WebPulse Collector" />
                                        <FlowArrow />
                                        <FlowBox label="Analytics Data" />
                                    </div>
                                    <div className="flex justify-center gap-4">
                                        <div className="flex w-40 flex-col items-center gap-1">
                                            <ArrowDown className="h-4 w-4 text-slate-600" aria-hidden="true" />
                                            <FlowBox label="Dashboard" />
                                        </div>
                                        <div className="flex w-40 flex-col items-center gap-1">
                                            <ArrowDown className="h-4 w-4 text-slate-600" aria-hidden="true" />
                                            <FlowBox label="REST API" />
                                        </div>
                                    </div>
                                </Section>

                                <Section id="quickstart" title="Start collecting analytics in three steps." icon={Zap}>
                                    <div className="space-y-10">
                                        <Step number="01" title="Create a project">
                                            <p className="mkt-body mt-1.5">
                                                Create a project from your WebPulse console. Your project provides the credentials and tracking configuration required to send analytics data.
                                            </p>
                                            <Link to="/register" className="mkt-link mt-3">
                                                Create a project
                                                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                                            </Link>
                                        </Step>

                                        <Step number="02" title="Add tracking">
                                            <p className="mkt-body mt-1.5">
                                                Add the WebPulse tracking script to your website.
                                            </p>
                                            <div className="mt-5 space-y-4">
                                                <CodePanel
                                                    language="html"
                                                    title="Tracking Snippet"
                                                    code={`<script src="${API_DOMAIN}/api/v1/track/script.js"></script>\n<script>\n  tracker('init', 'YOUR_TRACKING_ID');\n  tracker('track', 'page_view');\n</script>`}
                                                />
                                                <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] p-4">
                                                    <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                                                    <p className="text-sm leading-relaxed text-slate-300">
                                                        Replace <InlineCode>{API_DOMAIN}</InlineCode> with your actual deployed API/CDN URL.
                                                    </p>
                                                </div>
                                            </div>
                                        </Step>

                                        <Step number="03" title="View your analytics">
                                            <p className="mkt-body mt-1.5">
                                                Once events are received, they become available through your WebPulse analytics dashboard and API.
                                            </p>
                                            <Link to="/dashboard" className="mkt-link mt-3">
                                                Open Console
                                                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                                            </Link>
                                        </Step>
                                    </div>
                                </Section>

                                <Section id="auth" title="Protect your API credentials." icon={Lock}>
                                    <p className="text-base leading-relaxed text-slate-300">
                                        Sending tracking events and querying view counts use your project's <strong className="text-slate-100">tracking ID</strong>, sent in the <InlineCode>x-api-key</InlineCode> header.
                                    </p>

                                    <CodePanel
                                        language="bash"
                                        title="Header Example"
                                        code={`GET ${API_DOMAIN}/api/v1/analytics/count\nx-api-key: YOUR_TRACKING_ID`}
                                    />

                                    <div className="flex items-start gap-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] p-6">
                                        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
                                        <div>
                                            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                                                Security warning
                                            </h3>
                                            <p className="mt-2 text-sm leading-relaxed text-slate-300">
                                                Never expose console credentials in browser-side JavaScript, public repositories, or client applications.
                                                For browser tracking, use the tracking ID / public tracking mechanism intended for the client-side tracker.
                                                Keep console and server credentials on your server.
                                            </p>
                                        </div>
                                    </div>

                                    <p className="mkt-body">
                                        Protected analytics endpoints (such as <InlineCode>/api/v1/analytics/overview</InlineCode>) require an authenticated console session.
                                    </p>
                                </Section>

                                <Section id="endpoints" title="API Endpoints" icon={Server}>
                                    <div className="space-y-12">
                                        <div id="track-events" className="scroll-mt-24">
                                            <div className="flex items-center justify-between gap-4">
                                                <h3 className="mkt-h4 !text-lg">Track an event</h3>
                                                <MethodBadge method="POST" />
                                            </div>
                                            <p className="mkt-body mt-2">
                                                Send a page view or custom event to WebPulse.
                                            </p>
                                            <div className="mt-5 space-y-5">
                                                <CodePanel
                                                    language="bash"
                                                    title="Endpoint"
                                                    code={`POST ${API_DOMAIN}/api/v1/track/events\nContent-Type: application/json`}
                                                />
                                                <CodePanel
                                                    language="json"
                                                    title="Request Body"
                                                    code={`{\n  "event": "page_view",\n  "url": "https://example.com/pricing",\n  "referrer": "https://google.com"\n}`}
                                                />
                                                <div className="mkt-card p-6">
                                                    <h4 className="mkt-eyebrow mb-4">Parameters</h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full min-w-[520px] border-collapse text-left">
                                                            <caption className="sr-only">
                                                                Track event parameters
                                                            </caption>
                                                            <thead>
                                                                <tr className="border-b border-white/[0.07]">
                                                                    <th scope="col" className="py-2.5 pr-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Parameter</th>
                                                                    <th scope="col" className="py-2.5 pr-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Type</th>
                                                                    <th scope="col" className="py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Description</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-white/[0.05]">
                                                                {[
                                                                    ['event', 'string', 'Event name'],
                                                                    ['url', 'string', 'Page URL'],
                                                                    ['referrer', 'string', 'Referring URL'],
                                                                    ['title', 'string', 'Page title']
                                                                ].map(([param, type, desc]) => (
                                                                    <tr key={param}>
                                                                        <th scope="row" className="py-3 pr-6 font-mono text-sm font-medium text-slate-200">{param}</th>
                                                                        <td className="py-3 pr-6 text-sm text-slate-400">{type}</td>
                                                                        <td className="py-3 text-sm leading-snug text-slate-400">{desc}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <p className="mt-4 text-xs leading-relaxed text-slate-500">
                                                        Fields beyond these are accepted but not persisted — only the documented fields are stored.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mkt-divider" aria-hidden="true" />

                                        <div id="analytics" className="scroll-mt-24">
                                            <div className="flex items-center justify-between gap-4">
                                                <h3 className="mkt-h4 !text-lg">Get analytics</h3>
                                                <MethodBadge method="GET" />
                                            </div>
                                            <p className="mkt-body mt-2">
                                                Retrieve view-count data for your project. Include <InlineCode>?url=/pricing</InlineCode> to filter to a specific page path.
                                            </p>
                                            <div className="mt-5 space-y-5">
                                                <CodePanel
                                                    language="bash"
                                                    title="Endpoint"
                                                    code={`GET ${API_DOMAIN}/api/v1/analytics/count?url=/pricing\nx-api-key: YOUR_TRACKING_ID`}
                                                />
                                                <div className="mkt-card p-6">
                                                    <h4 className="mkt-eyebrow mb-4">Response Sample</h4>
                                                    <CodePanel
                                                        language="json"
                                                        title="Response"
                                                        code={`{\n  "count": 1284\n}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Section>

                                <Section id="tracker" title="Lightweight website tracking" icon={Code2}>
                                    <p className="text-base leading-relaxed text-slate-300">
                                        The WebPulse tracker provides a simple client-side interface for initializing a project and sending events.
                                        It sends events with <InlineCode>navigator.sendBeacon</InlineCode> when available and falls back to <InlineCode>fetch</InlineCode>.
                                    </p>

                                    <div className="space-y-6">
                                        <div className="mkt-card p-6">
                                            <h3 className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                                                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" aria-hidden="true" />
                                                Method: init
                                            </h3>
                                            <p className="mkt-body mt-3">
                                                Initialize your project tracking ID. This must be called before tracking any events.
                                            </p>
                                            <div className="mt-5">
                                                <CodePanel
                                                    language="javascript"
                                                    code={`tracker('init', 'YOUR_TRACKING_ID');`}
                                                />
                                            </div>
                                        </div>

                                        <div className="mkt-card p-6">
                                            <h3 className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                                                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" aria-hidden="true" />
                                                Method: track
                                            </h3>
                                            <p className="mkt-body mt-3">
                                                Record an event such as a page view.
                                            </p>
                                            <div className="mt-5">
                                                <CodePanel
                                                    language="javascript"
                                                    code={`tracker('track', 'page_view');`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mkt-card p-6">
                                        <h3 className="mkt-h4 !text-lg">Real-time analytics</h3>
                                        <p className="mkt-body mt-2">
                                            Track activity as it arrives and explore the resulting analytics from your WebPulse dashboard.
                                        </p>
                                    </div>
                                </Section>

                                <Section id="security" title="Keep your analytics integration secure." icon={Shield}>
                                    <div className="mkt-card p-6">
                                        <h3 className="flex items-center gap-2.5 text-sm font-semibold text-slate-100">
                                            <KeyRound className="h-5 w-5 text-violet-300" aria-hidden="true" />
                                            Use the correct credential
                                        </h3>
                                        <div className="mt-6 grid gap-6 sm:grid-cols-2">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Tracking ID</p>
                                                <p className="mkt-body mt-2 !text-sm">
                                                    Designed for client-side tracking in the browser.
                                                </p>
                                                <p className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                                                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                                                    Client-side tracking
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">Console credentials</p>
                                                <p className="mkt-body mt-2 !text-sm">
                                                    For protected server/API requests from your backend.
                                                </p>
                                                <p className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                                                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                                                    Protected server/API requests
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mkt-card p-6">
                                        <h3 className="text-sm font-semibold text-slate-100">
                                            Never put console credentials inside:
                                        </h3>
                                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                            {['React source', 'Browser JavaScript', 'GitHub repository', 'Public HTML', 'localStorage'].map((item) => (
                                                <p key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                                                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-rose-400/20 bg-rose-500/10">
                                                        <X className="h-3 w-3 text-rose-400" aria-hidden="true" />
                                                    </span>
                                                    {item}
                                                </p>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="mkt-card p-6">
                                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10">
                                                <Shield className="h-5 w-5 text-emerald-300" aria-hidden="true" />
                                            </div>
                                            <h3 className="text-sm font-semibold text-slate-100">Restrict allowed origins</h3>
                                            <p className="mkt-body mt-2">
                                                Restrict browser-based tracking to approved domains to reduce unauthorized use of your tracking configuration.
                                            </p>
                                            <p className="mkt-body mt-3 !text-sm">
                                                Allowed origins are an abuse-control mechanism, not authentication.
                                            </p>
                                        </div>
                                        <div className="mkt-card p-6">
                                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                                                <Terminal className="h-5 w-5 text-violet-300" aria-hidden="true" />
                                            </div>
                                            <h3 className="text-sm font-semibold text-slate-100">Use HTTPS & keep secrets server-side</h3>
                                            <p className="mkt-body mt-2">
                                                Production API requests and tracking traffic should use HTTPS.
                                            </p>
                                            <p className="mkt-body mt-3">
                                                Use environment variables or a server-side secret manager for API keys.
                                            </p>
                                        </div>
                                    </div>
                                </Section>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingShell>
    );
}
