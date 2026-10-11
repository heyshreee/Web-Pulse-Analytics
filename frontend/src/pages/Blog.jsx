import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Search, Clock, Tag, BookOpen,
    Sparkles, ArrowUpRight, Share2, Rss
} from 'lucide-react';
import Logo from '../components/Logo';

const POSTS = [
    {
        id: 'why-we-built-webpulse',
        number: '01',
        category: 'Product',
        title: 'Why We Built WebPulse',
        headline: 'How we are building a focused alternative to traditional web analytics.',
        description: 'Web analytics often turns visitor activity into reports you look at later. WebPulse is designed around a different idea: make website activity easy to understand while it is happening.',
        body: 'Learn how WebPulse approaches visitor tracking, events, traffic analysis, and sub-second real-time metrics.',
        readTime: '4 min read',
        date: 'Oct 2026',
        image: '/blog/why-we-built-webpulse.svg',
        url: 'https://dev.to/sriram_sriram_b5d5526a7b8/why-we-built-webpulse-p33'
    },
    {
        id: 'how-real-time-works',
        number: '02',
        category: 'Engineering',
        title: 'How Real-Time Web Analytics Works',
        headline: 'From a visitor browser to an analytics dashboard in milliseconds.',
        description: 'What actually happens when a visitor opens a page? Explore the pipeline behind WebPulse: tracking data, event ingestion, processing, storage, and live UI streaming.',
        readTime: '6 min read',
        date: 'Sep 2026',
        image: '/blog/how-real-time-analytics-works.svg',
        url: 'https://dev.to/sriram_sriram_b5d5526a7b8/how-real-time-web-analytics-works-a2e'
    },
    {
        id: 'understanding-sessions',
        number: '03',
        category: 'Analytics',
        title: 'Understanding Visitor Sessions',
        headline: 'Why pageviews alone are not enough to understand user intent.',
        description: 'A pageview tells you that something happened. A session gives you context. Learn how visitor sessions connect individual interactions into a meaningful picture.',
        readTime: '5 min read',
        date: 'Sep 2026',
        image: '/blog/understanding-visitor-sessions.svg',
        url: 'https://dev.to/sriram_sriram_b5d5526a7b8/understanding-visitor-sessions-19o0'
    },
    {
        id: 'tracking-pipeline',
        number: '04',
        category: 'Engineering',
        title: 'Designing a Website Tracking Pipeline',
        headline: 'What happens between a browser event and your analytics dashboard.',
        description: 'A tracking system must deal with event collection, validation, transport, storage, and querying while keeping the experience lightweight for client apps.',
        readTime: '7 min read',
        date: 'Aug 2026',
        image: '/blog/designing-a-tracking-pipeline.svg',
        url: 'https://dev.to/sriram_sriram_b5d5526a7b8/designing-a-website-tracking-pipeline-56bm'
    },
    {
        id: 'integrating-analytics',
        number: '05',
        category: 'Developers',
        title: 'Integrating Web Analytics Into Your Application',
        headline: 'A practical look at sending website activity into an analytics platform.',
        description: 'Analytics becomes much more useful when it fits naturally into your existing stack. Explore concepts behind tracking IDs, event collection, and API integration.',
        readTime: '5 min read',
        date: 'Aug 2026',
        image: '/blog/integrating-web-analytics.svg',
        url: 'https://dev.to/sriram_sriram_b5d5526a7b8/integrating-web-analytics-into-your-application-4j5m'
    },
    {
        id: 'protecting-data',
        number: '06',
        category: 'Security',
        title: 'Protecting Analytics Data & Privacy',
        headline: 'Why analytics infrastructure needs security and compliance from day one.',
        description: 'Visitor telemetry can contain sensitive metadata. Tracking identifiers, API credentials, sessions, and event payloads need appropriate isolation and hashing.',
        readTime: '6 min read',
        date: 'Jul 2026',
        image: '/blog/protecting-analytics-data.svg',
        url: 'https://dev.to/sriram_sriram_b5d5526a7b8/protecting-analytics-data-4kii'
    },
    {
        id: 'signals-to-insights',
        number: '07',
        category: 'Product',
        title: 'From Visitor Signals to Actionable Insights',
        headline: 'Turning raw events into information you can actually use.',
        description: 'Visitors generate signals. Those signals become events. Events reveal patterns. Explore how WebPulse is designed to help you make better product decisions.',
        readTime: '4 min read',
        date: 'Jul 2026',
        image: '/blog/signals-to-insights.svg',
        url: 'https://dev.to/sriram_sriram_b5d5526a7b8/from-visitor-signals-to-useful-insights-1m82'
    },
    {
        id: 'building-realtime-dashboard',
        number: '08',
        category: 'Engineering',
        title: 'Building a High-Performance Real-Time Dashboard',
        headline: 'The UI architecture behind keeping analytics close to the source.',
        description: 'A real-time dashboard is not just charts. It needs efficient websocket delivery, predictable state updates, and an interface that remains scannable under rapid change.',
        readTime: '8 min read',
        date: 'Jun 2026',
        image: '/blog/building-a-real-time-dashboard.svg',
        url: 'https://dev.to/sriram_sriram_b5d5526a7b8/building-a-real-time-dashboard-1gf1'
    }
];

const CATEGORIES = ['All', 'Product', 'Engineering', 'Analytics', 'Developers', 'Security'];

export default function Blog() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const featured = POSTS[0];

    const filtered = POSTS.filter((post) => {
        const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
        const matchesSearch =
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 relative selection:bg-violet-500/30 selection:text-violet-200">
            {/* Ambient Background Grid & Glow */}
            <div className="pointer-events-none fixed inset-0 z-0 obs-grid opacity-70" />
            <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-violet-600/10 via-fuchsia-600/5 to-transparent blur-3xl -z-10" />

            {/* Navigation Header */}
            <header className="fixed top-0 w-full z-50 bg-white/85 dark:bg-[#0B0F17]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.07]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Logo />
                        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
                            <Link to="/features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</Link>
                            <Link to="/integrations" className="hover:text-slate-900 dark:hover:text-white transition-colors">Integrations</Link>
                            <Link to="/api" className="hover:text-slate-900 dark:hover:text-white transition-colors">API</Link>
                            <Link to="/docs" className="hover:text-slate-900 dark:hover:text-white transition-colors">Docs</Link>
                            <Link to="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
                            <Link to="/blog" className="text-violet-600 dark:text-violet-400 font-semibold">Blog</Link>
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
                    {/* Header Title */}
                    <div className="text-center mb-12 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-4">
                            <Rss className="h-3.5 w-3.5" />
                            Building in Public
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
                            Engineering notes &amp; <br />
                            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 dark:from-violet-400 dark:via-fuchsia-300 dark:to-indigo-300 bg-clip-text text-transparent">
                                product dispatches.
                            </span>
                        </h1>
                        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                            Deep dives into real-time web telemetry, time-series ingest architectures, privacy regulations, and building an open observability platform.
                        </p>

                        {/* Search & Category Filter Controls */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
                            <div className="relative w-full">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search engineering articles..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                                />
                            </div>
                        </div>

                        {/* Category Pills */}
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                        activeCategory === cat
                                            ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                                            : 'border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Featured Article Section (Shown when no active search query and "All" or featured category) */}
                    {!searchQuery && (activeCategory === 'All' || activeCategory === featured.category) && (
                        <div className="mb-14">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5" /> Featured Dispatch
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{featured.date}</span>
                            </div>

                            <a
                                href={featured.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17] overflow-hidden shadow-xl hover:border-violet-500/40 hover:shadow-2xl transition-all duration-300"
                            >
                                <div className="grid lg:grid-cols-12 gap-0">
                                    <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20">
                                                    {featured.category}
                                                </span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" /> {featured.readTime}
                                                </span>
                                            </div>

                                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                                {featured.title}
                                            </h2>
                                            <p className="mt-3 text-base font-medium text-slate-700 dark:text-slate-200">
                                                {featured.headline}
                                            </p>
                                            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                                {featured.description}
                                            </p>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center justify-center">
                                                    WP
                                                </div>
                                                <div className="text-xs">
                                                    <div className="font-semibold text-slate-900 dark:text-white">WebPulse Core Team</div>
                                                    <div className="text-slate-500 dark:text-slate-400">Published on Dev.to</div>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform">
                                                Read Dispatch <ArrowUpRight className="h-4 w-4" />
                                            </span>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-5 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-slate-900/40 p-6 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-white/[0.08]">
                                        <img
                                            src={featured.image}
                                            alt={featured.title}
                                            className="w-full max-h-64 object-contain rounded-xl drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                </div>
                            </a>
                        </div>
                    )}

                    {/* Articles Grid */}
                    <div className="mb-14">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                                {searchQuery ? `Search Results (${filtered.length})` : 'All Dispatches'}
                            </h3>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                Showing {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
                            </span>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] p-12 text-center bg-white dark:bg-[#0B0F17]">
                                <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                                <h4 className="font-bold text-slate-900 dark:text-white text-base">No articles found</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try another keyword or category filter.</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filtered.map((post) => (
                                    <a
                                        key={post.id}
                                        href={post.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 group"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20">
                                                    {post.category}
                                                </span>
                                                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                                                    <Clock className="h-3 w-3" /> {post.readTime}
                                                </span>
                                            </div>

                                            <div className="mb-4 overflow-hidden rounded-xl bg-slate-100 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] p-3">
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                    className="w-full h-36 object-contain group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>

                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
                                                {post.title}
                                            </h4>
                                            <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
                                                {post.headline}
                                            </p>
                                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                                                {post.description}
                                            </p>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                                            <span className="text-[11px] text-slate-400 dark:text-slate-500">WebPulse Team</span>
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 group-hover:translate-x-0.5 transition-transform">
                                                Read on Dev.to <ArrowUpRight className="h-3.5 w-3.5" />
                                            </span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bottom CTA Banner */}
                    <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-indigo-600/10 p-8 sm:p-12 text-center backdrop-blur-xl">
                        <div className="max-w-2xl mx-auto">
                            <h3 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Want to see the code behind the articles?
                            </h3>
                            <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm">
                                WebPulse is open source and built in public. Explore our GitHub repositories, report feature requests, or deploy your self-hosted tracker.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                <Link to="/register" className="btn-signal btn-lg">
                                    Start Free Tracking
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <a
                                    href="https://github.com/heyshreee/Web-Pulse-Analytics"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary btn-lg"
                                >
                                    View GitHub Repo
                                    <ArrowUpRight className="h-4 w-4" />
                                </a>
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