import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    ArrowUpRight,
    BookOpen,
    Bug,
    CircleCheck,
    CircleDot,
    Clock,
    CodeXml,
    Compass,
    FlaskConical,
    Github,
    HeartHandshake,
    Lightbulb,
    MessageSquareText,
    MessagesSquare,
    Palette,
    Radio,
    Route,
    Scale,
    Search,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Telescope,
    Users,
} from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import SectionHead from '../components/marketing/SectionHead';
import Reveal from '../components/marketing/Reveal';

const REPO_URL = 'https://github.com/heyshreee/Web-Pulse-Analytics';
const ISSUES_URL = `${REPO_URL}/issues`;
const NEW_FEATURE_URL = `${REPO_URL}/issues/new?template=feature_request.yml`;
const NEW_BUG_URL = `${REPO_URL}/issues/new?template=bug_report.yml`;
const CONTRIBUTING_URL = `${REPO_URL}/blob/main/CONTRIBUTING.md`;
const CODE_OF_CONDUCT_URL = `${REPO_URL}/blob/main/CODE_OF_CONDUCT.md`;
const RELEASES_URL = `${REPO_URL}/releases`;
const CONTRIBUTORS_URL = `${REPO_URL}/graphs/contributors`;
const CONTRIBUTORS_API = 'https://api.github.com/repos/heyshreee/Web-Pulse-Analytics/contributors?per_page=100';

/* ---------------------------------------------------------------------------
   SEO — the SPA has a single static <head>, so the community route sets its
   own title, description, and canonical tags and restores the previous values
   on unmount.
--------------------------------------------------------------------------- */

const SEO_TITLE = 'WebPulse Community — Build WebPulse With Us';
const SEO_DESCRIPTION =
    'Join the WebPulse open-source community. Share ideas, report bugs, contribute code or documentation, and help shape the future of real-time web analytics.';
const SEO_URL = 'https://obs-real-time-tracker.vercel.app/community';

const SEO_META = [
    { selector: 'meta[name="description"]', name: 'description', content: SEO_DESCRIPTION },
    { selector: 'meta[property="og:title"]', property: 'og:title', content: SEO_TITLE },
    { selector: 'meta[property="og:description"]', property: 'og:description', content: SEO_DESCRIPTION },
    { selector: 'meta[property="og:url"]', property: 'og:url', content: SEO_URL },
    { selector: 'meta[name="twitter:title"]', name: 'twitter:title', content: SEO_TITLE },
    { selector: 'meta[name="twitter:description"]', name: 'twitter:description', content: SEO_DESCRIPTION },
];

function useCommunitySeo() {
    useEffect(() => {
        const previousTitle = document.title;
        const previousMeta = SEO_META.map(({ selector }) => {
            const tag = document.head.querySelector(selector);
            return {
                selector,
                existed: Boolean(tag),
                content: tag?.getAttribute('content') ?? null,
            };
        });
        const canonical = document.head.querySelector('link[rel="canonical"]');
        const previousCanonical = canonical?.getAttribute('href') ?? null;

        document.title = SEO_TITLE;
        SEO_META.forEach(({ selector, name, property, content }) => {
            let tag = document.head.querySelector(selector);
            if (!tag) {
                tag = document.createElement('meta');
                if (name) tag.setAttribute('name', name);
                if (property) tag.setAttribute('property', property);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        });
        if (canonical) canonical.setAttribute('href', SEO_URL);

        return () => {
            document.title = previousTitle;
            previousMeta.forEach(({ selector, existed, content }) => {
                const tag = document.head.querySelector(selector);
                if (!tag) return;
                if (!existed) {
                    tag.remove();
                } else if (content !== null) {
                    tag.setAttribute('content', content);
                }
            });
            if (canonical && previousCanonical !== null) {
                canonical.setAttribute('href', previousCanonical);
            }
        };
    }, []);
}

/* ---------------------------------------------------------------------------
   Contributor data. The deployment ships a strict CSP, so only attempt the
   GitHub request when the policy allows it. This avoids noisy console errors
   and falls back to the GitHub contributors page — the source of truth.
--------------------------------------------------------------------------- */

function directiveAllows(directive, url) {
    if (typeof document === 'undefined') return false;
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!meta) return true;

    const policy = meta.getAttribute('content') || '';
    const directives = {};
    policy.split(';').forEach((part) => {
        const [name, ...sources] = part.trim().split(/\s+/);
        if (name) directives[name.toLowerCase()] = sources;
    });

    const sources = directives[directive] || directives['default-src'];
    if (!sources || sources.length === 0) return true;
    if (sources.includes('*')) return true;

    let target;
    try {
        target = new URL(url);
    } catch {
        return false;
    }

    return sources.some((source) => {
        if (source === "'self'") return false;
        if (source === target.protocol) return true;

        if (source.startsWith('*.')) {
            const suffix = source.slice(2);
            return target.hostname === suffix || target.hostname.endsWith(`.${suffix}`);
        }

        try {
            const parsed = new URL(
                source.includes('://') ? source : `${target.protocol}//${source}`
            );
            return parsed.hostname === target.hostname;
        } catch {
            return false;
        }
    });
}

function initials(login = '') {
    return login.slice(0, 2).toUpperCase();
}

function useContributors() {
    const [contributors, setContributors] = useState([]);
    const [avatarsAllowed] = useState(() =>
        directiveAllows('img-src', 'https://avatars.githubusercontent.com/u/1?v=4')
    );
    const [status, setStatus] = useState(() =>
        directiveAllows('connect-src', CONTRIBUTORS_API) ? 'loading' : 'unavailable'
    );

    useEffect(() => {
        if (status !== 'loading') return undefined;

        let active = true;

        fetch(CONTRIBUTORS_API, { headers: { Accept: 'application/vnd.github+json' } })
            .then((res) => {
                if (!res.ok) throw new Error(`GitHub API ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (!active) return;
                setContributors(Array.isArray(data) ? data : []);
                setStatus('loaded');
            })
            .catch(() => {
                if (!active) return;
                setStatus('error');
            });

        return () => {
            active = false;
        };
    }, [status]);

    return { contributors, status, avatarsAllowed };
}

/* ---------------------------------------------------------------------------
   Content
--------------------------------------------------------------------------- */

/* Decorative mosaic — a fixed pattern keeps the preview stable between visits. */
const CONTRIBUTION_COLUMNS = [
    [0, 0, 1, 0, 0, 2, 1],
    [0, 1, 0, 2, 1, 0, 0],
    [1, 0, 0, 1, 0, 2, 1],
    [0, 0, 2, 0, 1, 0, 3],
    [2, 1, 0, 1, 0, 1, 0],
    [0, 0, 1, 0, 2, 0, 1],
    [1, 2, 0, 1, 0, 3, 0],
    [0, 1, 0, 2, 1, 0, 1],
    [2, 0, 1, 0, 0, 2, 0],
    [0, 3, 0, 1, 2, 0, 1],
    [1, 0, 2, 0, 1, 0, 0],
    [0, 1, 0, 1, 0, 2, 1],
    [2, 0, 1, 0, 3, 0, 0],
    [0, 1, 0, 2, 0, 1, 2],
];

const CONTRIBUTION_CELLS = CONTRIBUTION_COLUMNS.flat();

const CONTRIBUTION_TONES = [
    'bg-white/[0.05]',
    'bg-violet-500/20',
    'bg-violet-500/40',
    'bg-violet-400/65',
    'bg-violet-300/90',
];

const CONTRIBUTION_WAYS = [
    {
        icon: CodeXml,
        title: 'Code',
        body: 'Fix bugs, improve reliability, and implement features.',
    },
    {
        icon: BookOpen,
        title: 'Documentation',
        body: 'Clarify setup instructions, examples, and API references.',
    },
    {
        icon: FlaskConical,
        title: 'Testing',
        body: 'Reproduce issues, verify fixes, and identify edge cases.',
    },
    {
        icon: Palette,
        title: 'Design',
        body: 'Improve usability, accessibility, and the dashboard experience.',
    },
    {
        icon: Lightbulb,
        title: 'Ideas',
        body: 'Share use cases and explain what would make WebPulse more useful.',
    },
];

const ROADMAP = [
    {
        key: 'now',
        title: 'Available today',
        status: 'Live now',
        icon: Radio,
        description: 'Features currently available in the released product.',
        items: [
            'Real-time website analytics',
            'Visitor and session tracking',
            'Project-level analytics dashboard',
        ],
        itemIcon: CircleCheck,
        tone: {
            icon: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
            chip: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
            marker: 'text-emerald-300',
        },
    },
    {
        key: 'next',
        title: 'On the roadmap',
        status: 'Planned',
        icon: Route,
        description: 'Potential improvements being considered or planned for future releases.',
        items: [
            'More detailed analytics and insights',
            'Improved reporting capabilities',
            'Additional integrations',
        ],
        itemIcon: CircleDot,
        tone: {
            icon: 'border-violet-400/20 bg-violet-500/10 text-violet-300',
            chip: 'border-violet-400/25 bg-violet-500/10 text-violet-300',
            marker: 'text-violet-300',
        },
    },
    {
        key: 'exploring',
        title: "Ideas we're exploring",
        status: 'Exploring',
        icon: Telescope,
        description: 'Longer-term possibilities that need further investigation and prioritization.',
        items: [
            'Advanced audience segmentation',
            'Machine-learning-based anomaly detection',
            'Mobile analytics support',
            'Expanded data export options',
        ],
        itemIcon: Sparkles,
        tone: {
            icon: 'border-white/[0.08] bg-white/[0.03] text-slate-300',
            chip: 'border-white/[0.08] bg-white/[0.03] text-slate-400',
            marker: 'text-slate-500',
        },
    },
];

const GUIDELINES = [
    {
        icon: HeartHandshake,
        title: 'Be respectful',
        body: 'Discuss ideas and technical decisions constructively. Critique the work, not the person.',
    },
    {
        icon: MessageSquareText,
        title: 'Provide context',
        body: 'Explain the problem, share reproducible steps, and include relevant technical details.',
    },
    {
        icon: ShieldAlert,
        title: 'Protect sensitive information',
        body: 'Never publish credentials, access tokens, private visitor information, or confidential security details in public discussions.',
    },
    {
        icon: Search,
        title: 'Search before posting',
        body: 'Check existing issues and discussions to avoid duplicates and build on previous work.',
    },
    {
        icon: Clock,
        title: "Respect contributors' time",
        body: "Keep reports focused, follow up with requested details, and understand that open-source contributions may take time to review.",
    },
    {
        icon: Scale,
        title: 'Follow project conventions',
        body: "Read the contribution guidelines and respect the repository's review and release processes.",
    },
];

const START_STEPS = [
    {
        title: 'Read the contribution guidelines',
        body: 'Learn the workflow, local setup, and review expectations.',
    },
    {
        title: 'Check existing issues',
        body: 'Build on previous work and look for good first issues or help wanted labels.',
    },
    {
        title: 'Ask questions before a large change',
        body: 'Keep the scope clear and aligned with the project before you invest time.',
    },
];

const CARD_TONES = {
    violet: {
        iconBox: 'border-violet-400/20 bg-violet-500/10',
        icon: 'text-violet-300',
        link: 'text-violet-300 group-hover:text-violet-200',
        bullet: 'bg-violet-400/80',
    },
    amber: {
        iconBox: 'border-amber-400/20 bg-amber-400/10',
        icon: 'text-amber-300',
        link: 'text-amber-300 group-hover:text-amber-200',
        bullet: 'bg-amber-400/80',
    },
    emerald: {
        iconBox: 'border-emerald-400/20 bg-emerald-400/10',
        icon: 'text-emerald-300',
        link: 'text-emerald-300 group-hover:text-emerald-200',
        bullet: 'bg-emerald-400/80',
    },
    slate: {
        iconBox: 'border-white/[0.1] bg-white/[0.04]',
        icon: 'text-slate-100',
        link: 'text-violet-300 group-hover:text-violet-200',
        bullet: 'bg-slate-500',
    },
};

/* ---------------------------------------------------------------------------
   Small presentational pieces
--------------------------------------------------------------------------- */

function ContributionMosaic() {
    return (
        <div className="grid grid-flow-col grid-rows-7 gap-1.5" aria-hidden="true">
            {CONTRIBUTION_CELLS.map((level, i) => (
                <span
                    key={i}
                    className={`h-2.5 w-2.5 rounded-[3px] sm:h-3.5 sm:w-3.5 ${CONTRIBUTION_TONES[level]}`}
                />
            ))}
        </div>
    );
}

function HeroRepoPreview() {
    return (
        <div className="mkt-panel relative p-2">
            <div
                aria-hidden="true"
                className="mkt-glow right-[-70px] top-[-90px] h-[240px] w-[240px] bg-violet-600/25"
            />
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0B0F17]/80">
                <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3.5">
                    <a
                        href={REPO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                    >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                            <Github className="h-4 w-4 text-slate-200" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-xs font-semibold text-slate-200 transition-colors group-hover:text-violet-200">
                                heyshreee / Web-Pulse-Analytics
                            </span>
                            <span className="block text-[10px] text-slate-500">
                                Public repository
                            </span>
                        </span>
                    </a>
                    <span className="shrink-0 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-300">
                        Open source
                    </span>
                </div>

                <div className="px-5 py-5">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Contribution activity
                        </p>
                        <span className="text-[10px] text-slate-600">Illustrative</span>
                    </div>
                    <div className="mt-4 flex justify-center sm:justify-start">
                        <ContributionMosaic />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-slate-500">
                        <span>Every contribution counts.</span>
                        <span className="flex items-center gap-1" aria-hidden="true">
                            Less
                            <span className="ml-1 flex gap-1">
                                {CONTRIBUTION_TONES.map((tone) => (
                                    <span key={tone} className={`h-2 w-2 rounded-[2px] ${tone}`} />
                                ))}
                            </span>
                            <span className="ml-1">More</span>
                        </span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                        <span className="mkt-chip !py-1 !text-[10px]">
                            <ShieldCheck className="h-3 w-3 text-emerald-300" aria-hidden="true" />
                            MIT licensed
                        </span>
                        <span className="mkt-chip !py-1 !text-[10px]">
                            <Radio className="h-3 w-3 text-violet-300" aria-hidden="true" />
                            V1 preview
                        </span>
                        <span className="mkt-chip !py-1 !text-[10px]">
                            <Users className="h-3 w-3 text-slate-300" aria-hidden="true" />
                            Contributions welcome
                        </span>
                    </div>
                </div>

                <div className="grid gap-2 border-t border-white/[0.06] p-3 sm:grid-cols-2">
                    <a
                        href={CONTRIBUTING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-[11px] font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                    >
                        Contribution guidelines
                        <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                    </a>
                    <a
                        href={ISSUES_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-[11px] font-medium text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                    >
                        Open issues
                        <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                    </a>
                </div>
            </div>
            <p className="relative px-3 pb-1 pt-3 text-center text-[10px] text-slate-500">
                Illustrative contribution activity. Live repository data is on GitHub.
            </p>
        </div>
    );
}

function InvolvedCard({
    icon,
    tone = 'violet',
    title,
    subtitle,
    body,
    items,
    href,
    linkLabel,
    extra,
    featured = false,
    className = '',
}) {
    const Icon = icon;
    const styles = CARD_TONES[tone] || CARD_TONES.violet;

    return (
        <article
            className={`mkt-card mkt-card-hover group relative flex h-full flex-col overflow-hidden p-6 sm:p-7 ${className}`}
        >
            {featured && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-violet-600/15 blur-3xl"
                />
            )}
            <div className="relative">
                <div className="flex items-start justify-between gap-3">
                    <span
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border ${styles.iconBox}`}
                    >
                        <Icon
                            className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${styles.icon}`}
                            aria-hidden="true"
                        />
                    </span>
                    {featured && (
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Open source
                        </span>
                    )}
                </div>

                <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-100">
                    {title}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-300">{subtitle}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{body}</p>

                {items && items.length > 0 && (
                    <ul className="mt-5 space-y-2">
                        {items.map((item) => (
                            <li
                                key={item}
                                className="flex items-start gap-2 text-sm text-slate-400"
                            >
                                <span
                                    className={`mt-[0.45rem] h-1 w-1 shrink-0 rounded-full ${styles.bullet}`}
                                    aria-hidden="true"
                                />
                                {item}
                            </li>
                        ))}
                    </ul>
                )}

                {extra && <div className="mt-5">{extra}</div>}
            </div>

            <div className="mt-auto pt-6">
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 rounded text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${styles.link}`}
                >
                    {linkLabel}
                    <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                    />
                </a>
            </div>
        </article>
    );
}

function ContributorsCard() {
    const { contributors, status, avatarsAllowed } = useContributors();
    const visibleContributors = contributors.slice(0, 6);

    return (
        <article className="mkt-card flex h-full flex-col p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-100">
                        Meet the contributors
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                        WebPulse contributions can come from developers, testers, designers,
                        technical writers, and analytics enthusiasts.
                    </p>
                </div>
                <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 sm:flex">
                    <Users className="h-5 w-5 text-violet-300" aria-hidden="true" />
                </span>
            </div>

            <div className="mt-6 flex-1">
                {status === 'loading' && (
                    <>
                        <div className="grid gap-2 sm:grid-cols-2" aria-hidden="true">
                            {[0, 1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5"
                                >
                                    <span className="skeleton h-10 w-10 shrink-0 rounded-full bg-white/[0.06]" />
                                    <span className="min-w-0 flex-1">
                                        <span className="skeleton mb-2 block h-2.5 w-20 rounded bg-white/[0.06]" />
                                        <span className="skeleton block h-2.5 w-14 rounded bg-white/[0.05]" />
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="sr-only" role="status">
                            Loading contributors from GitHub.
                        </p>
                    </>
                )}

                {status === 'loaded' && contributors.length > 0 && (
                    <>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {visibleContributors.map((contributor) => (
                                <a
                                    key={contributor.id}
                                    href={contributor.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 transition-colors hover:border-violet-400/25 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                >
                                    {avatarsAllowed && contributor.avatar_url ? (
                                        <img
                                            src={contributor.avatar_url}
                                            alt=""
                                            loading="lazy"
                                            width="40"
                                            height="40"
                                            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/10"
                                        />
                                    ) : (
                                        <span
                                            aria-hidden="true"
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/35 to-violet-500/10 text-xs font-semibold text-violet-200 ring-2 ring-white/10"
                                        >
                                            {initials(contributor.login)}
                                        </span>
                                    )}
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold text-slate-200 transition-colors group-hover:text-violet-200">
                                            {contributor.login}
                                        </span>
                                        <span className="metric-num block text-[11px] text-slate-500">
                                            {contributor.contributions}{' '}
                                            {contributor.contributions === 1
                                                ? 'contribution'
                                                : 'contributions'}
                                        </span>
                                    </span>
                                </a>
                            ))}
                        </div>
                        {contributors.length > visibleContributors.length && (
                            <a
                                href={CONTRIBUTORS_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mkt-link mt-4 !text-xs"
                            >
                                View all {contributors.length} contributors
                                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                        )}
                    </>
                )}

                {status === 'loaded' && contributors.length === 0 && (
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                        <p className="text-sm leading-relaxed text-slate-400">
                            Contributor details aren&apos;t listed yet. The GitHub contributors
                            page remains the source of truth for the current list.
                        </p>
                    </div>
                )}

                {(status === 'unavailable' || status === 'error') && (
                    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                        <div className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                                <Github
                                    className="h-4 w-4 text-slate-300"
                                    aria-hidden="true"
                                />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-slate-200">
                                    {status === 'unavailable'
                                        ? 'Contributor details are available on GitHub.'
                                        : "Contributor details couldn't be loaded right now."}
                                </p>
                                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                                    The GitHub contributors page remains the source of truth for
                                    current contributors and their work.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                            {[
                                { label: 'Contributors', href: CONTRIBUTORS_URL },
                                { label: 'Commit history', href: `${REPO_URL}/commits/main` },
                                { label: 'Pull requests', href: `${REPO_URL}/pulls` },
                            ].map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[11px] font-medium text-slate-400 transition-colors hover:border-violet-400/25 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                >
                                    {item.label}
                                    <ArrowUpRight
                                        className="h-3 w-3 shrink-0"
                                        aria-hidden="true"
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] leading-relaxed text-slate-500">
                    Contributor information is sourced from the project&apos;s GitHub repository
                    when available.
                </p>
                <a
                    href={CONTRIBUTORS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mkt-link shrink-0 !text-xs"
                >
                    View contributors
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
            </div>
        </article>
    );
}

/* ---------------------------------------------------------------------------
   Page
--------------------------------------------------------------------------- */

export default function Community() {
    useCommunitySeo();

    return (
        <MarketingShell tone="hero">
            {/* Hero */}
            <section className="relative pb-14 pt-10 sm:pt-14 lg:pb-20">
                <div className="mkt-container">
                    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                        <Reveal>
                            <p className="mkt-eyebrow">Community · Open source</p>
                            <h1 className="mkt-h1 mt-5">
                                Build <span className="mkt-accent-text">WebPulse</span> with us.
                            </h1>
                            <p className="mkt-lead mt-6 max-w-xl">
                                WebPulse is an open-source analytics platform shaped by the people
                                who use it, test it, and contribute to it. Share ideas, report bugs,
                                improve the documentation, or help build what comes next.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <a
                                    href={REPO_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mkt-btn mkt-btn-primary mkt-btn-lg"
                                >
                                    <Github className="h-4 w-4" aria-hidden="true" />
                                    Explore GitHub
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </a>
                                <a
                                    href={NEW_BUG_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mkt-btn mkt-btn-secondary mkt-btn-lg"
                                >
                                    <Bug className="h-4 w-4" aria-hidden="true" />
                                    Report a bug
                                </a>
                            </div>

                            <p className="mt-6 max-w-md text-xs leading-relaxed text-slate-500">
                                No contribution is too small. Start with a question, an issue, or
                                your first pull request.
                            </p>
                        </Reveal>

                        <Reveal delay={100}>
                            <HeroRepoPreview />
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* Get involved */}
            <section id="get-involved" className="relative border-t border-white/[0.06] py-16 lg:py-24">
                <div className="mkt-container">
                    <SectionHead
                        eyebrow="Get involved"
                        title="There are many ways to help WebPulse grow."
                        description="Choose a starting point that matches your interests and experience. Every path leads back to the same place: building a better, more useful analytics platform in the open."
                    />

                    <div className="mt-12 grid gap-5 lg:grid-cols-12">
                        <Reveal className="lg:col-span-7">
                            <InvolvedCard
                                icon={Github}
                                tone="slate"
                                featured
                                title="GitHub"
                                subtitle="Explore the code. Help improve the product."
                                body="WebPulse is developed in the open. Explore the source code, understand how the platform works, review existing issues, and contribute improvements."
                                items={[
                                    'Browse the application source code',
                                    'Find issues that need attention',
                                    'Submit fixes and improvements',
                                    "Review the project's contribution guidelines",
                                ]}
                                href={REPO_URL}
                                linkLabel="Explore the repository"
                                extra={
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[11px] font-medium text-slate-500">
                                            Repository
                                        </span>
                                        <code className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-slate-300">
                                            github.com/heyshreee/Web-Pulse-Analytics
                                        </code>
                                    </div>
                                }
                            />
                        </Reveal>

                        <Reveal className="lg:col-span-5" delay={70}>
                            <InvolvedCard
                                icon={Lightbulb}
                                tone="violet"
                                title="Feature requests"
                                subtitle="Have an idea that would make WebPulse better?"
                                body="Tell us what you're trying to accomplish, what's missing today, and how the improvement would help. Clear proposals help us understand real user needs and prioritize the roadmap."
                                items={[
                                    "The problem you're experiencing",
                                    'Your proposed solution or workflow',
                                    'Who would benefit from the change',
                                    'Examples or screenshots, where useful',
                                ]}
                                href={NEW_FEATURE_URL}
                                linkLabel="Suggest a feature"
                            />
                        </Reveal>

                        <Reveal className="lg:col-span-5" delay={70}>
                            <InvolvedCard
                                icon={Bug}
                                tone="amber"
                                title="Bug reports"
                                subtitle="Found something that doesn't work as expected?"
                                body="Help us reproduce the problem and understand its impact. A clear bug report makes it easier to investigate, fix, and verify the issue."
                                items={[
                                    'What happened',
                                    'What you expected to happen',
                                    'Steps to reproduce the issue',
                                    'Browser, operating system, and environment',
                                    'Relevant error messages or screenshots',
                                ]}
                                href={NEW_BUG_URL}
                                linkLabel="Report a bug"
                                extra={
                                    <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/15 bg-amber-400/[0.06] p-3.5">
                                        <ShieldAlert
                                            className="mt-0.5 h-4 w-4 shrink-0 text-amber-300"
                                            aria-hidden="true"
                                        />
                                        <p className="text-xs leading-relaxed text-amber-100/80">
                                            Never include passwords, API secrets, session tokens,
                                            or private visitor data in a public issue.
                                        </p>
                                    </div>
                                }
                            />
                        </Reveal>

                        <Reveal className="lg:col-span-7" delay={140}>
                            <InvolvedCard
                                icon={MessagesSquare}
                                tone="emerald"
                                title="Discussions"
                                subtitle="Ask questions. Share ideas. Learn from other developers."
                                body="Have a question about WebPulse, want feedback on an integration, or have an idea worth discussing? Start with the project's available GitHub communication channels."
                                href={ISSUES_URL}
                                linkLabel="Visit GitHub"
                                extra={
                                    <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4">
                                        <p className="text-xs leading-relaxed text-emerald-100/80">
                                            GitHub Issues is the current place to report problems
                                            and propose improvements. General questions and
                                            community discussions should use GitHub Discussions
                                            once that feature is enabled.
                                        </p>
                                    </div>
                                }
                            />
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* Contributors */}
            <section id="contributors" className="relative border-t border-white/[0.06] py-16 lg:py-24">
                <div className="mkt-container">
                    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                        <Reveal>
                            <p className="mkt-eyebrow">Made better by contributors</p>
                            <h2 className="mkt-h2 mt-4 max-w-2xl">
                                Every contribution moves the project forward.
                            </h2>
                        </Reveal>
                        <Reveal delay={70}>
                            <p className="mkt-lead !text-base">
                                You don&apos;t need to be an experienced maintainer to help.
                                Contributions can include fixing a bug, improving a confusing
                                instruction, testing a release, reporting an issue, or proposing a
                                useful feature.
                            </p>
                        </Reveal>
                    </div>

                    <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {CONTRIBUTION_WAYS.map((way, index) => {
                            const Icon = way.icon;
                            return (
                                <Reveal key={way.title} delay={(index % 5) * 60} className="h-full">
                                    <article className="mkt-card mkt-card-hover h-full p-5">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10">
                                            <Icon
                                                className="h-4 w-4 text-violet-300"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <h3 className="mt-4 text-sm font-semibold text-slate-100">
                                            {way.title}
                                        </h3>
                                        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                                            {way.body}
                                        </p>
                                    </article>
                                </Reveal>
                            );
                        })}
                    </div>

                    <div className="mt-6 grid gap-5 lg:grid-cols-12">
                        <Reveal className="lg:col-span-5">
                            <article className="mkt-card flex h-full flex-col p-6 sm:p-7">
                                <div className="flex items-start justify-between gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                                        <Compass
                                            className="h-5 w-5 text-violet-300"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                        3 steps
                                    </span>
                                </div>
                                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300/90">
                                    New to open source?
                                </p>
                                <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-100">
                                    Start small. Take your time.
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                                    Read the contribution guidelines, check existing issues, and
                                    ask questions before beginning a large change.
                                </p>

                                <ol className="mt-6 space-y-4">
                                    {START_STEPS.map((step, index) => (
                                        <li key={step.title} className="flex gap-3">
                                            <span className="metric-num flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[10px] font-semibold text-violet-300">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <span>
                                                <span className="block text-sm font-medium text-slate-200">
                                                    {step.title}
                                                </span>
                                                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                                                    {step.body}
                                                </span>
                                            </span>
                                        </li>
                                    ))}
                                </ol>

                                <div className="mt-auto pt-6">
                                    <a
                                        href={ISSUES_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mkt-link !text-sm"
                                    >
                                        Find an issue to work on
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </a>
                                </div>
                            </article>
                        </Reveal>

                        <Reveal className="lg:col-span-7" delay={70}>
                            <ContributorsCard />
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* Roadmap */}
            <section id="roadmap" className="relative border-t border-white/[0.06] py-16 lg:py-24">
                <div className="mkt-container">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <Reveal className="max-w-2xl">
                            <p className="mkt-eyebrow">Roadmap</p>
                            <h2 className="mkt-h2 mt-4">
                                Built in the open. Evolving with the community.
                            </h2>
                            <p className="mkt-lead mt-4">
                                See what&apos;s available today, what we&apos;re working toward,
                                and which ideas are still being explored. Roadmap items are not
                                promises of release dates; their status can change as development
                                progresses.
                            </p>
                        </Reveal>
                        <Reveal delay={70} className="shrink-0">
                            <a
                                href={ISSUES_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mkt-link !text-sm"
                            >
                                Explore the roadmap on GitHub
                                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                        </Reveal>
                    </div>

                    <div className="mt-10">
                        <Reveal>
                            <div className="mkt-panel overflow-hidden">
                                <div className="grid divide-y divide-white/[0.06] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
                                    {ROADMAP.map((phase) => {
                                        const Icon = phase.icon;
                                        const ItemIcon = phase.itemIcon;
                                        return (
                                            <div
                                                key={phase.key}
                                                className="flex h-full flex-col p-6 sm:p-8"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <span
                                                        className={`flex h-10 w-10 items-center justify-center rounded-xl border ${phase.tone.icon}`}
                                                    >
                                                        <Icon
                                                            className="h-5 w-5"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                    <span
                                                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${phase.tone.chip}`}
                                                    >
                                                        {phase.status}
                                                    </span>
                                                </div>
                                                <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-100">
                                                    {phase.title}
                                                </h3>
                                                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                                                    {phase.description}
                                                </p>
                                                <ul className="mt-6 space-y-3 border-t border-white/[0.06] pt-5">
                                                    {phase.items.map((item) => (
                                                        <li
                                                            key={item}
                                                            className="flex items-start gap-2.5 text-sm text-slate-300"
                                                        >
                                                            <ItemIcon
                                                                className={`mt-0.5 h-4 w-4 shrink-0 ${phase.tone.marker}`}
                                                                aria-hidden="true"
                                                            />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Reveal>
                        <p className="mt-4 text-xs leading-relaxed text-slate-500">
                            Roadmap labels reflect the project&apos;s current direction. Refer to
                            the repository and{' '}
                            <a
                                href={RELEASES_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded font-medium text-slate-300 transition-colors hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                            >
                                release notes
                            </a>{' '}
                            for the latest implementation status.
                        </p>
                    </div>
                </div>
            </section>

            {/* Guidelines */}
            <section id="guidelines" className="relative border-t border-white/[0.06] py-16 lg:py-24">
                <div className="mkt-container">
                    <SectionHead
                        eyebrow="Community guidelines"
                        title="Keep it constructive. Keep it useful."
                        description="We want WebPulse to be a welcoming, practical place for people who care about building better software."
                    />

                    <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {GUIDELINES.map((guideline, index) => {
                            const Icon = guideline.icon;
                            return (
                                <Reveal
                                    key={guideline.title}
                                    delay={(index % 3) * 60}
                                    className="h-full"
                                >
                                    <article className="mkt-card mkt-card-hover h-full p-6">
                                        <div className="flex items-start justify-between gap-3">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
                                                <Icon
                                                    className="h-5 w-5 text-violet-300"
                                                    aria-hidden="true"
                                                />
                                            </span>
                                            <span className="metric-num text-[10px] font-semibold text-slate-600">
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                        </div>
                                        <h3 className="mt-5 text-base font-semibold tracking-tight text-slate-100">
                                            {guideline.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-400">
                                            {guideline.body}
                                        </p>
                                    </article>
                                </Reveal>
                            );
                        })}
                    </div>

                    <Reveal className="mt-6">
                        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:p-6">
                            <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
                                By participating, you agree to follow the project&apos;s
                                contribution guidelines and code of conduct.
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <a
                                    href={CONTRIBUTING_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mkt-btn mkt-btn-secondary mkt-btn-md"
                                >
                                    Contribution guidelines
                                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </a>
                                <a
                                    href={CODE_OF_CONDUCT_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mkt-btn mkt-btn-ghost mkt-btn-md"
                                >
                                    Code of conduct
                                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </a>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Closing CTA */}
            <section className="relative pb-20 lg:pb-24">
                <div className="mkt-container">
                    <Reveal>
                        <div className="mkt-panel relative overflow-hidden px-6 py-12 text-center sm:px-12">
                            <div
                                aria-hidden="true"
                                className="mkt-glow left-1/2 top-[-160px] h-[320px] w-[560px] max-w-[110vw] -translate-x-1/2 bg-violet-600/20"
                            />
                            <div className="relative">
                                <p className="mkt-eyebrow justify-center">Ready to contribute?</p>
                                <h2 className="mkt-h2 mt-4">Help shape what WebPulse becomes.</h2>
                                <p className="mkt-lead mx-auto mt-4 max-w-2xl !text-base">
                                    Whether you have a bug fix, a feature idea, a documentation
                                    improvement, or simply a question, the best place to begin is
                                    the project&apos;s GitHub repository.
                                </p>
                                <p className="mt-3 text-sm text-slate-500">
                                    Explore the code. Share feedback. Make your first contribution.
                                </p>
                                <div className="mt-8 flex flex-wrap justify-center gap-3">
                                    <a
                                        href={REPO_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mkt-btn mkt-btn-primary mkt-btn-lg"
                                    >
                                        <Github className="h-4 w-4" aria-hidden="true" />
                                        Open GitHub
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </a>
                                    <Link
                                        to="/register"
                                        className="mkt-btn mkt-btn-secondary mkt-btn-lg"
                                    >
                                        Start tracking free
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
        </MarketingShell>
    );
}
