import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BarChart2 } from 'lucide-react';
import Logo from '../components/Logo';

const posts = [
    {
        number: "01",
        category: "Product",
        title: "Why We Built WebPulse",
        headline: "How we're building a focused alternative to traditional web analytics.",
        description: "Web analytics often turns visitor activity into reports you look at later. WebPulse is designed around a different idea: make website activity easier to understand while it's happening.",
        body: "Learn how WebPulse approaches visitor tracking, events, traffic analysis, and real-time analytics.",
        image: "/blog/why-we-built-webpulse.svg",
        url: "https://dev.to/sriram_sriram_b5d5526a7b8/why-we-built-webpulse-p33"
    },
    {
        number: "02",
        category: "Engineering",
        title: "How Real-Time Web Analytics Works",
        headline: "From a visitor's browser to an analytics dashboard.",
        description: "What actually happens when a visitor opens a page?",
        body: "Explore the pipeline behind WebPulse: tracking data, event ingestion, processing, storage, and presenting analytics back to the dashboard.",
        image: "/blog/how-real-time-analytics-works.svg",
        url: "https://dev.to/sriram_sriram_b5d5526a7b8/how-real-time-web-analytics-works-a2e"
    },
    {
        number: "03",
        category: "Analytics",
        title: "Understanding Visitor Sessions",
        headline: "Why pageviews alone aren't enough to understand your audience.",
        description: "A pageview tells you that something happened. A session gives you context.",
        body: "Learn how visitor sessions help connect individual interactions into a more meaningful picture of how people use a website.",
        image: "/blog/understanding-visitor-sessions.svg",
        url: "https://dev.to/sriram_sriram_b5d5526a7b8/understanding-visitor-sessions-19o0"
    },
    {
        number: "04",
        category: "Engineering",
        title: "Designing a Website Tracking Pipeline",
        headline: "What happens between a browser event and your analytics dashboard.",
        description: "A tracking system has to deal with event collection, validation, transport, storage, and querying while keeping the experience lightweight for the website being monitored.",
        body: "This article explores the engineering considerations behind building that pipeline.",
        image: "/blog/designing-a-tracking-pipeline.svg",
        url: "https://dev.to/sriram_sriram_b5d5526a7b8/designing-a-website-tracking-pipeline-56bm"
    },
    {
        number: "05",
        category: "Developers",
        title: "Integrating Web Analytics Into Your Application",
        headline: "A practical look at sending website activity into an analytics platform.",
        description: "Analytics becomes much more useful when it can fit naturally into your existing application.",
        body: "Explore the concepts behind tracking IDs, event collection, API integration, and connecting application activity with analytics.",
        image: "/blog/integrating-web-analytics.svg",
        url: "https://dev.to/sriram_sriram_b5d5526a7b8/integrating-web-analytics-into-your-application-4j5m"
    },
    {
        number: "06",
        category: "Security",
        title: "Protecting Analytics Data",
        headline: "Why analytics infrastructure needs security from the beginning.",
        description: "Visitor analytics can contain sensitive information. Tracking identifiers, API credentials, sessions, and event data all need appropriate isolation and access controls.",
        body: "Learn about the security principles we're applying to WebPulse as the platform evolves.",
        image: "/blog/protecting-analytics-data.svg",
        url: "https://dev.to/sriram_sriram_b5d5526a7b8/protecting-analytics-data-4kii"
    },
    {
        number: "07",
        category: "Product",
        title: "From Visitor Signals to Useful Insights",
        headline: "Turning raw events into information you can actually use.",
        description: "Visitors generate signals. Those signals become events. Events reveal patterns.",
        body: "Explore how WebPulse is designed to move from raw activity toward analytics that helps you make better product decisions.",
        image: "/blog/signals-to-insights.svg",
        url: "https://dev.to/sriram_sriram_b5d5526a7b8/from-visitor-signals-to-useful-insights-1m82"
    },
    {
        number: "08",
        category: "Engineering",
        title: "Building a Real-Time Dashboard",
        headline: "The engineering behind keeping analytics close to the source.",
        description: "A real-time dashboard isn't just a collection of charts. It needs efficient data delivery, predictable state updates, sensible loading behavior, and a UI that can handle changing information without becoming difficult to scan.",
        image: "/blog/building-a-real-time-dashboard.svg",
        url: "https://dev.to/sriram_sriram_b5d5526a7b8/building-a-real-time-dashboard-1gf1"
    }
];

const categories = ['All', 'Product', 'Analytics', 'Engineering', 'Developers', 'Security', 'Updates'];

const [featured, ...latest] = posts;

export default function Blog() {
    const [activeCategory, setActiveCategory] = useState('All');

    const filtered = latest.filter((post) =>
        activeCategory === 'All' || post.category === activeCategory
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
            <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-space-900/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-medium text-sm">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link to="/features" className="hidden sm:block px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Features</Link>
                        <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="eyebrow mb-3">Blog</p>
                        <h2 className="page-title !text-4xl font-display">Building WebPulse <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">in public</span></h2>
                        <p className="page-sub !text-base mt-3 max-w-2xl mx-auto">
                            Engineering notes, product updates, analytics concepts, and lessons from building a real-time web analytics platform.
                        </p>
                    </div>

                    <div className="mb-14">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">Featured</p>
                        <a href={featured.url} target="_blank" rel="noopener noreferrer" className="card card-hover overflow-hidden group block">
                            <div className="overflow-hidden">
                                <img
                                    src={featured.image}
                                    alt={featured.title}
                                    className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                />
                            </div>
                            <div className="p-6 sm:p-8">
                                <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mb-3">{featured.number} — {featured.category}</p>
                                <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{featured.title}</h3>
                                <p className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-3">{featured.headline}</p>
                                <p className="prose-quiet mb-2">{featured.description}</p>
                                <p className="prose-quiet mb-6">{featured.body}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600 dark:text-slate-300">WebPulse Team · {featured.category}</span>
                                    <span className="text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1 text-sm">
                                        Read on dev.to <ArrowRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </div>
                        </a>
                    </div>

                    <div className="mb-14">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">Latest</p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((post) => (
                                <a href={post.url} target="_blank" rel="noopener noreferrer" className="card card-hover flex flex-col group overflow-hidden block">
                                    <div className="overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                        />
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mb-3">{post.number} — {post.category}</p>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{post.title}</h3>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-2">{post.headline}</p>
                                        <p className="prose-quiet mb-2">{post.description}</p>
                                        {post.body && <p className="prose-quiet mb-5">{post.body}</p>}
                                        <div className="mt-auto flex items-center justify-between pt-4">
                                            <span className="text-sm text-slate-600 dark:text-slate-300">WebPulse Team · {post.category}</span>
                                            <span className="text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1 text-sm">
                                                Read on dev.to <ArrowRight className="h-4 w-4" />
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                        {filtered.length === 0 && (
                            <p className="prose-quiet text-center mt-10">
                                No published articles in this topic yet — it's on our building-in-public roadmap.
                            </p>
                        )}
                    </div>

                    <div className="mb-20">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">Explore by topic</p>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                                        activeCategory === category
                                            ? 'bg-violet-600 text-white border-violet-600'
                                            : 'bg-white dark:bg-space-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/[0.08] hover:text-violet-600 dark:hover:text-violet-400'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card card-pad text-center bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-500/10 dark:to-fuchsia-500/5 border-violet-100 dark:border-white/[0.06]">
                        <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">Want to see WebPulse in action?</h3>
                        <Link to="/register" className="btn-primary btn-lg mt-6">
                            Start Tracking
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-white/[0.06] py-10 bg-slate-50 dark:bg-[#070A10] text-center">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
                    <Logo />
                </div>
                <p className="text-slate-400 dark:text-slate-600 text-xs">© 2026 WebPulse</p>
            </footer>
        </div>
    );
}