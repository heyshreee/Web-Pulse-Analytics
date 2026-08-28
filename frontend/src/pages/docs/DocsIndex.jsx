import { Link } from 'react-router-dom';
import {
    ArrowLeft, ArrowRight, ArrowDown, Activity, Server, Shield,
    Zap, BookOpen, Code2, BarChart2
} from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import CodeBlock from './CodeBlock';
import { API_DOMAIN } from './docsContent';

const FlowStep = ({ label }) => (
    <div className="rounded-xl px-4 py-2.5 text-center text-xs font-semibold border bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20 text-violet-600 dark:text-violet-400">
        {label}
    </div>
);

const FlowArrowRight = () => <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 hidden md:block" />;
const FlowArrowDown = () => <ArrowDown className="h-4 w-4 text-slate-300 dark:text-slate-600 md:hidden" />;

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
            <div className="text-center mb-16">
                <p className="eyebrow mb-3">Documentation</p>
                <h1 className="page-title !text-4xl font-display text-center">Everything you need to <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">build with WebPulse</span>.</h1>
                <p className="page-sub !text-base mt-4 max-w-2xl mx-auto">
                    Set up tracking, send events, query analytics, and integrate WebPulse into your application.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                    <Link to="/docs/getting-started" className="btn-primary btn-md">
                        Read the guides <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link to="/docs/api" className="btn-secondary btn-md">
                        API reference
                    </Link>
                </div>
            </div>

            <div className="card card-pad mb-16 bg-white/70 dark:bg-slate-900/60">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 tracking-tight flex items-center gap-2">
                    <Zap className="h-5 w-5 text-violet-500" /> Start tracking in minutes
                </h3>
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-2">
                    {flowSteps.map((step, i) => (
                        <div key={step} className="flex md:flex-1 flex-col md:flex-row items-center gap-3 md:gap-2 w-full">
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
                <p className="prose-quiet text-sm mt-6">
                    From project creation to live analytics — <Link to="/docs/getting-started" className="font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors">follow the quick start →</Link>
                </p>
            </div>

            <div className="mb-20">
                <div className="grid md:grid-cols-2 gap-6">
                    {primaryCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Link key={card.to} to={card.to} className="card card-pad card-hover group block">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10 group-hover:scale-105 transition-transform duration-300">
                                        <Icon className="h-6 w-6 text-violet-500" />
                                    </div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{card.eyebrow}</p>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight mb-5 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{card.title}</h3>
                                <span className="inline-flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-medium text-sm">
                                    {card.cta} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="mb-20">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">JavaScript</p>
                <div className="card card-pad">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3 tracking-tight">JavaScript Tracker</h3>
                            <p className="prose-quiet mb-6">
                                Integrate WebPulse into your website using the lightweight JavaScript tracking module.
                            </p>
                            <Link to="/docs/javascript" className="text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1.5 text-sm hover:text-violet-500 transition-colors">
                                View tracker documentation <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <CodeBlock
                            language="javascript"
                            title="tracker.js"
                            code={`tracker('init', 'YOUR_TRACKING_ID');\n\ntracker('track', 'page_view');`}
                        />
                    </div>
                </div>
            </div>

            <div className="mb-20">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">Developer Guides</p>
                    <Link to="/docs/guides" className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors flex items-center gap-1">
                        Browse guides <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    {guideLinks.map((link) => (
                        <Link key={link.label} to={link.to} className="card card-pad card-hover group/li block">
                            <span className="font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 group-hover/li:text-violet-600 dark:group-hover/li:text-violet-400 transition-colors">
                                <Code2 className="h-4 w-4 text-violet-500 shrink-0" />
                                {link.label}
                                <ArrowRight className="h-4 w-4 text-violet-500 shrink-0 ml-auto group-hover/li:translate-x-1 transition-transform" />
                            </span>
                            <p className="prose-quiet text-sm mt-1.5">{link.desc}</p>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="card card-pad text-center bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-500/10 dark:to-fuchsia-500/5 border-violet-100 dark:border-white/[0.06]">
                <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">Ready to build?</h3>
                <p className="prose-quiet mb-6 max-w-xl mx-auto">
                    Start a project and add WebPulse tracking to your site in a few minutes.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link to="/register" className="btn-primary btn-lg">
                        Get Started <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link to="/docs/api" className="btn-secondary btn-lg">
                        View the API
                    </Link>
                </div>
            </div>
        </div>
    );
}