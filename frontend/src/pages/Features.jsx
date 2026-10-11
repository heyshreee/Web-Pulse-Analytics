import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity, Gauge, Globe, LayoutDashboard, Bell, History,
    FileDown, Braces, Bug, ArrowRight, CheckCircle2,
    Zap, Sparkles, Database, Laptop, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import Logo from '../components/Logo';

const CATEGORIES = ['All', 'Real-time & Telemetry', 'Traffic & Audience', 'Developer & API', 'Security & Ops'];

const CORE_FEATURES = [
    {
        id: 'realtime',
        category: 'Real-time & Telemetry',
        icon: Activity,
        badge: 'Zero Delay',
        title: 'Sub-Second Real-Time Engine',
        headline: 'Observe live visitor actions the exact moment they occur.',
        description: 'Stream pageviews, clicks, and custom client actions to your live dashboard with sub-second websocket synchronization. No 24-hour lag or delayed processing batches.',
        metrics: [
            { label: 'Latency', value: '< 15ms' },
            { label: 'Sync Rate', value: '1.0s interval' },
            { label: 'Throughput', value: '10k+ eps' }
        ],
        highlight: true
    },
    {
        id: 'performance',
        category: 'Real-time & Telemetry',
        icon: Gauge,
        badge: 'Core Web Vitals',
        title: 'Application Performance',
        headline: 'Pinpoint page slowdowns, TTFB, and layout shifts.',
        description: 'Track essential browser speed metrics across device types and geographies. Spot regressions before they compromise your conversion rates.',
        metrics: [
            { label: 'LCP & FID', value: 'Monitored' },
            { label: 'TTFB Tracking', value: 'Active' },
            { label: 'Slow Page Alert', value: 'Automated' }
        ]
    },
    {
        id: 'traffic',
        category: 'Traffic & Audience',
        icon: Globe,
        badge: 'Global Insights',
        title: 'Traffic & Visitor Journeys',
        headline: 'Comprehensive geographic and referrer attribution.',
        description: 'Identify top acquisition channels, campaign UTM tags, browser engines, operating systems, and city-level geolocations with privacy-first aggregation.',
        metrics: [
            { label: 'Geo Resolution', value: 'City level' },
            { label: 'UTM Tracking', value: 'Supported' },
            { label: 'Device Matrix', value: 'All screen sizes' }
        ]
    },
    {
        id: 'dashboards',
        category: 'Traffic & Audience',
        icon: LayoutDashboard,
        badge: 'Modular UI',
        title: 'Customizable Dashboards',
        headline: 'Curate workspaces around the metrics that drive decisions.',
        description: 'Toggle between multi-project overviews, filter by date horizons (24h, 7d, 30d, 90d), and focus on the KPIs that matter most to your product stakeholders.',
        metrics: [
            { label: 'Multi-Project', value: 'Unlimited' },
            { label: 'Granular Filters', value: 'Instant' },
            { label: 'Dark / Light', value: 'Native support' }
        ]
    },
    {
        id: 'alerts',
        category: 'Security & Ops',
        icon: Bell,
        badge: 'Smart Watchdog',
        title: 'Intelligent Spike & Anomaly Alerts',
        headline: 'Know immediately when traffic surges or drops unexpectedly.',
        description: 'Configure automated notification thresholds for sudden spikes, error surges, or unusual visitor drops. Direct notifications to Slack, email, or custom webhooks.',
        metrics: [
            { label: 'Channels', value: 'Slack, Email, WH' },
            { label: 'Threshold Rules', value: 'Custom' },
            { label: 'Response', value: 'Immediate' }
        ]
    },
    {
        id: 'history',
        category: 'Traffic & Audience',
        icon: History,
        badge: 'Trend Analysis',
        title: 'Historical Trends & Retention',
        headline: 'Uncover long-term trajectory beyond daily snapshots.',
        description: 'Store rich analytics timelines and contrast metrics against previous quarters. Understand growth velocity, returning visitor loyalty, and seasonal patterns.',
        metrics: [
            { label: 'Data Retention', value: 'Up to 2 Years' },
            { label: 'Period Compare', value: '1-click' },
            { label: 'Time Horizons', value: '24h - 90d' }
        ]
    },
    {
        id: 'exports',
        category: 'Developer & API',
        icon: FileDown,
        badge: 'Data Ownership',
        title: 'Automated Reports & Raw Export',
        headline: 'Take full ownership of your data in CSV, JSON, or via API.',
        description: 'Export raw event streams or aggregated summaries whenever required. Seamlessly feed WebPulse telemetry into internal BI dashboards, Snowflake, or BigQuery.',
        metrics: [
            { label: 'Formats', value: 'CSV, JSON' },
            { label: 'Raw Ingestion', value: 'Available' },
            { label: 'Scheduled Dumps', value: 'Configurable' }
        ]
    },
    {
        id: 'api',
        category: 'Developer & API',
        icon: Braces,
        badge: 'REST & GraphQL',
        title: 'High-Throughput REST API',
        headline: 'Integrate analytics natively into your CI/CD and services.',
        description: 'Issue granular API tokens with read/write permission scopes. Query live metrics programmatically or trigger server-side event tracking from Node, Python, or Go.',
        metrics: [
            { label: 'Rate Limits', value: 'Up to 10k req/min' },
            { label: 'Auth', value: 'Bearer tokens' },
            { label: 'SDK Support', value: 'JS, React, cURL' }
        ]
    },
    {
        id: 'errors',
        category: 'Security & Ops',
        icon: Bug,
        badge: 'Privacy & Stability',
        title: 'Zero-Cookie Privacy & Error Ingestion',
        headline: 'Capture client exceptions while staying 100% GDPR compliant.',
        description: 'No intrusive third-party cookies or cross-site fingerprinting. Collect runtime JavaScript errors alongside visitor metrics without violating user trust.',
        metrics: [
            { label: 'Compliance', value: 'GDPR / CCPA' },
            { label: 'Cookies Used', value: '0' },
            { label: 'Exception Logs', value: 'Real-time' }
        ]
    }
];

export default function Features() {
    const [activeCategory, setActiveCategory] = useState('All');

    const filtered = CORE_FEATURES.filter(
        (f) => activeCategory === 'All' || f.category === activeCategory
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 relative selection:bg-violet-500/30 selection:text-violet-200">
            {/* Ambient Background Grid & Glow Aura */}
            <div className="pointer-events-none fixed inset-0 z-0 obs-grid opacity-70" />
            <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-violet-600/10 via-fuchsia-600/5 to-transparent blur-3xl -z-10" />

            {/* Navigation Header */}
            <header className="fixed top-0 w-full z-50 bg-white/85 dark:bg-[#0B0F17]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.07]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Logo />
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
                            <Link to="/features" className="text-violet-600 dark:text-violet-400 font-semibold">Features</Link>
                            <Link to="/integrations" className="hover:text-slate-900 dark:hover:text-white transition-colors">Integrations</Link>
                            <Link to="/api" className="hover:text-slate-900 dark:hover:text-white transition-colors">API</Link>
                            <Link to="/docs" className="hover:text-slate-900 dark:hover:text-white transition-colors">Docs</Link>
                            <Link to="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
                            <Link to="/blog" className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                            Log in
                        </Link>
                        <Link to="/register" className="btn-signal btn-md">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Header */}
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-4">
                            <Sparkles className="h-3.5 w-3.5" />
                            Engineered for High-Velocity Teams
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
                            Every metric you need. <br />
                            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 dark:from-violet-400 dark:via-fuchsia-300 dark:to-indigo-300 bg-clip-text text-transparent">
                                Zero privacy compromise.
                            </span>
                        </h1>
                        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                            A modular analytics platform engineered from the ground up for sub-second insights, lightweight edge ingestion, and clear decision-making.
                        </p>

                        {/* Category Filter Pills */}
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                        activeCategory === cat
                                            ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                                            : 'border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Featured Hero Card - Realtime Engine Simulation */}
                    <div className="mb-12 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.04] via-transparent to-fuchsia-500/[0.04] p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
                        
                        <div className="grid lg:grid-cols-12 gap-8 items-center">
                            <div className="lg:col-span-7">
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Live Ingestion Stream
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
                                    Real-time tracking that never keeps you waiting.
                                </h2>
                                <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                                    Unlike traditional analytics providers that process traffic in hourly batches, WebPulse ingests client signals via edge proxies with near-instant WebSocket fanout. Keep your operational dashboard in sync with your users.
                                </p>
                                
                                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 dark:border-white/[0.08] pt-6">
                                    <div>
                                        <div className="text-2xl font-bold font-mono text-violet-600 dark:text-violet-400">12ms</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ingest Latency</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">&lt; 1.2 KB</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Script Bundle</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">99.99%</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Delivery SLA</div>
                                    </div>
                                </div>
                            </div>

                            {/* Mini Mock Dashboard Widget */}
                            <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17] p-5 shadow-xl">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-violet-500 animate-pulse" />
                                        <span className="text-xs font-semibold text-slate-900 dark:text-white">Live Telemetry Feed</span>
                                    </div>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400">
                                        34 Active Now
                                    </span>
                                </div>

                                <div className="mt-4 space-y-2.5">
                                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            <span className="font-mono text-slate-700 dark:text-slate-300">/features</span>
                                        </div>
                                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">US · Chrome</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                                            <span className="font-mono text-slate-700 dark:text-slate-300">/docs/api</span>
                                        </div>
                                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">DE · Safari</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                                            <span className="font-mono text-slate-700 dark:text-slate-300">signup_completed</span>
                                        </div>
                                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">IN · Edge</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((feature) => {
                            const IconComponent = feature.icon;
                            return (
                                <div
                                    key={feature.id}
                                    className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/5 group"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:bg-violet-500 group-hover:text-white transition-colors duration-200">
                                                <IconComponent className="h-6 w-6 text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors" />
                                            </div>
                                            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/[0.06]">
                                                {feature.badge}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
                                            {feature.headline}
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>

                                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/[0.06] grid grid-cols-3 gap-2">
                                        {feature.metrics.map((m, idx) => (
                                            <div key={idx} className="text-center">
                                                <div className="text-[11px] font-bold text-slate-900 dark:text-white font-mono truncate">{m.value}</div>
                                                <div className="text-[10px] text-slate-500 dark:text-slate-500 truncate">{m.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Architectural Pipeline Breakdown */}
                    <div className="mt-20 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] p-8 sm:p-12">
                        <div className="text-center max-w-2xl mx-auto mb-10">
                            <p className="eyebrow mb-2">Architectural Flow</p>
                            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
                                How telemetry moves through WebPulse
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                From the client browser to your analytical console in milliseconds.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200/60 dark:border-white/[0.06]">
                                <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-sm mb-3 font-mono">01</div>
                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Lightweight Script</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Single 1.2 KB snippet loads asynchronously without degrading Core Web Vitals.</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200/60 dark:border-white/[0.06]">
                                <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-sm mb-3 font-mono">02</div>
                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Edge Validation</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">API gateway validates tracking tokens, filters bots, and hashes IP addresses.</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200/60 dark:border-white/[0.06]">
                                <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-sm mb-3 font-mono">03</div>
                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Time-Series Buffer</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Events are aggregated in real-time buffers for instantaneous velocity calculation.</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B0F17] border border-slate-200/60 dark:border-white/[0.06]">
                                <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-sm mb-3 font-mono">04</div>
                                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Instant Console</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dashboards, webhooks, and REST endpoints reflect real-time updates.</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom CTA Banner */}
                    <div className="mt-20 rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-indigo-600/10 p-8 sm:p-12 text-center relative overflow-hidden backdrop-blur-xl">
                        <div className="max-w-2xl mx-auto">
                            <h3 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Ready to transform how you understand your users?
                            </h3>
                            <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
                                Create your first analytics project in less than 2 minutes. Free forever tier, no credit card required.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                <Link to="/register" className="btn-signal btn-lg">
                                    Start Tracking Free
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link to="/docs" className="btn-secondary btn-lg">
                                    Browse Documentation
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

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