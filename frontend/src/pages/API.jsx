import { Link } from 'react-router-dom';
import {
    Terminal, Copy, Check, Shield,
    Zap, Code2, Globe, Activity, Menu, X,
    ChevronRight, BookOpen, Lock, Server
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';

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
    <motion.section
        id={id}
        className="mb-20 scroll-mt-24"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
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
    </motion.section>
);

export default function API() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');

    const navItems = [
        { id: 'overview', label: 'Overview', icon: BookOpen },
        { id: 'quickstart', label: 'Quick Start', icon: Zap },
        { id: 'auth', label: 'Authentication', icon: Lock },
        { id: 'endpoints', label: 'API Endpoints', icon: Server },
        { id: 'sdk', label: 'Tracker SDK', icon: Code2 },
        { id: 'security', label: 'Best Practices', icon: Shield },
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.5, rootMargin: "-100px 0px -50% 0px" }
        );

        navItems.forEach((item) => {
            const el = document.getElementById(item.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

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
                        <Link to="/" className="flex items-center gap-3 group/logo">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-violet-500 text-white shadow-soft transition-transform duration-300 group-hover/logo:scale-105">
                                <Activity className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">WebPulse</span>
                        </Link>
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
                        <nav className="flex-1 space-y-1.5">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollTo(item.id)}
                                        className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                                            activeSection === item.id
                                            ? 'bg-slate-900 dark:bg-violet-500 text-white shadow-sm'
                                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                        }`}
                                    >
                                        <Icon className={`h-5 w-5 transition-colors ${activeSection === item.id ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                                        {item.label}
                                        {activeSection === item.id && (
                                            <motion.div layoutId="activeDot" className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
                            <div className="card card-pad">
                                <h4 className="eyebrow mb-2">Need Help?</h4>
                                <p className="prose-quiet mb-4">Join our Discord community and chat with fellow developers.</p>
                                <button className="btn-secondary btn-md w-full">
                                    Join Discord
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 pt-28 pb-24 px-6 sm:px-12 lg:px-24 max-w-5xl">
                    <Section id="overview" title="Global Analytics Infrastructure">
                        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300 mb-10 font-medium tracking-tight">
                            WebPulse provides a high-performance, real-time analytics infrastructure designed for high-traffic websites and applications.
                            Our API lets you programmatically send event telemetry and retrieve privacy-first analytics data.
                        </p>

                        <div className="card overflow-hidden group card-hover mb-10">
                            <div className="relative">
                                <img
                                    src="/docs/api-architecture.png"
                                    alt="Architecture"
                                    className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/40 dark:via-slate-950/40 to-transparent"></div>
                                <div className="absolute bottom-8 left-8 right-8">
                                    <div className="eyebrow mb-2 text-violet-600 dark:text-violet-400">System Architecture</div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight tracking-tight">Lightning Telemetry Engine</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
                                        Data flows from your visitors through our edge-optimized collectors directly into your personalized dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: 'High Performance', desc: 'Average response time of <15ms for event tracking.', icon: Zap },
                                { title: 'Privacy First', desc: 'GDPR/CCPA compliant by design. No PII storage.', icon: Shield },
                                { title: 'Scalable', desc: 'Handles millions of concurrent visitors without latency.', icon: Globe },
                                { title: 'Developer Friendly', desc: 'Simple JSON API with standard SDK support.', icon: Terminal }
                            ].map((feat, i) => (
                                <div key={i} className="card card-pad card-hover">
                                    <h4 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-3 mb-2 tracking-tight">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10 shrink-0">
                                            <feat.icon className="h-5 w-5 text-violet-500" />
                                        </div>
                                        {feat.title}
                                    </h4>
                                    <p className="prose-quiet ml-13">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section id="quickstart" title="Quick Start Guide" icon={Zap}>
                        <p className="prose-quiet mb-4 text-base">Integrate WebPulse into your website in 3 simple steps.</p>

                        <div className="space-y-10">
                            <div className="flex gap-5">
                                <div className="flex-none h-10 w-10 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center text-sm font-semibold text-violet-600 dark:text-violet-300">1</div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">Create a Project</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Login to your console and create a new project. Each project receives a unique tracking ID and API Key.</p>
                                    <Link to="/register" className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors mt-3">
                                        Sign up now <ChevronRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>

                            <div className="flex gap-5">
                                <div className="flex-none h-10 w-10 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center text-sm font-semibold text-violet-600 dark:text-violet-300">2</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">Add the Script</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">Paste the tracking snippet into the <code className="bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded-md font-mono text-[13px]">&lt;head&gt;</code> tag of your website.</p>
                                    <div className="card overflow-hidden mb-4 aspect-video relative group">
                                        <img
                                            src="/docs/sdk-mockup.png"
                                            alt="SDK Integration"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="px-5 py-3 rounded-2xl bg-slate-950/70 backdrop-blur-md border border-white/10 flex items-center gap-2.5 shadow-lift">
                                                <Code2 className="h-5 w-5 text-violet-400" />
                                                <span className="text-[10px] font-semibold text-white uppercase tracking-widest">Minimal SDK</span>
                                            </div>
                                        </div>
                                    </div>
                                    <CodeBlock
                                        language="html"
                                        title="SDK Snippet"
                                        code={`<script src="${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}/v1/track/script.js"></script>\n<script>\n  tracker('init', 'trk_your_id_here');\n  tracker('track', 'page_view');\n</script>`}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-5">
                                <div className="flex-none h-10 w-10 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 flex items-center justify-center text-sm font-semibold text-violet-600 dark:text-violet-300">3</div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">View Live Data</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Events start appearing in your Real-time visitor map and activity log instantly.</p>
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section id="auth" title="Authentication" icon={Lock}>
                        <p className="prose-quiet text-base">
                            Requests to protected API endpoints require an API Key passed in the <code className="bg-slate-100 dark:bg-slate-800 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded-md font-mono text-[13px]">x-api-key</code> header.
                            You can manage your keys in the project settings dashboard.
                        </p>

                        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex gap-4 items-start mb-6">
                            <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-widest mb-1">Security Warning</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                    Your API Key (`trk_...`) grants full access to your project telemetry. Never share it in public repositories (e.g. GitHub) or non-secure client-side code where exposure is risky.
                                </p>
                            </div>
                        </div>

                        <CodeBlock
                            language="bash"
                            title="Header Example"
                            code={`GET /v1/analytics/count HTTP/1.1\nx-api-key: trk_982b...`}
                        />
                    </Section>

                    <Section id="endpoints" title="Standard API Index" icon={Server}>
                        <div className="space-y-12">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center justify-between gap-4">
                                    Track Events
                                    <span className="badge-green uppercase">POST</span>
                                </h3>
                                <p className="prose-quiet mb-6">
                                    Send standard or custom event telemetry to the analytics engine.
                                    Compatible with both SDK and manual server-side hits.
                                </p>
                                <CodeBlock
                                    language="bash"
                                    title="Endpoint"
                                    code={`POST ${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}/v1/track/events`}
                                />
                                <div className="card card-pad mt-4">
                                    <h5 className="eyebrow mb-4">Payload Template</h5>
                                    <CodeBlock
                                        language="json"
                                        title="Body"
                                        code={`{\n  "event": "page_view",\n  "url": "https://example.com/pricing",\n  "referrer": "https://google.com"\n}`}
                                    />
                                    <div className="mt-5 grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Parameter</div>
                                            <div className="text-sm font-mono font-medium text-slate-800 dark:text-slate-200">event</div>
                                            <div className="text-sm font-mono font-medium text-slate-800 dark:text-slate-200">url</div>
                                            <div className="text-sm font-mono font-medium text-slate-800 dark:text-slate-200">referrer</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Type</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 leading-snug">String ("page_view", "click")</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 leading-snug">String (Full URL tracked)</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 leading-snug">String (Traffic source)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-200 dark:bg-slate-800"></div>

                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center justify-between gap-4">
                                    Get View Count
                                    <span className="badge-green uppercase">GET</span>
                                </h3>
                                <p className="prose-quiet mb-6">
                                    Retrieve instant view analytics for your project or specific URLs.
                                </p>
                                <CodeBlock
                                    language="bash"
                                    title="Endpoint"
                                    code={`GET ${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}/v1/analytics/count?url=/pricing`}
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

                    <Section id="sdk" title="Functional SDK Reference" icon={Code2}>
                        <p className="prose-quiet text-base">
                            The `tracker.js` SDK provides an easy, low-latency interface to communicate with our collectors.
                            It implements automatic session management and deduplication logic.
                        </p>

                        <div className="space-y-6">
                            <div className="card card-pad">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
                                    Method: init
                                </h3>
                                <p className="prose-quiet mb-4">Initialize your project key. This must be called before tracking any events.</p>
                                <CodeBlock
                                    language="javascript"
                                    code={`tracker('init', 'trk_91238b...');`}
                                />
                            </div>

                            <div className="card card-pad">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
                                    Method: track
                                </h3>
                                <p className="prose-quiet mb-4">Record an event transaction. Pass custom metadata if needed.</p>
                                <CodeBlock
                                    language="javascript"
                                    code={`tracker('track', 'conversion', {\n  value: 29.99,\n  currency: 'USD'\n});`}
                                />
                            </div>
                        </div>

                        <div className="card overflow-hidden relative aspect-[21/9] mt-6">
                            <img
                                src="/docs/realtime-visual.png"
                                alt="Realtime Visual"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm flex flex-col justify-center items-center text-center p-10">
                                <h4 className="text-2xl font-bold text-white mb-2 leading-tight">Live Real-time Processing</h4>
                                <p className="text-sm text-slate-200 max-w-sm leading-relaxed">
                                    Every SDK call is processed globally in under 15ms and visible in your dashboard in real-time.
                                </p>
                            </div>
                        </div>
                    </Section>

                    <Section id="security" title="Best Practices & Security" icon={Shield}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="card card-pad">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 mb-4">
                                    <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Allowed Origins</h4>
                                <p className="prose-quiet">
                                    Restrict tracking to specific domains to prevent third-party usage of your project key. Enable this in settings.
                                </p>
                            </div>
                            <div className="card card-pad">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10 mb-4">
                                    <Zap className="h-5 w-5 text-violet-500" />
                                </div>
                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">sendBeacon Latency</h4>
                                <p className="prose-quiet">
                                    The SDK automatically uses `navigator.sendBeacon` if available to ensure zero-latency tracking without blocking visitors.
                                </p>
                            </div>
                        </div>
                    </Section>
                </main>
            </div>

            <footer className="border-t border-slate-200 dark:border-white/[0.06] py-14 bg-slate-50 dark:bg-[#070A10] flex flex-col items-center gap-8 px-6">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-violet-500 text-white shadow-soft transition-transform duration-300 group-hover:scale-105">
                        <Activity className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">WebPulse</span>
                </Link>
                <div className="flex flex-wrap justify-center gap-8 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <Link to="/privacy" className="hover:text-violet-600 dark:hover:text-violet-300 transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-violet-600 dark:hover:text-violet-300 transition-colors">Term of Service</Link>
                    <Link to="/community" className="hover:text-violet-600 dark:hover:text-violet-300 transition-colors">Community</Link>
                </div>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-600">© 2026 WebPulse Infrastructure. Built for extreme precision.</p>
            </footer>
        </div>
    );
}