import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import {
    Terminal, Copy, Check, Shield,
    Zap, Code2, Activity, Menu, X,
    ChevronRight, BookOpen, Lock, Server,
    ArrowRight, ArrowDown, KeyRound
} from 'lucide-react';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-white my-8 shadow-lift">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/70 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500/60"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500/60"></div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400 ml-2">{title || language}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/10"
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-semibold uppercase tracking-widest">Copy Code</span>
                        </>
                    )}
                </button>
            </div>
            <div className="p-6 overflow-x-auto bg-slate-900">
                <SyntaxHighlighter
                    language={language}
                    style={atomDark}
                    customStyle={{
                        background: 'transparent',
                        padding: 0,
                        margin: 0,
                        fontSize: '14px',
                        lineHeight: '1.8',
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
    <section
        id={id}
        className="mb-20 scroll-mt-24"
    >
        <div className="flex items-center gap-4 mb-8">
            {Icon && (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                    <Icon className="h-5 w-5 text-violet-500" />
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
    <div className={`rounded-xl px-4 py-2.5 text-center text-xs font-semibold border ${
        tone === 'dark'
            ? 'bg-slate-900 dark:bg-violet-500 border-slate-800 dark:border-violet-400 text-white'
            : 'bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20 text-violet-600 dark:text-violet-400'
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
    { id: 'analytics', label: 'Analytics', icon: ChevronRight, nested: true },
    { id: 'tracker', label: 'Tracker', icon: Code2 },
    { id: 'security', label: 'Security', icon: Shield },
];

export default function API() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
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
            setSidebarOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
            {/* Header */}
            <header className="fixed top-0 w-full z-[60] bg-white/80 dark:bg-space-900/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.06]">
                <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg"
                        >
                            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                        <Logo />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 badge-green">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">API Operational</span>
                        </div>
                        <Link to="/dashboard" className="btn-secondary btn-md">
                            Go to Console
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto flex">
                {/* Sidebar */}
                <aside className={`
                    fixed lg:sticky top-16 h-[calc(100vh-64px)] w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-50 transition-all duration-500
                    ${sidebarOpen ? 'left-0' : '-left-full lg:left-0'}
                `}>
                    <div className="p-6 h-full flex flex-col overflow-y-auto">
                        <nav ref={navRef} className="relative flex-1 space-y-1.5">
                            {indicator && (
                                <span
                                    className="absolute left-0 right-0 rounded-xl bg-slate-900 dark:bg-violet-500 shadow-sm pointer-events-none transition-all duration-300 ease-out"
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
                                        ref={(el) => { itemRefs.current[item.id] = el; }}
                                        onClick={() => scrollTo(item.id)}
                                        className={`relative z-10 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                                            item.nested ? 'ml-5 !px-3 text-[13px]' : ''
                                        } ${
                                            isActive
                                            ? 'text-white'
                                            : isGroupActive
                                                ? 'text-violet-600 dark:text-violet-400 font-semibold'
                                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                                        {item.label}
                                        {isActive && (
                                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                            <Link to="/docs/api" className="group flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                                <BookOpen className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-violet-500 transition-colors" />
                                Read the API docs
                                <ChevronRight className="h-4 w-4 ml-auto text-slate-400" />
                            </Link>
                            <Link to="/docs/getting-started" className="group flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                                <Zap className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-violet-500 transition-colors" />
                                Getting started guide
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 pt-28 pb-24 px-6 sm:px-12 lg:px-24 max-w-5xl">
                    {/* Hero */}
                    <div className="mb-20">
                        <p className="eyebrow mb-3">WebPulse API</p>
                        <h1 className="page-title !text-4xl font-display mb-4">Build with your <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">analytics data</span>.</h1>
                        <p className="page-sub !text-base mt-3 max-w-2xl mb-8">
                            Send events to WebPulse, retrieve analytics programmatically, and connect real-time website activity to your own applications and workflows.
                        </p>
                        <Link to="/dashboard" className="btn-primary btn-md inline-flex items-center gap-2">
                            Go to Console <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <Section id="overview" title="Analytics you can build on." icon={BookOpen}>
                        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300 mb-10 font-medium tracking-tight">
                            WebPulse provides APIs for collecting website activity and accessing analytics data from your projects.
                        </p>

                        <div className="card card-pad mb-8">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Use the API to:</h4>
                            <ul className="space-y-3">
                                {[
                                    'Send page-view events',
                                    'Send custom events',
                                    'Retrieve analytics',
                                    'Integrate tracking into your application',
                                    'Build internal analytics tools',
                                    'Connect WebPulse with your existing backend'
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15 shrink-0">
                                            <Check className="h-3 w-3 text-emerald-500" />
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">How WebPulse fits into your application</h3>
                        <div className="flex flex-col items-center gap-0 max-w-xs mx-auto mb-4">
                            <FlowBox label="Visitor" />
                            <FlowArrow />
                            <FlowBox label="Your Website" />
                            <FlowArrow label="tracking event" />
                            <FlowBox label="WebPulse Collector" />
                            <FlowArrow />
                            <FlowBox label="Analytics Data" />
                        </div>
                        <div className="flex justify-center gap-4">
                            <div className="flex flex-col items-center gap-1">
                                <ArrowDown className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                                <FlowBox label="Dashboard" />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <ArrowDown className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                                <FlowBox label="REST API" />
                            </div>
                        </div>
                    </Section>

                    <Section id="quickstart" title="Start collecting analytics in three steps." icon={Zap}>
                        <div className="space-y-10">
                            <div className="flex gap-5">
                                <div className="flex-none h-10 w-10 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center text-sm font-semibold text-violet-600 dark:text-violet-300">01</div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">Create a project</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Create a project from your WebPulse console. Your project provides the credentials and tracking configuration required to send analytics data.</p>
                                    <Link to="/register" className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors mt-3">
                                        Create a project <ChevronRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>

                            <div className="flex gap-5">
                                <div className="flex-none h-10 w-10 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center text-sm font-semibold text-violet-600 dark:text-violet-300">02</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">Add tracking</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">Add the WebPulse tracking script to your website.</p>
                                    <CodeBlock
                                        language="html"
                                        title="Tracking Snippet"
                                        code={`<script src="${API_DOMAIN}/api/v1/track/script.js"></script>\n<script>\n  tracker('init', 'YOUR_TRACKING_ID');\n  tracker('track', 'page_view');\n</script>`}
                                    />
                                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex gap-3 items-start">
                                        <Terminal className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                            Replace <code className="bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded-md font-mono text-[13px]">{API_DOMAIN}</code> with your actual deployed API/CDN URL.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-5">
                                <div className="flex-none h-10 w-10 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center text-sm font-semibold text-violet-600 dark:text-violet-300">03</div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">View your analytics</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3">Once events are received, they become available through your WebPulse analytics dashboard and API.</p>
                                    <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors">
                                        Open Console <ChevronRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section id="auth" title="Protect your API credentials." icon={Lock}>
                        <p className="prose-quiet text-base">
                            Sending tracking events and querying view counts use your project's <strong>tracking ID</strong>, sent in the <code className="bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded-md font-mono text-[13px]">x-api-key</code> header.
                        </p>

                        <CodeBlock
                            language="bash"
                            title="Header Example"
                            code={`GET ${API_DOMAIN}/api/v1/analytics/count\nx-api-key: YOUR_TRACKING_ID`}
                        />

                        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex gap-4 items-start">
                            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-widest mb-1">Security warning</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Never expose console credentials in browser-side JavaScript, public repositories, or client applications.
                                    For browser tracking, use the tracking ID / public tracking mechanism intended for the client-side tracker.
                                    Keep console and server credentials on your server.
                                </p>
                            </div>
                        </div>

                        <p className="prose-quiet text-sm">
                            Protected analytics endpoints (such as <code className="bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded-md font-mono text-[13px]">/api/v1/analytics/overview</code>) require an authenticated console session.
                        </p>
                    </Section>

                    <Section id="endpoints" title="API Endpoints" icon={Server}>
                        <div className="space-y-12">
                            <div id="track-events" className="scroll-mt-24">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center justify-between gap-4">
                                    Track an event
                                    <span className="badge-green uppercase">POST</span>
                                </h3>
                                <p className="prose-quiet mb-6">
                                    Send a page view or custom event to WebPulse.
                                </p>
                                <CodeBlock
                                    language="bash"
                                    title="Endpoint"
                                    code={`POST ${API_DOMAIN}/api/v1/track/events\nContent-Type: application/json`}
                                />
                                <CodeBlock
                                    language="json"
                                    title="Request Body"
                                    code={`{\n  "event": "page_view",\n  "url": "https://example.com/pricing",\n  "referrer": "https://google.com"\n}`}
                                />
                                <div className="card card-pad mt-4">
                                    <h5 className="eyebrow mb-4">Parameters</h5>
                                    <div className="grid grid-cols-[1fr_1.5fr_3fr] gap-x-6 gap-y-3 text-sm">
                                        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Parameter</div>
                                        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Type</div>
                                        <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Description</div>
                                        {[
                                            ['event', 'string', 'Event name'],
                                            ['url', 'string', 'Page URL'],
                                            ['referrer', 'string', 'Referring URL'],
                                            ['title', 'string', 'Page title']
                                        ].map(([param, type, desc]) => (
                                            <div key={param} className="contents">
                                                <div className="font-mono font-medium text-slate-800 dark:text-slate-200">{param}</div>
                                                <div className="text-slate-500 dark:text-slate-400">{type}</div>
                                                <div className="text-slate-500 dark:text-slate-400 leading-snug">{desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="prose-quiet text-xs mt-4">
                                        Fields beyond these are accepted but not persisted — only the documented fields are stored.
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

                            <div id="analytics" className="scroll-mt-24">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center justify-between gap-4">
                                    Get analytics
                                    <span className="badge-green uppercase">GET</span>
                                </h3>
                                <p className="prose-quiet mb-6">
                                    Retrieve view-count data for your project. Include <code className="bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded-md font-mono text-[13px]">?url=/pricing</code> to filter to a specific page path.
                                </p>
                                <CodeBlock
                                    language="bash"
                                    title="Endpoint"
                                    code={`GET ${API_DOMAIN}/api/v1/analytics/count?url=/pricing\nx-api-key: YOUR_TRACKING_ID`}
                                />
                                <div className="card card-pad mt-4">
                                    <h5 className="eyebrow mb-4">Response Sample</h5>
                                    <CodeBlock
                                        language="json"
                                        title="Response"
                                        code={`{\n  "count": 1284\n}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section id="tracker" title="Lightweight website tracking" icon={Code2}>
                        <p className="prose-quiet text-base">
                            The WebPulse tracker provides a simple client-side interface for initializing a project and sending events.
                            It sends events with <code className="bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded-md font-mono text-[13px]">navigator.sendBeacon</code> when available and falls back to <code className="bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded-md font-mono text-[13px]">fetch</code>.
                        </p>

                        <div className="space-y-6">
                            <div className="card card-pad">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
                                    Method: init
                                </h3>
                                <p className="prose-quiet mb-4">Initialize your project tracking ID. This must be called before tracking any events.</p>
                                <CodeBlock
                                    language="javascript"
                                    code={`tracker('init', 'YOUR_TRACKING_ID');`}
                                />
                            </div>

                            <div className="card card-pad">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
                                    Method: track
                                </h3>
                                <p className="prose-quiet mb-4">Record an event such as a page view.</p>
                                <CodeBlock
                                    language="javascript"
                                    code={`tracker('track', 'page_view');`}
                                />
                            </div>
                        </div>

                        <div className="card card-pad mt-8">
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Real-time analytics</h4>
                            <p className="prose-quiet">
                                Track activity as it arrives and explore the resulting analytics from your WebPulse dashboard.
                            </p>
                        </div>
                    </Section>

                    <Section id="security" title="Keep your analytics integration secure." icon={Shield}>
                        <div className="card card-pad">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <KeyRound className="h-5 w-5 text-violet-500" />
                                Use the correct credential
                            </h4>
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-2">Tracking ID</p>
                                    <p className="prose-quiet text-sm mb-3">Designed for client-side tracking in the browser.</p>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <ArrowRight className="h-4 w-4 text-slate-400" /> Client-side tracking
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-2">Console credentials</p>
                                    <p className="prose-quiet text-sm mb-3">For protected server/API requests from your backend.</p>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <ArrowRight className="h-4 w-4 text-slate-400" /> Protected server/API requests
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card card-pad">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Never put console credentials inside:</h4>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {['React source', 'Browser JavaScript', 'GitHub repository', 'Public HTML', 'localStorage'].map((item) => (
                                    <div key={item} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/15 shrink-0">
                                            <X className="h-3 w-3 text-rose-500" />
                                        </span>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="card card-pad">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 mb-4">
                                    <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Restrict allowed origins</h4>
                                <p className="prose-quiet">
                                    Restrict browser-based tracking to approved domains to reduce unauthorized use of your tracking configuration.
                                </p>
                                <p className="prose-quiet text-sm mt-3">
                                    Allowed origins are an abuse-control mechanism, not authentication.
                                </p>
                            </div>
                            <div className="card card-pad">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10 mb-4">
                                    <Terminal className="h-5 w-5 text-violet-500" />
                                </div>
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Use HTTPS & keep secrets server-side</h4>
                                <p className="prose-quiet mb-3">
                                    Production API requests and tracking traffic should use HTTPS.
                                </p>
                                <p className="prose-quiet">
                                    Use environment variables or a server-side secret manager for API keys.
                                </p>
                            </div>
                        </div>
                    </Section>
                </main>
            </div>

            <footer className="border-t border-slate-200 dark:border-white/[0.06] py-14 bg-slate-50 dark:bg-[#070A10] flex flex-col items-center gap-8 px-6">
                <Logo />
                <div className="flex flex-wrap justify-center gap-8 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <Link to="/privacy" className="hover:text-violet-600 dark:hover:text-violet-300 transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-violet-600 dark:hover:text-violet-300 transition-colors">Term of Service</Link>
                    <Link to="/community" className="hover:text-violet-600 dark:hover:text-violet-300 transition-colors">Community</Link>
                </div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-600">© 2026 WebPulse</p>
            </footer>
        </div>
    );
}