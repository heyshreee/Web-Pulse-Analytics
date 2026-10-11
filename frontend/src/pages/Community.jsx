import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Bug, Compass, Github, Lightbulb, MessageSquareText,
    ShieldCheck, Sparkles, Users, Star, GitPullRequest, ExternalLink,
    Heart, Code2
} from 'lucide-react';
import Logo from '../components/Logo';

const REPO_URL = 'https://github.com/heyshreee/Web-Pulse-Analytics';
const ISSUES_URL = `${REPO_URL}/issues`;
const CONTRIBUTORS_URL = `${REPO_URL}/graphs/contributors`;
const CONTRIBUTORS_API = 'https://api.github.com/repos/heyshreee/Web-Pulse-Analytics/contributors?per_page=100';

const ROADMAP = {
    now: {
        badge: 'Live Today',
        color: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        items: [
            'Sub-second real-time telemetry engine',
            'Zero-cookie session & visitor journey tracking',
            'Custom event tracking and conversion goals',
            'City-level geographic & referrer attribution',
            'Multi-project workspaces & REST API tokens'
        ]
    },
    next: {
        badge: 'In Development',
        color: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
        items: [
            'Automated weekly email digests & reports',
            'Pre-built integrations for Cloudflare Workers & Vercel',
            'Webhooks for traffic anomaly & error alerts',
            'Advanced funnel analysis & conversion flows'
        ]
    },
    exploring: {
        badge: 'Research & Ideas',
        color: 'border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400',
        items: [
            'Machine learning traffic anomaly detection',
            'Self-hosted standalone Docker container option',
            'Mobile app SDKs (React Native, Flutter)',
            'First-party reverse proxy generator'
        ]
    }
};

export default function Community() {
    const [contributors, setContributors] = useState(null);
    const [status, setStatus] = useState('loading');

    useEffect(() => {
        let mounted = true;
        fetch(CONTRIBUTORS_API)
            .then((res) => {
                if (!res.ok) throw new Error(`GitHub API ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (!mounted) return;
                setContributors(data);
                setStatus('loaded');
            })
            .catch(() => {
                if (!mounted) return;
                setStatus('error');
            });
        return () => {
            mounted = false;
        };
    }, []);

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
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Header */}
                    <div className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-4">
                            <Users className="h-3.5 w-3.5" />
                            Open Source &amp; Community
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
                            Build WebPulse <br />
                            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 dark:from-violet-400 dark:via-fuchsia-300 dark:to-indigo-300 bg-clip-text text-transparent">
                                with us in the open.
                            </span>
                        </h1>
                        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            WebPulse is completely public and open source. Suggest features, report edge issues, review source code, and help shape modern web observability.
                        </p>
                    </div>

                    {/* GitHub Hero Showcase Card */}
                    <a
                        href={REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17] p-6 sm:p-10 mb-8 shadow-xl hover:border-violet-500/40 hover:shadow-2xl transition-all duration-300"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-start sm:items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <Github className="h-7 w-7" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">GitHub Repository</h2>
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            Public
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        heyshreee/Web-Pulse-Analytics · Apache 2.0 / MIT
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.1] text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-white/[0.03]">
                                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> Star Project
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform">
                                    Explore Repository <ArrowRight className="h-4 w-4" />
                                </span>
                            </div>
                        </div>
                    </a>

                    {/* Community Channels Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        <a
                            href={ISSUES_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-xl p-6 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/5 transition-all group block"
                        >
                            <div className="h-11 w-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4 group-hover:scale-105 transition-transform">
                                <Lightbulb className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Feature Requests &amp; Ideas</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                Propose telemetry capabilities, framework SDKs, or reporting features directly on our issue tracker.
                            </p>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 group-hover:translate-x-0.5 transition-transform">
                                Suggest a feature <ExternalLink className="h-3 w-3" />
                            </span>
                        </a>

                        <a
                            href={ISSUES_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-xl p-6 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/5 transition-all group block"
                        >
                            <div className="h-11 w-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 group-hover:scale-105 transition-transform">
                                <Bug className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Bug Reports &amp; Edge Cases</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                                Spot an issue with tracking beacon transport, timezone offsets, or UI charts? Open an issue with reproduction details.
                            </p>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform">
                                Report an issue <ExternalLink className="h-3 w-3" />
                            </span>
                        </a>
                    </div>

                    {/* Contributors Live Section */}
                    <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-xl p-6 sm:p-8 mb-12 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Project Contributors</h3>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Thank you to everyone helping build WebPulse. Live from GitHub.
                                </p>
                            </div>
                            <a
                                href={CONTRIBUTORS_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 flex items-center gap-1"
                            >
                                All Contributors <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>

                        {status === 'loading' && (
                            <div className="flex items-center gap-3 py-4">
                                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/[0.05] animate-pulse" />
                                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/[0.05] animate-pulse" />
                                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/[0.05] animate-pulse" />
                            </div>
                        )}

                        {status === 'loaded' && contributors && (
                            <div className="flex flex-wrap gap-3">
                                {contributors.map((c) => (
                                    <a
                                        key={c.id}
                                        href={c.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={`${c.login} · ${c.contributions} contributions`}
                                        className="group relative"
                                    >
                                        <img
                                            src={c.avatar_url}
                                            alt={c.login}
                                            className="h-11 w-11 rounded-full ring-2 ring-slate-200 dark:ring-white/[0.1] object-cover group-hover:scale-110 group-hover:ring-violet-500 transition-all duration-200"
                                        />
                                    </a>
                                ))}
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="py-2 text-xs text-slate-500 dark:text-slate-400">
                                Loaded through GitHub. View our full list of contributors directly on{' '}
                                <a href={CONTRIBUTORS_URL} target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 font-semibold hover:underline">
                                    GitHub Contributors Graph
                                </a>.
                            </div>
                        )}
                    </div>

                    {/* Roadmap Section */}
                    <div className="mb-14">
                        <div className="text-center mb-8">
                            <p className="eyebrow mb-2">Vision &amp; Priorities</p>
                            <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
                                The WebPulse Public Roadmap
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                                Where we are focusing development effort and what we are investigating next.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {Object.entries(ROADMAP).map(([key, section]) => (
                                <div
                                    key={key}
                                    className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-xl p-6 flex flex-col justify-between"
                                >
                                    <div>
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-4 ${section.color}`}>
                                            {section.badge}
                                        </span>
                                        <ul className="space-y-2.5">
                                            {section.items.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                                                    <Sparkles className="h-3.5 w-3.5 text-violet-500 shrink-0 mt-0.5" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Community Guidelines Card */}
                    <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-xl p-6 sm:p-8 mb-12 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base text-slate-900 dark:text-white">Community Principles</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                                    WebPulse is built on respect, technical rigor, and privacy-first engineering. Keep discussions constructive, never post sensitive visitor data or production tokens, and include reproducible test cases when filing issues.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom CTA Banner */}
                    <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-indigo-600/10 p-8 sm:p-12 text-center backdrop-blur-xl">
                        <div className="max-w-xl mx-auto">
                            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                                Ready to contribute?
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                                Whether you submit code, report bugs, improve documentation, or star the repository — every contribution matters.
                            </p>
                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <a
                                    href={REPO_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-signal btn-md"
                                >
                                    <Github className="h-4 w-4" /> Open GitHub Repository
                                </a>
                                <Link to="/register" className="btn-secondary btn-md">
                                    Start Tracking Free
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