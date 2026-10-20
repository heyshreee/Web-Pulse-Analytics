import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import MarketingShell from '../../components/marketing/MarketingShell';
import PageTransition from '../../components/PageTransition';
import DocsSidebar from './DocsSidebar';
import { resolveActiveTo } from './docsNav';

const CTA_LINKS = [
    { to: '/docs/getting-started', label: 'Getting Started' },
    { to: '/docs/api', label: 'API Reference' },
    { to: '/docs/security', label: 'Security Guide' },
];

export default function DocsLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sectionId, setSectionId] = useState(null);
    const [sectionIds, setSectionIds] = useState([]);
    const [railTop, setRailTop] = useState(null);
    const location = useLocation();
    const { pathname, hash } = location;

    const activeTo = useMemo(
        () => resolveActiveTo(pathname, hash ? hash.slice(1) : null, sectionId, sectionIds),
        [pathname, hash, sectionId, sectionIds]
    );

    // Scroll to the requested anchor. The document body is lazy loaded, so the
    // element may not exist on the first frames — keep looking for a moment
    // instead of dropping the fragment on the floor.
    useEffect(() => {
        if (!hash) return undefined;
        let raf;
        let attempts = 0;
        const scrollToHash = () => {
            const el = document.getElementById(hash.slice(1));
            if (!el) {
                if (attempts < 40) raf = requestAnimationFrame(scrollToHash);
                return;
            }
            // The sections carry `scroll-mt-24`, so the heading clears the
            // sticky navigation bar.
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        raf = requestAnimationFrame(scrollToHash);
        return () => cancelAnimationFrame(raf);
    }, [pathname, hash]);

    // Track the section the reader is on so the rail can highlight it.
    useEffect(() => {
        let raf = null;
        const readSections = () => Array.from(document.querySelectorAll('main section[id]'));

        const update = () => {
            raf = null;
            const sections = readSections();
            const ids = sections.map((section) => section.id);
            setSectionIds((prev) =>
                prev.length === ids.length && prev.every((id, i) => id === ids[i]) ? prev : ids
            );

            const trigger = 140;
            let current = null;
            for (const section of sections) {
                if (section.getBoundingClientRect().top - trigger <= 0) current = section.id;
                else break;
            }
            // The final section stays current once the page is scrolled out.
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
                const last = sections[sections.length - 1];
                if (last) current = last.id;
            }
            setSectionId((prev) => (prev === current ? prev : current));
        };

        const schedule = () => {
            if (raf === null) raf = requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        // The page body arrives lazily — re-read the sections once it lands.
        const main = document.querySelector('main');
        const observer = typeof MutationObserver !== 'undefined' && main
            ? new MutationObserver(schedule)
            : null;
        if (observer) observer.observe(main, { childList: true, subtree: true });
        return () => {
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
            observer?.disconnect();
            if (raf !== null) cancelAnimationFrame(raf);
        };
    }, [pathname]);

    // The marketing nav is sticky and the preview notice above it changes its
    // height, so the rail follows the nav instead of assuming a fixed offset.
    useEffect(() => {
        const header = document.querySelector('[data-marketing-nav]');
        if (!header) return undefined;
        let raf = null;
        const update = () => {
            raf = null;
            const bottom = Math.round(header.getBoundingClientRect().bottom);
            setRailTop((prev) => (prev === bottom ? prev : bottom));
        };
        const onScroll = () => {
            if (raf === null) raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        // Dismissing the preview notice moves the nav up without firing a
        // scroll or resize event — watch the shell for that change.
        const observer = typeof MutationObserver !== 'undefined' && header.parentElement
            ? new MutationObserver(update)
            : null;
        if (observer) observer.observe(header.parentElement, { childList: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            observer?.disconnect();
            if (raf !== null) cancelAnimationFrame(raf);
        };
    }, []);

    // Escape closes the mobile drawer.
    useEffect(() => {
        if (!sidebarOpen) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setSidebarOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [sidebarOpen]);

    const railStyle = railTop
        ? { '--docs-rail-top': `${railTop}px`, '--docs-rail-h': `calc(100vh - ${railTop}px)` }
        : undefined;

    const ctaLinks = CTA_LINKS.filter((link) => link.to !== pathname);
    const showCta = pathname !== '/docs' && ctaLinks.length > 0;

    return (
        <MarketingShell grid={false} transition={false}>
            <div className="mx-auto flex max-w-[1400px]" style={railStyle}>
                <DocsSidebar activeTo={activeTo} variant="rail" />

                <div className="min-w-0 flex-1 px-5 pb-24 pt-10 sm:px-8 lg:px-12">
                    <div className="mx-auto max-w-3xl">
                        <div className="mb-8 lg:hidden">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(true)}
                                aria-expanded={sidebarOpen}
                                aria-controls="docs-drawer"
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

                    {showCta && (
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
                                        {ctaLinks.map((link, i) => (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                className={`mkt-btn ${i === 0 ? 'mkt-btn-primary' : 'mkt-btn-secondary'} mkt-btn-md`}
                                            >
                                                {link.label}
                                                {i === 0 && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* The drawer is portalled to <body> so it is not trapped inside the
                page's stacking context and can sit above the marketing nav. */}
            {typeof document !== 'undefined' &&
                createPortal(
                    <>
                        {sidebarOpen && (
                            <button
                                type="button"
                                aria-label="Close documentation menu"
                                onClick={() => setSidebarOpen(false)}
                                className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
                            />
                        )}
                        <DocsSidebar
                            activeTo={activeTo}
                            variant="drawer"
                            open={sidebarOpen}
                            onNavigate={() => setSidebarOpen(false)}
                        />
                    </>,
                    document.body
                )}
        </MarketingShell>
    );
}
