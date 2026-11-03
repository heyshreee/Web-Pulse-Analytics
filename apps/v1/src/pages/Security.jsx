import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, ArrowUpRight, CheckCircle2, AlertTriangle,
    KeyRound, LockKeyhole, Users, Radar, ShieldCheck, Server, GitBranch,
    ClipboardList, ListChecks, ChevronRight, Globe
} from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import Reveal from '../components/marketing/Reveal';
import { apiRequest } from '../utils/api';

/* ---------------------------------------------------------------------------
   Links
   --------------------------------------------------------------------------- */

const REPO_URL = 'https://github.com/heyshreee/Web-Pulse-Analytics';
const SECURITY_POLICY_URL = `${REPO_URL}/blob/HEAD/SECURITY.md`;
const ADVISORY_URL = `${REPO_URL}/security/advisories/new`;
const DEVELOPER_SECURITY_URL = `${REPO_URL}/blob/HEAD/docs/security.md`;

/* ---------------------------------------------------------------------------
   SEO — the SPA has a single static <head>, so the security route sets its own
   title, description, and canonical tags and restores the previous values on
   unmount (same pattern as the features and community pages).
   --------------------------------------------------------------------------- */

const SEO_TITLE = 'Security at WebPulse | Authentication, Data Protection & Disclosure';
const SEO_DESCRIPTION =
    'Learn how WebPulse handles authentication, project isolation, tracking security, data protection, and responsible vulnerability disclosure.';
const SEO_URL = 'https://obs-real-time-tracker.vercel.app/security';

const SEO_META = [
    { selector: 'meta[name="description"]', name: 'description', content: SEO_DESCRIPTION },
    { selector: 'meta[property="og:title"]', property: 'og:title', content: SEO_TITLE },
    { selector: 'meta[property="og:description"]', property: 'og:description', content: SEO_DESCRIPTION },
    { selector: 'meta[property="og:url"]', property: 'og:url', content: SEO_URL },
    { selector: 'meta[name="twitter:title"]', name: 'twitter:title', content: SEO_TITLE },
    { selector: 'meta[name="twitter:description"]', name: 'twitter:description', content: SEO_DESCRIPTION },
];

function useSecuritySeo() {
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
   Page structure
   --------------------------------------------------------------------------- */

const NAV_GROUPS = [
    {
        id: 'group-identity',
        label: 'Identity & access',
        blurb: 'How an account proves who it is, and how one account stays separate from another.',
        sections: [
            { id: 'credentials', label: 'Credentials' },
            { id: 'authentication', label: 'Authentication' },
            { id: 'isolation', label: 'Project isolation' },
        ],
    },
    {
        id: 'group-data',
        label: 'Data & infrastructure',
        blurb: 'What happens to a tracking request, what it leaves behind, and how long it stays.',
        sections: [
            { id: 'tracking', label: 'Tracking security' },
            { id: 'abuse', label: 'Abuse prevention' },
            { id: 'data', label: 'Data protection' },
        ],
    },
    {
        id: 'group-operations',
        label: 'Operations & accountability',
        blurb: 'How the code is checked before release, and how to reach us when something is wrong.',
        sections: [
            { id: 'development', label: 'Secure development' },
            { id: 'disclosure', label: 'Responsible disclosure' },
            { id: 'checklist', label: 'Deployment checklist' },
        ],
    },
];

const ALL_SECTIONS = NAV_GROUPS.flatMap((group) =>
    group.sections.map((section) => ({ ...section, groupId: group.id }))
);

const OVERVIEW = [
    {
        icon: LockKeyhole,
        title: 'Account security',
        summary: 'Hashed passwords, verified email, and server-checked sessions.',
        points: [
            'Passwords are hashed with bcrypt; plaintext is never stored',
            'Email and password or Google sign-in, with a verification step',
            'Every protected API route verifies the session token on the server',
            'Sessions can be listed and revoked from Account Settings',
            'Multi-factor authentication is not available yet',
        ],
    },
    {
        icon: Users,
        title: 'Project isolation',
        summary: 'Project data is scoped to the owning account in the API, not in the interface.',
        points: [
            'Analytics, settings, activity logs, notifications, and receipts are owner-scoped',
            'A project identifier belonging to another account is treated as not found',
            'A project can publish one revocable, read-only report link',
        ],
    },
    {
        icon: ShieldCheck,
        title: 'Abuse controls',
        summary: 'Public tracking endpoints are validated, rate limited, and bot filtered.',
        points: [
            'Per-IP rate limits, with rejections recorded in the activity log',
            'Sign-in, password reset, and verification endpoints are rate limited per account',
            'Known bots are filtered before any visitor is recorded',
            'Allowed origins per project; disabled projects stop accepting events',
            'Plan limits are enforced on the server',
        ],
    },
];

const CHECKLIST = [
    'Serve the dashboard and tracking API over HTTPS',
    'Keep account credentials server-side — environment variables or a secret manager',
    'Never commit console credentials to a repository',
    'Treat the tracking ID as a public identifier — it is not a secret',
    "Set allowed origins to your site's domains before running heavy browser tracking",
    'Review activity logs for blocked-origin and rate-limit events',
    'Revoke share links when a report should no longer be public',
    'Publish a privacy notice and obtain consent where your jurisdiction requires it for visitor tracking',
    'Keep dependencies updated',
];

const DATA_LIFECYCLE = [
    {
        term: 'In transit',
        detail:
            'Production dashboard, API, and tracking traffic is served over HTTPS/TLS, and session cookies are marked Secure in production. The visitor IP address that is used to derive a location is sent to the geolocation provider over HTTPS, and is not sent at all when the offline lookup is used.',
    },
    {
        term: 'What is stored',
        detail:
            'For each recorded visit: IP address, user agent, derived country and city, device type, browser, operating system, page URL and title, referrer, and timestamps. Custom event fields your snippet sends are not stored. The tracking script sets no cookies and writes nothing to local storage, so visitors carry no persistent WebPulse state.',
    },
    {
        term: 'Retention',
        detail:
            'Analytics records (visitors, page views, counters, monthly usage) are kept until the project is deleted. Project activity logs keep the most recent 1,000 entries and drop the oldest as new ones arrive. Session records (device, IP address, and last activity) are kept until the session is revoked or expires. There is no automatic time-based deletion of analytics records today.',
    },
    {
        term: 'Deletion',
        detail:
            'Deleting a project removes its page views, visitors, counters, and usage rows. Activity log entries and notifications created for that project are not removed by that deletion. Account-level deletion is not self-service — request it through the privacy channel.',
    },
    {
        term: 'Backups',
        detail:
            "Database backups and point-in-time recovery are provided by the database provider and follow that provider's configuration. We do not publish a backup-retention window, so confirm it with the provider before you rely on a deletion window.",
    },
    {
        term: 'Third parties',
        detail:
            'Supabase (database, authentication, file storage), Vercel (hosting), Razorpay (payments), Resend (transactional email), Google (sign-in), Cloudinary (avatar uploads), and ipwho.is (IP geolocation, with an offline fallback). Each processes data under its own terms.',
    },
];

/* ---------------------------------------------------------------------------
   Presentational pieces
   --------------------------------------------------------------------------- */

function Code({ children }) {
    return (
        <code className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[0.85em] text-violet-300">
            {children}
        </code>
    );
}

function SectionCard({ id, icon, kicker, title, summary, children }) {
    const Icon = icon;
    return (
        <section id={id} className="scroll-mt-28">
            <div className="mb-4 flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                    <Icon className="h-[18px] w-[18px] text-violet-300" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                    <p className="mkt-eyebrow">{kicker}</p>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-100">{title}</h3>
                    {summary && <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{summary}</p>}
                </div>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-slate-400">{children}</div>
        </section>
    );
}

function CodeFigure({ caption, lines }) {
    return (
        <figure className="mkt-panel">
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-300">
                {lines}
            </pre>
            <figcaption className="border-t border-white/[0.07] px-4 py-2.5 text-[11px] text-slate-500">
                {caption}
            </figcaption>
        </figure>
    );
}

function StatusList({ tone = 'implemented', items }) {
    const isImplemented = tone === 'implemented';
    const Icon = isImplemented ? CheckCircle2 : AlertTriangle;
    return (
        <ul className="space-y-2.5">
            {items.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                    <Icon
                        className={`mt-0.5 h-4 w-4 shrink-0 ${isImplemented ? 'text-emerald-400' : 'text-amber-400'}`}
                        aria-hidden="true"
                    />
                    <span className="text-slate-300">{item}</span>
                </li>
            ))}
        </ul>
    );
}

function Callout({ tone = 'note', title, children }) {
    const tones = {
        note: 'border-white/[0.08] bg-white/[0.03]',
        warn: 'border-amber-400/20 bg-amber-500/[0.06]',
        danger: 'border-red-400/25 bg-red-500/[0.07]',
    };
    const accents = {
        note: 'text-slate-300',
        warn: 'text-amber-200',
        danger: 'text-red-200',
    };
    return (
        <div className={`rounded-xl border p-4 text-sm leading-relaxed ${tones[tone]} ${accents[tone]}`}>
            {title && <p className="mb-1.5 font-semibold">{title}</p>}
            <div className="text-slate-300">{children}</div>
        </div>
    );
}

function Disclosure({ summary, children }) {
    return (
        <details className="group overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 [&::-webkit-details-marker]:hidden">
                {summary}
                <ChevronRight
                    className="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 group-open:rotate-90"
                    aria-hidden="true"
                />
            </summary>
            <div className="space-y-3 border-t border-white/[0.07] px-4 py-4 text-sm leading-relaxed text-slate-400">
                {children}
            </div>
        </details>
    );
}

function CredentialCard({ name, badge, tone, description, example }) {
    const badges = {
        public: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300',
        sensitive: 'border-amber-400/25 bg-amber-500/10 text-amber-300',
        unavailable: 'border-white/[0.12] bg-white/[0.04] text-slate-400',
    };
    return (
        <div className="flex h-full flex-col rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-mono text-sm font-semibold text-slate-100">{name}</h4>
                <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${badges[tone]}`}
                >
                    {badge}
                </span>
            </div>
            <p className="flex-1 text-sm leading-relaxed text-slate-400">{description}</p>
            {example && (
                <p className="mt-4 border-t border-white/[0.07] pt-3 text-xs text-slate-500">
                    {example.label} <span className="mt-1 block font-mono text-[0.8rem] text-slate-300">{example.value}</span>
                </p>
            )}
        </div>
    );
}

function OverviewCard({ icon, title, summary, points }) {
    const Icon = icon;
    return (
        <div className="mkt-card flex h-full flex-col p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10">
                <Icon className="h-[18px] w-[18px] text-emerald-300" aria-hidden="true" />
            </div>
            <h3 className="text-base font-semibold text-slate-100">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{summary}</p>
            <ul className="mt-4 space-y-2">
                {points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-xs leading-relaxed text-slate-400">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
                        <span>{point}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ---------------------------------------------------------------------------
   Page
   --------------------------------------------------------------------------- */

export default function Security() {
    const [meta, setMeta] = useState(null);
    const [activeId, setActiveId] = useState(ALL_SECTIONS[0].id);

    useSecuritySeo();

    useEffect(() => {
        let mounted = true;
        apiRequest('/meta')
            .then((res) => {
                if (mounted) setMeta(res);
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, []);

    // Scroll spy — mirrors the behaviour of the legal pages so the section
    // navigator and the content stay in sync while reading.
    useEffect(() => {
        const onScroll = () => {
            const threshold = 220;
            let current = ALL_SECTIONS[0].id;
            for (const section of ALL_SECTIONS) {
                const el = document.getElementById(section.id);
                if (el && el.getBoundingClientRect().top <= threshold) {
                    current = section.id;
                }
            }
            const nearBottom =
                window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 60;
            if (nearBottom) current = ALL_SECTIONS[ALL_SECTIONS.length - 1].id;
            setActiveId(current);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const activeGroupId = ALL_SECTIONS.find((s) => s.id === activeId)?.groupId;

    return (
        <MarketingShell>
            <section className="mkt-section">
                <div className="mkt-container">
                    {/* Hero ---------------------------------------------------- */}
                    <Reveal>
                        <div className="max-w-3xl">
                            <p className="mkt-eyebrow mb-4">WebPulse security</p>
                            <h1 className="mkt-h1 !text-4xl sm:!text-5xl">
                                Security, built into the way{' '}
                                <span className="mkt-accent-text">WebPulse works.</span>
                            </h1>
                            <p className="mkt-lead mt-5">
                                WebPulse uses account authentication, project-level access controls, and
                                protections for tracking endpoints to help safeguard analytics data. We document
                                the controls implemented today, the limitations that remain, and the safeguards
                                you can configure yourself.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal delay={80}>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <span className="mkt-chip">
                                <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                                Last reviewed: <span className="font-medium text-slate-200">October 2026</span>
                            </span>
                            <span className="mkt-chip">
                                Scope: <span className="font-medium text-slate-200">the running service</span>
                            </span>
                        </div>
                    </Reveal>

                    {/* Mobile section navigator -------------------------------- */}
                    <nav
                        aria-label="Security topics"
                        className="sticky top-16 z-30 -mx-5 mt-10 border-y border-white/[0.07] bg-[#070A10]/90 px-5 py-2.5 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:hidden"
                    >
                        <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {ALL_SECTIONS.map((item) => (
                                <li key={item.id} className="shrink-0">
                                    <a
                                        href={`#${item.id}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            scrollTo(item.id);
                                        }}
                                        aria-current={activeId === item.id ? 'true' : undefined}
                                        className={`inline-block rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
                                            activeId === item.id
                                                ? 'border-violet-400/40 bg-violet-500/15 text-violet-200'
                                                : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-violet-400/30 hover:text-violet-200'
                                        }`}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Overview ------------------------------------------------ */}
                    <Reveal>
                        <div className="mt-16">
                            <h2 className="mkt-h3">What WebPulse enforces today</h2>
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
                                Three areas carry the security posture. Each one below is checked against the
                                running service. Anything that is not implemented is listed as such further
                                down this page rather than implied.
                            </p>
                            <div className="mt-7 grid gap-5 md:grid-cols-3">
                                {OVERVIEW.map((card) => (
                                    <OverviewCard key={card.title} {...card} />
                                ))}
                            </div>
                        </div>
                    </Reveal>

                    {/* Content ------------------------------------------------- */}
                    <div className="mt-12 grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
                        {/* Desktop navigator */}
                        <nav aria-label="On this page" className="hidden lg:block">
                            <div className="lg:sticky lg:top-28">
                                <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    On this page
                                </p>
                                <div className="space-y-7">
                                    {NAV_GROUPS.map((group) => (
                                        <div key={group.id}>
                                            <p
                                                className={`mb-2 px-4 text-xs font-semibold transition-colors ${
                                                    activeGroupId === group.id ? 'text-violet-300' : 'text-slate-500'
                                                }`}
                                            >
                                                {group.label}
                                            </p>
                                            <ul className="relative space-y-1 border-l border-white/[0.08]">
                                                {group.sections.map((item) => {
                                                    const isActive = item.id === activeId;
                                                    return (
                                                        <li key={item.id}>
                                                            <a
                                                                href={`#${item.id}`}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    scrollTo(item.id);
                                                                }}
                                                                aria-current={isActive ? 'true' : undefined}
                                                                className={`block -ml-px border-l-2 py-1 pl-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
                                                                    isActive
                                                                        ? 'border-violet-400 font-medium text-violet-300'
                                                                        : 'border-transparent text-slate-400 hover:border-slate-600 hover:text-violet-300'
                                                                }`}
                                                            >
                                                                {item.label}
                                                            </a>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </nav>

                        <div className="min-w-0 space-y-16">
                            {/* ---- Identity & access ---- */}
                            {NAV_GROUPS[0].sections.length > 0 && (
                                <div>
                                    <h2 id={NAV_GROUPS[0].id} className="mkt-h3 scroll-mt-28">
                                        {NAV_GROUPS[0].label}
                                    </h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                                        {NAV_GROUPS[0].blurb}
                                    </p>

                                    <div className="mt-8 space-y-12">
                                        <Reveal>
                                            <SectionCard
                                                id="credentials"
                                                icon={KeyRound}
                                                kicker="Identity & access"
                                                title="Credentials"
                                                summary="Two kinds of token: one public by design, one secret."
                                            >
                                                <p>
                                                    WebPulse separates the identifier that names a project in the
                                                    browser from the credential that controls the account. Only one
                                                    of them is a secret.
                                                </p>
                                                <div className="grid gap-4 md:grid-cols-3">
                                                    <CredentialCard
                                                        name="Tracking ID"
                                                        badge="Public"
                                                        tone="public"
                                                        description="Identifies the WebPulse project that receives browser events. It appears in the client-side tracking snippet on your site, so it must not be treated as a secret. The tracker sends it as an x-api-key header, or in the request body when the browser cannot set headers."
                                                        example={{ label: 'Example — browser tracking requests', value: 'x-api-key: trk_…' }}
                                                    />
                                                    <CredentialCard
                                                        name="Account session"
                                                        badge="Sensitive"
                                                        tone="sensitive"
                                                        description="Authenticates access to the dashboard and to protected API endpoints. Do not expose session credentials or other private authentication material in public client code."
                                                        example={{ label: 'Example — authenticated console requests', value: 'HttpOnly cookie: token=…' }}
                                                    />
                                                    <CredentialCard
                                                        name="Personal access tokens"
                                                        badge="Not available"
                                                        tone="unavailable"
                                                        description="Programmatic access tokens are not shipped. There is no secret API key to manage today, and nothing on this page implies one exists."
                                                        example={{ label: 'Status', value: 'Planned — not yet implemented' }}
                                                    />
                                                </div>
                                                <Callout tone="warn" title="Hiding the tracking ID adds no security">
                                                    Anyone can read it from your page source. Treat it as a project
                                                    label: what protects your data is the account credential and the
                                                    origin allow-list, not the tracking ID.
                                                </Callout>
                                                <Disclosure summary="How each credential travels">
                                                    <CodeFigure
                                                        caption="Where each credential is used."
                                                        lines={`Browser tracking  (public identifier)
   Tracking ID  ->  GET  /api/v1/track/script.js
                ->  POST /api/v1/track/events     (x-api-key header)
                ->  POST /api/track/:trackingId    (tracking ID in the path)

Console + protected API  (secret)
   Session     ->  GET/POST /api/v1/projects, /analytics, /activity,
                   /user, /usage, /payment
                ->  sent as an HttpOnly cookie
                ->  the API also accepts Authorization: Bearer for
                   server-to-server clients`}
                                                    />
                                                </Disclosure>
                                            </SectionCard>
                                        </Reveal>

                                        <Reveal>
                                            <SectionCard
                                                id="authentication"
                                                icon={LockKeyhole}
                                                kicker="Identity & access"
                                                title="Authentication and sessions"
                                                summary="Token-based sessions, with a stated lifetime and server-side revocation."
                                            >
                                                <p>WebPulse protects accounts with token-based authentication. Implemented today:</p>
                                                <StatusList
                                                    items={[
                                                        'Email and password sign-up, with a verification code sent by email before the first sign-in',
                                                        'Google sign-in',
                                                        'Passwords hashed with bcrypt (cost factor 10) — plaintext passwords are never stored',
                                                        'Session tokens are signed JWTs, verified on the server for every protected request',
                                                        'Password reset by emailed link — the link is single-use and expires after 15 minutes',
                                                        'Changing a password ends every other session',
                                                        'CSRF protection: state-changing API routes under /api/v1 require a custom X-Requested-With header',
                                                        'Security-relevant events (sign-in, password change, blocked origin, rate limit) are written to the activity log',
                                                    ]}
                                                />
                                                <Disclosure summary="How sessions work today">
                                                    <dl className="space-y-3">
                                                        <div>
                                                            <dt className="font-semibold text-slate-200">Token lifetime</dt>
                                                            <dd>
                                                                7 days from issue. There is no refresh flow — when the token
                                                                expires you sign in again.
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="font-semibold text-slate-200">Delivery</dt>
                                                            <dd>
                                                                Set as an <Code>HttpOnly</Code> cookie named <Code>token</Code>.
                                                                The token is never returned in a response body and is never
                                                                written to browser storage, so page scripts cannot read it.
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="font-semibold text-slate-200">Cookie flags</dt>
                                                            <dd>
                                                                <Code>HttpOnly</Code> always; <Code>Secure</Code> and{' '}
                                                                <Code>SameSite=None</Code> in production, <Code>SameSite=Lax</Code> in
                                                                development.
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="font-semibold text-slate-200">Sign-out</dt>
                                                            <dd>
                                                                Revokes the session on the server, so the token stops working
                                                                even if it was copied out of the browser beforehand.
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="font-semibold text-slate-200">Revoking a session</dt>
                                                            <dd>
                                                                The Active Sessions panel in Account Settings lists the
                                                                devices signed in to your account and lets you revoke any
                                                                one of them.
                                                            </dd>
                                                        </div>
                                                    </dl>
                                                </Disclosure>
                                                <Callout tone="warn" title="Multi-factor authentication is not implemented">
                                                    When MFA ships, this page will list it as a live control rather than a
                                                    planned one.
                                                </Callout>
                                                <p>Recommended practices for you:</p>
                                                <ul className="list-inside list-disc space-y-2.5 text-slate-300">
                                                    <li>Use a strong, unique password and never share it</li>
                                                    <li>Sign out on shared devices, and change your password if you think someone else has used it</li>
                                                    <li>Treat password reset emails as sensitive — request a new one if one arrives unexpectedly</li>
                                                    <li>Report suspicious activity on your account</li>
                                                </ul>
                                            </SectionCard>
                                        </Reveal>

                                        <Reveal>
                                            <SectionCard
                                                id="isolation"
                                                icon={Users}
                                                kicker="Identity & access"
                                                title="Project isolation"
                                                summary="Access is decided on the server, per account."
                                            >
                                                <p>
                                                    Each project belongs to exactly one account. Every API query for
                                                    project data is scoped to the signed-in account on the server, so
                                                    the dashboard interface is never the thing enforcing access.
                                                </p>
                                                <p>
                                                    Ownership is checked for project settings, analytics, traffic,
                                                    pages, activity logs, notifications, usage figures, and payment
                                                    receipts. A project identifier belonging to another account is
                                                    treated as not found.
                                                </p>
                                                <CodeFigure
                                                    caption="One account, many projects — queries are scoped, not filtered in the UI."
                                                    lines={`Account (authenticated)
   |- Project A  ->  Analytics A, settings A
   |- Project B  ->  Analytics B, settings B
   |- Project C  ->  Analytics C, settings C

Every query is scoped server-side:  WHERE user_id = <session user>`}
                                                />
                                                <h4 className="text-sm font-semibold text-slate-200">Share links</h4>
                                                <p>
                                                    A project can publish a read-only report link. The link opens one
                                                    project&apos;s report — the last 30 days of traffic, top referrers,
                                                    device mix, and view counts — and never exposes your account or
                                                    any other project.
                                                </p>
                                                <p>
                                                    Share links do not expire on their own. Revoke one from the
                                                    project&apos;s share dialog, or regenerate it, which invalidates the
                                                    previous link immediately.
                                                </p>
                                                <Callout tone="note">
                                                    Anyone holding the link can read that report. Treat a share link as
                                                    a capability, and revoke it when it is no longer needed.
                                                </Callout>
                                            </SectionCard>
                                        </Reveal>
                                    </div>
                                </div>
                            )}

                            {/* ---- Data & infrastructure ---- */}
                            <div>
                                <h2 id={NAV_GROUPS[1].id} className="mkt-h3 scroll-mt-28">
                                    {NAV_GROUPS[1].label}
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                                    {NAV_GROUPS[1].blurb}
                                </p>

                                <div className="mt-8 space-y-12">
                                    <Reveal>
                                        <SectionCard
                                            id="tracking"
                                            icon={Radar}
                                            kicker="Data & infrastructure"
                                            title="Tracking security"
                                            summary="Browser tracking can be restricted to the domains you choose."
                                        >
                                            <p>
                                                Allowed origins lets a project owner restrict browser tracking requests
                                                to approved domains. It is an abuse control for browser traffic: it is
                                                not authentication, and it does not prove who is calling.
                                            </p>
                                            <StatusList
                                                items={[
                                                    'Allowed origins can be set per project — browser requests from an origin outside the list are rejected and recorded in the project activity log',
                                                    'The allow-list is applied on every tracking endpoint, including the v1 event endpoint the current tracker SDK uses',
                                                    'Known bots are filtered before any visitor record is created',
                                                    'Disabled projects stop accepting tracking requests',
                                                    'Tracking identifiers are validated against existing projects before an event is stored',
                                                    'Repeated identical events from the same IP, browser, and tracking ID are ignored inside a short in-memory window',
                                                ]}
                                            />
                                            <Callout tone="danger" title="Origin restrictions are an abuse control, not a security boundary">
                                                The tracking ID is public, so an allow-list reduces accidental or casual
                                                misuse rather than keeping a determined party out. It is applied to every
                                                tracking endpoint, but it only applies to requests that carry a browser{' '}
                                                <Code>Origin</Code> header — a client that sends none is not origin-checked.
                                            </Callout>
                                            <p>
                                                When no allowed origin is configured, tracking is accepted from any
                                                origin — the default that keeps snippets working from anywhere.
                                            </p>
                                        </SectionCard>
                                    </Reveal>

                                    <Reveal>
                                        <SectionCard
                                            id="abuse"
                                            icon={ShieldCheck}
                                            kicker="Data & infrastructure"
                                            title="Abuse prevention"
                                            summary="The collection path is checked at every step."
                                        >
                                            <p>
                                                WebPulse applies layered controls to the public collection and
                                                management endpoints against excessive requests, invalid events,
                                                unauthorized origins, and data pollution.
                                            </p>
                                            <CodeFigure
                                                caption="How a request is refused, and what is recorded when it is."
                                                lines={`Excessive requests   ->  per-IP rate limit    ->  429 + activity log entry
Invalid events       ->  request validation + bot filtering
Unauthorized origin  ->  403 + activity log entry
Disabled project     ->  403
Over plan allowance  ->  403 LIMIT_EXCEEDED
Missing CSRF header  ->  403 on state-changing API routes`}
                                            />
                                            <p>
                                                Rate limits are applied per IP address to the public tracking
                                                endpoints and the contact form. When a limit is hit the request is
                                                refused with <Code>HTTP 429</Code>, and — where a project can be
                                                identified — a rate-limit entry is written to that project&apos;s
                                                activity log.
                                            </p>
                                            <p>
                                                The account endpoints are limited separately and more tightly: sign-in
                                                is limited per IP and per address, and verification and reset
                                                requests are limited per address, so neither one host nor one
                                                account can be ground down.
                                            </p>
                                            <p>
                                                Exact thresholds are deployment configuration. They are deliberately
                                                not published here, and they may differ between environments.
                                            </p>
                                            <p>
                                                Request validation runs on registration, login, project creation, and
                                                contact submissions; malformed input is rejected instead of stored.
                                                Plan limits are enforced on the server too — when a monthly view
                                                allowance or project count limit is reached, further tracking or project
                                                creation is refused rather than silently dropped.
                                            </p>
                                            <Callout tone="warn">
                                                Rate limiting uses an in-memory counter, so a limit applies per
                                                application instance. A deployment running several instances needs a
                                                shared store before limits are enforced globally.
                                            </Callout>
                                        </SectionCard>
                                    </Reveal>

                                    <Reveal>
                                        <SectionCard
                                            id="data"
                                            icon={Server}
                                            kicker="Data & infrastructure"
                                            title="Data protection"
                                            summary="Transport encryption, measured storage claims, and a documented data lifecycle."
                                        >
                                            <p>
                                                Production WebPulse traffic is served over HTTPS/TLS, which protects
                                                tracking payloads, analytics API requests, and session cookies in
                                                transit.
                                            </p>
                                            <p>
                                                We do not claim blanket &ldquo;encrypted at rest&rdquo; guarantees, and
                                                we do not claim &ldquo;zero PII&rdquo; — analytics inherently records
                                                IP-derived location, page URLs, and user-agent details. Storage-level
                                                protections are provided by the hosting provider, not asserted here.
                                            </p>
                                            <h4 className="text-sm font-semibold text-slate-200">Data lifecycle</h4>
                                            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-[11rem_1fr]">
                                                {DATA_LIFECYCLE.map((row) => (
                                                    <div key={row.term} className="contents">
                                                        <dt className="text-sm font-semibold text-slate-200">{row.term}</dt>
                                                        <dd className="text-sm leading-relaxed text-slate-400">{row.detail}</dd>
                                                    </div>
                                                ))}
                                            </dl>
                                            <Callout tone="note">
                                                Visitor IPs are resolved to an approximate location with an
                                                encrypted lookup and an offline fallback. The raw address is still
                                                stored as collected — it is not truncated or anonymised, which is
                                                on the list of things we have not built yet.
                                            </Callout>
                                        </SectionCard>
                                    </Reveal>
                                </div>
                            </div>

                            {/* ---- Operations & accountability ---- */}
                            <div>
                                <h2 id={NAV_GROUPS[2].id} className="mkt-h3 scroll-mt-28">
                                    {NAV_GROUPS[2].label}
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                                    {NAV_GROUPS[2].blurb}
                                </p>

                                <div className="mt-8 space-y-12">
                                    <Reveal>
                                        <SectionCard
                                            id="development"
                                            icon={GitBranch}
                                            kicker="Operations & accountability"
                                            title="Secure development"
                                            summary="What runs in the pipeline today, and what is not in place yet."
                                        >
                                            <p>
                                                These controls are configured in the project&apos;s own CI and
                                                repository settings, and are verifiable there.
                                            </p>
                                            <StatusList
                                                items={[
                                                    'Dependency audit on every push, pull request, and weekly schedule, failing on high or critical production dependency advisories',
                                                    'Static analysis of JavaScript and TypeScript on push, pull request, and schedule',
                                                    'Secret scanning of the repository history on push and pull request',
                                                    'Dependency review on pull requests, failing on high-severity additions',
                                                    'Weekly dependency update pull requests for the frontend, the backend, and GitHub Actions',
                                                    'Least-privilege workflow permissions, pinned actions, and no secrets in build logs',
                                                    'Security response headers (Helmet) with a Content-Security-Policy',
                                                    'Required environment variables validated at server start — secrets are read only from the environment and never committed',
                                                    'Row Level Security policies enabled on the database tables that hold account, project, and analytics data',
                                                    'Server-side session records, so a session can be revoked and a password reset can end every session',
                                                    'A request body size limit on API JSON payloads',
                                                    'A centralized error handler that returns generic failures to clients instead of stack traces',
                                                ]}
                                            />
                                            <p className="pt-2">Not shipped yet, and therefore not claimed:</p>
                                            <StatusList
                                                tone="planned"
                                                items={[
                                                    'Multi-factor authentication',
                                                    'Personal access tokens (secret API keys)',
                                                    'Automated retention and deletion jobs for analytics records',
                                                    'IP anonymisation (truncation) before visitor records are stored',
                                                    'Distributed rate limiting across multiple application instances',
                                                    'A public security status endpoint',
                                                    'Explicit encryption-at-rest guarantees',
                                                ]}
                                            />
                                            <Callout tone="note">
                                                The API reaches the database with a server-side service credential,
                                                which bypasses Row Level Security. Authorization for project data is
                                                therefore enforced in the application layer on every request — the
                                                policies are a second layer, not the primary one.
                                            </Callout>
                                        </SectionCard>
                                    </Reveal>

                                    <Reveal>
                                        <SectionCard
                                            id="disclosure"
                                            icon={ClipboardList}
                                            kicker="Operations & accountability"
                                            title="Responsible disclosure"
                                            summary="A private channel for vulnerabilities, and what to send."
                                        >
                                            <h4 className="text-sm font-semibold text-slate-200">
                                                Found a potential security vulnerability?
                                            </h4>
                                            <p>
                                                We appreciate responsible reports that help improve WebPulse security.
                                            </p>
                                            <Callout tone="danger" title="Do not publish vulnerability details">
                                                Please do not include vulnerability details, exploit code, credentials,
                                                tracking identifiers, or real visitor data in a public issue.
                                            </Callout>
                                            <h4 className="text-sm font-semibold text-slate-200">How to report</h4>
                                            <ul className="list-inside list-disc space-y-2.5 text-slate-300">
                                                <li>
                                                    Use GitHub private vulnerability reporting —{' '}
                                                    <a
                                                        href={ADVISORY_URL}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mkt-link"
                                                    >
                                                        open the private advisory
                                                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                                                    </a>
                                                    . It opens a private advisory that only the maintainers can read.
                                                </li>
                                                <li>
                                                    If the advisory form is unavailable, contact the maintainer
                                                    privately and ask for a secure channel.
                                                </li>
                                                <li>
                                                    Bugs that are not security issues are welcome as ordinary
                                                    GitHub issues.
                                                </li>
                                            </ul>
                                            <p>
                                                The repository&apos;s{' '}
                                                <a
                                                    href={SECURITY_POLICY_URL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mkt-link"
                                                >
                                                    security policy
                                                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                                                </a>{' '}
                                                is the authoritative version of this process, including what happens
                                                after a report and the response timelines. Check it before you send
                                                anything.
                                            </p>
                                            <h4 className="text-sm font-semibold text-slate-200">What to include</h4>
                                            <ul className="list-inside list-disc space-y-2.5 text-slate-300">
                                                <li>The affected feature or endpoint</li>
                                                <li>The potential impact</li>
                                                <li>Safe, reproducible steps where possible</li>
                                                <li>Synthetic data and test accounts rather than real visitor information</li>
                                            </ul>
                                            <p>
                                                We will not publish a vulnerability before a fix is available, and we
                                                cannot commit to a remediation timeline beyond what the published
                                                security policy states.
                                            </p>
                                            {meta?.supportEmail && (
                                                <p>
                                                    For anything that is not a security issue, the support mailbox is{' '}
                                                    <a href={`mailto:${meta.supportEmail}`} className="mkt-link">
                                                        {meta.supportEmail}
                                                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                                                    </a>
                                                    .
                                                </p>
                                            )}
                                        </SectionCard>
                                    </Reveal>

                                    <Reveal>
                                        <SectionCard
                                            id="checklist"
                                            icon={ListChecks}
                                            kicker="Operations & accountability"
                                            title="Deployment checklist"
                                            summary="What to configure on your side before you rely on WebPulse."
                                        >
                                            <ul className="space-y-2.5">
                                                {CHECKLIST.map((item) => (
                                                    <li key={item} className="flex items-start gap-2.5">
                                                        <CheckCircle2
                                                            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"
                                                            aria-hidden="true"
                                                        />
                                                        <span className="text-slate-300">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <Callout tone="note">
                                                This checklist covers your own deployment. The controls WebPulse
                                                applies are listed above.
                                            </Callout>
                                        </SectionCard>
                                    </Reveal>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Closing CTA --------------------------------------------- */}
                    <Reveal>
                        <div className="mkt-panel relative mt-20 overflow-hidden px-6 py-12 text-center sm:px-12">
                            <div
                                aria-hidden="true"
                                className="mkt-glow left-1/2 top-[-160px] h-[320px] w-[560px] max-w-[110vw] -translate-x-1/2 bg-violet-600/20"
                            />
                            <div className="relative">
                                <h2 className="mkt-h3 !text-2xl sm:!text-3xl">Build with confidence.</h2>
                                <p className="mkt-body mx-auto mt-3 max-w-md">
                                    Protect your credentials, control your tracking configuration, and keep your
                                    analytics projects isolated.
                                </p>
                                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                                    <Link to="/docs/security" className="mkt-btn mkt-btn-primary mkt-btn-lg">
                                        Read the docs <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                    <Link to="/dashboard" className="mkt-btn mkt-btn-secondary mkt-btn-lg">
                                        Go to console <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </div>
                                <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2">
                                    <Link to="/privacy" className="rounded text-xs text-slate-500 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60">
                                        Privacy
                                    </Link>
                                    <Link to="/terms" className="rounded text-xs text-slate-500 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60">
                                        Terms
                                    </Link>
                                    <Link to="/cookies" className="rounded text-xs text-slate-500 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60">
                                        Cookies
                                    </Link>
                                    <a
                                        href={DEVELOPER_SECURITY_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded text-xs text-slate-500 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                    >
                                        Security policy
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
