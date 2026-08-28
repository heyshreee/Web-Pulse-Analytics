import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Integrations() {
    const groups = [
        {
            title: "Infrastructure",
            tint: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white",
            items: [
                { name: "AWS", desc: "Deploy and scale your tracked services on AWS without friction." },
                { name: "Cloudflare", desc: "Run WebPulse alongside your Cloudflare-served sites and apps." },
                { name: "Vercel", desc: "Add WebPulse to Vercel-hosted frontends in minutes." }
            ]
        },
        {
            title: "Data",
            tint: "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400",
            items: [
                { name: "Supabase", desc: "Backend and storage that plays well with your analytics stream." },
                { name: "Google Analytics", desc: "Complement your existing analytics with real-time events." }
            ]
        },
        {
            title: "Payments",
            tint: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
            items: [
                { name: "Razorpay", desc: "Track and analyze usage alongside your payment flows." }
            ]
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
                        <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="eyebrow mb-3">Integrations</p>
                        <h2 className="page-title !text-4xl">Works with your stack</h2>
                        <p className="page-sub !text-base mt-3 max-w-2xl mx-auto">
                            Run WebPulse alongside the tools and services you already use every day.
                        </p>
                    </div>

                    {groups.map((group) => (
                        <div key={group.title} className="mb-12">
                            <h3 className="eyebrow mb-4">{group.title}</h3>
                            <div className="grid md:grid-cols-3 gap-5">
                                {group.items.map((item) => (
                                    <div key={item.name} className="card card-pad card-hover">
                                        <div className={`w-11 h-11 rounded-xl ${group.tint} flex items-center justify-center font-bold text-lg mb-4`}>
                                            {item.name[0]}
                                        </div>
                                        <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5 tracking-tight">
                                            {item.name}
                                        </h4>
                                        <p className="prose-quiet text-sm">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white dark:bg-slate-950 text-center">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-violet-500 text-white">
                        <BarChart2 className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">WebPulse</span>
                </div>
                <p className="text-slate-400 dark:text-slate-600 text-xs">© 2026 WebPulse Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}
