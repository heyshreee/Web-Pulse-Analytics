import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import {
    Activity,
    Bell,
    BarChart2,
    Check,
    Menu,
    X,
    Play,
    Star,
    ArrowRight,
    Globe,
    Zap,
    Layers
} from 'lucide-react';

export default function Landing() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('react');
    const [isAutoCycling, setIsAutoCycling] = useState(true);

    // Automatic tab cycling
    useEffect(() => {
        if (!isAutoCycling) return;

        const tabs = ['react', 'vue', 'node'];
        const interval = setInterval(() => {
            setActiveTab((current) => {
                const currentIndex = tabs.indexOf(current);
                const nextIndex = (currentIndex + 1) % tabs.length;
                return tabs[nextIndex];
            });
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoCycling]);

    const [plans, setPlans] = useState([
        {
            id: 'free',
            name: 'Free',
            price_usd: 0,
            price_inr: 0,
            features: ['1 Project', '1 Allowed Origin', '1,000 events/mo', '60 sec refresh', 'Basic Analytics'],
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
            features: ['5 Projects', '3 Allowed Origins', 'Live Device Stats', '50,000 events/mo', '10 sec refresh', 'Real-time Analytics'],
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
            features: ['15 Projects', '10 Allowed Origins', 'Live Activity Logs', '500,000 events/mo', '1 sec refresh', 'Advanced Analytics', 'Priority Support'],
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

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/features', label: 'Features' },
        { to: '/pricing', label: 'Pricing' },
        { to: '/blog', label: 'Blog' },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans transition-colors duration-300">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group/logo">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-violet-500 text-white shadow-soft transition-transform duration-300 group-hover/logo:scale-105">
                            <BarChart2 className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                            WebPulse <span className="text-violet-600 dark:text-violet-300">Analytics</span>
                        </span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-1">
                            <nav className="flex items-center mr-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
                            <Link to="/login" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                Log in
                            </Link>
                            <Link to="/register" className="btn-primary btn-md ml-1">
                                Start Tracking
                            </Link>
                        </div>

                        <ThemeToggle />

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-1">
                        {navLinks.map((link) => (
                            <Link key={link.to} to={link.to} className="block px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium">
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                            <Link to="/login" className="block px-3 py-2 text-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium">
                                Log in
                            </Link>
                            <Link to="/register" className="btn-primary btn-md w-full">Get Started</Link>
                        </div>
                    </div>
                )}
            </header>

            <main className="pt-16">
                {/* Hero Section */}
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 sm:py-28">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full badge-slate mb-8">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            WebPulse Analytics Solutions
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight text-slate-900 dark:text-white">
                            Track every <span className="text-violet-600 dark:text-violet-400">frame</span>.
                            <br />
                            Know every <span className="text-violet-600 dark:text-violet-400">viewer</span>.
                        </h1>

                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Stop guessing who's watching. Get granular, real-time analytics for every stream.
                            Understand your audience, optimize your content, and grow your channel.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
                            <Link to="/register" className="btn-primary btn-lg w-full sm:w-auto">
                                Start Tracking Now
                            </Link>
                            <button
                                onClick={() => setIsVideoOpen(true)}
                                className="btn-secondary btn-lg w-full sm:w-auto"
                            >
                                <Play className="h-4 w-4 fill-current" /> Watch Demo
                            </button>
                        </div>

                        {/* Mockup */}
                        <div className="relative max-w-5xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-1.5 shadow-lift">
                            <div className="bg-white dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[4/3] sm:aspect-[16/9] relative group">
                                {/* Fake UI Header */}
                                <div className="h-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center px-4 gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-300 dark:bg-red-500/40"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-300 dark:bg-amber-500/40"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-300 dark:bg-emerald-500/40"></div>
                                    </div>
                                    <div className="ml-4 text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest">WebPulse Analytics Dashboard</div>
                                </div>
                                {/* Fake UI Content */}
                                <div className="p-3 sm:p-6 grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6 h-full">
                                    <div className="hidden sm:block col-span-1 border-r border-slate-100 dark:border-slate-800 pr-6 space-y-4">
                                        <div className="h-8 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                                        <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                        <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                        <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                    </div>
                                    <div className="col-span-3 space-y-6">
                                        <div className="flex gap-4">
                                            <div className="h-24 w-1/3 bg-violet-500/10 border border-violet-500/20 rounded-xl"></div>
                                            <div className="h-24 w-1/3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"></div>
                                            <div className="h-24 w-1/3 bg-amber-500/10 border border-amber-500/20 rounded-xl"></div>
                                        </div>
                                        <div className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Logos */}
                <section className="py-12 border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-white/[0.02]">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">Integrated with your favorite platforms</p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
                            <div className="text-xl font-bold text-slate-700 dark:text-slate-300 tracking-tight">Razorpay</div>
                            <div className="text-xl font-bold text-[#3ECF8E] tracking-tight">Supabase</div>
                            <div className="text-xl font-bold text-[#F9AB00] tracking-tight">Google Analytics</div>
                            <div className="text-xl font-bold text-[#F38020] tracking-tight">Cloudflare</div>
                            <div className="text-xl font-bold text-[#FF9900] tracking-tight">AWS</div>
                            <div className="text-xl font-bold text-slate-700 dark:text-slate-300 tracking-tight">Vercel</div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <p className="eyebrow mb-3">Why WebPulse</p>
                        <h2 className="page-title !text-4xl sm:!text-5xl">
                            Precision analytics for <span className="text-violet-600 dark:text-violet-400">streamers</span>
                        </h2>
                        <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Everything you need to take your content to the next level.</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6 mb-16">
                        {[
                            {
                                icon: <Activity className="h-6 w-6" />,
                                color: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
                                title: "Real-time Activity Logs",
                                desc: "Track every visitor action as it happens — not minutes later. WebPulse captures live events such as page visits, session starts, and engagement activity in real time using WebSockets.",
                                get: ["Live visitor activity feed", "Real-time page and session tracking", "Instant data updates", "Low-latency event delivery"],
                                why: ["Perfect for live streams and launches", "Immediate insight into traffic spikes", "No waiting for analytics reports"]
                            },
                            {
                                icon: <Layers className="h-6 w-6" />,
                                color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
                                title: "Multi-Project Management",
                                desc: "Manage multiple websites, streams, or applications from one centralized dashboard. Each project is fully isolated with its own tracking ID and data stream.",
                                get: ["Multiple project support", "Dedicated tracking IDs per project", "Fast project switching", "Secure data separation"],
                                why: ["Ideal for agencies, creators, and dev teams", "One account, many projects", "Clean organization without complexity"]
                            },
                            {
                                icon: <Bell className="h-6 w-6" />,
                                color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
                                title: "Instant Usage Alerts",
                                desc: "Stay informed the moment something changes. WebPulse monitors usage patterns and notifies you immediately when predefined thresholds are reached.",
                                get: ["Real-time usage notifications", "Viewer milestone alerts", "Performance degradation alerts", "Custom alert thresholds"],
                                why: ["React before problems escalate", "Never miss peak engagement moments", "Better stream and site reliability"]
                            }
                        ].map((feature, i) => (
                            <div key={i} className="card card-pad card-hover flex flex-col">
                                <div className={`h-12 w-12 rounded-xl ${feature.color} flex items-center justify-center mb-5`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="prose-quiet mb-6">{feature.desc}</p>

                                <div className="space-y-5 mt-auto">
                                    <div>
                                        <h4 className="eyebrow mb-2.5 !text-[11px] !tracking-[0.12em]">What you get</h4>
                                        <ul className="space-y-2">
                                            {feature.get.map((item, j) => (
                                                <li key={j} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="eyebrow mb-2.5 !text-[11px] !tracking-[0.12em]">Why it matters</h4>
                                        <ul className="space-y-2">
                                            {feature.why.map((item, j) => (
                                                <li key={j} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <Star className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Technical Highlights */}
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center py-12">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-left"
                        >
                            <p className="eyebrow mb-3">Technical highlights</p>
                            <h2 className="page-title !text-4xl mb-5">
                                Built for speed <br />and <span className="text-violet-600 dark:text-violet-400">scale</span>
                            </h2>
                            <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 leading-relaxed max-w-lg">
                                Our edge-optimized stack tracks millions of events in real-time, delivering insights directly to your dashboard and OBS overlays.
                            </p>

                            <div className="space-y-8">
                                {[
                                    {
                                        icon: <Zap className="h-5 w-5" />,
                                        bg: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
                                        title: "Real-Time WebSockets",
                                        desc: "Sub-100ms latency for all visitor events. Your OBS overlay and dashboard stay perfectly in sync."
                                    },
                                    {
                                        icon: <Globe className="h-5 w-5" />,
                                        bg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
                                        title: "Edge Optimized",
                                        desc: "Global tracking network ensures minimal impact on your site's performance and SEO."
                                    },
                                    {
                                        icon: <Layers className="h-5 w-5" />,
                                        bg: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
                                        title: "OBS Native",
                                        desc: "Seamlessly integrate your live stats into OBS Browser Sources with customizable templates."
                                    }
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-start gap-4 group">
                                        <div className={`p-3 rounded-xl ${feature.bg} transition-transform group-hover:scale-105`}>
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{feature.title}</h3>
                                            <p className="prose-quiet">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative group"
                        >
                            <div className="card overflow-hidden">
                                {/* Header */}
                                <div className="h-10 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-5 gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-300 dark:bg-red-500/40"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-300 dark:bg-amber-500/40"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-300 dark:bg-emerald-500/40"></div>
                                    </div>
                                    <div className="ml-4 flex gap-2">
                                        {['react', 'vue', 'node'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => {
                                                    setActiveTab(tab);
                                                    setIsAutoCycling(false);
                                                }}
                                                className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-medium transition-all ${activeTab === tab
                                                    ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
                                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                    }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-[0.2em] hidden sm:block">SDK v2.0</div>
                                </div>
                                {/* Code content */}
                                <div className="p-6 sm:p-8 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto whitespace-pre min-h-[320px] relative bg-slate-950 dark:bg-[#0B0E14] text-slate-200">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {activeTab === 'react' && (
                                                <div className="space-y-1">
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">01</span><span><span className="text-fuchsia-400">import</span> <span className="text-slate-400">{'{'}</span> <span className="text-cyan-400">useEffect</span> <span className="text-slate-400">{'}'}</span> <span className="text-fuchsia-400">from</span> <span className="text-emerald-400">'react'</span><span className="text-slate-400">;</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">02</span><span><span className="text-fuchsia-400">import</span> <span className="text-slate-400">{'{'}</span> <span className="text-cyan-400">WebPulse</span> <span className="text-slate-400">{'}'}</span> <span className="text-fuchsia-400">from</span> <span className="text-emerald-400">'@webpulse/sdk'</span><span className="text-slate-400">;</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">03</span><span> </span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">04</span><span><span className="text-fuchsia-400">const</span> <span className="text-indigo-100">tracker</span> <span className="text-slate-400">=</span> <span className="text-fuchsia-400">new</span> <span className="text-cyan-400">WebPulse</span><span className="text-slate-400">(</span><span className="text-emerald-400">'wp_live_7x92k...'</span><span className="text-slate-400">);</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">05</span><span> </span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">06</span><span><span className="text-fuchsia-400">const</span> <span className="text-indigo-100">App</span> <span className="text-slate-400">=</span> <span className="text-slate-400">()</span> <span className="text-slate-400">={'>'}</span> <span className="text-slate-400">{'{'}</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">07</span><span>    <span className="text-cyan-400">useEffect</span><span className="text-slate-400">(()</span> <span className="text-slate-400">={'>'}</span> <span className="text-slate-400">{'{'}</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">08</span><span>        <span className="text-indigo-100">tracker</span><span className="text-slate-400">.</span><span className="text-cyan-400">init</span><span className="text-slate-400">({'{'}</span> <span className="text-slate-200">realtime</span><span className="text-slate-400">:</span> <span className="text-amber-400">true</span> <span className="text-slate-400">{'}'});</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">09</span><span>    <span className="text-slate-400">{'}'}, []);</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">10</span><span><span className="text-slate-400">{'}'};</span></span></div>
                                                </div>
                                            )}
                                            {activeTab === 'vue' && (
                                                <div className="space-y-1">
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">01</span><span><span className="text-fuchsia-400">import</span> <span className="text-slate-400">{'{'}</span> <span className="text-cyan-400">onMounted</span> <span className="text-slate-400">{'}'}</span> <span className="text-fuchsia-400">from</span> <span className="text-emerald-400">'vue'</span><span className="text-slate-400">;</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">02</span><span><span className="text-fuchsia-400">import</span> <span className="text-slate-400">{'{'}</span> <span className="text-cyan-400">WebPulse</span> <span className="text-slate-400">{'}'}</span> <span className="text-fuchsia-400">from</span> <span className="text-emerald-400">'@webpulse/sdk'</span><span className="text-slate-400">;</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">03</span><span> </span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">04</span><span><span className="text-cyan-400">onMounted</span><span className="text-slate-400">(()</span> <span className="text-slate-400">={'>'}</span> <span className="text-slate-400">{'{'}</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">05</span><span>    <span className="text-fuchsia-400">const</span> <span className="text-indigo-100">tracker</span> <span className="text-slate-400">=</span> <span className="text-fuchsia-400">new</span> <span className="text-cyan-400">WebPulse</span><span className="text-slate-400">(</span><span className="text-emerald-400">'wp_live_7k2...'</span><span className="text-slate-400">);</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">06</span><span> </span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">07</span><span>    <span className="text-indigo-100">tracker</span><span className="text-slate-400">.</span><span className="text-cyan-400">on</span><span className="text-slate-400">(</span><span className="text-emerald-400">'visitor'</span><span className="text-slate-400">, (</span><span className="text-indigo-100">event</span><span className="text-slate-400">)</span> <span className="text-slate-400">={'>'}</span> <span className="text-slate-400">{'{'}</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">08</span><span>        <span className="text-slate-400">console</span><span className="text-slate-400">.</span><span className="text-cyan-400">log</span><span className="text-slate-400">(</span><span className="text-emerald-400">`Live: ${'{'}event.city{'}'}`</span><span className="text-slate-400">);</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">09</span><span>    <span className="text-slate-400">{'}'});</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">10</span><span><span className="text-slate-400">{'}'});</span></span></div>
                                                </div>
                                            )}
                                            {activeTab === 'node' && (
                                                <div className="space-y-1">
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">01</span><span><span className="text-fuchsia-400">const</span> <span className="text-slate-400">{'{'}</span> <span className="text-cyan-400">WebPulse</span> <span className="text-slate-400">{'}'}</span> <span className="text-slate-400">=</span> <span className="text-cyan-400">require</span><span className="text-slate-400">(</span><span className="text-emerald-400">'@webpulse/sdk'</span><span className="text-slate-400">);</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">02</span><span> </span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">03</span><span><span className="text-fuchsia-400">const</span> <span className="text-indigo-100">tracker</span> <span className="text-slate-400">=</span> <span className="text-fuchsia-400">new</span> <span className="text-cyan-400">WebPulse</span><span className="text-slate-400">({'{'}</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">04</span><span>    <span className="text-indigo-100">apiKey</span><span className="text-slate-400">:</span> <span className="text-emerald-400">'wp_live_7x92k...'</span><span className="text-slate-400">,</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">05</span><span>    <span className="text-indigo-100">env</span><span className="text-slate-400">:</span> <span className="text-emerald-400">'production'</span><span className="text-slate-400">,</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">06</span><span>    <span className="text-indigo-100">bufferSize</span><span className="text-slate-400">:</span> <span className="text-amber-400">10</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">07</span><span><span className="text-slate-400">{'}'});</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">08</span><span> </span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">09</span><span><span className="text-slate-500">// Track server-side events</span></span></div>
                                                    <div className="flex gap-4"><span className="text-slate-600 select-none">10</span><span><span className="text-indigo-100">tracker</span><span className="text-slate-400">.</span><span className="text-cyan-400">capture</span><span className="text-slate-400">(</span><span className="text-emerald-400">'api_call'</span><span className="text-slate-400">, {'{'}</span> <span className="text-indigo-100">userId</span><span className="text-slate-400">:</span> <span className="text-amber-400">123</span> <span className="text-slate-400">{'}'});</span></span></div>
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Testimonial */}
                <section id="testimonials" className="py-20 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <p className="eyebrow mb-3">Loved by creators</p>
                                <h2 className="page-title !text-4xl mb-6">
                                    Trusted by over <span className="text-violet-600 dark:text-violet-400">5,000+ creators</span>
                                </h2>
                                <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed max-w-lg">
                                    "WebPulse Analytics is the only analytics tool that gives me the granularity I need to understand my audience retention. It's completely changed how I plan my content schedule."
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="h-11 w-11 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                    <div>
                                        <div className="font-semibold text-slate-900 dark:text-white">Alex Rivera</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Professional Streamer, 500k+ Subs</div>
                                    </div>
                                </div>
                            </div>
                            <div className="card card-pad">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                                    ))}
                                </div>
                                <div className="space-y-3">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-700/40">
                                        <div className="text-sm text-slate-700 dark:text-slate-300">"The real-time alerts saved my stream twice last week. Indispensable."</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-700/40">
                                        <div className="text-sm text-slate-700 dark:text-slate-300">"Finally, analytics that actually look good and make sense."</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing */}
                <section id="pricing" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <p className="eyebrow mb-3">Pricing</p>
                        <h2 className="page-title !text-4xl mb-3">Transparent pricing</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">The perfect plan for every stage of your journey.</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-500 border-t-transparent"></div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {plans.map((plan) => {
                                const isPro = plan.id === 'pro';
                                const isFree = plan.id === 'free';

                                return (
                                    <div key={plan.id} className={`card card-pad flex flex-col transition-all duration-300 relative ${isPro
                                        ? 'bg-slate-900 border-slate-900 dark:bg-violet-500 dark:border-violet-500 transform lg:-translate-y-2'
                                        : 'card-hover'
                                        }`}>
                                        {isPro && (
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-violet-600 rounded-full text-[10px] font-semibold text-white tracking-wide shadow-soft">
                                                MOST POPULAR
                                            </div>
                                        )}

                                        <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${isPro ? 'text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>{plan.name}</h3>

                                        <div className="flex items-baseline gap-1 mb-1">
                                            <span className={`text-3xl font-bold ${isPro ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                                {!plan.price_inr && !plan.price_usd ? 'Free' : `₹${plan.price_inr}`}
                                            </span>
                                            {(plan.price_inr > 0) && <span className={isPro ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}>/mo</span>}
                                        </div>

                                        <div className={`text-xs mb-5 ${isPro ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {plan.price_usd > 0 ? `$${plan.price_usd} / month` : '$0 / month'}
                                        </div>

                                        <p className={`text-sm mb-6 min-h-[40px] ${isPro ? 'text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                                            {plan.id === 'free' && 'Trying WebPulse'}
                                            {plan.id === 'basic' && 'Students & solo devs'}
                                            {plan.id === 'pro' && 'Streamers & growing apps'}
                                            {plan.id === 'business' && 'Scale-ups & teams'}
                                        </p>

                                        <ul className="space-y-3 mb-8 flex-1">
                                            {plan.features && plan.features.length > 0 ? (
                                                plan.features.slice(0, 6).map((feature, idx) => (
                                                    <li key={idx} className={`flex items-center gap-2 text-sm ${isPro ? 'text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        <Check className={`h-4 w-4 shrink-0 ${isPro ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                                        {feature.text || feature}
                                                    </li>
                                                ))
                                            ) : (
                                                <>
                                                    <li className={`flex items-center gap-2 text-sm ${isPro ? 'text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        <Check className={`h-4 w-4 shrink-0 ${isPro ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                                        {plan.max_projects === 100 ? 'Unlimited' : plan.max_projects} Projects
                                                    </li>
                                                    <li className={`flex items-center gap-2 text-sm ${isPro ? 'text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        <Check className={`h-4 w-4 shrink-0 ${isPro ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                                        {plan.allowed_origins} Allowed Origin{plan.allowed_origins > 1 ? 's' : ''}
                                                    </li>
                                                    <li className={`flex items-center gap-2 text-sm ${isPro ? 'text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        <Check className={`h-4 w-4 shrink-0 ${isPro ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                                        {new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(plan.monthly_events)} events/mo
                                                    </li>
                                                    <li className={`flex items-center gap-2 text-sm ${isPro ? 'text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        <Check className={`h-4 w-4 shrink-0 ${isPro ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                                        {plan.refresh_rate === 0 ? 'Real-time' : `${plan.refresh_rate} sec`} dashboard refresh
                                                    </li>
                                                    {plan.live_logs && (
                                                        <li className={`flex items-center gap-2 text-sm ${isPro ? 'text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                                                            <Check className={`h-4 w-4 shrink-0 ${isPro ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                                            Live Activity Logs
                                                        </li>
                                                    )}
                                                </>
                                            )}
                                        </ul>

                                        <Link
                                            to="/register"
                                            className={isPro ? 'btn-primary btn-md w-full !bg-white !text-slate-900 dark:!bg-white dark:!text-slate-900 hover:!bg-slate-100' : 'btn-secondary btn-md w-full'}
                                        >
                                            {isFree ? 'Get Started' : `Choose ${plan.name}`}
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Stats */}
                <section className="py-16 border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {[
                                { value: '500M+', label: 'Views Tracked' },
                                { value: '12K+', label: 'Active Creators' },
                                { value: '99.9%', label: 'Uptime' },
                                { value: '24/7', label: 'Support' },
                            ].map((stat) => (
                                <div key={stat.label}>
                                    <div className="text-4xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">{stat.value}</div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-500 font-medium uppercase tracking-[0.3em]">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 px-4">
                    <div className="max-w-5xl mx-auto rounded-3xl bg-slate-900 dark:bg-violet-600 p-12 text-center relative overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-500/20 dark:bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 dark:bg-white/10 rounded-full blur-3xl" />
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">Your growth starts with better data.</h2>
                            <p className="text-slate-200 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">Join thousands of creators who are using WebPulse Analytics to build their audience.</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Link to="/register" className="btn-primary btn-lg !bg-white !text-slate-900 hover:!bg-slate-100">
                                    Get Started Free <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link to="/pricing" className="btn-md inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold px-5 py-3 text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all">
                                    View Pricing
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-slate-200 dark:border-slate-800 py-14 bg-white dark:bg-slate-950 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-10 mb-10">
                            <div className="col-span-1">
                                <Link to="/" className="flex items-center gap-3 mb-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-violet-500 text-white">
                                        <BarChart2 className="h-5 w-5" />
                                    </div>
                                    <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">WebPulse <span className="text-violet-600 dark:text-violet-300">Analytics</span></span>
                                </Link>
                                <p className="prose-quiet">
                                    The advanced analytics platform for modern content creators. Track, analyze, and grow.
                                </p>
                            </div>
                            {[
                                {
                                    title: 'Product',
                                    links: [
                                        { to: '/features', label: 'Features' },
                                        { to: '/pricing', label: 'Pricing' },
                                        { to: '/api', label: 'API' },
                                        { to: '/integrations', label: 'Integrations' },
                                    ]
                                },
                                {
                                    title: 'Resources',
                                    links: [
                                        { to: '/blog', label: 'Blog' },
                                        { to: '/docs', label: 'Documentation' },
                                        { to: '/community', label: 'Community' },
                                        { to: '/help', label: 'Help Center' },
                                    ]
                                },
                                {
                                    title: 'Legal',
                                    links: [
                                        { to: '/privacy', label: 'Privacy Policy' },
                                        { to: '/terms', label: 'Terms of Service' },
                                        { to: '/cookies', label: 'Cookie Policy' },
                                    ]
                                },
                            ].map((col) => (
                                <div key={col.title}>
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{col.title}</h4>
                                    <ul className="space-y-3">
                                        {col.links.map((link) => (
                                            <li key={link.to}>
                                                <Link to={link.to} className="text-sm text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors">{link.label}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-xs text-slate-400 dark:text-slate-600">© 2026 WebPulse Analytics Inc. All rights reserved.</p>
                            <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
                                <a href="#" className="hover:text-violet-600 dark:hover:text-white transition-colors">Twitter</a>
                                <a href="#" className="hover:text-violet-600 dark:hover:text-white transition-colors">GitHub</a>
                                <a href="#" className="hover:text-violet-600 dark:hover:text-white transition-colors">Discord</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>

            {/* Video Modal */}
            {isVideoOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-slate-700 shadow-lift">
                        <button
                            onClick={() => setIsVideoOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors z-10"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.youtube.com/embed/gNTU9WCmgbk?si=jsn0X5wxM76jv54c&autoplay=1"
                            title="Product Demo"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                    <div
                        className="absolute inset-0 -z-10"
                        onClick={() => setIsVideoOpen(false)}
                    ></div>
                </div>
            )}
        </div>
    );
}
