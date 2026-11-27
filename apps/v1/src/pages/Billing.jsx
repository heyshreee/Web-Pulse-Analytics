import { useOutletContext } from 'react-router-dom';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { plans, individualPlans, formatINR, getPlanById } from '../data/plans';

const comparisonGroups = [
    {
        name: 'Usage and limits',
        rows: [
            { feature: 'Monthly events', nano: '10,000', lite: '100,000', pro: '1,000,000', max: '5,000,000', enterprise: 'Negotiated' },
            { feature: 'Projects', nano: '1', lite: '3', pro: '10', max: '50', enterprise: 'Custom' },
            { feature: 'Allowed domains', nano: '1', lite: '3', pro: '10', max: '25', enterprise: 'Custom' },
            { feature: 'Data retention', nano: '7 days', lite: '30 days', pro: '90 days', max: '12 months', enterprise: 'Custom' },
            { feature: 'Dashboard refresh interval', nano: '60 sec', lite: '15 sec', pro: '5 sec', max: '1 sec', enterprise: 'Dedicated (1s)' },
        ],
    },
    {
        name: 'Analytics',
        rows: [
            { feature: 'Website traffic analytics', nano: true, lite: true, pro: true, max: true, enterprise: true },
            { feature: 'Pages, sources, devices, geography', nano: true, lite: true, pro: true, max: true, enterprise: true },
            { feature: 'Advanced filters', nano: false, lite: 'Basic', pro: true, max: true, enterprise: true },
            { feature: 'Live event logs', nano: false, lite: false, pro: true, max: true, enterprise: true },
            { feature: 'Analytics API', nano: 'Basic', lite: 'Basic', pro: 'Full', max: 'Full', enterprise: 'Custom' },
            { feature: 'CSV exports', nano: false, lite: '30-day activity', pro: true, max: true, enterprise: true },
            { feature: 'Advanced reports', nano: false, lite: false, pro: '5 saved', max: 'Unlimited', enterprise: 'Custom' },
        ],
    },
    {
        name: 'Platform access',
        rows: [
            { feature: 'V1 Stable access', nano: true, lite: true, pro: true, max: true, enterprise: true },
            { feature: 'V2 Beta access', nano: false, lite: false, pro: true, max: true, enterprise: true },
            { feature: 'Alpha access', nano: false, lite: false, pro: false, max: 'Eligible', enterprise: 'Configurable' },
            { feature: 'Custom dashboards', nano: false, lite: false, pro: 'Basic', max: true, enterprise: true },
        ],
    },
    {
        name: 'Team and support',
        rows: [
            { feature: 'Team member limits', nano: '1', lite: '1', pro: '3', max: '10', enterprise: 'Custom' },
            { feature: 'RBAC', nano: false, lite: false, pro: false, max: 'Basic', enterprise: 'Advanced' },
            { feature: 'Priority support', nano: false, lite: false, pro: false, max: true, enterprise: 'Dedicated' },
            { feature: 'Custom integrations', nano: false, lite: false, pro: false, max: false, enterprise: true },
            { feature: 'SLA', nano: false, lite: false, pro: false, max: false, enterprise: 'Contractual' },
        ],
    },
];

function renderComparisonValue(val) {
    if (val === true) {
        return <Check className="h-3.5 w-3.5 text-emerald-400 inline-block" aria-label="Included" />;
    }
    if (val === false || val === undefined || val === null) {
        return <span className="text-[var(--wp-text-muted)] opacity-40">—</span>;
    }
    return <span className="font-mono text-[11px] text-[var(--wp-text-secondary)]">{val}</span>;
}

export default function Billing() {
    const { user, loadUser, setIsPageLoading } = useOutletContext();
    const [stats, setStats] = useState(null);
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [category, setCategory] = useState('individual');
    const [showDetailedComparison, setShowDetailedComparison] = useState(false);
    const [usageStats, setUsageStats] = useState({
        totalViews: 0,
        monthlyLimit: 10000,
        storageUsed: 0,
        storageLimit: 1024 * 1024 * 1024,
        plan: 'nano',
        projectLimit: 1
    });
    const [, setPaymentHistory] = useState([]);

    useEffect(() => {
        const init = async () => {
            try {
                await Promise.all([
                    loadStats(),
                    loadUsage(),
                    loadPaymentHistory()
                ]);
            } catch (error) {
                console.error('Failed to load billing data:', error);
            } finally {
                setPageLoading(false);
                setIsPageLoading?.(false);
            }
        };
        init();
    }, []);

    const loadPaymentHistory = async () => {
        try {
            const history = await apiRequest('/payment/history');
            setPaymentHistory(history);
        } catch (err) {
            console.error('Failed to load payment history:', err);
        }
    };

    const loadStats = async () => {
        try {
            const projects = await apiRequest('/projects');
            if (projects.length > 0) {
                const statsPromises = projects.map(p =>
                    apiRequest(`/analytics/projects/${p.id}/overview`).catch(() => null)
                );
                const allStats = await Promise.all(statsPromises);
                const totalViews = allStats.reduce((acc, curr) => acc + (curr?.current_month_views || 0), 0);
                setStats({ totalViews, projectsCount: projects.length });
            } else {
                setStats({ totalViews: 0, projectsCount: 0 });
            }
        } catch (err) {
            // Silent fail
        }
    };

    const loadUsage = async () => {
        try {
            const usage = await apiRequest('/usage');
            setUsageStats(usage);
        } catch (err) {
            // Silent fail
        }
    };

    const viewLimit = usageStats?.monthlyLimit || 10000;
    const totalViewsUsed = usageStats?.totalViews || 0;
    const viewPercentage = Math.min((totalViewsUsed / viewLimit) * 100, 100);
    const projectsCount = stats?.projectsCount || 0;
    const projectLimit = usageStats?.projectLimit || 1;
    const projectPercentage = Math.min((projectsCount / projectLimit) * 100, 100);
    const activePlanId = usageStats?.plan === 'free' ? 'nano' : usageStats?.plan === 'basic' ? 'lite' : usageStats?.plan === 'business' ? 'max' : (usageStats?.plan || 'nano');
    const currentPlan = getPlanById(activePlanId) || getPlanById('nano') || { id: 'nano', name: 'Nano', amount: 0, description: 'Nano Tier', limits: [], features: [] };

    const getNextResetDate = () => {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return nextMonth.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            if (typeof window !== 'undefined' && window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUpgrade = async (planId) => {
        setLoading(true);
        try {
            const res = await loadRazorpay();

            if (!res) {
                showToast('Razorpay SDK failed to load', 'error');
                return;
            }

            // 1. Create Order
            const { order } = await apiRequest('/payment/order', {
                method: 'POST',
                body: JSON.stringify({ planId })
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "WebPulse",
                description: "Subscription payment for WebPulse services",
                image: typeof window !== 'undefined' ? `${window.location.origin}/logo-512.png` : undefined,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 2. Verify Payment
                        await apiRequest('/payment/verify', {
                            method: 'POST',
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const planName = getPlanById(planId)?.name || planId;
                        showToast(`Successfully upgraded to the ${planName} plan.`, 'success');
                        loadUsage();
                        if (loadUser) loadUser();
                    } catch (error) {
                        showToast('Payment verification failed', 'error');
                        console.error(error);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        console.log('Payment cancelled by user');
                    }
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: ''
                },
                theme: {
                    color: "#2563EB"
                },

            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Payment error:', error);
            showToast('Failed to initiate payment', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDowngrade = async () => {
        if (!window.confirm('Are you sure you want to downgrade to the Nano plan? You will lose access to paid plan features and limits.')) {
            return;
        }

        setLoading(true);
        try {
            await apiRequest('/payment/downgrade', {
                method: 'POST',
                body: JSON.stringify({ planId: 'nano' })
            });

            showToast('Plan downgraded successfully', 'success');
            loadUsage();
            if (loadUser) loadUser();
        } catch (error) {
            console.error('Downgrade error:', error);
            showToast('Failed to downgrade plan', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="space-y-3 font-sans animate-pulse">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center h-8">
                    <div className="space-y-1">
                        <div className="h-4 w-44 bg-[var(--wp-border-default)] rounded" />
                        <div className="h-3 w-64 bg-[var(--wp-border-subtle)] rounded hidden sm:block" />
                    </div>
                </div>

                {/* Top Section Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <div className="lg:col-span-2 wp-panel h-[130px] p-3 space-y-2 bg-[var(--wp-bg-surface)]">
                        <div className="h-4 w-28 bg-[var(--wp-border-subtle)] rounded" />
                        <div className="h-6 w-36 bg-[var(--wp-border-default)] rounded" />
                        <div className="h-3 w-48 bg-[var(--wp-border-subtle)] rounded" />
                    </div>
                    <div className="wp-panel h-[130px] p-3 space-y-3 bg-[var(--wp-bg-surface)]">
                        <div className="h-4 w-28 bg-[var(--wp-border-subtle)] rounded" />
                        <div className="h-2 w-full bg-[var(--wp-border-subtle)] rounded-full" />
                        <div className="h-2 w-full bg-[var(--wp-border-subtle)] rounded-full" />
                    </div>
                </div>

                {/* Plans Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="wp-panel h-[260px] p-3.5 space-y-3 bg-[var(--wp-bg-surface)]">
                            <div className="h-4 w-20 bg-[var(--wp-border-subtle)] rounded" />
                            <div className="h-6 w-24 bg-[var(--wp-border-default)] rounded" />
                            <div className="h-16 bg-[var(--wp-bg-subtle)] rounded" />
                            <div className="h-7 w-full bg-[var(--wp-border-subtle)] rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div>
                    <h1 className="wp-title-page">Billing & Subscription</h1>
                    <p className="text-[11.5px] text-[var(--wp-text-muted)] mt-0.5">
                        Manage your workspace plan, track monthly quota, and review billing limits.
                    </p>
                </div>
            </div>

            {/* Top Section: Current Plan & Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Current Plan Card */}
                <div className="lg:col-span-2 wp-panel flex flex-col justify-between bg-[var(--wp-bg-surface)]">
                    <div className="wp-panel-header">
                        <span className="wp-title-card">Current plan</span>
                        <span className="wp-metric-mono text-[10.5px] text-[var(--wp-text-muted)] px-1.5 py-0.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] uppercase">
                            Active
                        </span>
                    </div>

                    <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="wp-kpi-value text-lg font-medium tracking-tight text-[var(--wp-text-primary)]">{currentPlan.name} Tier</h2>
                            </div>
                            <p className="text-xs font-mono text-[var(--wp-text-muted)] mt-0.5">
                                {formatINR(currentPlan.amount)} / month allowance
                            </p>
                        </div>
                        <button
                            onClick={() => document.getElementById('choose-plan')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                            className="wp-btn wp-btn-secondary text-xs h-7 px-3 self-start sm:self-auto"
                        >
                            Compare all tiers
                        </button>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-[var(--wp-border-subtle)] border-t border-[var(--wp-border-subtle)] bg-[var(--wp-bg-subtle)]/20">
                        <div className="p-2.5 sm:p-3">
                            <span className="wp-label-section uppercase">Monthly event limit</span>
                            <div className="wp-kpi-value text-base font-medium text-[var(--wp-text-primary)] mt-0.5 tabular-nums">
                                {viewLimit.toLocaleString()} <span className="text-[11px] font-normal text-[var(--wp-text-muted)]">hits</span>
                            </div>
                        </div>
                        <div className="p-2.5 sm:p-3">
                            <span className="wp-label-section uppercase">Next quota reset</span>
                            <div className="wp-metric-mono text-base font-medium text-[var(--wp-text-primary)] mt-0.5">
                                {getNextResetDate()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usage Card */}
                <div className="wp-panel flex flex-col justify-between bg-[var(--wp-bg-surface)]">
                    <div className="wp-panel-header">
                        <span className="wp-title-card">Quota consumption</span>
                        <span className="wp-metric-mono text-[11px] text-[var(--wp-text-muted)]">
                            {viewPercentage > 0 && viewPercentage < 0.1 ? '<0.1%' : `${Math.round(viewPercentage)}%`}
                        </span>
                    </div>

                    <div className="p-3 sm:p-4 space-y-3.5 flex-1">
                        <div>
                            <div className="flex justify-between items-baseline text-xs mb-1">
                                <span className="text-[11.5px] text-[var(--wp-text-secondary)]">Tracked events</span>
                                <span className="wp-metric-mono text-[11px] text-[var(--wp-text-muted)]">
                                    {totalViewsUsed.toLocaleString()} / {viewLimit.toLocaleString()}
                                </span>
                            </div>
                            <div className="wp-meter-track">
                                <div
                                    className="wp-meter-bar"
                                    style={{ width: `${Math.max(viewPercentage, totalViewsUsed > 0 ? 2 : 0)}%` }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-baseline text-xs mb-1">
                                <span className="text-[11.5px] text-[var(--wp-text-secondary)]">Active projects</span>
                                <span className="wp-metric-mono text-[11px] text-[var(--wp-text-muted)]">
                                    {projectsCount} / {projectLimit}
                                </span>
                            </div>
                            <div className="wp-meter-track">
                                <div
                                    className="wp-meter-bar"
                                    style={{ width: `${Math.max(projectPercentage, projectsCount > 0 ? 2 : 0)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-3 py-2 border-t border-[var(--wp-border-subtle)] text-[10.5px] font-mono text-[var(--wp-text-muted)] bg-[var(--wp-bg-subtle)]/30">
                        Resets on the 1st of each calendar month.
                    </div>
                </div>
            </div>

            {/* Plan Comparison Section */}
            <div id="choose-plan" className="scroll-mt-12 pt-2">
                <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="wp-title-card">Choose your plan</h2>
                        <p className="text-[11.5px] text-[var(--wp-text-muted)] mt-0.5">
                            Prepaid allowances with fixed ceilings and zero surprise overages.
                        </p>
                    </div>

                    {/* Category Switcher */}
                    <div
                        className="inline-flex self-start sm:self-auto rounded-lg border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-subtle)] p-0.5"
                        role="tablist"
                        aria-label="Pricing categories"
                    >
                        <button
                            type="button"
                            role="tab"
                            id="billing-tab-individual"
                            aria-selected={category === 'individual'}
                            aria-controls="billing-panel-individual"
                            onClick={() => setCategory('individual')}
                            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                                category === 'individual'
                                    ? 'bg-[var(--wp-bg-surface)] text-[var(--wp-text-primary)] shadow-sm'
                                    : 'text-[var(--wp-text-muted)] hover:text-[var(--wp-text-secondary)]'
                            }`}
                        >
                            Individual
                        </button>
                        <button
                            type="button"
                            role="tab"
                            id="billing-tab-enterprise"
                            aria-selected={category === 'enterprise'}
                            aria-controls="billing-panel-enterprise"
                            onClick={() => setCategory('enterprise')}
                            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                                category === 'enterprise'
                                    ? 'bg-[var(--wp-bg-surface)] text-[var(--wp-text-primary)] shadow-sm'
                                    : 'text-[var(--wp-text-muted)] hover:text-[var(--wp-text-secondary)]'
                            }`}
                        >
                            Business & Enterprise
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--wp-border-default)] border-t-[var(--wp-accent-solid)]" />
                    </div>
                ) : category === 'individual' ? (
                    /* Individual 4-Tier Cards */
                    <div
                        id="billing-panel-individual"
                        role="tabpanel"
                        aria-labelledby="billing-tab-individual"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
                    >
                        {individualPlans.map((plan) => {
                            const isCurrentPlan = activePlanId === plan.id;
                            const isNano = plan.id === 'nano';
                            const isPro = plan.id === 'pro';
                            const isDowngrade = typeof plan.amount === 'number' && typeof currentPlan.amount === 'number' && plan.amount < currentPlan.amount;
                            const ctaLabel = isCurrentPlan
                                ? 'Current plan'
                                : isNano
                                    ? 'Downgrade to Nano'
                                    : `${isDowngrade ? 'Switch' : 'Upgrade'} to ${plan.name}`;

                            return (
                                <div
                                    key={plan.id}
                                    className={`wp-panel p-3.5 sm:p-4 flex flex-col justify-between transition-colors bg-[var(--wp-bg-surface)] ${
                                        isCurrentPlan
                                            ? 'border-[var(--wp-border-strong)] ring-1 ring-[var(--wp-border-strong)]/30'
                                            : isPro
                                                ? 'border-violet-500/30 hover:border-violet-500/50'
                                                : 'border-[var(--wp-border-subtle)] hover:border-[var(--wp-border-strong)]'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <span className="wp-title-card font-semibold">{plan.name}</span>
                                            {isCurrentPlan ? (
                                                <span className="wp-metric-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] uppercase text-[var(--wp-text-muted)]">
                                                    Current
                                                </span>
                                            ) : isPro ? (
                                                <span className="wp-metric-mono text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/30 font-semibold uppercase text-violet-400">
                                                    Most popular
                                                </span>
                                            ) : null}
                                        </div>

                                        <p className="text-[11px] text-[var(--wp-text-muted)] leading-relaxed mb-2.5 min-h-[32px]">
                                            {plan.description}
                                        </p>

                                        <div className="mb-3">
                                            <div className="flex items-baseline gap-1">
                                                <span className="wp-kpi-value text-xl font-medium text-[var(--wp-text-primary)] tracking-tight tabular-nums">
                                                    {formatINR(plan.amount)}
                                                </span>
                                                <span className="text-[11px] font-mono text-[var(--wp-text-muted)]">
                                                    / month
                                                </span>
                                            </div>
                                        </div>

                                        {/* Maximum three differentiating benefits */}
                                        <ul className="mb-4 space-y-1.5 border-t border-[var(--wp-border-subtle)] pt-3">
                                            {plan.benefits.map((benefit) => (
                                                <li key={benefit} className="flex items-start gap-1.5 text-[11px] text-[var(--wp-text-secondary)]">
                                                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                                    <span className="leading-snug">{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (isCurrentPlan) return;
                                            if (isNano) handleDowngrade();
                                            else handleUpgrade(plan.id);
                                        }}
                                        disabled={isCurrentPlan}
                                        className={`w-full text-xs h-8 rounded-md font-medium transition-colors ${
                                            isCurrentPlan
                                                ? 'wp-btn wp-btn-secondary opacity-50 cursor-default'
                                                : isPro
                                                    ? 'wp-btn wp-btn-primary'
                                                    : 'wp-btn wp-btn-secondary'
                                        }`}
                                    >
                                        {ctaLabel}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Business & Enterprise Category Presentation */
                    <div
                        id="billing-panel-enterprise"
                        role="tabpanel"
                        aria-labelledby="billing-tab-enterprise"
                        className="wp-panel p-5 sm:p-6 bg-[var(--wp-bg-surface)] border border-[var(--wp-border-subtle)]"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="max-w-2xl">
                                <div className="flex items-center gap-2">
                                    <span className="wp-title-card text-base font-semibold">Business & Enterprise</span>
                                    <span className="wp-metric-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] uppercase text-[var(--wp-text-muted)]">
                                        Custom agreement
                                    </span>
                                </div>
                                <p className="mt-1.5 text-xs text-[var(--wp-text-muted)] leading-relaxed">
                                    Custom commercial agreements for organizations requiring enterprise-grade capacity, security, compliance, and dedicated engineering support.
                                </p>

                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[var(--wp-text-secondary)]">
                                    <div className="flex items-start gap-2">
                                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                        <span>Negotiated monthly event volume & retention</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                        <span>Custom projects & verified domain allowances</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                        <span>Advanced RBAC & enterprise SSO integration</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                        <span>Configurable V2 Beta and Alpha preview access</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                        <span>Custom webhooks, data pipelines & API limits</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                        <span>Contractual SLA & dedicated support engineer</span>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:border-l lg:border-[var(--wp-border-subtle)] lg:pl-8 flex flex-col justify-center sm:min-w-[240px]">
                                <div className="text-[10.5px] font-mono text-[var(--wp-text-muted)] uppercase tracking-wider">
                                    Pricing structure
                                </div>
                                <div className="mt-1 text-xl font-medium text-[var(--wp-text-primary)]">
                                    Custom commercial pricing
                                </div>
                                <p className="mt-1 text-[11px] text-[var(--wp-text-muted)]">
                                    Volume billing invoiced annually or quarterly with contractual SLA.
                                </p>
                                <a
                                    href="mailto:sales@webpulseanalytics.tech?subject=WebPulse%20Enterprise%20Inquiry"
                                    className="wp-btn wp-btn-primary mt-4 text-xs h-8 text-center flex items-center justify-center gap-1.5"
                                >
                                    Contact Sales
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detailed Comparison Toggle & Section */}
                <div className="mt-4 border-t border-[var(--wp-border-subtle)] pt-3">
                    <button
                        type="button"
                        onClick={() => setShowDetailedComparison(!showDetailedComparison)}
                        className="flex items-center gap-1.5 text-xs font-medium text-[var(--wp-text-secondary)] hover:text-[var(--wp-text-primary)] transition-colors"
                    >
                        <span>{showDetailedComparison ? 'Hide detailed feature comparison' : 'Compare all plan features and limits'}</span>
                        {showDetailedComparison ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>

                    {showDetailedComparison && (
                        <div className="mt-3 overflow-x-auto wp-panel p-0 border border-[var(--wp-border-subtle)] bg-[var(--wp-bg-surface)]">
                            <table className="w-full min-w-[700px] border-collapse text-left text-xs">
                                <thead>
                                    <tr className="border-b border-[var(--wp-border-subtle)] bg-[var(--wp-bg-subtle)]/30">
                                        <th scope="col" className="p-3 font-medium text-[var(--wp-text-muted)]">Feature / Limit</th>
                                        {plans.map((p) => (
                                            <th
                                                key={p.id}
                                                scope="col"
                                                className={`p-3 font-medium ${
                                                    p.id === 'pro' ? 'text-violet-400 bg-violet-500/[0.04]' : 'text-[var(--wp-text-primary)]'
                                                }`}
                                            >
                                                <div>{p.name}</div>
                                                <div className="font-mono text-[10.5px] font-normal text-[var(--wp-text-muted)] mt-0.5">
                                                    {formatINR(p.amount)}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonGroups.map((group) => (
                                        <tr key={group.name} className="contents">
                                            <td
                                                colSpan={6}
                                                className="border-y border-[var(--wp-border-subtle)] bg-[var(--wp-bg-subtle)]/50 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--wp-text-muted)]"
                                            >
                                                {group.name}
                                            </td>
                                            {group.rows.map((row) => (
                                                <tr
                                                    key={row.feature}
                                                    className="border-b border-[var(--wp-border-subtle)]/40 hover:bg-[var(--wp-bg-subtle)]/20 transition-colors"
                                                >
                                                    <td className="p-3 text-[var(--wp-text-secondary)] font-medium">
                                                        {row.feature}
                                                    </td>
                                                    <td className="p-3">{renderComparisonValue(row.nano)}</td>
                                                    <td className="p-3">{renderComparisonValue(row.lite)}</td>
                                                    <td className="p-3 bg-violet-500/[0.02]">{renderComparisonValue(row.pro)}</td>
                                                    <td className="p-3">{renderComparisonValue(row.max)}</td>
                                                    <td className="p-3">{renderComparisonValue(row.enterprise)}</td>
                                                </tr>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}