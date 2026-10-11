import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Minus, HelpCircle, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

const BASE_PLANS = [
    {
        id: 'free',
        name: 'Free',
        monthlyPrice: 0,
        annualPrice: 0,
        tagline: 'For personal projects and experimentation',
        leadIn: null,
        items: [
            '1 project',
            'Real-time monitoring',
            'Traffic analytics',
            'Visitor tracking',
            'Performance analytics',
            'Custom dashboard',
            'Historical analytics',
            'REST API access'
        ],
        cta: 'Start for free',
        kind: 'secondary'
    },
    {
        id: 'basic',
        name: 'Basic',
        monthlyPrice: 299,
        annualPrice: 239,
        tagline: 'For developers and small websites',
        leadIn: 'Everything in Free, plus:',
        items: [
            'Multiple projects',
            'Extended analytics usage',
            'Advanced dashboard views',
            'Alerts & notifications',
            'Performance monitoring',
            'Report export'
        ],
        cta: 'Choose Basic',
        kind: 'secondary'
    },
    {
        id: 'pro',
        name: 'Pro',
        monthlyPrice: 999,
        annualPrice: 799,
        tagline: 'For growing products and high-traffic websites',
        leadIn: 'Everything in Basic, plus:',
        items: [
            'Higher analytics limits',
            'Advanced monitoring',
            'Detailed visitor analytics',
            'Advanced reporting',
            'Priority support',
            'Webhooks & API access'
        ],
        cta: 'Start Pro',
        kind: 'primary'
    },
    {
        id: 'business',
        name: 'Business',
        monthlyPrice: 2999,
        annualPrice: 2399,
        tagline: 'For teams that need more control',
        leadIn: 'Everything in Pro, plus:',
        items: [
            'Higher usage limits',
            'Team collaboration',
            'Advanced access controls',
            'Custom integrations',
            'Dedicated support',
            '99.9% uptime SLA'
        ],
        cta: 'Contact Sales',
        kind: 'secondary'
    }
];

const tableRows = [
    { feature: 'Real-time monitoring', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
    { feature: 'Traffic analytics', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
    { feature: 'Visitor tracking', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
    { feature: 'Performance analytics', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
    { feature: 'Custom dashboards', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
    { feature: 'Historical data', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
    { feature: 'Alerts & notifications', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
    { feature: 'REST API & Webhooks', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
    { feature: 'Error tracking', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
    { feature: 'Report export', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
    { feature: 'Multiple projects', free: 'no', basic: 'yes', pro: 'yes', business: 'yes' },
    { feature: 'Advanced reporting', free: 'no', basic: 'no', pro: 'yes', business: 'yes' },
    { feature: 'Team access & RBAC', free: 'no', basic: 'no', pro: 'no', business: 'yes' },
    { feature: 'Dedicated support', free: 'no', basic: 'no', pro: 'Priority', business: 'Dedicated' }
];

const tableCell = (value) => {
    if (value === 'yes') {
        return (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            </span>
        );
    }
    if (value === 'no') {
        return <Minus className="h-4 w-4 text-slate-300 dark:text-slate-600" />;
    }
    return <span className="font-semibold text-xs text-violet-600 dark:text-violet-400">{value}</span>;
};

const faqs = [
    {
        q: "Can I upgrade or downgrade anytime?",
        a: "Yes. Your plan adjusts immediately. If you downgrade, remaining credit from your current billing cycle is prorated."
    },
    {
        q: "Is there a free plan?",
        a: "Yes. WebPulse provides a permanent free plan with 1 website project and real-time analytics to get started without a credit card."
    },
    {
        q: "What happens when I reach my usage limit?",
        a: "We never drop tracking silently. We'll send an in-app and email alert when you approach 80% and 100% capacity."
    },
    {
        q: "Are prices in INR (₹) inclusive of taxes?",
        a: "Yes, all quoted prices in INR include applicable taxes and are billed transparently."
    }
];

export default function Pricing() {
    const [annual, setAnnual] = useState(false);

    return (
        <div className="min-h-screen font-sans transition-colors duration-300 bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-slate-100">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-white/85 dark:bg-[#0B0F17]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.07]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-medium text-sm">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                            Log in
                        </Link>
                        <Link to="/register" className="btn-signal btn-md">Get Started</Link>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Title */}
                    <div className="text-center mb-12">
                        <p className="eyebrow mb-3">Pricing</p>
                        <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">
                            Simple pricing. <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">Start free.</span>
                        </h1>
                        <p className="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Explore WebPulse with the core analytics tools you need to understand your website. Upgrade as your product scales.
                        </p>

                        {/* Billing Switcher */}
                        <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full border border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-white/[0.03]">
                            <button
                                type="button"
                                onClick={() => setAnnual(false)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                    !annual
                                        ? 'bg-white dark:bg-white/[0.1] text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                Monthly billing
                            </button>
                            <button
                                type="button"
                                onClick={() => setAnnual(true)}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                    annual
                                        ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                Annual billing
                                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold">
                                    SAVE 20%
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-24 items-stretch">
                        {BASE_PLANS.map((plan) => {
                            const isPrimary = plan.kind === 'primary';
                            const price = annual ? plan.annualPrice : plan.monthlyPrice;
                            const priceStr = price === 0 ? '₹0' : `₹${price.toLocaleString('en-IN')}`;

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 ${
                                        isPrimary
                                            ? 'bg-white dark:bg-[#0D111A] border-2 border-violet-500 dark:border-violet-400 shadow-2xl shadow-violet-500/15 lg:-translate-y-3'
                                            : 'glass-obs border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.16]'
                                    }`}
                                >
                                    {isPrimary && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full text-[10px] font-bold text-white tracking-widest uppercase shadow-md shadow-violet-500/30">
                                            MOST POPULAR
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                {plan.name}
                                            </h3>
                                            {isPrimary && <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />}
                                        </div>

                                        <div className="flex items-baseline gap-1.5 mb-1">
                                            <span className={`text-4xl font-extrabold font-display tracking-tight ${
                                                isPrimary ? 'text-violet-600 dark:text-violet-400' : 'text-slate-900 dark:text-white'
                                            }`}>
                                                {priceStr}
                                            </span>
                                            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                                                {price === 0 ? 'forever' : '/ month'}
                                            </span>
                                        </div>

                                        {price > 0 && (
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2">
                                                {annual ? 'billed annually (save 20%)' : 'billed monthly'}
                                            </p>
                                        )}

                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                            {plan.tagline}
                                        </p>

                                        <div className="h-px w-full bg-slate-200/70 dark:bg-white/[0.07] mb-6" />

                                        {plan.leadIn && (
                                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                                {plan.leadIn}
                                            </div>
                                        )}

                                        <ul className="space-y-2.5 mb-8">
                                            {plan.items.map((item, i) => (
                                                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-snug">
                                                    <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Link
                                        to="/register"
                                        className={isPrimary ? 'btn-signal btn-md w-full justify-center' : 'btn-ghost-dark btn-md w-full justify-center'}
                                    >
                                        {plan.cta}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>

                    {/* Feature Comparison Table */}
                    <div className="max-w-7xl mx-auto mb-24">
                        <div className="text-center mb-10">
                            <p className="eyebrow mb-2">Detailed matrix</p>
                            <h2 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">
                                Compare all features
                            </h2>
                        </div>
                        <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0B0F17] overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[680px]">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.02]">
                                            <th className="py-4 px-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.16em]">
                                                Feature
                                            </th>
                                            {BASE_PLANS.map((plan) => {
                                                const price = annual ? plan.annualPrice : plan.monthlyPrice;
                                                const priceStr = price === 0 ? '₹0' : `₹${price.toLocaleString('en-IN')}`;
                                                return (
                                                    <th key={plan.id} className="py-4 px-6 text-left">
                                                        <div className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">
                                                            {plan.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                            {priceStr} / mo
                                                        </div>
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] text-sm">
                                        {tableRows.map((row, index) => (
                                            <tr key={index} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3.5 px-6 font-medium text-slate-700 dark:text-slate-300">{row.feature}</td>
                                                <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400">{tableCell(row.free)}</td>
                                                <td className="py-3.5 px-6 text-slate-500 dark:text-slate-400">{tableCell(row.basic)}</td>
                                                <td className="py-3.5 px-6 text-slate-900 dark:text-white">{tableCell(row.pro)}</td>
                                                <td className="py-3.5 px-6 text-slate-900 dark:text-white">{tableCell(row.business)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-10">
                            <p className="eyebrow mb-2">FAQ</p>
                            <h2 className="text-3xl font-extrabold font-display text-slate-900 dark:text-white">
                                Frequently asked questions
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.02] p-6 hover:border-slate-300 dark:hover:border-white/[0.14] transition-colors">
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-start gap-3">
                                        <HelpCircle className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
                                        {faq.q}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 ml-8 leading-relaxed">
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-white/[0.07] py-10 bg-white dark:bg-[#070A10] text-center">
                <div className="flex items-center justify-center gap-2 mb-3 opacity-80">
                    <Logo />
                </div>
                <p className="text-slate-400 dark:text-slate-600 text-xs">© 2026 WebPulse · Built with intention</p>
            </footer>
        </div>
    );
}