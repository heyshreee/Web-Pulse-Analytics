import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Activity,
    ArrowDown,
    ArrowRight,
    ArrowUpRight,
    BookOpen,
    Code2,
    Github,
    GitCommit,
    ShieldCheck,
} from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import { REPO_URL } from '../components/marketing/MarketingFooter';
import Reveal from '../components/marketing/Reveal';

const DEV_PROFILE_URL = 'https://dev.to/sriram_sriram_b5d5526a7b8';
const CHANGELOG_URL = `${REPO_URL}/blob/main/CHANGELOG.md`;
const RELEASES_URL = `${REPO_URL}/releases`;
const SECURITY_POLICY_URL = `${REPO_URL}/blob/main/SECURITY.md`;

/*
 * Publication dates and reading times come from the DEV Community API metadata
 * for each published article. Keep them in sync if an article is edited.
 */
const posts = [
    {
        number: '01',
        category: 'Product',
        featured: true,
        title: 'Why We Built WebPulse: A Different Approach to Website Analytics',
        headline:
            "Website analytics should help you understand what's happening, not just give you another report to read.",
        description:
            "We started building WebPulse around a simple idea: make website activity easier to observe and understand. This article explains the problem we're solving, the decisions shaping the product, and what we're learning as we build it in the open.",
        cardDescription:
            "Why build another analytics platform? Explore the problems we're trying to solve, the trade-offs behind our approach, and the principles guiding WebPulse as an open-source project.",
        published: 'Aug 28, 2026',
        readingTime: '6 min read',
        url: 'https://dev.to/sriram_sriram_b5d5526a7b8/why-we-built-webpulse-p33',
    },
    {
        number: '02',
        category: 'Engineering',
        title: 'Inside a Real-Time Analytics Pipeline',
        description:
            'Follow an analytics event from the browser to the dashboard. Understand event collection, API ingestion, validation, storage, and the steps required to turn incoming data into useful metrics.',
        published: 'Aug 28, 2026',
        readingTime: '7 min read',
        url: 'https://dev.to/sriram_sriram_b5d5526a7b8/how-real-time-web-analytics-works-a2e',
    },
    {
        number: '03',
        category: 'Analytics',
        title: 'Page Views vs. Sessions: What Should You Measure?',
        description:
            'Page views count individual visits to a page; sessions group activity into a browsing period. Learn what each metric tells you, where it can mislead you, and when to use it.',
        published: 'Aug 28, 2026',
        readingTime: '6 min read',
        url: 'https://dev.to/sriram_sriram_b5d5526a7b8/understanding-visitor-sessions-19o0',
    },
    {
        number: '04',
        category: 'Engineering',
        title: 'Designing a Lightweight JavaScript Tracking SDK',
        description:
            'A tracking script should collect useful data without becoming a burden on the website it measures. Explore design considerations such as bundle size, event validation, network failures, retries, and browser compatibility.',
        published: 'Aug 28, 2026',
        readingTime: '8 min read',
        url: 'https://dev.to/sriram_sriram_b5d5526a7b8/designing-a-website-tracking-pipeline-56bm',
    },
    {
        number: '05',
        category: 'Guides',
        title: 'Add Website Analytics to Your JavaScript Application',
        description:
            'Learn how tracking IDs, page-view events, custom events, and API requests fit together. Follow a practical integration workflow for adding analytics to an existing application.',
        published: 'Aug 28, 2026',
        readingTime: '8 min read',
        url: 'https://dev.to/sriram_sriram_b5d5526a7b8/integrating-web-analytics-into-your-application-4j5m',
    },
    {
        number: '06',
        category: 'Security',
        title: 'Securing an Analytics Platform: Tracking IDs, Sessions, and Access',
        description:
            'Analytics security involves more than protecting a dashboard login. Explore the distinction between public tracking identifiers and secret credentials, origin restrictions, session protection, and access control.',
        published: 'Aug 28, 2026',
        readingTime: '7 min read',
        url: 'https://dev.to/sriram_sriram_b5d5526a7b8/protecting-analytics-data-4kii',
    },
    {
        number: '07',
        category: 'Analytics',
        title: 'From Raw Events to Useful Website Insights',
        description:
            'An event stream is not automatically useful analytics. Discover how event definitions, aggregation, traffic attribution, and reporting windows influence the conclusions you draw from website data.',
        published: 'Aug 28, 2026',
        readingTime: '7 min read',
        url: 'https://dev.to/sriram_sriram_b5d5526a7b8/from-visitor-signals-to-useful-insights-1m82',
    },
    {
        number: '08',
        category: 'Engineering',
        title: 'Building a Dashboard That Keeps Up With Live Data',
        description:
            'Real-time dashboards must balance fresh information with responsiveness and readability. Explore polling, state updates, loading states, failure handling, and the trade-offs involved in presenting changing metrics.',
        published: 'Aug 28, 2026',
        readingTime: '9 min read',
        url: 'https://dev.to/sriram_sriram_b5d5526a7b8/building-a-real-time-dashboard-1gf1',
    },
];

const filters = ['All articles', 'Product', 'Engineering', 'Analytics', 'Security', 'Guides', 'Changelog'];

const filterCounts = filters.reduce((counts, filter) => {
    counts[filter] =
        filter === 'All articles'
            ? posts.length
            : posts.filter((post) => post.category === filter).length;
    return counts;
}, {});

const categoryText = {
    Product: 'text-violet-300/90',
    Engineering: 'text-sky-300/90',
    Analytics: 'text-teal-300/90',
    Security: 'text-rose-300/90',
    Guides: 'text-amber-300/90',
};

const categoryAccents = {
    Product: 'from-violet-400/80 via-violet-400/25',
    Engineering: 'from-sky-400/80 via-sky-400/25',
    Analytics: 'from-teal-400/80 via-teal-400/25',
    Security: 'from-rose-400/80 via-rose-400/25',
    Guides: 'from-amber-400/80 via-amber-400/25',
};

const featuredPath = ['Visitor', 'Signal', 'Event', 'Session', 'Insight', 'Decision'];

const updates = [
    {
        label: 'Added',
        title: 'A real project foundation',
        description:
            'CI for lint, build, and backend syntax checks; CodeQL; dependency review; secret scanning; release automation; community files; and documentation for the architecture, API, tracking, database, deployment, and security.',
        link: CHANGELOG_URL,
        linkLabel: 'Read in the changelog',
    },
    {
        label: 'Changed',
        title: 'A sharper analytics console',
        description:
            'Theme switching with the View Transitions API, animated sidebar collapse, improved chart tooltips and crosshairs, null-safe analytics pages, and a visitor network globe backed by backend-only analytics.',
        link: CHANGELOG_URL,
        linkLabel: 'Read in the changelog',
    },
    {
        label: 'Security',
        title: 'Security posture, documented',
        description:
            'A private vulnerability reporting path, RLS policy documentation, secret scanning in CI, and an explicit policy that database migrations are never auto-deployed.',
        link: SECURITY_POLICY_URL,
        linkLabel: 'Read the security policy',
    },
];

const docLinks = [
    {
        title: 'Getting started',
        description: 'Install the tracker, add your tracking ID, and confirm your first page view.',
        to: '/docs/getting-started',
        icon: BookOpen,
    },
    {
        title: 'Custom events',
        description: 'Define the events and properties that answer real product questions.',
        to: '/docs/tracking/events',
        icon: Activity,
    },
    {
        title: 'API reference',
        description: 'Send events and query analytics from your own backend or service.',
        to: '/docs/api',
        icon: Code2,
    },
    {
        title: 'Security guide',
        description: 'Keep secrets server-side, restrict origins, and understand tracking IDs.',
        to: '/docs/security',
        icon: ShieldCheck,
    },
];

function ArticleCard({ post }) {
    return (
        <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mkt-card mkt-card-hover group relative flex h-full flex-col overflow-hidden p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
        >
            <span
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent ${
                    categoryAccents[post.category] || 'from-slate-400/80 via-slate-400/25'
                }`}
            />
            <div className="flex items-start justify-between gap-3">
                <span
                    className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
                        categoryText[post.category] || 'text-slate-300/90'
                    }`}
                >
                    {post.number} — {post.category}
                </span>
                <span className="shrink-0 text-[11px] font-medium text-slate-500">
                    {post.readingTime}
                </span>
            </div>

            <h3 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-slate-100 transition-colors group-hover:text-violet-200">
                {post.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
                {post.cardDescription || post.description}
            </p>

            <div className="mt-auto pt-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-4">
                    <span className="text-[11px] text-slate-500">
                        WebPulse Team · {post.published}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-300 transition-colors group-hover:text-violet-200">
                        Read on DEV
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                </div>
            </div>
        </a>
    );
}

function FeaturedCard({ post }) {
    return (
        <Reveal>
            <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-labelledby="featured-article-title"
                className="mkt-card mkt-card-hover group block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            >
                <div className="lg:grid lg:grid-cols-[0.92fr_1.35fr]">
                    <div className="relative flex min-h-[19rem] flex-col justify-between overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(circle_at_18%_12%,rgba(139,92,246,0.32),transparent_52%),linear-gradient(155deg,#151226_0%,#0B0F17_72%)] p-7 sm:p-9 lg:border-b-0 lg:border-r">
                        <div
                            aria-hidden="true"
                            className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] [background-size:40px_40px]"
                        />

                        <div className="relative flex items-center justify-between gap-3">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300/90">
                                From the article
                            </span>
                            <span className="mkt-chip !border-white/10 !bg-white/[0.04] !text-slate-300">
                                Open source
                            </span>
                        </div>

                        <div className="relative my-9">
                            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                                The path from activity to understanding
                            </p>
                            <ol className="mt-5">
                                {featuredPath.map((step, index) => (
                                    <li
                                        key={step}
                                        className="relative flex items-center gap-3 pb-3.5 last:pb-0"
                                    >
                                        {index < featuredPath.length - 1 && (
                                            <span
                                                aria-hidden="true"
                                                className="absolute left-[3px] top-2.5 h-full w-px bg-gradient-to-b from-violet-400/50 to-violet-400/5"
                                            />
                                        )}
                                        <span className="relative h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300 shadow-[0_0_12px_rgba(167,139,250,0.7)]" />
                                        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400 transition-colors group-hover:text-slate-300">
                                            {step}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="relative flex items-end justify-between gap-4">
                            <p className="max-w-[13rem] font-['Plus_Jakarta_Sans'] text-2xl font-bold leading-tight tracking-tight text-slate-100">
                                Closer to what&apos;s happening.
                            </p>
                            <span
                                aria-hidden="true"
                                className="text-[5.5rem] font-extrabold leading-none tracking-tighter text-white/[0.06]"
                            >
                                01
                            </span>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 lg:p-10">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300/90">
                            Featured · {post.category}
                        </p>
                        <h2
                            id="featured-article-title"
                            className="mkt-h3 mt-3 text-[1.45rem] transition-colors group-hover:text-violet-200 sm:text-[1.65rem]"
                        >
                            {post.title}
                        </h2>
                        <p className="mt-4 text-base font-medium leading-relaxed text-slate-200">
                            {post.headline}
                        </p>
                        <p className="mkt-body mt-3">{post.description}</p>

                        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-5">
                            <span className="text-xs text-slate-500">
                                WebPulse Team · {post.published} · {post.readingTime}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-300 transition-colors group-hover:text-violet-200">
                                Read the article
                                <ArrowRight
                                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                    aria-hidden="true"
                                />
                            </span>
                        </div>
                    </div>
                </div>
            </a>
        </Reveal>
    );
}

function FilterBar({ activeFilter, onChange }) {
    return (
        <div className="mt-10 flex flex-col gap-4 border-y border-white/[0.06] py-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Filter by topic
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter articles by topic">
                {filters.map((filter) => {
                    const isActive = activeFilter === filter;
                    const count = filterCounts[filter];

                    return (
                        <button
                            key={filter}
                            type="button"
                            onClick={() => onChange(filter)}
                            aria-pressed={isActive}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
                                isActive
                                    ? 'border-violet-400/40 bg-violet-600 text-white'
                                    : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-violet-400/30 hover:text-slate-100'
                            }`}
                        >
                            {filter}
                            <span
                                className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none tabular-nums ${
                                    isActive
                                        ? 'bg-white/15 text-white'
                                        : count === 0
                                          ? 'bg-white/[0.03] text-slate-600'
                                          : 'bg-white/[0.05] text-slate-500'
                                }`}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function Blog() {
    const [activeFilter, setActiveFilter] = useState('All articles');

    const featuredPost = posts.find((post) => post.featured);
    const latestPosts = posts.filter((post) => !post.featured);
    const isAllArticles = activeFilter === 'All articles';
    const filteredPosts = isAllArticles
        ? latestPosts
        : posts.filter((post) => post.category === activeFilter);

    const scrollToArticles = (event) => {
        event.preventDefault();
        document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <MarketingShell tone="hero">
            {/* Hero */}
            <section className="relative pb-12 pt-12 sm:pt-16 lg:pb-16">
                <div className="mkt-container">
                    <Reveal className="max-w-4xl">
                        <p className="mkt-eyebrow">WebPulse Blog</p>
                        <h1 className="mkt-h1 mt-5">
                            The thinking behind{' '}
                            <span className="mkt-accent-text">WebPulse.</span>
                        </h1>
                        <p className="mkt-lead mt-6 max-w-2xl">
                            Engineering deep dives, practical analytics guides, security insights,
                            and honest updates from building an open-source analytics platform.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <a
                                href="#articles"
                                onClick={scrollToArticles}
                                className="mkt-btn mkt-btn-primary mkt-btn-lg"
                            >
                                Explore articles
                                <ArrowDown className="h-4 w-4" aria-hidden="true" />
                            </a>
                            <a
                                href={REPO_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mkt-btn mkt-btn-secondary mkt-btn-lg"
                            >
                                <Github className="h-4 w-4" aria-hidden="true" />
                                View on GitHub
                            </a>
                        </div>

                        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-slate-500">
                            <span>Product development</span>
                            <span aria-hidden="true" className="text-slate-700">
                                ·
                            </span>
                            <span>Engineering</span>
                            <span aria-hidden="true" className="text-slate-700">
                                ·
                            </span>
                            <span>Analytics</span>
                            <span aria-hidden="true" className="text-slate-700">
                                ·
                            </span>
                            <span>Security</span>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Article archive */}
            <section id="articles" className="relative scroll-mt-24 py-14 lg:py-20">
                <div className="mkt-container">
                    <Reveal>
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-2xl">
                                <p className="mkt-eyebrow">Articles</p>
                                <h2 className="mkt-h2 mt-4">Browse the archive.</h2>
                                <p className="mkt-lead mt-4">
                                    Every entry links to the full article on DEV Community. Filter
                                    by topic to find the engineering, analytics, or security work
                                    most relevant to you.
                                </p>
                            </div>
                            <a
                                href={DEV_PROFILE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mkt-link shrink-0 !text-sm"
                            >
                                Follow Sriram on DEV
                                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                        </div>
                    </Reveal>

                    <FilterBar activeFilter={activeFilter} onChange={setActiveFilter} />

                    <p className="sr-only" role="status">
                        {isAllArticles
                            ? `Showing all ${posts.length} articles.`
                            : `Showing ${filteredPosts.length} ${
                                  filteredPosts.length === 1 ? 'article' : 'articles'
                              } in ${activeFilter}.`}
                    </p>

                    {!isAllArticles && (
                        <p className="mt-5 text-xs font-medium text-slate-500">
                            Showing {filteredPosts.length} of {posts.length} articles
                            {activeFilter !== 'Changelog' ? ` in ${activeFilter}` : ''}.
                        </p>
                    )}

                    {isAllArticles && featuredPost && (
                        <div className="mt-8">
                            <FeaturedCard post={featuredPost} />
                        </div>
                    )}

                    {isAllArticles && filteredPosts.length > 0 && (
                        <div className="mt-12 flex flex-wrap items-end justify-between gap-3">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Latest articles
                            </h3>
                            <span className="text-xs font-medium text-slate-600">
                                {latestPosts[0]?.number} — {latestPosts[latestPosts.length - 1]?.number}
                            </span>
                        </div>
                    )}

                    {filteredPosts.length > 0 && (
                        <div
                            className={`${
                                isAllArticles ? 'mt-6' : 'mt-8'
                            } grid gap-5 sm:grid-cols-2 xl:grid-cols-3`}
                        >
                            {filteredPosts.map((post, index) => (
                                <Reveal
                                    key={post.number}
                                    delay={(index % 3) * 70}
                                    className="h-full"
                                >
                                    <ArticleCard post={post} />
                                </Reveal>
                            ))}
                        </div>
                    )}

                    {filteredPosts.length === 0 && (
                        <Reveal className="mt-8">
                            <div className="mkt-card flex flex-col items-start gap-5 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                                <div className="flex items-start gap-4">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                                        <GitCommit
                                            className="h-5 w-5 text-violet-300"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <div>
                                        <h3 className="text-base font-semibold tracking-tight text-slate-100">
                                            No changelog posts published yet.
                                        </h3>
                                        <p className="mkt-body mt-2 text-sm">
                                            Development updates live in the repository changelog
                                            right now. That is where shipped changes, fixes, and
                                            security notes are documented as they happen.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 flex-wrap gap-3">
                                    <a
                                        href={CHANGELOG_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mkt-btn mkt-btn-primary mkt-btn-md"
                                    >
                                        Read the changelog
                                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                    </a>
                                    <a
                                        href={RELEASES_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mkt-btn mkt-btn-secondary mkt-btn-md"
                                    >
                                        View releases
                                    </a>
                                </div>
                            </div>
                        </Reveal>
                    )}
                </div>
            </section>

            {/* Development updates */}
            <section className="relative border-t border-white/[0.06] py-14 lg:py-20">
                <div className="mkt-container">
                    <Reveal>
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-2xl">
                                <p className="mkt-eyebrow">Development log</p>
                                <h2 className="mkt-h2 mt-4">Latest updates.</h2>
                                <p className="mkt-lead mt-4">
                                    What has actually changed in the repository during the current
                                    development cycle. These notes come from the project changelog,
                                    not a marketing calendar.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="mkt-chip">Unreleased</span>
                                <a
                                    href={CHANGELOG_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mkt-link !text-sm"
                                >
                                    Full changelog
                                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </a>
                            </div>
                        </div>
                    </Reveal>

                    <div className="mt-10 grid gap-4 lg:grid-cols-3">
                        {updates.map((update, index) => (
                            <Reveal key={update.title} delay={index * 70} className="h-full">
                                <a
                                    href={update.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mkt-card mkt-card-hover group flex h-full flex-col p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300/90">
                                            {update.label}
                                        </span>
                                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                                            In development
                                        </span>
                                    </div>
                                    <h3 className="mt-4 text-base font-semibold tracking-tight text-slate-100 transition-colors group-hover:text-violet-200">
                                        {update.title}
                                    </h3>
                                    <p className="mkt-body mt-2 text-sm">{update.description}</p>
                                    <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-xs font-semibold text-violet-300 transition-colors group-hover:text-violet-200">
                                        {update.linkLabel}
                                        <ArrowUpRight
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                </a>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Documentation */}
            <section className="relative pb-16 lg:pb-20">
                <div className="mkt-container">
                    <Reveal>
                        <div className="mkt-panel p-6 sm:p-8 lg:p-10">
                            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
                                <div>
                                    <p className="mkt-eyebrow">From reading to shipping</p>
                                    <h2 className="mkt-h3 mt-4 !text-2xl">
                                        Put the ideas to work.
                                    </h2>
                                    <p className="mkt-body mt-3">
                                        Use the documentation to add WebPulse to an application,
                                        define events that answer real questions, and keep the
                                        integration secure.
                                    </p>
                                    <a
                                        href={REPO_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mkt-link mt-5 !text-sm"
                                    >
                                        Browse the source code
                                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </a>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {docLinks.map((doc) => {
                                        const Icon = doc.icon;

                                        return (
                                            <Link
                                                key={doc.title}
                                                to={doc.to}
                                                className="group flex flex-col rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-colors hover:border-violet-400/30 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                            >
                                                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03]">
                                                    <Icon
                                                        className="h-4 w-4 text-violet-300"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                                <span className="mt-3 text-sm font-semibold text-slate-100 group-hover:text-violet-200">
                                                    {doc.title}
                                                </span>
                                                <span className="mt-1 text-xs leading-relaxed text-slate-500">
                                                    {doc.description}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Closing CTA */}
            <section className="relative pb-20 lg:pb-24">
                <div className="mkt-container">
                    <Reveal>
                        <div className="mkt-panel relative px-6 py-12 text-center sm:px-12">
                            <div
                                aria-hidden="true"
                                className="mkt-glow left-1/2 top-[-160px] h-[320px] w-[560px] max-w-[110vw] -translate-x-1/2 bg-violet-600/20"
                            />
                            <div className="relative">
                                <h2 className="mkt-h3 !text-2xl sm:!text-3xl">
                                    Curious about what we&apos;re building?
                                </h2>
                                <p className="mkt-lead mx-auto mt-4 max-w-2xl !text-base">
                                    Follow the development of WebPulse, explore the source code,
                                    and start using the analytics platform for your own projects.
                                </p>
                                <div className="mt-8 flex flex-wrap justify-center gap-3">
                                    <Link
                                        to="/register"
                                        className="mkt-btn mkt-btn-primary mkt-btn-lg"
                                    >
                                        Start tracking free
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                    <a
                                        href={REPO_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mkt-btn mkt-btn-secondary mkt-btn-lg"
                                    >
                                        <Github className="h-4 w-4" aria-hidden="true" />
                                        Explore GitHub
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
        </MarketingShell>
    );
}
