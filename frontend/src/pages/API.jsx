import { Link } from 'react-router-dom';
import { 
    ArrowLeft, Terminal, Copy, Check, Info, Shield, 
    Zap, Code2, Globe, Database, Activity, Menu, X,
    ChevronRight, BookOpen, Lock, Server
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';

const CodeBlock = ({ code, language = 'javascript', title }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-slate-900 dark:bg-[#0f1218] rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden my-10 shadow-2xl transition-all hover:shadow-blue-500/10">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50 dark:bg-white/[0.03] border-b border-slate-700/50 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-500/40"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-500/40"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-400/20 border border-emerald-500/40"></div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500 ml-4">{title || language}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all flex items-center gap-2 group border border-transparent hover:border-white/10"
                >
                    {copied ? (
                        <>
                            <Check className="h-4 w-4 text-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Copied</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Copy Code</span>
                        </>
                    )}
                </button>
            </div>
            <div className="p-8 overflow-x-auto bg-slate-900 dark:bg-gradient-to-b dark:from-transparent dark:to-black/20">
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
        className="mb-32 scroll-mt-32"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex items-center gap-4 mb-8">
            {Icon && (
                <div className="p-3 rounded-2xl bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 dark:border-blue-500/20 shadow-sm">
                    <Icon className="h-6 w-6" />
                </div>
            )}
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{title}</h2>
        </div>
        <div className="text-slate-600 dark:text-slate-400 space-y-6">
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
        <div className="min-h-screen bg-slate-50 dark:bg-[#06080b] text-slate-900 dark:text-slate-300 font-sans selection:bg-blue-500/30 transition-colors duration-500">
            {/* Header */}
            <header className="fixed top-0 w-full z-[60] bg-white/80 dark:bg-[#06080b]/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5">
                <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                        <Link to="/" className="flex items-center gap-3 group/logo">
                            <div className="bg-blue-600 p-2 rounded-xl shadow-xl shadow-blue-600/20 group-hover/logo:rotate-12 transition-all duration-300">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">WebPulse <span className="text-blue-600">Analytics</span></span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-6">
                         <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em]">API Operational</span>
                        </div>
                        <Link to="/dashboard" className="text-xs font-black text-slate-900 dark:text-white transition-all px-6 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md active:scale-95 uppercase tracking-widest">
                            Go to Console
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto flex">
                {/* Sidebar */}
                <aside className={`
                    fixed lg:sticky top-16 h-[calc(100vh-64px)] w-72 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#06080b] z-50 transition-all duration-500
                    ${sidebarOpen ? 'left-0' : '-left-full lg:left-0'}
                `}>
                    <div className="p-8 h-full flex flex-col">
                        <nav className="flex-1 space-y-2">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => scrollTo(item.id)}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-black transition-all duration-300 group tracking-tight ${
                                            activeSection === item.id 
                                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 border border-blue-500/50' 
                                            : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                                        }`}
                                    >
                                        <Icon className={`h-5 w-5 ${activeSection === item.id ? 'text-white' : 'text-slate-400 dark:text-slate-600 group-hover:text-blue-500'}`} />
                                        {item.label}
                                        {activeSection === item.id && (
                                            <motion.div layoutId="activeDot" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-lg" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                        
                        <div className="pt-8 border-t border-slate-200 dark:border-white/5">
                            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-600/10 dark:to-indigo-600/5 border border-blue-500/20 shadow-xl shadow-blue-600/10">
                                <h4 className="text-[10px] font-black text-white dark:text-blue-400 uppercase tracking-[0.3em] mb-3">Need Help?</h4>
                                <p className="text-xs text-blue-50 dark:text-slate-500 mb-4 font-medium leading-relaxed">Join our Discord community and chat with fellow developers.</p>
                                <button className="w-full py-3 bg-white dark:bg-blue-600 text-blue-600 dark:text-white text-[10px] font-black rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">
                                    Join Discord
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 pt-32 pb-48 px-6 sm:px-12 lg:px-24 max-w-5xl">
                    <Section id="overview" title="Global Analytics Infrastructure">
                        <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-300/80 mb-10 font-medium tracking-tight">
                            WebPulse provides a high-performance, real-time analytics infrastructure designed for high-traffic websites and applications. 
                            Our API lets you programmatically send event telemetry and retrieve privacy-first analytics data.
                        </p>
                        
                        <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/5 bg-white dark:bg-white/[0.02] mb-16 group shadow-2xl transition-all hover:border-blue-500/30">
                             <img 
                                src="/docs/api-architecture.png" 
                                alt="Architecture" 
                                className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#06080b] via-transparent to-transparent"></div>
                            <div className="absolute bottom-12 left-12 right-12">
                                <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.4em] mb-3">System Architecture</div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 leading-tight tracking-tighter">Lightning Telemetry Engine</h3>
                                <p className="text-base text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed font-medium">
                                    Data flows from your visitors through our edge-optimized collectors directly into your personalized dashboard.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { title: 'High Performance', desc: 'Average response time of <15ms for event tracking.', icon: Zap },
                                { title: 'Privacy First', desc: 'GDPR/CCPA compliant by design. No PII storage.', icon: Shield },
                                { title: 'Scalable', desc: 'Handles millions of concurrent visitors without latency.', icon: Globe },
                                { title: 'Developer Friendly', desc: 'Simple JSON API with standard SDK support.', icon: Terminal }
                            ].map((feat, i) => (
                                <div key={i} className="p-8 rounded-[2rem] bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 hover:border-blue-500/20 dark:hover:border-blue-500/20 transition-all shadow-sm hover:shadow-md">
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3 mb-3 tracking-tight">
                                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                            <feat.icon className="h-5 w-5" />
                                        </div>
                                        {feat.title}
                                    </h4>
                                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section id="quickstart" title="Quick Start Guide" icon={Zap}>
                        <p className="mb-8">Integrate WebPulse into your website in 3 simple steps.</p>
                        
                        <div className="space-y-12">
                            <div className="flex gap-6">
                                <div className="flex-none w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 border-4 border-blue-500/20">1</div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Create a Project</h3>
                                    <p className="text-sm text-slate-400 mb-4 leading-relaxed">Login to your console and create a new project. Each project receives a unique tracking ID and API Key.</p>
                                    <Link to="/register" className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                                        Sign up now <ChevronRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="flex-none w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold border-4 border-white/5">2</div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-2">Add the Script</h3>
                                    <p className="text-sm text-slate-400 mb-6 leading-relaxed">Paste the tracking snippet into the <code>&lt;head&gt;</code> tag of your website.</p>
                                    <div className="rounded-2xl overflow-hidden border border-white/5 bg-black/40 mb-4 aspect-video relative group">
                                         <img 
                                            src="/docs/sdk-mockup.png" 
                                            alt="SDK Integration" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                            <div className="p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-center">
                                                 <Code2 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                                 <span className="text-[10px] font-bold text-white uppercase tracking-widest">Minimal SDK</span>
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

                            <div className="flex gap-6">
                                <div className="flex-none w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold border-4 border-white/5">3</div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">View Live Data</h3>
                                    <p className="text-sm text-slate-400 mb-0 leading-relaxed">Events start appearing in your Real-time visitor map and activity log instantly.</p>
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section id="auth" title="Authentication" icon={Lock}>
                        <p className="mb-6">
                            Requests to protected API endpoints require an API Key passed in the <code className="text-blue-400">x-api-key</code> header. 
                            You can manage your keys in the project settings dashboard.
                        </p>
                        
                        <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex gap-4 items-start mb-8">
                            <Lock className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                            <div>
                                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-1">Security Warning</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">
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
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
                                    Track Events
                                    <span className="text-[10px] font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 rounded tracking-widest uppercase">POST</span>
                                </h3>
                                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                                    Send standard or custom event telemetry to the analytics engine. 
                                    Compatible with both SDK and manual server-side hits.
                                </p>
                                <CodeBlock 
                                    language="bash"
                                    title="Endpoint"
                                    code={`POST ${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}/v1/track/events`}
                                />
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Payload Template</h5>
                                    <CodeBlock 
                                        language="json"
                                        title="Body"
                                        code={`{\n  "event": "page_view",\n  "url": "https://example.com/pricing",\n  "referrer": "https://google.com"\n}`}
                                    />
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Parameter</div>
                                            <div className="text-xs font-mono text-slate-300 font-bold">event</div>
                                            <div className="text-xs font-mono text-slate-300 font-bold">url</div>
                                            <div className="text-xs font-mono text-slate-300 font-bold">referrer</div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</div>
                                            <div className="text-xs text-slate-400 leading-[1.2rem]">String ("page_view", "click")</div>
                                            <div className="text-xs text-slate-400 leading-[1.2rem]">String (Full URL tracked)</div>
                                            <div className="text-xs text-slate-400 leading-[1.2rem]">String (Traffic source)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-white/5"></div>

                            <div>
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
                                    Get View Count
                                    <span className="text-[10px] font-bold text-blue-400 border border-blue-500/20 bg-blue-500/5 px-2 py-1 rounded tracking-widest uppercase">GET</span>
                                </h3>
                                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                                    Retrieve instant view analytics for your project or specific URLs.
                                </p>
                                <CodeBlock 
                                    language="bash"
                                    title="Endpoint"
                                    code={`GET ${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}/v1/analytics/count?url=/pricing`}
                                />
                                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                     <h5 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Response Sample</h5>
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
                        <p className="mb-8">
                            The `tracker.js` SDK provides an easy, low-latency interface to communicate with our collectors. 
                            It implements automatic session management and deduplication logic.
                        </p>

                        <div className="space-y-8">
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/5 to-transparent border border-blue-500/10">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    Method: init
                                </h3>
                                <p className="text-xs text-slate-400 mb-4 leading-relaxed">Initialize your project key. This must be called before tracking any events.</p>
                                <CodeBlock 
                                    language="javascript"
                                    code={`tracker('init', 'trk_91238b...');`}
                                />
                            </div>

                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    Method: track
                                </h3>
                                <p className="text-xs text-slate-400 mb-4 leading-relaxed">Record an event transaction. Pass custom metadata if needed.</p>
                                <CodeBlock 
                                    language="javascript"
                                    code={`tracker('track', 'conversion', {\n  value: 29.99,\n  currency: 'USD'\n});`}
                                />
                            </div>
                        </div>
                        
                        <div className="mt-12 rounded-3xl overflow-hidden relative aspect-[21/9]">
                             <img 
                                src="/docs/realtime-visual.png" 
                                alt="Realtime Visual" 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col justify-center items-center text-center p-10">
                                <h4 className="text-2xl font-bold text-white mb-2 leading-tight">Live Real-time Processing</h4>
                                <p className="text-sm text-slate-200 max-w-sm leading-relaxed">
                                    Every SDK call is processed globally in under 15ms and visible in your dashboard in real-time.
                                </p>
                            </div>
                        </div>
                    </Section>

                    <Section id="security" title="Best Practices & Security" icon={Shield}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <h4 className="font-bold text-white mb-2 underline underline-offset-4 decoration-emerald-500/30">Allowed Origins</h4>
                                <p className="text-xs leading-relaxed text-slate-500">
                                    Restrict tracking to specific domains to prevent third-party usage of your project key. Enable this in settings.
                                </p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <h4 className="font-bold text-white mb-2 underline underline-offset-4 decoration-blue-500/30">sendBeacon Latency</h4>
                                <p className="text-xs leading-relaxed text-slate-500">
                                    The SDK automatically uses `navigator.sendBeacon` if available to ensure zero-latency tracking without blocking visitors.
                                </p>
                            </div>
                        </div>
                    </Section>
                </main>
            </div>

            <footer className="border-t border-slate-200 dark:border-white/5 py-20 bg-white dark:bg-[#06080b] flex flex-col items-center gap-10">
                 <Link to="/" className="flex items-center gap-3 group">
                    <div className="p-2 rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/20 group-hover:rotate-12 transition-transform">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter">WebPulse analytics</span>
                </Link>
                <div className="flex gap-10 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">
                    <Link to="/privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-blue-500 transition-colors">Term of Service</Link>
                    <Link to="/community" className="hover:text-blue-500 transition-colors">Community</Link>
                </div>
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-800 uppercase tracking-[0.2em]">© 2026 WebPulse Infrastructure. Built for extreme precision.</p>
            </footer>
        </div>
    );
}

