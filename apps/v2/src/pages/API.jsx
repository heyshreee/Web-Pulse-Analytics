import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import {
    Terminal, Copy, Check, Shield,
    Zap, Code2, Menu, X,
    ChevronRight, BookOpen, Lock, Server,
    ArrowRight, ArrowDown, KeyRound, Globe, ArrowUpRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const API_DOMAIN = 'https://api.webpulse.app';

const CodeBlock = ({ code, language = 'javascript', title }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.08] bg-[#0A0E17] text-white my-6 shadow-xl">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400 ml-1 font-mono">{title || language}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-all text-xs font-medium"
                >
                    {copied ? (
                        <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-3 w-3" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider">Copy</span>
                        </>
                    )}
                </button>
            </div>
            <div className="p-5 overflow-x-auto bg-[#070A10]">
                <SyntaxHighlighter
                    language={language}
                    style={atomDark}
                    customStyle={{
                        background: 'transparent',
                        padding: 0,
                        margin: 0,
                        fontSize: '13px',
                        lineHeight: '1.7',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontWeight: '500'
                    }}
                    wrapLongLines={true}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

const Section = ({ id, title, children, icon: Icon }) => (
    <section id={id} className="mb-20 scroll-mt-24">
        <div className="flex items-center gap-3.5 mb-6">
            {Icon && (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
            )}
            <h2 className="text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </section>
);

const FlowBox = ({ label, tone = 'light' }) => (
    <div className={`rounded-xl px-4 py-2 text-center text-xs font-semibold border ${
        tone === 'dark'
            ? 'bg-slate-900 text-white border-slate-800'
            : 'bg-violet-500/10 border-violet-500/20 text-violet-700 dark:text-violet-300'
    }`}>
        {label}
    </div>
);

const FlowArrow = ({ label }) => (
    <div className="flex items-center gap-2 justify-center my-1">
        {label && <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>}
        <ArrowDown className="h-4 w-4 text-slate-300 dark:text-slate-600" />
    </div>
);

const navItems = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'quickstart', label: 'Quick Start', icon: Zap },
    { id: 'auth', label: 'Authentication', icon: Lock },
    { id: 'endpoints', label: 'API Endpoints', icon: Server },
    { id: 'track-events', label: 'Track Events', icon: ChevronRight, nested: true },
    { id: 'analytics', label: 'Analytics API', icon: ChevronRight, nested: true },
    { id: 'tracker', label: 'Client Tracker', icon: Code2 },
    { id: 'security', label: 'Security & Origins', icon: Shield },
];

export default function API() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');

    useEffect(() => {
        const handleScroll = () => {
            const cutoff = 150;
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

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setSidebarOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 relative selection:bg-violet-500/30 selection:text-violet-200">
            {/* Ambient Background Grid & Glow */}
            <div className="pointer-events-none fixed inset-0 z-0 obs-grid opacity-70" />
            <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-violet-600/10 via-fuchsia-600/5 to-transparent blur-3xl -z-10" />

            {/* Navigation Header */}
            <header className="fixed top-0 w-full z-50 bg-white/85 dark:bg-[#0B0F17]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.07]">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg"
                        >
                            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                        <Logo />
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
                            <Link to="/features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</Link>
                            <Link to="/integrations" className="hover:text-slate-900 dark:hover:text-white transition-colors">Integrations</Link>
                            <Link to="/api" className="text-violet-600 dark:text-violet-400 font-semibold">API</Link>
                            <Link to="/docs" className="hover:text-slate-900 dark:hover:text-white transition-colors">Docs</Link>
                            <Link to="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
                            <Link to="/blog" className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold font-mono">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            API Operational
                        </div>
                        <Link to="/dashboard" className="btn-signal btn-md">
                            Console
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto flex relative z-10">
                {/* Sticky Sidebar Navigation */}
                <aside className={`
                    fixed lg:sticky top-16 h-[calc(100vh-64px)] w-72 border-r border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#070A10]/95 backdrop-blur-xl z-40 transition-all duration-300
                    ${sidebarOpen ? 'left-0 shadow-2xl' : '-left-full lg:left-0'}
                `}>
                    <div className="p-6 h-full flex flex-col justify-between overflow-y-auto">
                        <nav className="space-y-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-3">
                                API Reference
                            </p>
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeSection === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollTo(item.id)}
                                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                                            item.nested ? 'ml-4 !w-[calc(100%-1rem)] !text-[11px]' : ''
                                        } ${
                                            isActive
                                                ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                                        }`}
                                    >
                                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                        {item.label}
                                        {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="pt-6 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
                            <Link to="/docs" className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                                <span className="flex items-center gap-2">
                                    <BookOpen className="h-3.5 w-3.5 text-violet-500" /> Guides &amp; Tutorials
                                </span>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                            <Link to="/dashboard/api-key" className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.03]">
                                <span className="flex items-center gap-2">
                                    <KeyRound className="h-3.5 w-3.5 text-emerald-500" /> Manage API Keys
                                </span>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 pt-28 pb-24 px-6 sm:px-12 lg:px-20 max-w-4xl">
                    {/* Hero */}
                    <div className="mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-4">
                            <Terminal className="h-3.5 w-3.5" />
                            v1 REST API Specifications
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
                            Build with your <br />
                            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 dark:from-violet-400 dark:via-fuchsia-300 dark:to-indigo-300 bg-clip-text text-transparent">
                                real-time analytics data.
                            </span>
                        </h1>
                        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                            Programmatically ingest client actions, query timeseries metrics, and wire WebPulse observability directly into your serverless microservices.
                        </p>
                    </div>

                    <Section id="overview" title="Architecture & Ingestion Pipeline" icon={BookOpen}>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            WebPulse exposes lightweight JSON REST endpoints optimized for high-velocity telemetry. All incoming requests are verified via bearer tokens or tracking identifiers, rate-limited at edge proxies, and queued for instant stream delivery.
                        </p>

                        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-xl p-6 shadow-sm">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Core API Capabilities:</h4>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {[
                                    'Sub-second pageview & custom event ingestion',
                                    'Granular time-series query endpoints with URL filters',
                                    'Serverless Node, Python, and Go integration',
                                    'Origin protection & automatic bot sanitization',
                                    'Export raw metrics for external data warehouses',
                                    'Custom dashboard widgets and CLI tools'
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                                        <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                            <Check className="h-2.5 w-2.5" />
                                        </div>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-100/50 dark:bg-white/[0.02] p-6 text-center max-w-sm mx-auto">
                            <div className="flex flex-col items-center gap-1.5">
                                <FlowBox label="Client Browser / App" />
                                <FlowArrow />
                                <FlowBox label="WebPulse Edge Proxy (< 15ms)" tone="dark" />
                                <FlowArrow label="validated payload" />
                                <FlowBox label="Time-Series Streaming Engine" />
                            </div>
                        </div>
                    </Section>

                    <Section id="quickstart" title="Quick Start Integration" icon={Zap}>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Start streaming website telemetry in three straightforward steps.
                        </p>

                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17]">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="h-6 w-6 rounded-lg bg-violet-600 text-white font-mono text-xs font-bold flex items-center justify-center">1</span>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Obtain Your Tracking ID</h4>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 pl-9">
                                    Create a project in the WebPulse console. Every project receives a unique <code className="font-mono text-violet-600 dark:text-violet-400">trk_••••••••</code> identifier.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17]">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="h-6 w-6 rounded-lg bg-violet-600 text-white font-mono text-xs font-bold flex items-center justify-center">2</span>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Embed Tracking Snippet</h4>
                                </div>
                                <div className="pl-9">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                        Paste this lightweight script before the closing <code className="font-mono text-slate-700 dark:text-slate-300">&lt;/head&gt;</code> tag of your website:
                                    </p>
                                    <CodeBlock
                                        language="html"
                                        title="Script Tag"
                                        code={`<script src="${API_DOMAIN}/api/v1/track/script.js" async></script>\n<script>\n  window.tracker = window.tracker || function() { (tracker.q = tracker.q || []).push(arguments) };\n  tracker('init', 'YOUR_TRACKING_ID');\n  tracker('track', 'page_view');\n</script>`}
                                    />
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17]">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="h-6 w-6 rounded-lg bg-violet-600 text-white font-mono text-xs font-bold flex items-center justify-center">3</span>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Verify Activity Stream</h4>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 pl-9">
                                    Visit your website. Open the WebPulse dashboard — your pageview will appear in the Live Activity stream instantaneously.
                                </p>
                            </div>
                        </div>
                    </Section>

                    <Section id="auth" title="Authentication & Keys" icon={Lock}>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            WebPulse distinguishes between client tracking identifiers and secret programmatic API tokens.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17]">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded bg-violet-500/10">Public</span>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2 mb-1">Project Tracking ID</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Safe to embed in client-side HTML and frontend bundles. Only grants permission to ingest events.</p>
                                <code className="text-xs font-mono px-2 py-1 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-800 dark:text-slate-200">x-api-key: trk_91af••••</code>
                            </div>

                            <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17]">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">Secret</span>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2 mb-1">Server Bearer Token</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Keep strictly server-side. Grants programmatic read access to query analytics counts.</p>
                                <code className="text-xs font-mono px-2 py-1 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-800 dark:text-slate-200">Authorization: Bearer wp_live_••••</code>
                            </div>
                        </div>
                    </Section>

                    <Section id="endpoints" title="API Endpoints" icon={Server}>
                        {/* Track Events Endpoint */}
                        <div id="track-events" className="scroll-mt-24 p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17] shadow-sm">
                            <div className="flex items-center justify-between gap-4 mb-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">POST</span>
                                    <code className="text-sm font-bold font-mono text-slate-900 dark:text-white">/api/v1/track/events</code>
                                </div>
                                <span className="text-xs text-slate-400">Ingest Client Event</span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                                Ingests a new pageview or custom client interaction. Accepts standard JSON or Beacon payloads.
                            </p>

                            <CodeBlock
                                language="bash"
                                title="cURL Example"
                                code={`curl -X POST "${API_DOMAIN}/api/v1/track/events" \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: trk_YOUR_TRACKING_ID" \\\n  -d '{\n    "event": "page_view",\n    "url": "https://example.com/pricing",\n    "referrer": "https://google.com",\n    "title": "Pricing & Plans"\n  }'`}
                            />

                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Parameters:</h5>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/[0.04]">
                                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">event <span className="text-rose-500">*</span></span>
                                        <span className="text-slate-500">string (e.g. "page_view", "checkout_completed")</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/[0.04]">
                                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">url <span className="text-rose-500">*</span></span>
                                        <span className="text-slate-500">string (Full page URL or path)</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">referrer</span>
                                        <span className="text-slate-500">string (Acquisition source document.referrer)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analytics Query Endpoint */}
                        <div id="analytics" className="scroll-mt-24 p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17] shadow-sm">
                            <div className="flex items-center justify-between gap-4 mb-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-mono">GET</span>
                                    <code className="text-sm font-bold font-mono text-slate-900 dark:text-white">/api/v1/analytics/count</code>
                                </div>
                                <span className="text-xs text-slate-400">Query Aggregates</span>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                                Returns aggregated view and session counts for a project or specific path.
                            </p>

                            <CodeBlock
                                language="bash"
                                title="cURL Request"
                                code={`curl -X GET "${API_DOMAIN}/api/v1/analytics/count?url=/pricing" \\\n  -H "x-api-key: trk_YOUR_TRACKING_ID"`}
                            />

                            <CodeBlock
                                language="json"
                                title="Response (200 OK)"
                                code={`{\n  "success": true,\n  "url": "/pricing",\n  "count": 4820,\n  "unique_visitors": 2190,\n  "period": "30d"\n}`}
                            />
                        </div>
                    </Section>

                    <Section id="tracker" title="JavaScript Tracker SDK" icon={Code2}>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            The WebPulse client SDK is tiny (&lt; 1.2 KB gzipped) and uses <code className="font-mono text-violet-600 dark:text-violet-400">navigator.sendBeacon</code> to guarantee delivery without freezing page navigation.
                        </p>

                        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17] space-y-4">
                            <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Custom Event Tracking:</h4>
                                <CodeBlock
                                    language="javascript"
                                    title="Custom Event"
                                    code={`// Record high-value conversion points\ntracker('track', 'demo_requested', {\n  plan: 'pro',\n  source: 'features_hero'\n});`}
                                />
                            </div>
                        </div>
                    </Section>

                    <Section id="security" title="Security & Allowed Origins" icon={Shield}>
                        <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17] p-6 space-y-4">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Domain Restrictions &amp; Origin Whitelisting</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                Prevent unauthorized domains from submitting spoofed telemetry. Configure allowed origins in your project settings (e.g., <code className="font-mono text-slate-700 dark:text-slate-300">https://yourdomain.com</code>). Requests originating from non-whitelisted domains are rejected with HTTP 403 Forbidden.
                            </p>
                        </div>
                    </Section>
                </main>
            </div>

            {/* Standard Footer */}
            <footer className="border-t border-slate-200/80 dark:border-white/[0.06] py-12 bg-white dark:bg-[#070A10] text-center relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Logo />
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
                        <Link to="/features" className="hover:text-violet-600 dark:hover:text-white transition-colors">Features</Link>
                        <Link to="/integrations" className="hover:text-violet-600 dark:hover:text-white transition-colors">Integrations</Link>
                        <Link to="/api" className="hover:text-violet-600 dark:hover:text-white transition-colors">API</Link>
                        <Link to="/docs" className="hover:text-violet-600 dark:hover:text-white transition-colors">Docs</Link>
                        <Link to="/pricing" className="hover:text-violet-600 dark:hover:text-white transition-colors">Pricing</Link>
                        <Link to="/blog" className="hover:text-violet-600 dark:hover:text-white transition-colors">Blog</Link>
                        <Link to="/community" className="hover:text-violet-600 dark:hover:text-white transition-colors">Community</Link>
                        <Link to="/help" className="hover:text-violet-600 dark:hover:text-white transition-colors">Help</Link>
                    </div>
                    <p className="text-slate-400 dark:text-slate-600 text-xs">© 2026 WebPulse Analytics. Real-time web observability.</p>
                </div>
            </footer>
        </div>
    );
}