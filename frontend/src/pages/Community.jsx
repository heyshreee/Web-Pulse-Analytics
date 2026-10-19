import { useEffect, useState } from 'react';
import { ArrowRight, Bug, Compass, Github, Lightbulb, MessageSquareText, ShieldCheck, Sparkles, Users } from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import SectionHead from '../components/marketing/SectionHead';
import Reveal from '../components/marketing/Reveal';

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
        if (id === 'bh') return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
        if (id === 'ba') return 'border-amber-400/25 bg-amber-400/10 text-amber-300';
        return 'border-white/[0.08] bg-white/[0.03] text-slate-300';
    };

    return (
        <MarketingShell>
            <section className="mkt-section">
                <div className="mkt-container">
                    <SectionHead
                        eyebrow="Community"
                        title={
                            <>
                                Build <span className="mkt-accent-text">WebPulse</span> with us.
                            </>
                        }
                        description="WebPulse is built in the open. Share ideas, report problems, discuss analytics, and help shape what comes next."
                    />

                    <div className="mx-auto mt-14 max-w-5xl space-y-6">
                        <Reveal>
                            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="mkt-card mkt-card-hover group block p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 sm:p-7">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                                        <Github className="h-7 w-7 text-slate-100 transition-transform group-hover:scale-110" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold tracking-tight text-slate-100">GitHub</h2>
                                        <p className="mkt-body mt-1">
                                            Build with us. WebPulse is a public, open-source project. Explore the codebase, report issues, suggest improvements, and contribute where you can.
                                        </p>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-medium text-slate-500">Repository:</span>
                                            <code className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-1 font-mono text-xs text-slate-300">github.com/heyshreee/Web-Pulse-Analytics</code>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-300">
                                        View repository <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                                    </span>
                                </div>
                            </a>
                        </Reveal>

                        <div className="grid gap-6 md:grid-cols-2">
                            <Reveal className="h-full">
                                <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="mkt-card mkt-card-hover group flex h-full flex-col p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60">
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                                        <Lightbulb className="h-6 w-6 text-violet-300 transition-transform group-hover:scale-110" aria-hidden="true" />
                                    </div>
                                    <h2 className="text-lg font-semibold tracking-tight text-slate-100">Feature Requests</h2>
                                    <p className="mkt-body mt-2">
                                        Help decide what comes next. Tell us what you need, explain the problem you're trying to solve, and open an issue to help shape the roadmap.
                                    </p>
                                    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-violet-300">
                                        Suggest a feature <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                                    </span>
                                </a>
                            </Reveal>

                            <Reveal className="h-full" delay={70}>
                                <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="mkt-card mkt-card-hover group flex h-full flex-col p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60">
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
                                        <Bug className="h-6 w-6 text-amber-300 transition-transform group-hover:scale-110" aria-hidden="true" />
                                    </div>
                                    <h2 className="text-lg font-semibold tracking-tight text-slate-100">Bug Reports</h2>
                                    <p className="mkt-body mt-2">
                                        Found something broken? Good bug reports make WebPulse better.
                                    </p>
                                    <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                                        <li className="flex items-start gap-2"><span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-slate-500" aria-hidden="true" />What happened</li>
                                        <li className="flex items-start gap-2"><span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-slate-500" aria-hidden="true" />What you expected</li>
                                        <li className="flex items-start gap-2"><span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-slate-500" aria-hidden="true" />Steps to reproduce</li>
                                        <li className="flex items-start gap-2"><span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-slate-500" aria-hidden="true" />Browser / environment</li>
                                        <li className="flex items-start gap-2"><span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-slate-500" aria-hidden="true" />Relevant logs or screenshots</li>
                                    </ul>
                                    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-amber-300">
                                        Report an issue <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                                    </span>
                                </a>
                            </Reveal>
                        </div>

                        <Reveal>
                            <div className="mkt-card p-6">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                                        <MessageSquareText className="h-6 w-6 text-emerald-300" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold tracking-tight text-slate-100">Discussions</h2>
                                        <p className="mkt-body mt-1">
                                            Ask questions and share what you're building. Discussion on GitHub Issues is the active channel today — WebPulse doesn't run a Discord or social chat yet. Once GitHub Discussions is enabled, questions and ideas from the Issues tab will move there.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        <section className="pt-6">
                            <Reveal className="mb-6">
                                <p className="mkt-eyebrow mb-3">
                                    <Users className="h-3.5 w-3.5" aria-hidden="true" />
                                    Contributors
                                </p>
                                <h2 className="mkt-h3 !text-xl">Built by developers.</h2>
                                <p className="mkt-body mt-2">Contributors load live from the GitHub repository.</p>
                            </Reveal>
                            <Reveal>
                                <div className="mkt-card p-6">
                                    {status === 'loading' && (
                                        <div className="flex items-center gap-3">
                                            <div className="skeleton h-14 w-14 rounded-full bg-white/[0.06]" />
                                            <div className="flex-1">
                                                <div className="skeleton mb-2 h-3 w-32 rounded bg-white/[0.06]" />
                                                <div className="skeleton h-3 w-48 rounded bg-white/[0.06]" />
                                            </div>
                                        </div>
                                    )}
                                    {status === 'error' && (
                                        <p className="mkt-body">
                                            Couldn't load contributor data right now (GitHub rate limit or network). You can still
                                            {' '}<a href={CONTRIBUTORS_URL} target="_blank" rel="noopener noreferrer" className="rounded font-medium text-violet-300 transition-colors hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60">view contributors on GitHub</a>.
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
                                                        className="rounded-full transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                                    >
                                                        <img src={c.avatar_url} alt={c.login} className="h-14 w-14 rounded-full object-cover ring-2 ring-white/10" />
                                                    </a>
                                                ))}
                                            </div>
                                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                                <p className="text-sm font-medium text-slate-100">
                                                    {contributors.length} {contributors.length === 1 ? 'contributor' : 'contributors'}
                                                </p>
                                                <a href={CONTRIBUTORS_URL} target="_blank" rel="noopener noreferrer" className="mkt-link">
                                                    View on GitHub <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                                </a>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Reveal>
                        </section>

                        <section className="pt-6">
                            <Reveal className="mb-6">
                                <p className="mkt-eyebrow mb-3">
                                    <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                                    Roadmap
                                </p>
                                <h2 className="mkt-h3 !text-xl">Help shape WebPulse.</h2>
                                <p className="mkt-body mt-2">
                                    The live product, near-term priorities, and ideas being explored — tracked in the GitHub repository.
                                </p>
                            </Reveal>
                            <div className="grid gap-6 md:grid-cols-3">
                                {Object.entries(roadmap).map(([key, tier], i) => (
                                    <Reveal key={key} className="h-full" delay={(i % 3) * 70}>
                                        <div className="mkt-card h-full p-6">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${badgeClass(tier.badge)}`}>{key}</span>
                                            {key === 'now' && <p className="mt-3 text-xs font-semibold text-emerald-300">Live in WebPulse today</p>}
                                            {key === 'next' && <p className="mt-3 text-xs font-semibold text-amber-300">On the near-term roadmap — not shipped yet</p>}
                                            {key === 'exploring' && <p className="mt-3 text-xs font-semibold text-slate-400">Ideas from the repository — not available yet</p>}
                                            <ul className="mt-4 space-y-2.5">
                                                {tier.items.map((item) => (
                                                    <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                                                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-300/70" aria-hidden="true" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                            <p className="mt-4 text-xs text-slate-500">
                                Status snapshot from the repository direction. Exploring items are ideas, not current features — actual status is tracked on{' '}
                                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="rounded font-medium text-slate-300 transition-colors hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60">GitHub</a>.
                            </p>
                        </section>

                        <Reveal>
                            <section className="mkt-card p-6">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
                                        <ShieldCheck className="h-6 w-6 text-slate-300" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold tracking-tight text-slate-100">Community guidelines</h2>
                                        <p className="mkt-body mt-1">
                                            <span className="font-semibold text-slate-200">Keep it useful.</span> WebPulse is a technical community. Keep discussions constructive and on topic, respect other contributors, don't share credentials or sensitive visitor data, and provide enough context when reporting issues. Issues and pull requests follow the same spirit.
                                        </p>
                                    </div>
                                    <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded text-sm font-semibold text-violet-300 transition-colors hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60">
                                        Read community guidelines <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </a>
                                </div>
                            </section>
                        </Reveal>

                        <Reveal className="pt-10">
                            <div className="mkt-panel relative overflow-hidden px-6 py-12 text-center sm:px-12">
                                <div
                                    aria-hidden="true"
                                    className="mkt-glow left-1/2 top-[-160px] h-[320px] w-[560px] max-w-[110vw] -translate-x-1/2 bg-violet-600/20"
                                />
                                <div className="relative">
                                    <h2 className="mkt-h3 !text-2xl sm:!text-3xl">Have something to contribute?</h2>
                                    <p className="mkt-body mx-auto mt-3 max-w-xl">
                                        Whether it's a bug report, feature idea, documentation improvement, or code contribution — start with GitHub.
                                    </p>
                                    <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="mkt-btn mkt-btn-primary mkt-btn-lg mt-7">
                                        <Github className="h-4 w-4" aria-hidden="true" /> Open GitHub <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </a>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>
        </MarketingShell>
    );
}
