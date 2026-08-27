import { Link } from 'react-router-dom';
import { ArrowLeft, Book, Code, Terminal, Zap, BarChart2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Documentation() {
    const sections = [
        {
            title: "Getting Started",
            icon: Zap,
            desc: "New to WebPulse? Start here with our quick setup guide and core concepts."
        },
        {
            title: "API Reference",
            icon: Terminal,
            desc: "Full documentation for our REST and WebSocket APIs with interactive code examples."
        },
        {
            title: "SDKs & Plugins",
            icon: Code,
            desc: "Libraries for JavaScript, Python, OBS Studio, and popular streaming tools."
        },
        {
            title: "Guides & Tutorials",
            icon: Book,
            desc: "Deep dives into advanced tracking, audience engagement, and data visualization."
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
                        <p className="eyebrow mb-3">Documentation</p>
                        <h2 className="page-title !text-4xl">Documentation</h2>
                        <p className="page-sub !text-base mt-3 max-w-2xl mx-auto">
                            Learn how to get the most out of WebPulse Analytics.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {sections.map((section, i) => (
                            <div key={i} className="card card-pad card-hover">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                                        <section.icon className="h-6 w-6 text-violet-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">{section.title}</h3>
                                </div>
                                <p className="prose-quiet mb-5">{section.desc}</p>
                                <button className="text-violet-600 dark:text-violet-400 font-medium text-sm hover:text-violet-500 dark:hover:text-white transition-colors">
                                    View details →
                                </button>
                            </div>
                        ))}
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
