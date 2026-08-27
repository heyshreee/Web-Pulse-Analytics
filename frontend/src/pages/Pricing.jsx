import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, HelpCircle, ArrowLeft, BarChart2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Pricing() {
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState([
        {
            id: 'free',
            name: 'Free',
            price_usd: 0,
            price_inr: 0,
            description: "For personal projects", color: "slate",
            features: ['1 Project', '1 Allowed Origin', '1,000 events/mo', '60 sec refresh'],
            max_projects: 1,
            allowed_origins: 1,
            monthly_events: 1000,
            live_logs: false
        },
        {
            id: 'basic',
            name: 'Basic',
            price_usd: 4,
            price_inr: 299,
            description: "For serious hobbyists", color: "blue",
            features: ['5 Projects', '3 Allowed Origins', 'Live Device Stats', '50,000 events/mo', '10 sec refresh'],
            max_projects: 5,
            allowed_origins: 3,
            monthly_events: 50000,
            live_logs: false
        },
        {
            id: 'pro',
            name: 'Pro',
            price_usd: 12,
            price_inr: 999,
            description: "For professional creators", color: "indigo",
            features: ['15 Projects', '10 Allowed Origins', 'Live Activity Logs', '500,000 events/mo', '1 sec refresh'],
            max_projects: 15,
            allowed_origins: 10,
            monthly_events: 500000,
            live_logs: true
        },
        {
            id: 'business',
            name: 'Business',
            price_usd: 39,
            price_inr: 2999,
            description: "For scaling teams", color: "purple",
            features: ['Unlimited Projects', '100 Allowed Origins', '5,000,000 events/mo', 'Real-time / SLA', 'Team access'],
            max_projects: 100,
            allowed_origins: 100,
            monthly_events: 5000000,
            live_logs: true
        }
    ]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
                const res = await fetch(`${API_URL}/v1/payment/plans`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        setPlans(data);
                    }
                }
            } catch (error) {
                console.error('Error fetching plans:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    // Helper to get plan attribute safely
    const getPlanAttr = (id, attr, fallback) => {
        const plan = plans.find(p => p.id === id);
        if (!plan) return fallback;
        if (attr === 'price') return plan.price_usd > 0 ? `$${plan.price_usd}` : 'Free';
        if (attr === 'monthly_events') return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(plan.monthly_events);
        if (attr === 'max_projects') return plan.max_projects === 100 ? 'Unlimited*' : plan.max_projects;
        if (attr === 'allowed_origins') return plan.allowed_origins;
        if (attr === 'retention_days') return `${plan.retention_days || 30} days`;
        return plan[attr] || fallback;
    }

    const featureRows = [
        { feature: "Projects", free: getPlanAttr('free', 'max_projects', '1'), basic: getPlanAttr('basic', 'max_projects', '5'), pro: getPlanAttr('pro', 'max_projects', '15'), business: getPlanAttr('business', 'max_projects', 'Unlimited*') },
        { feature: "Allowed Origins", free: getPlanAttr('free', 'allowed_origins', '1'), basic: getPlanAttr('basic', 'allowed_origins', '3'), pro: getPlanAttr('pro', 'allowed_origins', '10'), business: getPlanAttr('business', 'allowed_origins', '100') },
        { feature: "Events / month", free: getPlanAttr('free', 'monthly_events', '1,000'), basic: getPlanAttr('basic', 'monthly_events', '50,000'), pro: getPlanAttr('pro', 'monthly_events', '500,000'), business: getPlanAttr('business', 'monthly_events', '5,000,000') },
        { feature: "Real-time analytics", free: "Basic", basic: "Yes", pro: "Advanced", business: "Advanced" },
        { feature: "Dashboard refresh rate", free: "60 sec", basic: "10 sec", pro: "1 sec", business: "Real-time (WebSocket)" },
        { feature: "OBS overlay", free: "Default only", basic: "Custom text & theme", pro: "Fully customizable", business: "Fully customizable" },
        { feature: "Visitor geolocation", free: "—", basic: "—", pro: "Country-level", business: "Country-level" },
        { feature: "Device & browser stats", free: "—", basic: "Live", pro: "Yes", business: "Yes" },
        { feature: "Live Activity Logs", free: "—", basic: "—", pro: "Yes", business: "Yes" },
        { feature: "Tracking URL + API key", free: "—", basic: "Yes", pro: "Yes", business: "Yes" },
        { feature: "Team access / roles", free: "—", basic: "—", pro: "—", business: "Yes" },
        { feature: "Private dashboards", free: "—", basic: "—", pro: "—", business: "Yes" },
        { feature: "Custom domain tracking", free: "—", basic: "—", pro: "—", business: "Yes" },
        { feature: "Data retention", free: getPlanAttr('free', 'retention_days', '1 day'), basic: getPlanAttr('basic', 'retention_days', '7 days'), pro: getPlanAttr('pro', 'retention_days', '30 days'), business: getPlanAttr('business', 'retention_days', '90 days') },
        { feature: "Email support", free: "Community", basic: "Standard", pro: "Priority", business: "Dedicated" },
    ];

    const displayPlans = [
        { id: 'free', name: "Free", price: getPlanAttr('free', 'price', 'Free'), color: "slate" },
        { id: 'basic', name: "Basic", price: getPlanAttr('basic', 'price', '$4'), color: "blue" },
        { id: 'pro', name: "Pro", price: getPlanAttr('pro', 'price', '$12'), color: "indigo" },
        { id: 'business', name: "Business", price: getPlanAttr('business', 'price', '$39'), color: "purple" }
    ];

    const cards = [
        {
            id: 'free',
            name: 'Free',
            inr: '₹0',
            usd: '$0 / month',
            desc: 'Trying WebPulse',
            cta: 'Get Started',
            kind: 'secondary'
        },
        {
            id: 'basic',
            name: 'Basic',
            inr: '₹299',
            usd: '$4 / month',
            desc: 'Students & solo devs',
            cta: 'Choose Basic',
            kind: 'secondary'
        },
        {
            id: 'pro',
            name: 'Pro',
            inr: '₹999',
            usd: '$12 / month',
            desc: 'Streamers & growing apps',
            cta: 'Start Free Trial',
            kind: 'primary'
        },
        {
            id: 'business',
            name: 'Business',
            inr: '₹2,999',
            usd: '$39 / month',
            desc: 'Teams & high traffic',
            cta: 'Contact Sales',
            kind: 'secondary'
        },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
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
                        <h2 className="page-title !text-4xl">Simple, transparent pricing</h2>
                        <p className="page-sub !text-base mt-3 max-w-2xl mx-auto">
                            Choose the plan that fits your growth stage. No hidden fees, cancel anytime.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-24">
                        {cards.map((c) => {
                            const isPrimary = c.kind === 'primary';
                            return (
                                <div key={c.id} className={`card card-pad flex flex-col relative ${isPrimary
                                    ? 'bg-slate-900 border-slate-900 dark:bg-violet-500 dark:border-violet-500 transform lg:-translate-y-2'
                                    : 'card-hover'
                                    }`}>
                                    {isPrimary && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-violet-600 rounded-full text-[10px] font-semibold text-white tracking-wide shadow-soft">
                                            MOST POPULAR
                                        </div>
                                    )}
                                    <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isPrimary ? 'text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>{c.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-1">
                                        <span className={`text-3xl font-bold ${isPrimary ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{c.inr}</span>
                                        <span className={isPrimary ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}>/mo</span>
                                    </div>
                                    <div className={`text-xs mb-5 font-mono ${isPrimary ? 'text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>{c.usd}</div>
                                    <p className={`text-sm mb-8 min-h-[40px] ${isPrimary ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>{c.desc}</p>

                                    {/* feature summary */}
                                    <ul className="space-y-2.5 mb-8 flex-1">
                                        {(plans.find(p => p.id === c.id)?.features || []).slice(0, 4).map((f, i) => (
                                            <li key={i} className={`flex items-center gap-2 text-sm ${isPrimary ? 'text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                                                <Check className={`h-4 w-4 shrink-0 ${isPrimary ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        to="/register"
                                        className={isPrimary ? 'btn-md inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold px-4 py-2.5 w-full bg-white !text-slate-900 dark:!bg-white dark:!text-slate-900 hover:!bg-slate-100 transition-all' : 'btn-secondary btn-md w-full'}
                                    >
                                        {c.cta}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>

                    {/* Feature Comparison Table */}
                    <div className="max-w-7xl mx-auto mb-24">
                        <h2 className="page-title !text-3xl text-center mb-10">Compare plans</h2>
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent"></div>
                            </div>
                        ) : (
                            <div className="card overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[640px]">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800">
                                            <th className="py-5 px-6 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.14em]">Feature</th>
                                            {displayPlans.map((plan) => (
                                                <th key={plan.id} className="py-5 px-6 text-left">
                                                    <div className="font-semibold text-slate-900 dark:text-white mb-0.5">{plan.name}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">{plan.price}</div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {featureRows.map((row, index) => (
                                            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="py-4 px-6 text-sm font-medium text-slate-700 dark:text-slate-300">{row.feature}</td>
                                                <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">{row.free}</td>
                                                <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">{row.basic}</td>
                                                <td className="py-4 px-6 text-sm font-semibold text-slate-900 dark:text-white">{row.pro}</td>
                                                <td className="py-4 px-6 text-sm font-semibold text-slate-900 dark:text-white">{row.business}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* FAQ */}
                    <div className="max-w-3xl mx-auto">
                        <h2 className="page-title !text-3xl text-center mb-10">Frequently asked questions</h2>
                        <div className="space-y-4">
                            {[
                                {
                                    q: "Can I upgrade or downgrade anytime?",
                                    a: "Yes, you can change your plan at any time. Changes take effect immediately, and we'll prorate any payments."
                                },
                                {
                                    q: "What happens if I exceed my view limit?",
                                    a: "On the free plan, tracking will pause until the next billing cycle. We'll notify you before this happens so you can upgrade if needed."
                                },
                                {
                                    q: "Do you offer discounts for non-profits?",
                                    a: "Yes! Contact our sales team with proof of your non-profit status for a 50% discount on all plans."
                                }
                            ].map((faq, i) => (
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

            <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white dark:bg-slate-950 text-center">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-violet-500 text-white">
                        <BarChart2 className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">WebPulse Analytics</span>
                </div>
                <p className="text-slate-400 dark:text-slate-600 text-xs">© 2026 WebPulse Analytics Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}
