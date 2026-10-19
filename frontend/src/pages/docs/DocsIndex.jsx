import { Link } from 'react-router-dom';
import {
    ArrowRight, ArrowDown, Activity, Server, Shield,
    Zap, Code2
} from 'lucide-react';
import CodeBlock from './CodeBlock';
import Reveal from '../../components/marketing/Reveal';

const FlowStep = ({ label }) => (
    <div className="whitespace-nowrap rounded-xl border border-violet-400/20 bg-violet-500/10 px-4 py-2.5 text-center text-xs font-semibold text-violet-300">
        {label}
    </div>
);

const FlowArrowRight = () => <ArrowRight className="hidden h-4 w-4 text-slate-600 md:block" aria-hidden="true" />;
const FlowArrowDown = () => <ArrowDown className="h-4 w-4 text-slate-600 md:hidden" aria-hidden="true" />;

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
        eyebrow: 'API',
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
    'Add tracker',
    'Send events',
    'View analytics'
];

const guideLinks = [
    { to: '/docs/guides/react', label: 'Add WebPulse to a React application', desc: 'Track route changes and custom interactions in a Single Page App.' },
    { to: '/docs/guides#javascript-website', label: 'Add WebPulse to a JavaScript website', desc: 'Plain-JS setup for page views and interaction events.' },
    { to: '/docs/guides#custom-events', label: 'Track custom events end to end', desc: 'From tracker call to your project activity feed.' },
    { to: '/docs/guides#analytics-api', label: 'Query analytics through the API', desc: 'Retrieve counts and account-level analytics.' }
];

export default function DocsIndex() {
    return (
        <div>
            <Reveal className="mb-16 text-center">
                <p className="mkt-eyebrow mb-4">Documentation</p>
                <h1 className="mkt-h1 !text-3xl sm:!text-4xl">
                    Everything you need to{' '}
                    <span className="mkt-accent-text">build with WebPulse</span>.
                </h1>
                <p className="mkt-lead mx-auto mt-4 max-w-2xl">
                    Set up tracking, send events, query analytics, and integrate WebPulse into your application.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link to="/docs/getting-started" className="mkt-btn mkt-btn-primary mkt-btn-md">
                        Read the guides <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <Link to="/docs/api" className="mkt-btn mkt-btn-secondary mkt-btn-md">
                        API reference
                    </Link>
                </div>
            </Reveal>

            <Reveal className="mb-16">
                <div className="mkt-panel p-6">
                    <h2 className="mb-6 flex items-center gap-2 text-lg font-bold tracking-tight text-slate-100">
                        <Zap className="h-5 w-5 text-violet-300" aria-hidden="true" /> Start tracking in minutes
                    </h2>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2">
                        {flowSteps.map((step, i) => (
                            <div key={step} className="flex w-full flex-col items-center gap-3 md:flex-1 md:flex-row md:gap-2">
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
                    <p className="mt-6 text-sm text-slate-400">
                        From project creation to live analytics —{' '}
                        <Link to="/docs/getting-started" className="font-semibold text-violet-300 transition-colors hover:text-violet-200">
                            follow the quick start →
                        </Link>
                    </p>
                </div>
            </Reveal>

            <div className="mb-20 grid gap-6 md:grid-cols-2">
                {primaryCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <Reveal key={card.to} delay={(i % 2) * 70}>
                            <Link to={card.to} className="mkt-card mkt-card-hover group block p-6">
                                <div className="mb-4 flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 transition-transform duration-300 group-hover:scale-105">
                                        <Icon className="h-6 w-6 text-violet-300" aria-hidden="true" />
                                    </div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{card.eyebrow}</p>
                                </div>
                                <h2 className="mb-5 text-lg font-semibold tracking-tight text-slate-100 transition-colors group-hover:text-violet-300">{card.title}</h2>
                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-300">
                                    {card.cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                </span>
                            </Link>
                        </Reveal>
                    );
                })}
            </div>

            <Reveal className="mb-20">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">JavaScript</p>
                <div className="mkt-panel p-6">
                    <div className="grid items-center gap-8 lg:grid-cols-2">
                        <div>
                            <h2 className="mb-3 font-display text-2xl font-bold tracking-tight text-slate-100">JavaScript Tracker</h2>
                            <p className="mb-6 text-slate-400">
                                Integrate WebPulse into your website using the lightweight JavaScript tracking module.
                            </p>
                            <Link to="/docs/javascript" className="mkt-link inline-flex items-center gap-1.5">
                                View tracker documentation <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        </div>
                        <CodeBlock
                            language="javascript"
                            title="tracker.js"
                            code={`tracker('init', 'YOUR_TRACKING_ID');\n\ntracker('track', 'page_view');`}
                        />
                    </div>
                </div>
            </Reveal>

            <Reveal className="mb-20">
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Developer Guides</p>
                    <Link to="/docs/guides" className="mkt-link inline-flex items-center gap-1">
                        Browse guides <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    {guideLinks.map((link) => (
                        <Link key={link.label} to={link.to} className="mkt-card mkt-card-hover group/li block p-5">
                            <span className="flex items-center gap-2 font-semibold tracking-tight text-slate-100 transition-colors group-hover/li:text-violet-300">
                                <Code2 className="h-4 w-4 shrink-0 text-violet-400" aria-hidden="true" />
                                {link.label}
                                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-violet-400 transition-transform group-hover/li:translate-x-1" aria-hidden="true" />
                            </span>
                            <p className="mt-1.5 text-sm text-slate-400">{link.desc}</p>
                        </Link>
                    ))}
                </div>
            </Reveal>

            <Reveal>
                <div className="mkt-panel relative overflow-hidden px-6 py-12 text-center">
                    <div
                        aria-hidden="true"
                        className="mkt-glow left-1/2 top-[-160px] h-[320px] w-[560px] max-w-[110vw] -translate-x-1/2 bg-violet-600/20"
                    />
                    <div className="relative">
                        <h2 className="mkt-h3 !text-2xl">Ready to build?</h2>
                        <p className="mkt-body mx-auto mt-3 max-w-xl">
                            Start a project and add WebPulse tracking to your site in a few minutes.
                        </p>
                        <div className="mt-7 flex flex-wrap justify-center gap-3">
                            <Link to="/register" className="mkt-btn mkt-btn-primary mkt-btn-lg">
                                Get Started <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <Link to="/docs/api" className="mkt-btn mkt-btn-secondary mkt-btn-lg">
                                View the API
                            </Link>
                        </div>
                    </div>
                </div>
            </Reveal>
        </div>
    );
}
