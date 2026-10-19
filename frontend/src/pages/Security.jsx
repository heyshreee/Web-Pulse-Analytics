import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, BarChart2, CheckCircle2, AlertTriangle,
    Key, Lock, Server, Shield, Users, Radar, ClipboardList, GitBranch
} from 'lucide-react';
import MarketingShell from '../components/marketing/MarketingShell';
import SectionHead from '../components/marketing/SectionHead';
import Reveal from '../components/marketing/Reveal';
import { apiRequest } from '../utils/api';

const REPO_URL = 'https://github.com/heyshreee/Web-Pulse-Analytics';
const ISSUES_URL = `${REPO_URL}/issues`;

function SectionCard({ id, icon, kicker, title, children }) {
    const Icon = icon;
    return (
        <section id={id} className="mkt-card scroll-mt-24 p-6 sm:p-7">
            <div className="mb-5 flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                    <Icon className="h-5 w-5 text-violet-300" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                    <p className="mkt-eyebrow">{kicker}</p>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-100">{title}</h3>
                </div>
            </div>
            <div className="space-y-4 text-sm leading-relaxed text-slate-400">{children}</div>
        </section>
    );
}

function CodeDiagram({ lines }) {
    return (
        <div className="mkt-panel">
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-300">{lines}</pre>
        </div>
    );
}

function ImplementedList({ items }) {
    return (
        <ul className="space-y-2.5">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                    <span className="text-slate-300">{item}</span>
                </li>
            ))}
        </ul>
    );
}

function PlannedList({ items }) {
    return (
        <ul className="space-y-2.5">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                    <span className="text-slate-300">{item}</span>
                </li>
            ))}
        </ul>
    );
}

function CalloutBox({ children }) {
    return (
        <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06] p-4 text-sm leading-relaxed text-slate-300">
            {children}
        </div>
    );
}

function DisclosureBlock({ meta }) {
    const email = meta?.supportEmail || meta?.privacyEmail || null;
    return (
        <div className="rounded-xl border border-violet-400/20 bg-violet-500/[0.05] p-5">
            <div className="space-y-3">
                {email ? (
                    <>
                        <p className="text-xs text-slate-400">Send the report privately to:</p>
                        <a href={`mailto:${email}`} className="mkt-link">
                            {email} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                        <p className="text-xs text-slate-400">
                            Anything sent here is treated as confidential and not disclosed until we have a fix ready.
                        </p>
                    </>
                ) : (
                    <p className="text-sm leading-relaxed text-slate-300">
                        A dedicated security reporting channel is being set up. Until it is live, open a request through
                        GitHub Issues (mark it sensitive-only if you can), or email us if a mailbox is listed on the
                        privacy page.
                    </p>
                )}
                <a
                    href={ISSUES_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-slate-200 transition-colors hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                >
                    GitHub Issues <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
            </div>
        </div>
    );
}

const checklist = [
    'Serve the dashboard and tracking API over HTTPS',
    'Keep account credentials server-side (environment variables or a secret manager)',
    'Set allowed origins to your site\'s domains before heavy browser tracking',
    'Never commit console credentials to a repository',
    'Treat the tracking ID as a public identifier — it is not a secret',
    'Review activity logs for blocked-origin and rate-limit events',
    'Keep dependencies updated'
];

export default function Security() {
    const [meta, setMeta] = useState(null);

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

    const nav = [
        { id: 'credentials', label: 'Credentials' },
        { id: 'authentication', label: 'Authentication' },
        { id: 'isolation', label: 'Project isolation' },
        { id: 'tracking', label: 'Tracking security' },
        { id: 'abuse', label: 'Abuse prevention' },
        { id: 'data', label: 'Data protection' },
        { id: 'development', label: 'Secure development' },
        { id: 'disclosure', label: 'Responsible disclosure' },
        { id: 'checklist', label: 'Deployment checklist' }
    ];

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <MarketingShell>
            <section className="mkt-section">
                <div className="mkt-container">
                    <SectionHead
                        eyebrow="Security"
                        title={
                            <>
                                Security is part of the{' '}
                                <span className="mkt-accent-text">product.</span>
                            </>
                        }
                        description="Web analytics contains valuable information about your websites and visitors. WebPulse is designed to keep project data isolated, credentials protected, and access controlled — and this page documents exactly which controls are implemented today."
                    />

                    <Reveal className="mt-12">
                        <nav aria-label="Security topics" className="flex flex-wrap justify-center gap-2">
                            {nav.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => scrollTo(item.id)}
                                    className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </Reveal>

                    <div className="mx-auto mt-12 max-w-4xl space-y-6">
                        <Reveal>
                            <SectionCard id="credentials" icon={Key} kicker="Credentials" title="Two kinds of tokens, one public by design">
                                <p>
                                    WebPulse separates the credential that identifies a project in the browser from the
                                    credential that controls the account.
                                </p>
                                <div className="overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.02]">
                                    <table className="w-full min-w-[560px] text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-white/[0.07]">
                                                <th scope="col" className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Credential</th>
                                                <th scope="col" className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Purpose</th>
                                                <th scope="col" className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Secret?</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.05]">
                                            <tr>
                                                <th scope="row" className="px-5 py-4 font-mono text-xs font-normal text-violet-300">
                                                    Tracking ID <span className="text-slate-500">(trk_…)</span>
                                                </th>
                                                <td className="px-5 py-4 text-slate-400">Identifies a project for browser tracking</td>
                                                <td className="px-5 py-4 text-xs font-semibold text-amber-300">No</td>
                                            </tr>
                                            <tr>
                                                <th scope="row" className="px-5 py-4 font-mono text-xs font-normal text-slate-200">
                                                    Console account
                                                </th>
                                                <td className="px-5 py-4 text-slate-400">Authenticates dashboard and protected API access</td>
                                                <td className="px-5 py-4 text-xs font-semibold text-emerald-300">Yes</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-xs text-slate-500">
                                    The tracking ID only identifies your project — anyone can read it from your page, so it is not
                                    a secret. It is sent as the <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-violet-300">x-api-key</code> header. Account
                                    credentials are protected and must never be shipped to the browser.
                                </p>
                                <CodeDiagram lines={`Browser tracking\n   use Tracking ID (public)  ->  POST /track/events\n\nConsole + protected API\n   JWT session (secret)      ->  GET/POST /api/v1/...`} />
                                <p>
                                    Personal access tokens for programmatic access are planned but not shipped yet — no secret API
                                    key currently exists, and nothing here suggests otherwise.
                                </p>
                            </SectionCard>
                        </Reveal>

                        <Reveal>
                            <SectionCard id="authentication" icon={Lock} kicker="Authentication" title="Account access is authenticated">
                                <p>
                                    WebPulse protects user accounts with token-based authentication. Implemented today:
                                </p>
                                <ImplementedList
                                    items={[
                                        'Email + password sign-up with email verification, and Google sign-in',
                                        'Login, expiry, and logout through short-lived JWTs',
                                        'Password reset via email link',
                                        'Session listing and revocation from Account Settings',
                                        'CSRF protection on all non-GET API routes (custom header required)'
                                    ]}
                                />
                                <p>Recommended practices for you:</p>
                                <ul className="list-inside list-disc space-y-2.5 text-slate-300">
                                    <li>Use a strong, unique password and never share it</li>
                                    <li>Sign out from shared devices and use session revocation if a device is lost</li>
                                    <li>Report suspicious activity on your account</li>
                                </ul>
                                <CalloutBox>
                                    Multi-factor authentication (MFA) is not yet implemented. Once it ships, this page
                                    will list it as an actual control.
                                </CalloutBox>
                            </SectionCard>
                        </Reveal>

                        <Reveal>
                            <SectionCard id="isolation" icon={Users} kicker="Project isolation" title="Projects are isolated by authorization, not by hiding the UI">
                                <p>
                                    Each project keeps its own tracking configuration and analytics data. Access to one
                                    project's data does not grant access to another's. Isolation is enforced in the backend:
                                    every project query is scoped to the authenticated user's account ID — never filtered only
                                    in the frontend.
                                </p>
                                <CodeDiagram lines={`Account (authenticated)\n   |- Project A  ->  Analytics A, settings A\n   |- Project B  ->  Analytics B, settings B\n   |- Project C  ->  Analytics C, settings C\n\nQueries are scoped server-side:  WHERE user_id = <session user>`} />
                                <p>
                                    A separate, revocable share token can grant read-only access to a single project's report —
                                    regenerate it from the project's share dialog to invalidate the old link.
                                </p>
                            </SectionCard>
                        </Reveal>

                        <Reveal>
                            <SectionCard id="tracking" icon={Radar} kicker="Tracking security" title="Browser tracking can be restricted to your domains">
                                <p>
                                    Allowed origins lets project owners restrict browser-based tracking requests to approved
                                    domains, which helps prevent unauthorized third-party use of a project's tracking ID.
                                </p>
                                <ImplementedList
                                    items={[
                                        'Requests from origins outside the allow-list are rejected (403 CORS_BLOCKED)',
                                        'Blocked-origin attempts are logged to the project activity log',
                                        'Disabled projects stop accepting tracking and block requests (403)',
                                        'Known bots are filtered before any visitor is stored',
                                        'Tracking endpoints carry per-IP rate limits'
                                    ]}
                                />
                                <CalloutBox>
                                    Origin restrictions are <strong>not</strong> a replacement for API authentication. The
                                    tracking ID is public, so an allow-list reduces abuse but does not prove who is calling.
                                </CalloutBox>
                                <p>
                                    Note: when no allowed origin is configured, tracking falls back to allowing all origins
                                    (the SaaS default) so tracer snippets work from anywhere.
                                </p>
                            </SectionCard>
                        </Reveal>

                        <Reveal>
                            <SectionCard id="abuse" icon={Shield} kicker="Abuse prevention" title="The analytics pipeline is protected at each step">
                                <p>
                                    WebPulse applies controls to collection and management endpoints against excessive
                                    requests, invalid events, unauthorized tracking, and data pollution.
                                </p>
                                <CodeDiagram lines={`Excessive requests   ->  per-IP rate limit (100 / 15 min) + logged\nInvalid events       ->  request validation + bot filtering\nUnauthorized origin  ->  403 CORS_BLOCKED + activity log entry\nDisabled project    ->  403 PROJECT_DISABLED\nOver plan allowance ->  403 LIMIT_EXCEEDED\nCSRF               ->  custom header required on non-GET routes`} />
                                <p>
                                    These add up to stable, defensible collection endpoints rather than a single layer that
                                    can be bypassed.
                                </p>
                            </SectionCard>
                        </Reveal>

                        <Reveal>
                            <SectionCard id="data" icon={Server} kicker="Data protection" title="Data is protected in transit; storage claims stay measured">
                                <p>
                                    Production WebPulse traffic is served over HTTPS/TLS, protecting the tracking payloads,
                                    analytics API requests, and session tokens from eavesdropping in transit.
                                </p>
                                <p>
                                    We do not claim blanket "encrypted at rest" guarantees, and we do not claim "zero PII" —
                                    analytics inherently records IP-derived location, page URLs, and user-agent details (see
                                    the Privacy Policy for the full field list). Any infrastructure-level storage protections
                                    are provided by the hosting provider (e.g. Supabase), not asserted here.
                                </p>
                                <p>
                                    The tracker sets no cookies, writes nothing to local storage, and sends events with
                                    <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-violet-300">navigator.sendBeacon</code> (or a keep-alive fetch) — so page visitors get no persistent
                                    tracking state from WebPulse.
                                </p>
                            </SectionCard>
                        </Reveal>

                        <Reveal>
                            <SectionCard id="development" icon={GitBranch} kicker="Secure development" title="Implemented today vs. not shipped yet">
                                <p>Implemented controls, present in the codebase:</p>
                                <ImplementedList
                                    items={[
                                        'Authenticated middleware on all protected API routes',
                                        'Project-level authorization (row-level user scoping) in controllers',
                                        'Tracking identifier validation on public endpoints',
                                        'Per-IP rate limiting on tracking, contact, and visitor endpoints',
                                        'CSRF custom-header check on non-GET, non-tracking routes',
                                        'Security-relevant events (blocked origin, disabled project, rate-limit) written to the activity log',
                                        'Payload validation on registration, login, and contact submissions'
                                    ]}
                                />
                                <p className="pt-2">Not shipped yet, and therefore not claimed:</p>
                                <PlannedList
                                    items={[
                                        'Multi-factor authentication',
                                        'Personal access tokens (secret API keys)',
                                        'Automated vulnerability / dependency scanning in the pipeline',
                                        'Explicit at-rest encryption guarantees',
                                        'A live security status endpoint'
                                    ]}
                                />
                            </SectionCard>
                        </Reveal>

                        <Reveal>
                            <SectionCard id="disclosure" icon={ClipboardList} kicker="Responsible disclosure" title="Found a vulnerability?">
                                <p>
                                    Please don't publicly disclose security vulnerabilities before we've had a chance to
                                    investigate. Do not include real tracking IDs, passwords, visitor data, or other sensitive
                                    information in a report.
                                </p>
                                <p>When reporting, include:</p>
                                <ul className="list-inside list-disc space-y-2.5 text-slate-300">
                                    <li>A description of the issue and its potential impact</li>
                                    <li>Steps to reproduce</li>
                                    <li>The affected endpoint or component</li>
                                    <li>A proof of concept where appropriate</li>
                                </ul>
                                <DisclosureBlock meta={meta} />
                            </SectionCard>
                        </Reveal>

                        <Reveal>
                            <SectionCard id="checklist" icon={BarChart2} kicker="Deployment checklist" title="Before deploying WebPulse">
                                <ul className="space-y-2.5">
                                    {checklist.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2.5">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                            <span className="text-slate-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </SectionCard>
                        </Reveal>
                    </div>

                    <Reveal className="mx-auto mt-20 max-w-4xl">
                        <div className="mkt-panel relative overflow-hidden px-6 py-12 text-center sm:px-12">
                            <div
                                aria-hidden="true"
                                className="mkt-glow left-1/2 top-[-160px] h-[320px] w-[560px] max-w-[110vw] -translate-x-1/2 bg-violet-600/20"
                            />
                            <div className="relative">
                                <h2 className="mkt-h3 !text-2xl sm:!text-3xl">Build with confidence.</h2>
                                <p className="mkt-body mx-auto mt-3 max-w-md">
                                    Protect your credentials, control your tracking configuration, and keep your analytics
                                    projects isolated.
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
                                    <Link to="/privacy" className="rounded text-xs text-slate-500 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60">Privacy</Link>
                                    <Link to="/terms" className="rounded text-xs text-slate-500 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60">Terms</Link>
                                    <Link to="/cookies" className="rounded text-xs text-slate-500 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60">Cookies</Link>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
        </MarketingShell>
    );
}
