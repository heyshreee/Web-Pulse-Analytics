import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Activity, Menu, X, BookOpen, BarChart2, ArrowRight
} from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
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
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
            <header className="fixed top-0 w-full z-[60] bg-white/80 dark:bg-space-900/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.06]">
                <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg"
                        >
                            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                        <Link to="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="font-medium text-sm">Back to Home</span>
                        </Link>
                        <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            <BookOpen className="h-3.5 w-3.5" /> Documentation
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
                    </div>
                </div>
            </header>

            <div className="max-w-[1400px] mx-auto flex">
                <aside className={`
                    fixed lg:sticky top-16 h-[calc(100vh-64px)] w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 z-50 transition-all duration-500 overflow-y-auto
                    ${sidebarOpen ? 'left-0' : '-left-full lg:left-0'}
                `}>
                    <div className="p-6">
                        <Link to="/docs" className="flex items-center gap-2.5 mb-6 group">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm transition-transform duration-300 group-hover:scale-105">
                                <img src="/logo-01.png" alt="WebPulse logo" className="h-full w-full object-cover" />
                            </div>
                            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Documentation</span>
                        </Link>

                        <nav className="space-y-6">
                            {docsNav.map((group) => (
                                <div key={group.label}>
                                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">{group.label}</p>
                                    <div className="space-y-0.5">
                                        {group.items.map((item) => {
                                            const active = isItemActive(item.to);
                                            return (
                                                <button
                                                    key={item.label}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={`block w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                                                        active
                                                            ? 'bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-300'
                                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                                                    }`}
                                                >
                                                    <Link to={item.to} className="flex items-center gap-2">
                                                        {item.label}
                                                        {active && <span className="ml-auto h-1 w-1 rounded-full bg-violet-500"></span>}
                                                    </Link>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>
                </aside>

                <main ref={mainRef} className="flex-1 min-w-0 pt-28 pb-24 px-6 sm:px-12 lg:px-16">
                    <div className="mx-auto max-w-3xl">
                        <div className="lg:hidden mb-8">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors"
                            >
                                <Menu className="h-4 w-4" /> Browse documentation
                            </button>
                        </div>
                        <Outlet />
                    </div>

                    <div className="mx-auto max-w-3xl mt-20">
                        <div className="card card-pad text-center bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-500/10 dark:to-fuchsia-500/5 border-violet-100 dark:border-white/[0.06]">
                            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">Still exploring?</h3>
                            <p className="prose-quiet mb-6 max-w-xl mx-auto">
                                Browse the full documentation hub, read the developer guides, or jump straight into building.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link to="/docs/getting-started" className="btn-primary btn-md">
                                    Getting Started <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link to="/docs/api" className="btn-secondary btn-md">
                                    API Reference
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <footer className="border-t border-slate-200 dark:border-white/[0.06] py-10 bg-slate-50 dark:bg-[#070A10] text-center">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-70">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg overflow-hidden bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                        <img src="/logo-01.png" alt="WebPulse logo" className="h-full w-full object-cover" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">WebPulse</span>
                </div>
                <p className="text-slate-400 dark:text-slate-600 text-xs">© 2026 WebPulse · Documentation</p>
            </footer>
        </div>
    );
}