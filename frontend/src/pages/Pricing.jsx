import { Link } from 'react-router-dom';
import { Check, Minus, HelpCircle, ArrowLeft, BarChart2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';

const plans = [
    {
        id: 'free',
        name: 'Free',
        price: '₹0',
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
        price: '₹299',
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
        price: '₹999',
        tagline: 'For growing products and high-traffic websites',
        leadIn: 'Everything in Basic, plus:',
        items: [
            'Higher analytics limits',
            'Advanced monitoring',
            'Detailed visitor analytics',
            'Advanced reporting',
            'Priority support'
        ],
        cta: 'Start Pro',
        kind: 'primary'
    },
    {
        id: 'business',
        name: 'Business',
        price: '₹2,999',
        tagline: 'For teams that need more control',
        leadIn: 'Everything in Pro, plus:',
        items: [
            'Higher usage limits',
            'Team collaboration',
            'Advanced access controls',
            'Custom integrations',
            'Dedicated support'
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
    { feature: 'REST API', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
    { feature: 'Error tracking', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
    { feature: 'Report export', free: 'yes', basic: 'yes', pro: 'yes', business: 'yes' },
    { feature: 'Multiple projects', free: 'no', basic: 'yes', pro: 'yes', business: 'yes' },
    { feature: 'Advanced reporting', free: 'no', basic: 'no', pro: 'yes', business: 'yes' },
    { feature: 'Team access', free: 'no', basic: 'no', pro: 'no', business: 'Planned' }
];

const tableCell = (value) => {
    if (value === 'yes') {
        return (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
                <Check className="h-3 w-3 text-emerald-500" />
            </span>
        );
    }
    if (value === 'no') {
        return <Minus className="h-4 w-4 text-slate-300 dark:text-slate-600" />;
    }
    return <span className="text-violet-600 dark:text-violet-400">{value}</span>;
};

const faqs = [
    {
        q: "Can I upgrade or downgrade?",
        a: "Yes. Your plan determines the features and usage limits available to your account."
    },
    {
        q: "Is there a free plan?",
        a: "Yes. WebPulse provides a free starting point for personal projects and experimentation."
    },
    {
        q: "What happens when I reach my usage limit?",
        a: "We'll notify you when you're approaching your plan's usage limit. Tracking behavior after the limit depends on your plan."
    }
];

export default function Pricing() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-space-900/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-medium text-sm">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link to="/login" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            Log in
                        </Link>
                        <Link to="/register" className="btn-primary btn-md">Get Started</Link>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="eyebrow mb-3">Pricing</p>
                        <h2 className="page-title !text-4xl font-display">Simple pricing. <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">Start free.</span></h2>
                        <p className="page-sub !text-base mt-3 max-w-2xl mx-auto">
                            Explore WebPulse with the core analytics tools you need to understand your website. Upgrade as the platform grows.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-24">
                        {plans.map((plan) => {
                            const isPrimary = plan.kind === 'primary';
                            return (
                                <div key={plan.id} className={`card card-pad flex flex-col relative ${isPrimary
                                    ? 'bg-slate-900 border-slate-900 dark:bg-violet-500 dark:border-violet-500 transform lg:-translate-y-2'
                                    : 'card-hover'
                                    }`}>
                                    {isPrimary && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-violet-600 rounded-full text-[10px] font-semibold text-white tracking-wide shadow-soft">
                                            MOST POPULAR
                                        </div>
                                    )}
                                    <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isPrimary ? 'text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-1">
                                        <span className={`text-3xl font-bold ${isPrimary ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.price}</span>
                                        <span className={isPrimary ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}>/ month</span>
                                    </div>
                                    <p className={`text-sm mb-6 mt-1 ${isPrimary ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>{plan.tagline}</p>

                                    <ul className="space-y-2.5 mb-8 flex-1">
                                        {plan.leadIn && (
                                            <li className={`text-sm font-semibold ${isPrimary ? 'text-slate-100' : 'text-slate-800 dark:text-slate-100'}`}>
                                                {plan.leadIn}
                                            </li>
                                        )}
                                        {plan.items.map((item, i) => (
                                            <li key={i} className={`flex items-center gap-2 text-sm ${isPrimary ? 'text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                                                <Check className={`h-4 w-4 shrink-0 ${isPrimary ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        to="/register"
                                        className={isPrimary ? 'btn-md inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold px-4 py-2.5 w-full bg-white !text-slate-900 dark:!bg-white dark:!text-slate-900 hover:!bg-slate-100 transition-all' : 'btn-secondary btn-md w-full'}
                                    >
                                        {plan.cta}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>

                    {/* Feature Comparison Table */}
                    <div className="max-w-7xl mx-auto mb-24">
                        <h2 className="page-title text-3xl text-center mb-10">Compare plans</h2>
                        <div className="card overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[640px]">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800">
                                        <th className="py-5 px-6 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.14em]">Feature</th>
                                        {plans.map((plan) => (
                                            <th key={plan.id} className="py-5 px-6 text-left">
                                                <div className="font-semibold text-slate-900 dark:text-white mb-0.5">{plan.name}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">{plan.price} / month</div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {tableRows.map((row, index) => (
                                        <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">{row.feature}</td>
                                            <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">{tableCell(row.free)}</td>
                                            <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">{tableCell(row.basic)}</td>
                                            <td className="py-4 px-6 text-sm font-semibold text-slate-900 dark:text-white">{tableCell(row.pro)}</td>
                                            <td className="py-4 px-6 text-sm font-semibold text-slate-900 dark:text-white">{tableCell(row.business)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="max-w-3xl mx-auto">
                        <h2 className="page-title text-3xl text-center mb-10">Frequently asked questions</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="card card-pad card-hover">
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5 flex items-start gap-3">
                                        <HelpCircle className="h-5 w-5 text-violet-500 mt-0.5 shrink-0" />
                                        {faq.q}
                                    </h3>
                                    <p className="prose-quiet ml-8">{faq.a}</p>
                                </div>
                            ))}
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