import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import Logo from '../../components/Logo';
import { docsNav } from './docsNav';

/**
 * The documentation rail. Rendered twice: inline as the sticky desktop rail
 * and inside a portal as the mobile drawer. Both share this component so the
 * two can never drift apart.
 */
export default function DocsSidebar({ activeTo, onNavigate, variant = 'rail', open = false }) {
    const ref = useRef(null);
    const [more, setMore] = useState(false);
    const isDrawer = variant === 'drawer';

    // Keep the highlighted entry inside the visible part of the rail without
    // scrolling the page itself.
    useEffect(() => {
        const el = ref.current;
        if (!el || !activeTo) return;
        const link = el.querySelector(`[data-nav-to="${CSS.escape(activeTo)}"]`);
        if (!link) return;
        const top = link.offsetTop;
        const bottom = top + link.offsetHeight;
        if (top < el.scrollTop) el.scrollTop = Math.max(0, top - 16);
        else if (bottom > el.scrollTop + el.clientHeight) el.scrollTop = bottom - el.clientHeight + 16;
    }, [activeTo]);

    // Flag whether the list continues below the fold so the rail can fade out
    // at the cut instead of ending on a hard edge.
    useEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const update = () => {
            setMore(el.scrollHeight - el.clientHeight - el.scrollTop > 4);
        };
        update();
        el.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        // The rail changes height when the preview notice above it is
        // dismissed, so watch the element itself as well.
        const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
        observer?.observe(el);
        return () => {
            el.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
            observer?.disconnect();
        };
    }, []);

    return (
        <aside
            ref={ref}
            id={isDrawer ? 'docs-drawer' : 'docs-sidebar'}
            data-docs-nav=""
            className={[
                'docs-scroll',
                more ? 'has-more' : '',
                isDrawer
                    ? `docs-drawer${open ? ' is-open' : ''}`
                    : 'docs-rail hidden lg:block',
            ].join(' ')}
        >
            {isDrawer ? (
                /* The drawer covers the marketing nav, so its own header (and
                   the close button in it) must stay put while the list
                   scrolls underneath. */
                <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/[0.07] bg-[#0B0F17] px-5 py-4">
                    <Logo to="/docs" label="Documentation" />
                    <button
                        type="button"
                        onClick={onNavigate}
                        aria-label="Close documentation menu"
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between gap-4 px-6 pb-5 pt-6">
                    <Logo to="/docs" label="Documentation" />
                </div>
            )}

            <div className="px-5 pb-6 pt-5 lg:px-6">
                <nav aria-label="Documentation" className="space-y-6">
                    {docsNav.map((group) => (
                        <div key={group.label}>
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{group.label}</p>
                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const active = item.to === activeTo;
                                    return (
                                        <Link
                                            key={item.label}
                                            to={item.to}
                                            data-nav-to={item.to}
                                            onClick={onNavigate}
                                            aria-current={active ? 'page' : undefined}
                                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 ${
                                                active
                                                    ? 'bg-violet-500/15 text-violet-300'
                                                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
                                            }`}
                                        >
                                            {item.label}
                                            {active && <span className="ml-auto h-1 w-1 rounded-full bg-violet-400" aria-hidden="true" />}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>
        </aside>
    );
}
