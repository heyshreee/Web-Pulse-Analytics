import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../Logo';
import { MARKETING_LINKS } from '../../data/marketingNav';

/**
 * Primary navigation for every marketing page.
 * Sticky, keyboard accessible, with an explicit mobile panel.
 */
export default function MarketingNav() {
  const { pathname } = useLocation();
  // Store the pathname the panel was opened at so navigation closes it
  // without an effect (the panel is "open" only on the route it opened from).
  const [openPath, setOpenPath] = useState(null);
  const open = openPath === pathname;

  // Escape closes the mobile panel.
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpenPath(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const isActive = (to) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#070A10]/80 backdrop-blur-xl">
      <div className="mkt-container flex h-16 items-center justify-between gap-4">
        {/* Logo renders its own home <Link>; wrapping it in another link would nest anchors. */}
        <Logo className="shrink-0" />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {MARKETING_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              aria-current={isActive(l.to) ? 'page' : undefined}
              className={`mkt-navlink rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(l.to)
                  ? 'text-white'
                  : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/login" className="mkt-btn mkt-btn-ghost mkt-btn-md">
            Log in
          </Link>
          <Link to="/register" className="mkt-btn mkt-btn-primary mkt-btn-md">
            Start tracking
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpenPath(open ? null : pathname)}
          aria-expanded={open}
          aria-controls="marketing-mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          id="marketing-mobile-nav"
          className="border-t border-white/[0.07] bg-[#070A10]/95 backdrop-blur-xl lg:hidden"
        >
          <nav aria-label="Mobile" className="mkt-container flex flex-col py-4">
            {MARKETING_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                aria-current={isActive(l.to) ? 'page' : undefined}
                className={`rounded-lg px-3 py-3 text-[0.9375rem] font-medium transition-colors ${
                  isActive(l.to) ? 'text-white' : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/[0.07] pt-4">
              <Link to="/login" className="mkt-btn mkt-btn-secondary mkt-btn-lg w-full">
                Log in
              </Link>
              <Link to="/register" className="mkt-btn mkt-btn-primary mkt-btn-lg w-full">
                Start tracking
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
