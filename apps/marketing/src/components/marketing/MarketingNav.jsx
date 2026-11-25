import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Logo from '../Logo';
import { MARKETING_LINKS } from '../../data/marketingNav';
import { getCanonicalAppUrl } from '../../utils/urls';

/**
 * Primary Editorial Noir top navigation bar.
 * Sticky, keyboard-accessible, preserves V1 login/register and V2 Beta links.
 */
export default function MarketingNav() {
  const { pathname } = useLocation();
  const v1Url = getCanonicalAppUrl('v1');
  const v2Url = getCanonicalAppUrl('v2');
  const [openPath, setOpenPath] = useState(null);
  const open = openPath === pathname;

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
    <header
      data-marketing-nav=""
      className="sticky top-0 z-50 bg-[#0A0A0A]"
    >
      <div className="mkt-container flex h-16 items-center justify-between gap-6">
        <Logo className="shrink-0" />

        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {MARKETING_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              aria-current={isActive(l.to) ? 'page' : undefined}
              className={`mkt-navlink py-2 text-sm font-medium transition-colors ${
                isActive(l.to)
                  ? 'text-[#F5F5F4]'
                  : 'text-[#B3B3AF] hover:text-[#F5F5F4]'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`${v2Url}/login`}
            className="inline-flex items-center gap-1 px-2.5 py-2 text-sm text-[#B3B3AF] hover:text-[#FFFFFF] transition-colors"
            title="Open WebPulse V2 Beta console"
          >
            V2 Beta
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <span className="h-4 w-px bg-white/15" aria-hidden="true" />
          <a href={`${v1Url}/login`} className="mkt-btn mkt-btn-ghost mkt-btn-sm">
            Log in
          </a>
          <a href={`${v1Url}/register`} className="mkt-btn mkt-btn-primary mkt-btn-sm">
            Start tracking
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpenPath(open ? null : pathname)}
          aria-expanded={open}
          aria-controls="marketing-mobile-nav"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[2px] border border-white/15 bg-[#0B0B0B] text-[#F5F5F4] transition-colors hover:border-white/30 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          id="marketing-mobile-nav"
          className="border-t border-white/[0.11] bg-[#050505] lg:hidden"
        >
          <nav aria-label="Mobile" className="mkt-container flex flex-col py-4">
            {MARKETING_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                aria-current={isActive(l.to) ? 'page' : undefined}
                onClick={() => setOpenPath(null)}
                className={`border-b border-white/[0.08] py-3.5 text-base font-medium transition-colors ${
                  isActive(l.to) ? 'text-[#FFFFFF]' : 'text-[#C8C8C4] hover:text-[#F5F5F4]'
                }`}
              >
                {l.label}
              </Link>
            ))}

            <div className="mt-4 flex flex-col gap-2.5 pt-2">
              <a
                href={`${v1Url}/register`}
                className="mkt-btn mkt-btn-primary mkt-btn-lg w-full text-center"
              >
                Start tracking
              </a>
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={`${v1Url}/login`}
                  className="mkt-btn mkt-btn-secondary mkt-btn-md text-center"
                >
                  Log in (V1)
                </a>
                <a
                  href={`${v2Url}/login`}
                  className="mkt-btn mkt-btn-secondary mkt-btn-md text-center"
                >
                  V2 Beta
                </a>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
