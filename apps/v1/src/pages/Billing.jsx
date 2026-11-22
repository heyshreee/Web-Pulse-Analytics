import { useOutletContext } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { plans, formatINR, getPlanById } from '../data/plans';

export default function Billing() {
    const { user, loadUser, setIsPageLoading } = useOutletContext();
    const [stats, setStats] = useState(null);
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [usageStats, setUsageStats] = useState({
        totalViews: 0,
        monthlyLimit: 1000,
        storageUsed: 0,
        storageLimit: 1024 * 1024 * 1024,
        plan: 'free',
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

    const viewLimit = usageStats?.monthlyLimit || 1000;
    const totalViewsUsed = usageStats?.totalViews || 0;
    const viewPercentage = Math.min((totalViewsUsed / viewLimit) * 100, 100);
    const projectsCount = stats?.projectsCount || 0;
    const projectLimit = usageStats?.projectLimit || 5;
    const projectPercentage = Math.min((projectsCount / projectLimit) * 100, 100);
    const currentPlan = getPlanById(usageStats?.plan) || getPlanById('free') || { id: 'free', name: 'Free', amount: 0, description: 'Free Tier', limits: [], features: [] };

    const getNextResetDate = () => {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return nextMonth.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
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
                image: "https://example.com/your_logo",
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
        if (!window.confirm('Are you sure you want to downgrade to the Free plan? You will lose access to paid plan features and limits.')) {
            return;
        }

        setLoading(true);
        try {
            await apiRequest('/payment/downgrade', {
                method: 'POST',
                body: JSON.stringify({ planId: 'free' })
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
                        <div key={n} className="wp-panel h-[280px] p-3 space-y-3 bg-[var(--wp-bg-surface)]">
                            <div className="h-4 w-20 bg-[var(--wp-border-subtle)] rounded" />
                            <div className="h-6 w-24 bg-[var(--wp-border-default)] rounded" />
                            <div className="h-20 bg-[var(--wp-bg-subtle)] rounded" />
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

                    <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold tracking-tight text-[var(--wp-text-primary)]">{currentPlan.name} Tier</h2>
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

                    <div className="grid grid-cols-2 divide-x divide-[var(--wp-border-subtle)] border-t border-[var(--wp-border-subtle)] bg-[var(--wp-bg-subtle)]/30">
                        <div className="p-3">
                            <span className="wp-label-section uppercase">Monthly event limit</span>
                            <div className="wp-kpi-value text-base font-bold text-[var(--wp-text-primary)] mt-0.5 tabular-nums">
                                {viewLimit.toLocaleString()} <span className="text-[11px] font-normal text-[var(--wp-text-muted)]">hits</span>
                            </div>
                        </div>
                        <div className="p-3">
                            <span className="wp-label-section uppercase">Next quota reset</span>
                            <div className="wp-metric-mono text-base font-bold text-[var(--wp-text-primary)] mt-0.5">
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
                <div className="mb-2.5">
                    <h2 className="wp-title-card">Choose your plan</h2>
                    <p className="text-[11.5px] text-[var(--wp-text-muted)] mt-0.5">
                        Prepaid allowances with fixed ceilings and zero surprise overages.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--wp-border-default)] border-t-[var(--wp-accent-solid)]" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {plans.map((plan) => {
                            const isCurrentPlan = usageStats.plan === plan.id;
                            const isFree = plan.id === 'free';
                            const isPro = plan.kind === 'primary';
                            const isDowngrade = plan.amount < currentPlan.amount;
                            const ctaLabel = isCurrentPlan
                                ? 'Current plan'
                                : isFree
                                    ? 'Downgrade to Free'
                                    : `${isDowngrade ? 'Switch' : 'Upgrade'} to ${plan.name}`;

                            return (
                                <div
                                    key={plan.id}
                                    className={`wp-panel p-3.5 flex flex-col justify-between transition-colors ${
                                        isCurrentPlan
                                            ? 'border-[var(--wp-border-strong)] bg-[var(--wp-bg-surface)]'
                                            : 'hover:border-[var(--wp-border-strong)] bg-[var(--wp-bg-surface)]'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <h3 className="text-sm font-semibold text-[var(--wp-text-primary)]">{plan.name}</h3>
                                            {isCurrentPlan ? (
                                                <span className="wp-metric-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-subtle)] uppercase text-[var(--wp-text-muted)]">
                                                    Current
                                                </span>
                                            ) : isPro ? (
                                                <span className="wp-metric-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--wp-bg-subtle)] border border-[var(--wp-border-strong)] uppercase text-[var(--wp-text-primary)]">
                                                    Popular
                                                </span>
                                            ) : null}
                                        </div>

                                        <p className="text-[11px] text-[var(--wp-text-muted)] leading-relaxed mb-3">
                                            {plan.description}
                                        </p>

                                        <div className="mb-3">
                                            <div className="flex items-baseline gap-1">
                                                <span className="wp-kpi-value text-2xl font-bold text-[var(--wp-text-primary)] tracking-tight tabular-nums">
                                                    {formatINR(plan.amount)}
                                                </span>
                                                <span className="text-[11px] font-mono text-[var(--wp-text-muted)]">/ mo</span>
                                            </div>
                                        </div>

                                        <dl className="mb-3 grid grid-cols-2 gap-2 border-y border-[var(--wp-border-subtle)] py-2 text-[11px]">
                                            {plan.limits.map((limit) => (
                                                <div key={limit.label}>
                                                    <dt className="text-[10.5px] font-mono text-[var(--wp-text-muted)]">{limit.label}</dt>
                                                    <dd className="font-mono text-xs font-medium text-[var(--wp-text-primary)] mt-0.5">{limit.value}</dd>
                                                </div>
                                            ))}
                                        </dl>

                                        <ul className="mb-4 space-y-1.5">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2 text-[11.5px] text-[var(--wp-text-secondary)]">
                                                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (isCurrentPlan) return;
                                            if (isFree) handleDowngrade();
                                            else handleUpgrade(plan.id);
                                        }}
                                        disabled={isCurrentPlan}
                                        className={`w-full text-xs h-7 rounded-md font-medium transition-colors ${
                                            isCurrentPlan
                                                ? 'wp-btn wp-btn-secondary opacity-50 cursor-default'
                                                : plan.kind === 'primary'
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
                )}
            </div>
        </div>
    );
}