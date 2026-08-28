import { Link } from 'react-router-dom';
import { ArrowLeft, Activity, Layout, Bell, Zap, Shield, Globe, BarChart2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Features() {
    const features = [
        {
            icon: Activity,
            title: "Real-Time Tracking",
            description: "See every visitor, session, and event as it happens. Live event delivery keeps your dashboard always up to date."
        },
        {
            icon: Layout,
            title: "Multi-Project Dashboard",
            description: "Manage multiple websites, apps, or live experiences from a single interface. Switch between projects with one click."
        },
        {
            icon: Bell,
            title: "Smart Alerts",
            description: "Set custom thresholds for traffic, usage, or engagement. Get notified the moment important milestones are reached."
        },
        {
            icon: Zap,
            title: "Developer SDK",
            description: "A lightweight SDK and clean APIs make it easy to send custom events straight from your application."
        },
        {
            icon: Shield,
            title: "Privacy First",
            description: "We respect your data and your visitors' privacy. We are GDPR compliant and never sell your data to third parties."
        },
        {
            icon: Globe,
            title: "Adaptable Tracking",
            description: "Track websites, native apps, and live audiences with one account — no lock-in, no complex setup."
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
            <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
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
                        <h2 className="page-title !text-4xl">Real-time analytics for your whole product</h2>
                        <p className="page-sub !text-base mt-3 max-w-2xl mx-auto">
                            Everything you need to understand your visitors, track your events, and grow.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <div key={i} className="card card-pad card-hover">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                                    <feature.icon className="h-6 w-6 text-violet-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">{feature.title}</h3>
                                <p className="prose-quiet">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <Link to="/register" className="btn-primary btn-lg">Start free today</Link>
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white dark:bg-slate-950 text-center">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-violet-500 text-white">
                        <BarChart2 className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">WebPulse</span>
                </div>
                <p className="text-slate-400 dark:text-slate-600 text-xs">© 2026 WebPulse</p>
            </footer>
        </div>
    );
}
