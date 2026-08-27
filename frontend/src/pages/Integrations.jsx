import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, BarChart2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Integrations() {
    const integrations = [
        {
            name: "OBS Studio",
            desc: "Native browser source integration for seamless tracking.",
            tint: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
        },
        {
            name: "Streamlabs",
            desc: "Compatible with Streamlabs Desktop and widgets.",
            tint: "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400"
        },
        {
            name: "Twitch",
            desc: "Connect your Twitch account for subscriber-only analytics.",
            tint: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
        },
        {
            name: "YouTube Live",
            desc: "Track YouTube Live viewer engagement metrics.",
            tint: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
        },
        {
            name: "Discord",
            desc: "Send stream alerts directly to your Discord server.",
            tint: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        },
        {
            name: "Zapier",
            desc: "Connect WebPulse Analytics to 5,000+ other apps.",
            tint: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
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
                        <h2 className="page-title !text-4xl">Integrations</h2>
                        <p className="page-sub !text-base mt-3 max-w-2xl mx-auto">
                            Connect WebPulse Analytics with the tools you already use.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {integrations.map((item, i) => (
                            <div key={i} className="card card-pad card-hover group cursor-pointer">
                                <div className={`w-11 h-11 rounded-xl ${item.tint} flex items-center justify-center font-bold text-lg mb-4 transition-transform group-hover:scale-105`}>
                                    {item.name[0]}
                                </div>
                                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5 flex items-center gap-2 tracking-tight">
                                    {item.name}
                                    <ExternalLink className="h-4 w-4 text-slate-400 dark:text-slate-600 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
                                </h3>
                                <p className="prose-quiet text-sm">{item.desc}</p>
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
