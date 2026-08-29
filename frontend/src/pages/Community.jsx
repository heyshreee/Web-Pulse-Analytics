import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bug, Compass, Github, Lightbulb, MessageSquareText, ShieldCheck, Sparkles, Users } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';

const REPO_URL = 'https://github.com/heyshreee/Web-Pulse-Analytics';
const ISSUES_URL = `${REPO_URL}/issues`;
const CONTRIBUTORS_URL = `${REPO_URL}/graphs/contributors`;
const CONTRIBUTORS_API = 'https://api.github.com/repos/heyshreee/Web-Pulse-Analytics/contributors?per_page=100';

const roadmap = {
    now: {
        badge: 'bh',
        items: ['Real-time analytics', 'Visitor tracking', 'Projects dashboard'],
    },
    next: {
        badge: 'ba',
        items: ['Advanced insights', 'Improved reporting', 'More integrations'],
    },
    exploring: {
        badge: 'bs',
        items: ['Advanced segmentation', 'ML anomaly detection', 'Mobile support', 'Advanced export'],
    },
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

    const badgeClass = (id) => {
        if (id === 'bh') return 'badge-green';
        if (id === 'ba') return 'badge-amber';
        return 'badge-slate';
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
            <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-space-900/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-medium text-sm">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <p className="eyebrow mb-3">Community</p>
                        <h1 className="page-title !text-4xl font-display">Build <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">WebPulse</span> with us.</h1>
                        <p className="page-sub !text-base mt-3 max-w-2xl mx-auto">
                            WebPulse is built in the open. Share ideas, report problems, discuss analytics, and help shape what comes next.
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto space-y-6">
                        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="card card-pad card-hover block group">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                                    <Github className="h-7 w-7 text-slate-900 dark:text-white group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">GitHub</h2>
                                    <p className="prose-quiet text-sm mt-1">
                                        Build with us. WebPulse is a public, open-source project. Explore the codebase, report issues, suggest improvements, and contribute where you can.
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Repository:</span>
                                        <code className="font-mono text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">github.com/heyshreee/Web-Pulse-Analytics</code>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400">
                                    View repository <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </div>
                        </a>

                        <div className="grid md:grid-cols-2 gap-6">
                            <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="card card-pad card-hover block group">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 mb-5">
                                    <Lightbulb className="h-7 w-7 text-violet-500 group-hover:scale-110 transition-transform" />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">Feature Requests</h2>
                                <p className="prose-quiet text-sm">
                                    Help decide what comes next. Tell us what you need, explain the problem you're trying to solve, and open an issue to help shape the roadmap.
                                </p>
                                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400">
                                    Suggest a feature <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </a>

                            <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="card card-pad card-hover block group">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 mb-5">
                                    <Bug className="h-7 w-7 text-red-500 group-hover:scale-110 transition-transform" />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">Bug Reports</h2>
                                <p className="prose-quiet text-sm">
                                    Found something broken? Good bug reports make WebPulse better.
                                </p>
                                <ul className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                                    <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-slate-400 shrink-0" />What happened</li>
                                    <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-slate-400 shrink-0" />What you expected</li>
                                    <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-slate-400 shrink-0" />Steps to reproduce</li>
                                    <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-slate-400 shrink-0" />Browser / environment</li>
                                    <li className="flex items-start gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-slate-400 shrink-0" />Relevant logs or screenshots</li>
                                </ul>
                                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-red-500 dark:text-red-400">
                                    Report an issue <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </a>
                        </div>

                        <div className="card card-pad">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10">
                                    <MessageSquareText className="h-7 w-7 text-emerald-500" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Discussions</h2>
                                    <p className="prose-quiet text-sm mt-1">
                                        Ask questions and share what you're building. Discussion on GitHub Issues is the active channel today — WebPulse doesn't run a Discord or social chat yet. Once GitHub Discussions is enabled, questions and ideas from the Issues tab will move there.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <section>
                            <div className="mb-5">
                                <p className="eyebrow mb-2"><Users className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />Contributors</p>
                                <h2 className="section-title">Built by developers.</h2>
                                <p className="page-sub">Contributors load live from the GitHub repository.</p>
                            </div>
                            <div className="card card-pad">
                                {status === 'loading' && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-14 w-14 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
                                        <div className="flex-1">
                                            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2" />
                                            <div className="h-3 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                                        </div>
                                    </div>
                                )}
                                {status === 'error' && (
                                    <p className="prose-quiet text-sm">
                                        Couldn't load contributor data right now (GitHub rate limit or network). You can still
                                        {' '}<a href={CONTRIBUTORS_URL} target="_blank" rel="noopener noreferrer" className="text-violet-600 dark:text-violet-400 hover:underline font-medium">view contributors on GitHub</a>.
                                    </p>
                                )}
                                {status === 'loaded' && contributors && (
                                    <>
                                        <div className="flex flex-wrap gap-3">
                                            {contributors.map((c) => (
                                                <a
                                                    key={c.id}
                                                    href={c.html_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title={c.login + ` · ${c.contributions} commits`}
                                                    className="hover:-translate-y-0.5 transition-transform"
                                                >
                                                    <img src={c.avatar_url} alt={c.login} className="h-14 w-14 rounded-full ring-2 ring-white dark:ring-slate-700 object-cover" />
                                                </a>
                                            ))}
                                        </div>
                                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {contributors.length} {contributors.length === 1 ? 'contributor' : 'contributors'}
                                            </p>
                                            <a href={CONTRIBUTORS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400">
                                                View on GitHub <ArrowRight className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        <section>
                            <div className="mb-5">
                                <p className="eyebrow mb-2"><Compass className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />Roadmap</p>
                                <h2 className="section-title">Help shape WebPulse.</h2>
                                <p className="page-sub">
                                    The live product, near-term priorities, and ideas being explored — tracked in the GitHub repository.
                                </p>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                {Object.entries(roadmap).map(([key, tier]) => (
                                    <div key={key} className="card card-pad">
                                        <span className={badgeClass(tier.badge) + ' uppercase'}>{key}</span>
                                        {key === 'now' && <p className="prose-quiet mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Live in WebPulse today</p>}
                                        {key === 'next' && <p className="prose-quiet mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400">On the near-term roadmap — not shipped yet</p>}
                                        {key === 'exploring' && <p className="prose-quiet mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Ideas from the repository — not available yet</p>}
                                        <ul className="mt-4 space-y-2.5">
                                            {tier.items.map((item) => (
                                                <li key={item} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                                    <Sparkles className="h-4 w-4 mt-0.5 text-violet-500/70 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-600 mt-3">
                                Status snapshot from the repository direction. Exploring items are ideas, not current features — actual status is tracked on{' '}
                                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600 dark:hover:text-slate-400">GitHub</a>.
                            </p>
                        </section>

                        <section className="card card-pad">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                                    <ShieldCheck className="h-7 w-7 text-slate-700 dark:text-slate-300" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Community guidelines</h2>
                                    <p className="prose-quiet text-sm mt-1">
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">Keep it useful.</span> WebPulse is a technical community. Keep discussions constructive and on topic, respect other contributors, don't share credentials or sensitive visitor data, and provide enough context when reporting issues. Issues and pull requests follow the same spirit.
                                    </p>
                                </div>
                                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-600 dark:text-violet-400 shrink-0">
                                    Read community guidelines <ArrowRight className="h-4 w-4" />
                                </a>
                            </div>
                        </section>

                        <section className="text-center pt-8 pb-4">
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Have something to contribute?</h2>
                            <p className="page-sub mt-3 max-w-xl mx-auto">
                                Whether it's a bug report, feature idea, documentation improvement, or code contribution — start with GitHub.
                            </p>
                            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="btn-primary btn-lg mt-6">
                                <Github className="h-4 w-4" /> Open GitHub <ArrowRight className="h-4 w-4" />
                            </a>
                        </section>
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