import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Zap, CreditCard, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import Reveal from '../components/Reveal';
import { plans, formatINR, getPlanById } from '../data/plans';

export default function Billing() {
    const { user, loadUser } = useOutletContext();
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
    const [paymentHistory, setPaymentHistory] = useState([]);

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

    const handleDownloadReceipt = async (paymentId) => {
        try {
            // Trigger download by opening in new window or creating blob
            // Since our API returns a stream, we can use fetch and blob.
            // The session is carried by the HttpOnly cookie.
            const response = await fetch(`${import.meta.env.VITE_API_URL}/payment/receipt/${paymentId}`, {
                credentials: 'include',
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt_${paymentId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            showToast('Failed to download receipt', 'error');
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

    const viewLimit = usageStats.monthlyLimit || 1000;
    const totalViewsUsed = usageStats.totalViews || 0;
    const viewPercentage = Math.min((totalViewsUsed / viewLimit) * 100, 100);
    const projectsCount = stats?.projectsCount || 0;
    const projectLimit = usageStats?.projectLimit || 5;
    const projectPercentage = Math.min((projectsCount / projectLimit) * 100, 100);
    const currentPlan = getPlanById(usageStats.plan) || getPlanById('free');

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

    const handleEmailReceipt = async (paymentId) => {
        try {
            await apiRequest(`/payment/receipt/${paymentId}/email`, {
                method: 'POST'
            });
            showToast('Receipt sent to your email', 'success');
        } catch (error) {
            console.error('Email receipt error:', error);
            showToast('Failed to send receipt email', 'error');
        }
    };

    if (pageLoading) return <Spinner />;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="page-header">
                <div className="page-header-title">
                    <div className="page-header-icon">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="page-title">Billing & Subscription</h1>
                        <p className="page-sub">Manage your plan, track usage, and review billing terms.</p>
                    </div>
                </div>
            </div>

            {/* Top Section: Current Plan & Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Plan Card */}
                <div className="lg:col-span-2 card card-pad relative overflow-hidden">
                    <div className="absolute inset-0 bg-violet-500/[0.03] pointer-events-none" />
                    <div className="flex justify-between items-start gap-4 mb-8 relative z-10">
                        <div>
                            <p className="eyebrow mb-2">Current Plan</p>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentPlan.name} Plan</h2>
                                <span className="badge-slate">Current</span>
                            </div>
                            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                {formatINR(currentPlan.amount)} / month
                            </p>
                        </div>
                        <button
                            onClick={() => document.getElementById('choose-plan')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                            className="btn-secondary btn-md"
                        >
                            Compare plans
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        <div className="card card-pad bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/40">
                            <p className="eyebrow mb-2">Monthly Limit</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{viewLimit.toLocaleString()} <span className="text-sm text-slate-500 ml-1">tracked events</span></p>
                        </div>
                        <div className="card card-pad bg-slate-50 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700/40">
                            <p className="eyebrow mb-2">Next Reset</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{getNextResetDate()}</p>
                        </div>
                    </div>
                </div>

                {/* Usage Card */}
                <div className="card card-pad flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                            <Zap className="h-5 w-5 text-violet-500" />
                        </div>
                        <h3 className="eyebrow">Usage This Month</h3>
                    </div>

                    <div className="space-y-8 flex-1">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tracked Events</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                                    {totalViewsUsed.toLocaleString()} <span className="text-slate-400 dark:text-slate-500 font-normal">/ {viewLimit.toLocaleString()}</span>
                                </p>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${viewPercentage}%` }}
                                    className="h-full bg-violet-500 rounded-full"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Projects</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                                    {projectsCount} <span className="text-slate-400 dark:text-slate-500 font-normal">/ {projectLimit}</span>
                                </p>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${projectPercentage}%` }}
                                    className="h-full bg-violet-500 rounded-full"
                                />
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-8 italic leading-relaxed">
                        Resets on the first day of each calendar month.
                    </p>
                </div>
            </div>

            {/* Plan Comparison Section */}
            <div id="choose-plan" className="scroll-mt-24">
                <h2 className="section-title mb-2">Choose your plan</h2>
                <p className="page-sub">Pick the plan that fits your traffic and project needs.</p>
                <p className="mb-8 mt-2 max-w-3xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Prices are in INR per month of allowance. Paid plans are one-time orders with no
                    subscription and no automatic renewal; the plan stays active until you change it,
                    and amounts exclude applicable taxes.
                </p>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                <div key={plan.id} className={`
                                    card card-pad flex flex-col h-full relative transition-all duration-200
                                    ${isCurrentPlan
                                        ? 'border-violet-300 dark:border-violet-500/40 ring-1 ring-violet-500/20'
                                        : isPro
                                            ? 'border-violet-200 dark:border-violet-500/30 card-hover'
                                            : 'card-hover'}
                                `}>
                                    {isPro && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                            <span className="px-3 py-1 bg-violet-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm">Most popular</span>
                                        </div>
                                    )}

                                    <div className="mb-5">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{plan.name}</h3>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {plan.description}
                                        </p>
                                    </div>

                                    <div className="mb-5">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                                {formatINR(plan.amount)}
                                            </span>
                                            <span className="text-slate-500 font-semibold text-xs">/ month</span>
                                        </div>
                                    </div>

                                    <dl className="mb-5 grid grid-cols-2 gap-x-3 gap-y-3 border-y border-slate-200/70 py-4 dark:border-slate-700/50">
                                        {plan.limits.map((limit) => (
                                            <div key={limit.label}>
                                                <dt className="text-[11px] leading-tight text-slate-500 dark:text-slate-400">{limit.label}</dt>
                                                <dd className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{limit.value}</dd>
                                            </div>
                                        ))}
                                    </dl>

                                    <ul className="mb-6 flex-1 space-y-2.5">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                                                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500 dark:text-emerald-400" aria-hidden="true" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    {plan.plannedNote && (
                                        <p className="mb-6 flex items-start gap-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
                                            {plan.plannedNote}
                                        </p>
                                    )}

                                    <button
                                        onClick={() => {
                                            if (isCurrentPlan) return;
                                            if (isFree) handleDowngrade();
                                            else handleUpgrade(plan.id);
                                        }}
                                        disabled={isCurrentPlan}
                                        className={`
                                            w-full btn-lg
                                            ${isCurrentPlan
                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default border border-slate-200 dark:border-slate-700'
                                                : plan.kind === 'primary'
                                                    ? 'btn-primary'
                                                    : 'btn-secondary'}
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        `}
                                    >
                                        {ctaLabel}
                                    </button>
                                </div>
                            );
                        })}
                    </Reveal>
                )}

            </div>
        </div>
    );
}