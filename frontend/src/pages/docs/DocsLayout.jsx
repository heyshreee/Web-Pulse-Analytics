import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import Logo from '../../components/Logo';
import MarketingShell from '../../components/marketing/MarketingShell';
import PageTransition from '../../components/PageTransition';
import { docsNav } from './docsNav';

export default function DocsLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { pathname, hash } = location;

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
        <MarketingShell grid={false} transition={false}>
            {/* Mobile drawer backdrop */}
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close documentation menu"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
                />
            )}

            <div className="mx-auto flex max-w-[1400px]">
                <aside
                    id="docs-sidebar"
                    className={`
                        fixed left-0 top-0 z-[70] h-full w-72 overflow-y-auto border-r border-white/[0.07] bg-[#0B0F17]
                        transition-transform duration-300 lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:bg-transparent
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}
                >
                    <div className="p-6">
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <Logo to="/docs" label="Documentation" />
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                aria-label="Close documentation menu"
                                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 lg:hidden"
                            >
                                <X className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>

                        <nav aria-label="Documentation" className="space-y-6">
                            {docsNav.map((group) => (
                                <div key={group.label}>
                                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{group.label}</p>
                                    <div className="space-y-0.5">
                                        {group.items.map((item) => {
                                            const active = isItemActive(item.to);
                                            return (
                                                <Link
                                                    key={item.label}
                                                    to={item.to}
                                                    onClick={() => setSidebarOpen(false)}
                                                    aria-current={active ? 'page' : undefined}
                                                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
                                                        active
                                                            ? 'bg-violet-500/15 text-violet-300'
                                                            : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
                                                    }`}
                                                >
                                                    {item.label}
                                                    {active && <span className="ml-auto h-1 w-1 rounded-full bg-violet-400"></span>}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>
                </aside>

                <div className="min-w-0 flex-1 px-5 pb-24 pt-10 sm:px-8 lg:px-12">
                    <div className="mx-auto max-w-3xl">
                        <div className="mb-8 lg:hidden">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                aria-expanded={sidebarOpen}
                                aria-controls="docs-sidebar"
                                className="mkt-btn mkt-btn-secondary mkt-btn-sm"
                            >
                                {sidebarOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Menu className="h-4 w-4" aria-hidden="true" />}
                                Browse documentation
                            </button>
                        </div>
                        <PageTransition>
                            <Outlet />
                        </PageTransition>
                    </div>

                    <div className="mx-auto mt-20 max-w-3xl">
                        <div className="mkt-panel relative overflow-hidden px-6 py-10 text-center">
                            <div
                                aria-hidden="true"
                                className="mkt-glow left-1/2 top-[-140px] h-[280px] w-[480px] max-w-[110vw] -translate-x-1/2 bg-violet-600/20"
                            />
                            <div className="relative">
                                <h2 className="mkt-h3 !text-2xl">Still exploring?</h2>
                                <p className="mkt-body mx-auto mt-3 max-w-xl">
                                    Browse the full documentation hub, read the developer guides, or jump straight into building.
                                </p>
                                <div className="mt-7 flex flex-wrap justify-center gap-3">
                                    <Link to="/docs/getting-started" className="mkt-btn mkt-btn-primary mkt-btn-md">
                                        Getting Started
                                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                    <Link to="/docs/api" className="mkt-btn mkt-btn-secondary mkt-btn-md">
                                        API Reference
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MarketingShell>
    );
}
