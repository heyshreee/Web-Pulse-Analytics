import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Github, Twitter } from 'lucide-react';

export default function Community() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#0B0E14] text-slate-900 dark:text-slate-200 font-sans selection:bg-blue-500/30 transition-colors duration-500">
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
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">Join the Community</h2>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                            Connect with other streamers, developers, and the WebPulse team.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <a href="#" className="p-8 rounded-3xl bg-slate-50 dark:bg-[#5865F2]/10 border border-slate-200 dark:border-[#5865F2]/20 hover:bg-slate-100 dark:hover:bg-[#5865F2]/20 transition-all text-center group shadow-sm">
                            <MessageCircle className="h-12 w-12 text-[#5865F2] mx-auto mb-6 group-hover:scale-110 transition-transform" />
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Discord</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Join our active Discord server for support, feature requests, and chat.</p>
                        </a>

                        <a href="#" className="p-8 rounded-3xl bg-slate-50 dark:bg-[#1DA1F2]/10 border border-slate-200 dark:border-[#1DA1F2]/20 hover:bg-slate-100 dark:hover:bg-[#1DA1F2]/20 transition-all text-center group shadow-sm">
                            <Twitter className="h-12 w-12 text-[#1DA1F2] mx-auto mb-6 group-hover:scale-110 transition-transform" />
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Twitter</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Follow us for the latest updates, tips, and shoutouts.</p>
                        </a>

                        <a href="#" className="p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-center group shadow-sm">
                            <Github className="h-12 w-12 text-slate-900 dark:text-white mx-auto mb-6 group-hover:scale-110 transition-transform" />
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">GitHub</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Contribute to our open-source projects or report bugs.</p>
                        </a>
                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-white/5 py-12 bg-white dark:bg-[#0B0E14] text-center">
                <p className="text-slate-500 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest">© 2026 WebPulse Analytics Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}
