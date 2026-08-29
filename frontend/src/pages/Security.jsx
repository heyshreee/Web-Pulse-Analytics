import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, ArrowRight, BarChart2, CheckCircle2, AlertTriangle,
    Key, Lock, Server, Shield, Users, Radar, ClipboardList, GitBranch
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import { apiRequest } from '../utils/api';

const REPO_URL = 'https://github.com/heyshreee/Web-Pulse-Analytics';
const ISSUES_URL = `${REPO_URL}/issues`;

function SectionCard({ id, icon, kicker, title, children }) {
    const Icon = icon;
    return (
        <section id={id} className="card card-pad scroll-mt-28">
            <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                    <Icon className="h-5 w-5 text-violet-500" />
                </div>
                <div className="min-w-0">
                    <p className="eyebrow">{kicker}</p>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
                </div>
            </div>
            <div className="space-y-3.5 text-sm leading-relaxed">{children}</div>
        </section>
    );
}

function CodeDiagram({ lines }) {
    return (
        <pre className="rounded-xl bg-slate-900 dark:bg-slate-900 text-slate-200 p-4 overflow-x-auto text-xs font-mono leading-relaxed">
            {lines}
        </pre>
    );
}

function ImplementedList({ items }) {
    return (
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-400">{item}</span>
                </li>
            ))}
        </ul>
    );
}

function PlannedList({ items }) {
    return (
        <ul className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-slate-600 dark:text-slate-400">{item}</span>
                </li>
            ))}
        </ul>
    );
}

function DisclosureBlock({ meta }) {
    const email = meta?.supportEmail || meta?.privacyEmail || null;
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5 space-y-3">
            {email ? (
                <>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Send the report privately to:</p>
                    <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline">
                        {email} <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Anything sent here is treated as confidential and not disclosed until we have a fix ready.
                    </p>
                </>
            ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    A dedicated security reporting channel is being set up. Until it is live, open a request through
                    GitHub Issues (mark it sensitive-only if you can), or email us if a mailbox is listed on the
                    privacy page.
                </p>
            )}
            <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400">
                GitHub Issues <ArrowRight className="h-4 w-4" />
            </a>
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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <p className="eyebrow mb-3">Security</p>
                        <h2 className="page-title !text-4xl font-display">Security is part of the <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">product.</span></h2>
                        <p className="page-sub !text-base mt-4 max-w-2xl mx-auto">
                            Web analytics contains valuable information about your websites and visitors. WebPulse is
                            designed to keep project data isolated, credentials protected, and access controlled —
                            and this page documents exactly which controls are implemented today.
                        </p>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-2 mb-12">
                        {nav.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => scrollTo(item.id)}
                                className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-space-800 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="space-y-6">
                        <SectionCard id="credentials" icon={Key} kicker="Credentials" title="Two kinds of tokens, one public by design">
                            <p className="prose-quiet">
                                WebPulse separates the credential that identifies a project in the browser from the
                                credential that controls the account.
                            </p>
                            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                <table className="w-full text-sm bg-white dark:bg-transparent">
                                    <thead>
                                        <tr className="text-left border-b border-slate-200 dark:border-slate-800">
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Credential</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Purpose</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Secret?</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            <td className="px-4 py-3 font-mono text-xs text-violet-600 dark:text-violet-400">Tracking ID <span className="text-slate-400">(trk_…)</span></td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Identifies a project for browser tracking</td>
                                            <td className="px-4 py-3 text-xs font-semibold text-amber-600 dark:text-amber-400">No</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 font-mono text-xs">Console account</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Authenticates dashboard and protected API access</td>
                                            <td className="px-4 py-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Yes</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="prose-quiet text-xs">
                                The tracking ID only identifies your project — anyone can read it from your page, so it is not
                                a secret. It is sent as the <code className="text-[0.85em] px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">x-api-key</code> header. Account
                                credentials are protected and must never be shipped to the browser.
                            </p>
                            <CodeDiagram lines={`Browser tracking\n   use Tracking ID (public)  ->  POST /track/events\n\nConsole + protected API\n   JWT session (secret)      ->  GET/POST /api/v1/...  `} />
                            <p className="prose-quiet">
                                Personal access tokens for programmatic access are planned but not shipped yet — no secret API
                                key currently exists, and nothing here suggests otherwise.
                            </p>
                        </SectionCard>

                        <SectionCard id="authentication" icon={Lock} kicker="Authentication" title="Account access is authenticated">
                            <p className="prose-quiet">
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
                            <p className="prose-quiet">Recommended practices for you:</p>
                            <ul className="space-y-2 list-disc list-inside text-slate-600 dark:text-slate-400">
                                <li>Use a strong, unique password and never share it</li>
                                <li>Sign out from shared devices and use session revocation if a device is lost</li>
                                <li>Report suspicious activity on your account</li>
                            </ul>
                            <div className="rounded-xl border border-amber-200/80 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-500/5 p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                Multi-factor authentication (MFA) is not yet implemented. Once it ships, this page
                                will list it as an actual control.
                            </div>
                        </SectionCard>

                        <SectionCard id="isolation" icon={Users} kicker="Project isolation" title="Projects are isolated by authorization, not by hiding the UI">
                            <p className="prose-quiet">
                                Each project keeps its own tracking configuration and analytics data. Access to one
                                project's data does not grant access to another's. Isolation is enforced in the backend:
                                every project query is scoped to the authenticated user's account ID — never filtered only
                                in the frontend.
                            </p>
                            <CodeDiagram lines={`Account (authenticated)\n   |- Project A  ->  Analytics A, settings A\n   |- Project B  ->  Analytics B, settings B\n   |- Project C  ->  Analytics C, settings C\n\nQueries are scoped server-side:  WHERE user_id = <session user>`} />
                            <p className="prose-quiet">
                                A separate, revocable share token can grant read-only access to a single project's report —
                                regenerate it from the project's share dialog to invalidate the old link.
                            </p>
                        </SectionCard>

                        <SectionCard id="tracking" icon={Radar} kicker="Tracking security" title="Browser tracking can be restricted to your domains">
                            <p className="prose-quiet">
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
                            <div className="rounded-xl border border-amber-200/80 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-500/5 p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                Origin restrictions are <strong>not</strong> a replacement for API authentication. The
                                tracking ID is public, so an allow-list reduces abuse but does not prove who is calling.
                            </div>
                            <p className="prose-quiet">
                                Note: when no allowed origin is configured, tracking falls back to allowing all origins
                                (the SaaS default) so tracer snippets work from anywhere.
                            </p>
                        </SectionCard>

                        <SectionCard id="abuse" icon={Shield} kicker="Abuse prevention" title="The analytics pipeline is protected at each step">
                            <p className="prose-quiet">
                                WebPulse applies controls to collection and management endpoints against excessive
                                requests, invalid events, unauthorized tracking, and data pollution.
                            </p>
                            <CodeDiagram lines={`Excessive requests   ->  per-IP rate limit (100 / 15 min) + logged\nInvalid events       ->  request validation + bot filtering\nUnauthorized origin  ->  403 CORS_BLOCKED + activity log entry\nDisabled project    ->  403 PROJECT_DISABLED\nOver plan allowance ->  403 LIMIT_EXCEEDED\nCSRF               ->  custom header required on non-GET routes`} />
                            <p className="prose-quiet">
                                These add up to stable, defensible collection endpoints rather than a single layer that
                                can be bypassed.
                            </p>
                        </SectionCard>

                        <SectionCard id="data" icon={Server} kicker="Data protection" title="Data is protected in transit; storage claims stay measured">
                            <p className="prose-quiet">
                                Production WebPulse traffic is served over HTTPS/TLS, protecting the tracking payloads,
                                analytics API requests, and session tokens from eavesdropping in transit.
                            </p>
                            <p className="prose-quiet">
                                We do not claim blanket "encrypted at rest" guarantees, and we do not claim "zero PII" —
                                analytics inherently records IP-derived location, page URLs, and user-agent details (see
                                the Privacy Policy for the full field list). Any infrastructure-level storage protections
                                are provided by the hosting provider (e.g. Supabase), not asserted here.
                            </p>
                            <p className="prose-quiet">
                                The tracker sets no cookies, writes nothing to local storage, and sends events with
                                <code className="text-[0.85em] px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">navigator.sendBeacon</code> (or a keep-alive fetch) — so page visitors get no persistent
                                tracking state from WebPulse.
                            </p>
                        </SectionCard>

                        <SectionCard id="development" icon={GitBranch} kicker="Secure development" title="Implemented today vs. not shipped yet">
                            <p className="prose-quiet">Implemented controls, present in the codebase:</p>
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
                            <p className="prose-quiet mt-4">Not shipped yet, and therefore not claimed:</p>
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

                        <SectionCard id="disclosure" icon={ClipboardList} kicker="Responsible disclosure" title="Found a vulnerability?">
                            <p className="prose-quiet">
                                Please don't publicly disclose security vulnerabilities before we've had a chance to
                                investigate. Do not include real tracking IDs, passwords, visitor data, or other sensitive
                                information in a report.
                            </p>
                            <p className="prose-quiet">When reporting, include:</p>
                            <ul className="space-y-2 list-disc list-inside text-slate-600 dark:text-slate-400">
                                <li>A description of the issue and its potential impact</li>
                                <li>Steps to reproduce</li>
                                <li>The affected endpoint or component</li>
                                <li>A proof of concept where appropriate</li>
                            </ul>
                            <DisclosureBlock meta={meta} />
                        </SectionCard>

                        <SectionCard id="checklist" icon={BarChart2} kicker="Deployment checklist" title="Before deploying WebPulse">
                            <ul className="space-y-2">
                                {checklist.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-slate-600 dark:text-slate-400">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </SectionCard>
                    </div>

                    <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800">
                        <div className="card card-pad text-center bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-500/10 dark:to-fuchsia-500/5 border-violet-100 dark:border-white/[0.06]">
                            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">Build with confidence.</h2>
                            <p className="prose-quiet mb-6 max-w-md mx-auto">
                                Protect your credentials, control your tracking configuration, and keep your analytics
                                projects isolated.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <Link to="/docs/security" className="btn-primary btn-md">
                                    Read the docs <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link to="/dashboard" className="btn-secondary btn-md">
                                    Go to console <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-6">
                                <Link to="/privacy" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy</Link>
                                <Link to="/terms" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms</Link>
                                <Link to="/cookies" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Cookies</Link>
                            </div>
                        </div>
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