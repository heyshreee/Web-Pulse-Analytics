import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Activity, Gauge, Globe, LayoutDashboard, Bell, History, FileDown, Braces, Bug, BarChart2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Features() {
    const hero = {
        icon: Activity,
        eyebrow: "Real-Time Monitoring",
        title: "See what's happening as it happens.",
        description: "Monitor website activity and user behavior in real time. Track incoming activity and keep your analytics view close to what's happening on your application."
    };

    const features = [
        {
            icon: Gauge,
            title: "Performance Analytics",
            headline: "Understand how your website performs.",
            description: "Track performance signals such as page load times, response times, and other application performance metrics so you can identify where your experience needs improvement."
        },
        {
            icon: Globe,
            title: "Traffic & Visitor Analytics",
            headline: "Know where your visitors come from.",
            description: "Understand visitor patterns, traffic sources, sessions, unique visitors, and user journeys. See how people reach your application and how they move through it."
        },
        {
            icon: LayoutDashboard,
            title: "Custom Dashboards",
            headline: "Build a view around the metrics that matter.",
            description: "Create personalized dashboard views around the metrics you care about — from traffic and active users to performance measurements."
        },
        {
            icon: Bell,
            title: "Alerts & Notifications",
            headline: "Know when something needs attention.",
            description: "Configure monitoring and notification workflows for important analytics or performance conditions so you don't have to constantly watch the dashboard."
        },
        {
            icon: History,
            title: "Historical Analytics",
            headline: "Don't just see today. Understand the trend.",
            description: "Store historical analytics and compare your data over time to identify changes in traffic, performance, and user behavior."
        },
        {
            icon: FileDown,
            title: "Reports & Data Export",
            headline: "Take your analytics with you.",
            description: "Generate analytics reports and export your data for further analysis, reporting, or sharing."
        },
        {
            icon: Braces,
            title: "REST API",
            headline: "Connect WebPulse to your own stack.",
            description: "Use the WebPulse REST API to integrate analytics data with your existing applications, internal tools, and workflows."
        },
        {
            icon: Bug,
            title: "User & Error Tracking",
            headline: "Understand both users and failures.",
            description: "Track unique visitors, sessions, and user journeys while capturing application errors and exceptions that can affect the experience."
        }
    ];

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
                        <Link to="/pricing" className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
                        <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="eyebrow mb-3">Features</p>
                        <h2 className="page-title !text-4xl font-display">Real-time <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">analytics</span> for your entire web product</h2>
                        <p className="page-sub !text-base mt-3 max-w-2xl mx-auto">
                            Understand what your visitors are doing, where your traffic comes from, how your application performs, and what changes over time — from one analytics platform.
                        </p>
                    </div>

                    <div className="card card-pad card-hover mb-8">
                        <div className="md:flex md:items-center md:gap-8">
                            <div className="mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10 md:mb-0">
                                <hero.icon className="h-7 w-7 text-violet-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-2">{hero.eyebrow}</p>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">{hero.title}</h3>
                                <p className="prose-quiet">{hero.description}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {features.map((feature, i) => (
                            <div key={i} className="card card-pad card-hover">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                                    <feature.icon className="h-6 w-6 text-violet-500" />
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-2">{feature.title}</p>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">{feature.headline}</h3>
                                <p className="prose-quiet">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="card card-pad mt-20 text-center bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-500/10 dark:to-fuchsia-500/5 border-violet-100 dark:border-white/[0.06]">
                        <h3 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white mb-3">See what's happening on your website.</h3>
                        <p className="page-sub !text-base mt-3 max-w-xl mx-auto">
                            Start tracking your first project with WebPulse.
                        </p>
                        <Link to="/register" className="btn-primary btn-lg mt-6">
                            Start Tracking
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-white/[0.06] py-10 bg-slate-50 dark:bg-[#070A10] text-center">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg overflow-hidden bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                        <img src="/logo-01.png" alt="WebPulse logo" className="h-full w-full object-cover" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">WebPulse</span>
                </div>
                <p className="text-slate-400 dark:text-slate-600 text-xs">© 2026 WebPulse</p>
            </footer>
        </div>
    );
}