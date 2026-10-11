import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Search, ChevronDown, Rocket, Send, Wrench,
    BookOpen, CreditCard, Shield, LifeBuoy, Sparkles, HelpCircle,
    CheckCircle2, ArrowUpRight
} from 'lucide-react';
import Logo from '../components/Logo';

const API_DOMAIN = 'https://api.webpulse.app';

const HELP_CATEGORIES = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        subtitle: 'Setting up your first website tracking project',
        icon: Rocket,
        items: [
            {
                q: 'How do I create a new project?',
                a: 'Sign in to your WebPulse console, open the Projects dashboard, and click "New Project". WebPulse generates a unique tracking ID (trk_••••) automatically — you will use this identifier in your frontend script.',
                link: { to: '/docs/getting-started', label: 'Getting Started Guide' }
            },
            {
                q: 'How do I install the tracking snippet?',
                a: 'Add this single snippet to every page you wish to monitor before the closing </head> tag:',
                code: `<script src="${API_DOMAIN}/api/v1/track/script.js" async></script>\n<script>\n  window.tracker = window.tracker || function() { (tracker.q = tracker.q || []).push(arguments) };\n  tracker('init', 'YOUR_TRACKING_ID');\n  tracker('track', 'page_view');\n</script>`,
                link: { to: '/docs/tracking', label: 'Tracking Documentation' }
            },
            {
                q: 'Where do I find my Project Tracking ID?',
                a: 'Open your project in the console or visit the API Keys page. The tracking ID appears at the top of your project overview (e.g. trk_91af20bc8e14).',
                link: { to: '/dashboard/api-key', label: 'View API Keys' }
            },
            {
                q: 'How do I verify that telemetry is streaming properly?',
                a: 'Open your browser DevTools, switch to the Network tab, and load your tracked webpage. You will see an outgoing POST request to /api/v1/track/events returning HTTP 200 {"success": true}. The action will immediately appear in your Live Activity feed.',
                link: { to: '/dashboard/live', label: 'Live Activity Feed' }
            }
        ]
    },
    {
        id: 'tracking-events',
        title: 'Tracking & Custom Events',
        subtitle: 'Capture pageviews, conversions, and client interactions',
        icon: Send,
        items: [
            {
                q: 'How do I track custom conversion events?',
                a: 'Call tracker("track", "event_name", { metadata }) anywhere in your client-side JavaScript. For example: tracker("track", "signup_completed", { plan: "pro" }).',
                link: { to: '/docs/tracking/events', label: 'Custom Events Guide' }
            },
            {
                q: 'Does WebPulse track Single Page Applications (React, Next.js, Vue)?',
                a: 'Yes. In SPAs, trigger tracker("track", "page_view") inside your router listener (e.g. useEffect on usePathname in Next.js).',
                link: { to: '/docs/guides/react', label: 'Next.js & React Guide' }
            },
            {
                q: 'Why are some visitor visits not showing up?',
                a: 'WebPulse strictly filters known web scrapers and search bots to maintain clean analytics. If a visitor uses an aggressive ad-blocker or Do Not Track header, telemetry may also be bypassed depending on your configuration.'
            }
        ]
    },
    {
        id: 'troubleshooting',
        title: 'Troubleshooting & Errors',
        subtitle: 'Resolve common integration and ingestion questions',
        icon: Wrench,
        items: [
            {
                q: 'Getting HTTP 403 Forbidden on event ingestion?',
                a: 'Verify your project\'s Allowed Origins settings in the dashboard. If you enabled domain restriction, make sure your test domain (e.g. localhost:5173 or your preview URL) is whitelisted.'
            },
            {
                q: 'Getting HTTP 401 Invalid Tracking ID?',
                a: 'Check that your tracking ID starts with trk_ and does not contain stray whitespace or quotes in the snippet.'
            },
            {
                q: 'What is the rate limit for event ingestion?',
                a: 'Free plans support up to 500 requests per minute per project. Pro and Business tiers support high-throughput bursts up to 10,000 requests per minute with edge buffering.'
            }
        ]
    },
    {
        id: 'billing-plans',
        title: 'Billing & Subscriptions',
        subtitle: 'Invoicing, upgrades, and usage allowances',
        icon: CreditCard,
        items: [
            {
                q: 'Is there a permanent Free tier?',
                a: 'Yes. WebPulse offers a 100% free plan with 1 project, real-time analytics, and historical insights with zero credit card required.',
                link: { to: '/pricing', label: 'View Pricing' }
            },
            {
                q: 'What currency are plans billed in?',
                a: 'Plans are priced transparently in INR (₹) starting at ₹299/mo (or ₹239/mo billed annually with 20% savings). All prices include standard taxes.'
            },
            {
                q: 'Can I cancel or upgrade at any time?',
                a: 'Yes. Upgrades and downgrades are processed instantly with prorated adjustments. You can cancel your subscription anytime from the Billing settings.'
            }
        ]
    },
    {
        id: 'privacy-security',
        title: 'Privacy & GDPR Compliance',
        subtitle: 'Zero cookies, anonymized IP hashing, and data ownership',
        icon: Shield,
        items: [
            {
                q: 'Does WebPulse require cookie consent banners?',
                a: 'No. WebPulse is 100% cookie-free by design. We do not use third-party tracking cookies or cross-site fingerprinting, so no cookie banner is required under GDPR, ePrivacy, or CCPA.'
            },
            {
                q: 'How is visitor IP address handled?',
                a: 'Visitor IP addresses are immediately processed at the edge to resolve country and city metadata, then hashed with a daily rotating salt. Raw IP addresses are never written to permanent disk.'
            }
        ]
    }
];

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');
    const [openItem, setOpenItem] = useState(null);

    const q = searchQuery.trim().toLowerCase();

    const filteredCategories = q
        ? HELP_CATEGORIES.map((cat) => ({
              ...cat,
              items: cat.items.filter(
                  (item) =>
                      item.q.toLowerCase().includes(q) ||
                      item.a.toLowerCase().includes(q)
              )
          })).filter((cat) => cat.items.length > 0 || cat.title.toLowerCase().includes(q))
        : HELP_CATEGORIES;

    const toggleItem = (itemId) => {
        setOpenItem(openItem === itemId ? null : itemId);
    };

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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Hero Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-4">
                            <HelpCircle className="h-3.5 w-3.5" />
                            Help &amp; Knowledge Base
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
                            How can we <br />
                            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 dark:from-violet-400 dark:via-fuchsia-300 dark:to-indigo-300 bg-clip-text text-transparent">
                                help you today?
                            </span>
                        </h1>
                        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                            Search our guides, troubleshooting articles, and frequently asked questions about WebPulse real-time analytics.
                        </p>

                        {/* Search Bar */}
                        <div className="mt-8 max-w-xl mx-auto relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search questions, setup steps, or error codes..."
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 shadow-lg shadow-violet-500/5"
                            />
                        </div>
                    </div>

                    {/* FAQ Categories & Accordion */}
                    <div className="space-y-10">
                        {filteredCategories.map((cat) => {
                            const IconComponent = cat.icon;
                            return (
                                <div
                                    key={cat.id}
                                    className="rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-xl p-6 sm:p-8 shadow-sm"
                                >
                                    <div className="flex items-center gap-3.5 mb-6">
                                        <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                            <IconComponent className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{cat.title}</h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{cat.subtitle}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {cat.items.map((item, idx) => {
                                            const itemId = `${cat.id}-${idx}`;
                                            const isOpen = openItem === itemId;
                                            return (
                                                <div
                                                    key={idx}
                                                    className="rounded-xl border border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01] overflow-hidden transition-all"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleItem(itemId)}
                                                        className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                                                    >
                                                        <span>{item.q}</span>
                                                        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-violet-600' : 'text-slate-400'}`} />
                                                    </button>

                                                    {isOpen && (
                                                        <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100/60 dark:border-white/[0.04]">
                                                            <p className="mt-2">{item.a}</p>

                                                            {item.code && (
                                                                <pre className="mt-3 p-3.5 rounded-xl bg-[#070A10] border border-white/[0.08] text-[11px] font-mono text-violet-300 overflow-x-auto leading-relaxed">
                                                                    <code>{item.code}</code>
                                                                </pre>
                                                            )}

                                                            {item.link && (
                                                                <div className="mt-3">
                                                                    <Link
                                                                        to={item.link.to}
                                                                        className="inline-flex items-center gap-1 font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500"
                                                                    >
                                                                        {item.link.label} <ArrowRight className="h-3.5 w-3.5" />
                                                                    </Link>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {filteredCategories.length === 0 && (
                            <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17]">
                                <HelpCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                                <h4 className="font-bold text-slate-900 dark:text-white text-base">No matching answers found</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try another search keyword or check the technical documentation.</p>
                            </div>
                        )}
                    </div>

                    {/* Support & Community CTA Banner */}
                    <div className="mt-16 rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-indigo-600/10 p-8 sm:p-10 text-center backdrop-blur-xl">
                        <LifeBuoy className="h-8 w-8 text-violet-500 mx-auto mb-3" />
                        <h3 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                            Still need assistance?
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                            The WebPulse developer community and documentation are always available to help solve integration questions.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            <Link to="/docs" className="btn-signal btn-md">
                                Browse Documentation <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link to="/community" className="btn-secondary btn-md">
                                Ask in Community
                            </Link>
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