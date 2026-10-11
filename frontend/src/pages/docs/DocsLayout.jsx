import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Logo from '../../components/Logo';
import {
    ArrowLeft, Menu, X, BookOpen, ArrowRight,
    Search, Sparkles, ChevronRight
} from 'lucide-react';
import { docsNav } from './docsNav';

export default function DocsLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { pathname, hash } = location;
    const mainRef = useRef(null);

    useEffect(() => {
        let raf;
        const scrollToHash = () => {
            if (hash) {
                const el = document.getElementById(hash.slice(1));
                if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - 96;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }
        };

        if (hash) {
            raf = requestAnimationFrame(scrollToHash);
        }
        return () => cancelAnimationFrame(raf);
    }, [pathname, hash]);

    const isItemActive = (to) => {
        const [path, itemHash] = to.split('#');
        const pathMatch = location.pathname === path;
        if (!pathMatch) return false;
        return itemHash ? location.hash === `#${itemHash}` : !location.hash;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 relative selection:bg-violet-500/30 selection:text-violet-200">
            {/* Ambient Background Grid & Glow */}
            <div className="pointer-events-none fixed inset-0 z-0 obs-grid opacity-70" />
            <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-violet-600/10 via-fuchsia-600/5 to-transparent blur-3xl -z-10" />

            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-white/85 dark:bg-[#0B0F17]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.07]">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg"
                        >
                            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                        <Logo />
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            <BookOpen className="h-3.5 w-3.5" /> Documentation
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1">
                            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
                        </Link>
                        <Link to="/register" className="btn-signal btn-md">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto flex relative z-10">
                {/* Sticky Sidebar Navigation */}
                <aside className={`
                    fixed lg:sticky top-16 h-[calc(100vh-64px)] w-72 border-r border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#070A10]/95 backdrop-blur-xl z-40 transition-all duration-300 overflow-y-auto
                    ${sidebarOpen ? 'left-0 shadow-2xl' : '-left-full lg:left-0'}
                `}>
                    <div className="p-6">
                        <nav className="space-y-6">
                            {docsNav.map((group) => (
                                <div key={group.label}>
                                    <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3">
                                        {group.label}
                                    </p>
                                    <div className="space-y-1">
                                        {group.items.map((item) => {
                                            const active = isItemActive(item.to);
                                            return (
                                                <Link
                                                    key={item.label}
                                                    to={item.to}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                                        active
                                                            ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                                                    }`}
                                                >
                                                    <span>{item.label}</span>
                                                    {active && <span className="h-1.5 w-1.5 rounded-full bg-white"></span>}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main ref={mainRef} className="flex-1 min-w-0 pt-28 pb-24 px-6 sm:px-12 lg:px-16">
                    <div className="mx-auto max-w-3xl">
                        <div className="lg:hidden mb-8">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-400 px-3 py-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10"
                            >
                                <Menu className="h-4 w-4" /> Browse Documentation Menu
                            </button>
                        </div>
                        <Outlet />
                    </div>

                    <div className="mx-auto max-w-3xl mt-20">
                        <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-indigo-600/10 p-8 sm:p-10 text-center backdrop-blur-xl">
                            <h3 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mb-2">
                                Ready to deploy tracking?
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6">
                                Integrate WebPulse into your website in minutes. Free forever tier with real-time analytics.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                <Link to="/docs/getting-started" className="btn-signal btn-md">
                                    Getting Started Guide <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link to="/docs/api" className="btn-secondary btn-md">
                                    API Reference
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-200/80 dark:border-white/[0.06] py-12 bg-white dark:bg-[#070A10] text-center relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Logo />
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
                        <Link to="/features" className="hover:text-violet-600 dark:hover:text-white transition-colors">Features</Link>
                        <Link to="/integrations" className="hover:text-violet-600 dark:hover:text-white transition-colors">Integrations</Link>
                        <Link to="/api" className="hover:text-violet-600 dark:hover:text-white transition-colors">API</Link>
                        <Link to="/docs" className="hover:text-violet-600 dark:hover:text-white transition-colors">Docs</Link>
                        <Link to="/pricing" className="hover:text-violet-600 dark:hover:text-white transition-colors">Pricing</Link>
                        <Link to="/blog" className="hover:text-violet-600 dark:hover:text-white transition-colors">Blog</Link>
                        <Link to="/community" className="hover:text-violet-600 dark:hover:text-white transition-colors">Community</Link>
                        <Link to="/help" className="hover:text-violet-600 dark:hover:text-white transition-colors">Help</Link>
                    </div>
                    <p className="text-slate-400 dark:text-slate-600 text-xs">© 2026 WebPulse Analytics. Real-time web observability.</p>
                </div>
            </footer>
        </div>
    );
}