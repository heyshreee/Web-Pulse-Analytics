import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import SectionHead from '../components/marketing/SectionHead';
import Reveal from '../components/marketing/Reveal';

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

function ReadOnDevTo() {
    return (
        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-violet-300 transition-colors group-hover:text-violet-200">
            Read on dev.to
            <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
            />
        </span>
    );
}

export default function Blog() {
    const [activeCategory, setActiveCategory] = useState('All');

    const filtered = latest.filter((post) =>
        activeCategory === 'All' || post.category === activeCategory
    );

    return (
        <MarketingShell>
            <section className="mkt-section">
                <div className="mkt-container">
                    <SectionHead
                        eyebrow="Blog"
                        title={
                            <>
                                Building WebPulse{' '}
                                <span className="mkt-accent-text">in public</span>
                            </>
                        }
                        description="Engineering notes, product updates, analytics concepts, and lessons from building a real-time web analytics platform."
                    />

                    {/* Featured post */}
                    <Reveal className="mt-16">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Featured
                        </p>
                        <a
                            href={featured.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mkt-card mkt-card-hover group block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                        >
                            <div className="lg:grid lg:grid-cols-[1.05fr_1.5fr]">
                                <div className="overflow-hidden">
                                    {/* Artwork is left-aligned; anchor the crop left so the
                                        banner text is never cut when the column is narrow. */}
                                    <img
                                        src={featured.image}
                                        alt={featured.title}
                                        className="aspect-[1200/630] w-full object-cover object-left transition-transform duration-500 group-hover:scale-[1.03] lg:aspect-auto lg:h-full lg:min-h-[20rem]"
                                    />
                                </div>
                                <div className="p-6 sm:p-8 lg:p-10">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300/90">
                                        {featured.number} — {featured.category}
                                    </p>
                                    <h3 className="mkt-h3 mt-3 transition-colors group-hover:text-violet-200">
                                        {featured.title}
                                    </h3>
                                    <p className="mt-3 text-base font-medium text-slate-200">
                                        {featured.headline}
                                    </p>
                                    <p className="mkt-body mt-2">{featured.description}</p>
                                    <p className="mkt-body mt-2">{featured.body}</p>
                                    <div className="mt-7 border-t border-white/[0.06] pt-5">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <span className="text-sm text-slate-400">
                                                WebPulse Team · {featured.category}
                                            </span>
                                            <ReadOnDevTo />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </Reveal>

                    {/* Latest + topic filter */}
                    <div className="mt-24">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Latest
                            </p>
                            <div className="lg:max-w-2xl">
                                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Explore by topic
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((category) => {
                                        const isActive = activeCategory === category;
                                        return (
                                            <button
                                                key={category}
                                                type="button"
                                                onClick={() => setActiveCategory(category)}
                                                aria-pressed={isActive}
                                                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
                                                    isActive
                                                        ? 'border-violet-400/40 bg-violet-600 text-white'
                                                        : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-violet-400/30 hover:text-slate-100'
                                                }`}
                                            >
                                                {category}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filtered.map((post, i) => (
                                <Reveal key={post.number} delay={(i % 3) * 70} className="h-full">
                                    <a
                                        href={post.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mkt-card mkt-card-hover group flex h-full flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                    >
                                        <div className="overflow-hidden">
                                            <img
                                                src={post.image}
                                                alt={post.title}
                                                className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col p-6">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300/90">
                                                {post.number} — {post.category}
                                            </p>
                                            <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-100 transition-colors group-hover:text-violet-200">
                                                {post.title}
                                            </h3>
                                            <p className="mt-2 text-sm font-medium text-slate-200">
                                                {post.headline}
                                            </p>
                                            <p className="mkt-body mt-2">{post.description}</p>
                                            {post.body && (
                                                <p className="mkt-body mt-2">{post.body}</p>
                                            )}
                                            <div className="mt-auto pt-6">
                                                <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                                                    <span className="text-xs text-slate-400">
                                                        WebPulse Team · {post.category}
                                                    </span>
                                                    <ReadOnDevTo />
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </Reveal>
                            ))}
                        </div>

                        {filtered.length === 0 && (
                            <p className="mkt-body mt-10 text-center">
                                No published articles in this topic yet — it's on our building-in-public roadmap.
                            </p>
                        )}
                    </div>

                    {/* Closing CTA */}
                    <Reveal className="mt-24">
                        <div className="mkt-panel relative overflow-hidden px-6 py-12 text-center sm:px-12">
                            <div
                                aria-hidden="true"
                                className="mkt-glow left-1/2 top-[-160px] h-[320px] w-[560px] max-w-[110vw] -translate-x-1/2 bg-violet-600/20"
                            />
                            <div className="relative">
                                <h2 className="mkt-h3 !text-2xl sm:!text-3xl">
                                    Want to see WebPulse in action?
                                </h2>
                                <Link
                                    to="/register"
                                    className="mkt-btn mkt-btn-primary mkt-btn-lg mt-7"
                                >
                                    Start Tracking
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
        </MarketingShell>
    );
}
