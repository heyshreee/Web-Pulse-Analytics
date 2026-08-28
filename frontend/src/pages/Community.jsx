import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Github, Twitter, BarChart2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Community() {
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
                        <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
                    </div>
                </div>
            </header>

            <main className="pt-28 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="eyebrow mb-3">Community</p>
                        <h2 className="page-title !text-4xl font-display">Join the <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 dark:from-violet-400 dark:to-fuchsia-300 bg-clip-text text-transparent">community</span></h2>
                        <p className="page-sub !text-base mt-3 max-w-2xl mx-auto">
                            Connect with other streamers, developers, and the WebPulse team.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        <a href="#" className="card card-pad card-hover text-center group">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5865F2]/10 mx-auto mb-5">
                                <MessageCircle className="h-7 w-7 text-[#5865F2] group-hover:scale-110 transition-transform" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">Discord</h2>
                            <p className="prose-quiet text-sm">Join our active Discord server for support, feature requests, and chat.</p>
                        </a>

                        <a href="#" className="card card-pad card-hover text-center group">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 mx-auto mb-5">
                                <Twitter className="h-7 w-7 text-sky-500 group-hover:scale-110 transition-transform" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">Twitter</h2>
                            <p className="prose-quiet text-sm">Follow us for the latest updates, tips, and shoutouts.</p>
                        </a>

                        <a href="#" className="card card-pad card-hover text-center group">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto mb-5">
                                <Github className="h-7 w-7 text-slate-900 dark:text-white group-hover:scale-110 transition-transform" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">GitHub</h2>
                            <p className="prose-quiet text-sm">Contribute to our open-source projects or report bugs.</p>
                        </a>
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-white/[0.06] py-10 bg-slate-50 dark:bg-[#070A10] text-center">
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
