import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Mail, MessageSquare, BarChart2 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function HelpCenter() {
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
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="eyebrow mb-3">Help Center</p>
                    <h2 className="page-title !text-4xl mb-8">How can we help?</h2>

                    <div className="relative max-w-xl mx-auto mb-16">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            className="input pl-11 py-3"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-5 text-left">
                        <div className="card card-pad card-hover">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 tracking-tight">Account & Billing</h3>
                            <ul className="space-y-2 prose-quiet text-sm">
                                <li><a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Reset your password</a></li>
                                <li><a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Update payment method</a></li>
                                <li><a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Cancel subscription</a></li>
                            </ul>
                        </div>
                        <div className="card card-pad card-hover">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 tracking-tight">Troubleshooting</h3>
                            <ul className="space-y-2 prose-quiet text-sm">
                                <li><a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Browser source not loading</a></li>
                                <li><a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Data discrepancy</a></li>
                                <li><a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Connection issues</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Still need help?</h2>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <a href="mailto:support@obstracker.com" className="btn-primary btn-md">
                                <Mail className="h-4 w-4" /> Email support
                            </a>
                            <a href="#" className="btn-secondary btn-md">
                                <MessageSquare className="h-4 w-4" /> Live chat
                            </a>
                        </div>
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
                <p className="text-slate-400 dark:text-slate-600 text-xs">© 2026 WebPulse Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}
