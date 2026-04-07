import { Link } from 'react-router-dom';
import { ArrowLeft, Book, Code, Terminal, Zap } from 'lucide-react';

export default function Documentation() {
    const sections = [
        {
            title: "Getting Started",
            icon: <Zap className="h-6 w-6 text-yellow-500" />,
            desc: "New to WebPulse? Start here with our quick setup guide and core concepts."
        },
        {
            title: "API Reference",
            icon: <Terminal className="h-6 w-6 text-blue-500" />,
            desc: "Full documentation for our REST and WebSocket APIs with interactive code examples."
        },
        {
            title: "SDKs & Plugins",
            icon: <Code className="h-6 w-6 text-purple-500" />,
            desc: "Libraries for JavaScript, Python, OBS Studio, and popular streaming tools."
        },
        {
            title: "Guides & Tutorials",
            icon: <Book className="h-6 w-6 text-emerald-500" />,
            desc: "Deep dives into advanced tracking, audience engagement, and data visualization."
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-[#0B0E14] text-slate-900 dark:text-slate-200 font-sans selection:bg-blue-500/30 transition-colors duration-500">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#0B0E14]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Back to Home</span>
                    </Link>
                </div>
            </header>

            <main className="pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">Documentation</h2>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                            Learn how to get the most out of WebPulse Analytics.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {sections.map((section, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-slate-50 dark:bg-[#151921] border border-slate-200 dark:border-white/5 hover:border-blue-500/20 transition-all shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-xl bg-slate-200 dark:bg-white/5">
                                        {section.icon}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{section.title}</h3>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
                                    {section.desc}
                                </p>
                                <button className="text-blue-600 dark:text-blue-400 font-black text-sm uppercase tracking-widest hover:text-blue-500 dark:hover:text-white transition-colors">
                                    View Details →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-white/5 py-12 bg-white dark:bg-[#0B0E14] text-center">
                <p className="text-slate-500 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest">© 2026 WebPulse Analytics Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}
