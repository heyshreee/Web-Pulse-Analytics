import { Link } from 'react-router-dom';
import {
    ArrowRight, ArrowDown, Activity, Server, Shield,
    Zap, Code2, Sparkles, BookOpen
} from 'lucide-react';
import CodeBlock from './CodeBlock';

const FlowStep = ({ label }) => (
    <div className="rounded-xl px-4 py-2 text-center text-xs font-semibold border bg-violet-500/10 border-violet-500/20 text-violet-700 dark:text-violet-300 w-full">
        {label}
    </div>
);

const FlowArrowRight = () => <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 hidden md:block shrink-0" />;
const FlowArrowDown = () => <ArrowDown className="h-4 w-4 text-slate-300 dark:text-slate-600 md:hidden shrink-0" />;

const primaryCards = [
    {
        to: '/docs/getting-started',
        eyebrow: 'Getting Started',
        title: 'Start tracking your website with WebPulse.',
        cta: 'Read guide',
        icon: Zap
    },
    {
        to: '/docs/tracking',
        eyebrow: 'Tracking',
        title: 'Learn how events and sessions are collected.',
        cta: 'Read docs',
        icon: Activity
    },
    {
        to: '/docs/api',
        eyebrow: 'API Reference',
        title: 'Send events and retrieve analytics programmatically.',
        cta: 'API reference',
        icon: Server
    },
    {
        to: '/docs/security',
        eyebrow: 'Security',
        title: 'Protect your keys and tracking configuration.',
        cta: 'Security guide',
        icon: Shield
    }
];

const flowSteps = [
    'Create project',
    'Get tracking ID',
    'Embed tracker',
    'Send events',
    'Live dashboard'
];

const guideLinks = [
    { to: '/docs/guides/react', label: 'Add WebPulse to a React / Next.js app', desc: 'Track route changes and custom actions in Single Page Apps.' },
    { to: '/docs/guides#javascript-website', label: 'Add WebPulse to vanilla HTML / JS', desc: 'Plain-JS setup for pageviews and interaction events.' },
    { to: '/docs/guides#custom-events', label: 'Track custom conversion events', desc: 'From tracker call to your project activity feed.' },
    { to: '/docs/guides#analytics-api', label: 'Query analytics through the REST API', desc: 'Retrieve aggregates and account-level telemetry.' }
];

export default function DocsIndex() {
    return (
        <div>
            {/* Header Hero */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-4">
                    <BookOpen className="h-3.5 w-3.5" />
                    WebPulse Documentation
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
                    Everything you need to <br />
                    <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 dark:from-violet-400 dark:via-fuchsia-300 dark:to-indigo-300 bg-clip-text text-transparent">
                        build with WebPulse.
                    </span>
                </h1>
                <p className="mt-4 text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                    Set up tracking, record custom events, query telemetry aggregates, and wire real-time analytics into your application.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                    <Link to="/docs/getting-started" className="btn-signal btn-md">
                        Read Quick Start <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link to="/docs/api" className="btn-secondary btn-md">
                        API Reference
                    </Link>
                </div>
            </div>

            {/* Ingestion Pipeline Walkthrough Card */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-xl p-6 sm:p-8 mb-14 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 tracking-tight flex items-center gap-2">
                    <Zap className="h-4 w-4 text-violet-500" /> Start tracking in minutes
                </h3>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    {flowSteps.map((step, i) => (
                        <div key={step} className="flex md:flex-1 flex-col md:flex-row items-center gap-2 w-full">
                            {i > 0 && (
                                <>
                                    <FlowArrowDown />
                                    <FlowArrowRight />
                                </>
                            )}
                            <FlowStep label={step} />
                        </div>
                    ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-6 text-center">
                    From project creation to real-time analytics — <Link to="/docs/getting-started" className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors">follow the 3-minute guide →</Link>
                </p>
            </div>

            {/* Core Documentation Cards */}
            <div className="mb-14">
                <div className="grid md:grid-cols-2 gap-6">
                    {primaryCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={card.to}
                                to={card.to}
                                className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-xl p-6 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 group block"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 group-hover:scale-105 transition-transform duration-300">
                                        <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{card.eyebrow}</p>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-4 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                    {card.title}
                                </h3>
                                <span className="inline-flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-semibold text-xs group-hover:translate-x-1 transition-transform">
                                    {card.cta} <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* JavaScript Tracker Spotlight */}
            <div className="mb-14">
                <div className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-xl p-6 sm:p-8">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded bg-violet-500/10">
                                Official SDK
                            </span>
                            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-2 mb-2 tracking-tight">
                                JavaScript Tracker
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                                Less than 1.2 KB. Non-blocking beacon transmission. Zero cookie dependencies. Works with vanilla JS, React, Vue, Svelte, or plain static HTML.
                            </p>
                            <Link to="/docs/javascript" className="text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1 text-xs hover:text-violet-500 transition-colors">
                                View tracker documentation <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                        <CodeBlock
                            language="javascript"
                            title="tracker.js"
                            code={`// 1. Initialize with project ID\ntracker('init', 'trk_91af••••••••');\n\n// 2. Track automatic or custom action\ntracker('track', 'page_view');`}
                        />
                    </div>
                </div>
            </div>

            {/* Developer Guides Section */}
            <div className="mb-14">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Framework Tutorials</p>
                    <Link to="/docs/guides" className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors flex items-center gap-1">
                        All guides <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    {guideLinks.map((link) => (
                        <Link
                            key={link.label}
                            to={link.to}
                            className="p-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-xl hover:border-violet-500/40 hover:shadow-md transition-all group block"
                        >
                            <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight flex items-center gap-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                <Code2 className="h-4 w-4 text-violet-500 shrink-0" />
                                {link.label}
                                <ArrowRight className="h-3.5 w-3.5 text-violet-500 shrink-0 ml-auto group-hover:translate-x-1 transition-transform" />
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{link.desc}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}