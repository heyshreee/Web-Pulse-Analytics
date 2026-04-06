import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Zap, Layers, X, ArrowUpRight, Download, CreditCard, Calendar, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

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
        projectLimit: 5
    });
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [currency, setCurrency] = useState('INR');
    const [plans, setPlans] = useState([
        {
            id: 'free',
            name: 'Free',
            price_usd: 0,
            price_inr: 0,
            description: 'Trying WebPulse',
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
            description: 'Students & solo devs',
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
            description: 'Streamers & growing apps',
            features: ['15 Projects', '10 Allowed Origins', 'Live Activity Logs', '500,000 events/mo', '1 sec refresh', 'Advanced Analytics'],
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
            description: 'Teams & high traffic',
            features: ['Unlimited Projects', '100 Allowed Origins', '5,000,000 events/mo', 'Real-time / SLA', 'Team access'],
            max_projects: 100,
            allowed_origins: 100,
            monthly_events: 5000000,
            live_logs: true
        }
    ]);

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
            // Since our API returns a stream, we can use fetch and blob
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/payment/receipt/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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



    // ... existing useEffect ...

    // ... existing loadPaymentHistory ...

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
                body: JSON.stringify({ planId, currency })
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "WebPulse",
                description: "Subscription payment for WebPulse analytics services",
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
                                razorpay_signature: response.razorpay_signature,
                                planId,
                                currency // Pass currency to verify endpoint
                            })
                        });

                        showToast(`Successfully upgraded to ${planId} plan!`, 'success');
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
        if (!window.confirm('Are you sure you want to downgrade to the Free plan? You will lose access to Pro features.')) {
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
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div className="flex items-center gap-5">
                    <div className="p-4 rounded-3xl bg-blue-600 shadow-2xl shadow-blue-600/20 group-hover:rotate-12 transition-transform duration-500">
                        <CreditCard className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Billing & Subscription</h1>
                        <p className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic opacity-80">Manage your subscription, view usage, and download invoices.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Currency Switcher */}
                    <div className="bg-slate-100 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-white/5 p-1 rounded-xl flex items-center shadow-sm">
                        <button
                            onClick={() => setCurrency('INR')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currency === 'INR' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            INR (₹)
                        </button>
                        <button
                            onClick={() => setCurrency('USD')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currency === 'USD' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                            USD ($)
                        </button>
                    </div>

                    <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <Clock className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Top Section: Current Plan & Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                {/* Current Plan Card */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-white/5 rounded-3xl p-8 relative overflow-hidden group shadow-sm dark:shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 dark:bg-blue-500/10 blur-[100px] -mr-32 -mt-32 rounded-full"></div>

                    <div className="flex justify-between items-start mb-12 relative z-10">
                        <div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Current Plan</p>
                            <div className="flex items-center gap-3">
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white capitalize">{usageStats.plan} Plan</h2>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wider border border-slate-200 dark:border-slate-700">Current</span>
                            </div>
                        </div>
                        <button
                            onClick={() => handleUpgrade('pro')}
                            disabled={usageStats.plan === 'pro' || loading}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                            {usageStats.plan === 'pro' ? 'Current Plan' : 'Upgrade Now'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-6 shadow-inner">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">Monthly Limit</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{viewLimit.toLocaleString()} <span className="text-sm text-slate-500 ml-1">views</span></p>
                        </div>
                        <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-6 shadow-inner">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">Next Reset</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{getNextResetDate()}</p>
                        </div>
                    </div>
                </div>

                {/* Usage Card */}
                <div className="bg-white dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col shadow-sm dark:shadow-2xl transition-all">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-blue-50 dark:bg-blue-400/10 rounded-lg">
                            <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 fill-blue-600/10 dark:fill-blue-400/20" />
                        </div>
                        <h3 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Usage This Month</h3>
                    </div>

                    <div className="space-y-8 flex-1">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Project Views</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                                    {totalViewsUsed.toLocaleString()} <span className="text-slate-400 dark:text-slate-500 font-medium">/ {viewLimit.toLocaleString()}</span>
                                </p>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${viewPercentage}%` }}
                                    className="h-full bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Active Projects</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                                    {projectsCount} <span className="text-slate-400 dark:text-slate-500 font-medium">/ {projectLimit}</span>
                                </p>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${projectPercentage}%` }}
                                    className="h-full bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                                />
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] text-slate-500 mt-8 italic leading-relaxed">
                        Resets automatically at the start of next billing cycle.
                    </p>
                </div>
            </div>

            {/* Plan Comparison Section */}
            <div className="mb-16">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Choose your plan</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-10">Pick the best plan that fits your growth needs.</p>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plans.map((plan) => {
                            const isCurrentPlan = usageStats.plan === plan.id;
                            const isFree = plan.id === 'free';
                            const isPro = plan.id === 'pro';
                            const isBusiness = plan.id === 'business';
                            const isBasic = plan.id === 'basic';

                            // Determine price to display/compare based on currency
                            const price = currency === 'USD' ? plan.price_usd : plan.price_inr;
                            const currentPlanPrice = (plans.find(p => p.id === usageStats.plan) || {})[currency === 'USD' ? 'price_usd' : 'price_inr'] || 0;
                            const priceDisplay = currency === 'USD' ? `$${price}` : `₹${price}`;

                            return (
                                <div key={plan.id} className={`
                                    backdrop-blur-2xl border rounded-3xl p-6 flex flex-col h-full transition-all group relative shadow-sm hover:shadow-2xl
                                    ${isCurrentPlan
                                        ? 'bg-blue-50/50 dark:bg-blue-500/10 border-blue-200/50 dark:border-blue-500/30'
                                        : isPro
                                            ? 'bg-white dark:bg-slate-900/60 border-blue-200 dark:border-blue-500/30 hover:border-blue-400 dark:hover:border-blue-500/50'
                                            : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'}
                                `}>
                                    {isPro && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.4)]">Popular</span>
                                        </div>
                                    )}
                                    {isPro && (
                                        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className={`text-lg font-black mb-1 ${isFree ? 'text-slate-900 dark:text-white' :
                                            isBasic ? 'text-blue-600 dark:text-blue-400' :
                                                isPro ? 'text-blue-600 dark:text-white' :
                                                    'text-purple-600 dark:text-purple-400'
                                            }`}>{plan.name}</h3>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {plan.description}
                                        </p>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                                {priceDisplay}
                                            </span>
                                            <span className="text-slate-500 font-bold text-xs">/mo</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8 flex-1">
                                        <ul className="space-y-4">
                                            {plan.features && plan.features.length > 0 ? (
                                                plan.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                                                        <Check className={`h-4 w-4 shrink-0 p-1 rounded-full ${isFree || isBasic ? 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' :
                                                            isPro ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' :
                                                                'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                                                            }`} />
                                                        {feature.text || feature}
                                                    </li>
                                                ))
                                            ) : (
                                                <>
                                                    <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                                        <Check className="h-4 w-4 text-blue-600 bg-blue-50 dark:bg-blue-500/10 shrink-0 p-0.5 rounded-full" /> {plan.max_projects === 100 ? 'Unlimited' : plan.max_projects} Projects
                                                    </li>
                                                    <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                                        <Check className="h-4 w-4 text-blue-600 bg-blue-50 dark:bg-blue-500/10 shrink-0 p-0.5 rounded-full" /> {plan.allowed_origins} Allowed Origin{plan.allowed_origins > 1 ? 's' : ''}
                                                    </li>
                                                    <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                                        <Check className="h-4 w-4 text-blue-600 bg-blue-50 dark:bg-blue-500/10 shrink-0 p-0.5 rounded-full" /> {new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(plan.monthly_events)} events/mo
                                                    </li>
                                                    {plan.live_logs && (
                                                        <li className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                                            <Check className="h-4 w-4 text-blue-600 bg-blue-50 dark:bg-blue-500/10 shrink-0 p-0.5 rounded-full" /> Live Activity Logs
                                                        </li>
                                                    )}
                                                </>
                                            )}
                                        </ul>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (isCurrentPlan) return;
                                            if (isFree) handleDowngrade();
                                            else if (plan.id === 'business') { /* Do nothing or handle contact sales */ }
                                            else handleUpgrade(plan.id); // Pass plan.id to handleUpgrade
                                        }}
                                        disabled={isCurrentPlan || (isFree && usageStats.plan === 'free') || (plan.id === 'business')} // Disable business button
                                        className={`
                                            w-full py-4 rounded-2xl font-black text-sm transition-all shadow-sm
                                            ${isCurrentPlan
                                                ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 cursor-default border border-blue-200 dark:border-blue-500/50'
                                                : isFree
                                                    ? 'bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                                    : isBusiness
                                                        ? 'bg-slate-50 dark:bg-transparent border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 active:scale-[0.98]' // Style for Contact Sales
                                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.98]'}
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        `}
                                    >
                                        {isCurrentPlan ? 'Active Plan' :
                                            isFree ? 'Downgrade' :
                                                isBusiness ? 'Contact Sales' : // Text for Business plan
                                                    currentPlanPrice < price ? 'Upgrade' : 'Switch'}
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
