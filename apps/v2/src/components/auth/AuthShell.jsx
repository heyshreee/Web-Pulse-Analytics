import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Logo from '../Logo';
import EditorialGlobe from './EditorialGlobe';

function getMarketingUrl() {
  const isProdDomain =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'webpulseanalytics.tech' ||
      window.location.hostname.endsWith('.webpulseanalytics.tech'));
  const defaultMarketing = isProdDomain ? 'https://webpulseanalytics.tech' : 'http://localhost:5174';
  return (import.meta.env.VITE_MARKETING_URL || defaultMarketing).replace(/\/+$/, '');
}

function getV1ConsoleUrl() {
  const isProdDomain =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'webpulseanalytics.tech' ||
      window.location.hostname.endsWith('.webpulseanalytics.tech'));
  const defaultV1 = isProdDomain ? 'https://app.webpulseanalytics.tech' : 'http://localhost:5173';
  return (import.meta.env.VITE_V1_APP_URL || import.meta.env.VITE_APP_URL || defaultV1).replace(/\/+$/, '');
}

export function AuthTabs({ active }) {
  const { search } = useLocation();
  const base =
    'flex-1 rounded-[2px] py-2 text-center font-mono text-xs uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFFFF]';

  return (
    <div
      className="noir-auth-tabs mb-4 grid grid-cols-2 gap-1 rounded-[2px] border border-white/[0.14] bg-[#0A0A0A] p-1"
      role="tablist"
      aria-label="Authentication mode"
    >
      <Link
        to={`/login${search}`}
        role="tab"
        aria-selected={active === 'login'}
        aria-current={active === 'login' ? 'page' : undefined}
        className={`${base} ${
          active === 'login'
            ? 'bg-[#FFFFFF] font-semibold text-[#050505]'
            : 'text-[#969690] hover:text-[#F5F5F4]'
        }`}
      >
        Sign in
      </Link>
      <Link
        to={`/register${search}`}
        role="tab"
        aria-selected={active === 'register'}
        aria-current={active === 'register' ? 'page' : undefined}
        className={`${base} ${
          active === 'register'
            ? 'bg-[#FFFFFF] font-semibold text-[#050505]'
            : 'text-[#969690] hover:text-[#F5F5F4]'
        }`}
      >
        Create account
      </Link>
    </div>
  );
}

export default function AuthShell({ children, legal = true, showGlobe = false }) {
  const marketingUrl = getMarketingUrl();
  const v1Url = getV1ConsoleUrl();
  const year = new Date().getFullYear();

  return (
    <div className="noir-auth relative flex min-h-dvh flex-col bg-[#050505] text-[#F5F5F4] antialiased selection:bg-[#FFFFFF] selection:text-[#050505]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="noir-grid-bg" />
        {showGlobe && (
          <div className="noir-globe-stage absolute inset-x-0 bottom-0 h-[260px] sm:h-[360px] lg:h-[460px] overflow-hidden">
            <EditorialGlobe className="h-full w-full" />
          </div>
        )}
      </div>

      <header className="relative z-10 border-b border-white/[0.08] bg-[#050505]/85 backdrop-blur-sm">
        <div className="noir-auth-header-inner mx-auto flex h-16 w-full max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8">
          <Logo href={marketingUrl} tone="noir" className="shrink-0" />

          <div className="flex items-center gap-5">
            <a
              href={`${v1Url}/login`}
              className="hidden items-center gap-1 font-mono text-xs text-[#969690] transition-colors hover:text-[#FFFFFF] sm:inline-flex"
            >
              V1 Stable
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </a>

            <a
              href={marketingUrl}
              className="inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-[2px] border border-white/[0.14] bg-[#0A0A0A] px-3 py-1.5 font-mono text-xs text-[#C8C8C4] transition-colors hover:border-white/30 hover:text-[#FFFFFF]"
            >
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              Back to site
            </a>
          </div>
        </div>
      </header>

      <main
        id="auth-main"
        className="relative z-10 flex flex-1 flex-col px-4 py-8"
      >
        <div className="mx-auto my-auto w-full max-w-[404px] shadow-[0_24px_80px_rgba(0,0,0,0.92)]">
          {children}
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/[0.08] bg-[#050505]/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1320px] flex-col items-center justify-between gap-2.5 px-5 py-4 text-center text-xs text-[#969690] sm:flex-row sm:px-8 sm:text-left">
          {legal ? (
            <p className="leading-relaxed">
              By continuing, you agree to our{' '}
              <Link
                to="/terms"
                className="text-[#C8C8C4] underline underline-offset-4 transition-colors hover:text-[#FFFFFF]"
              >
                Terms
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="text-[#C8C8C4] underline underline-offset-4 transition-colors hover:text-[#FFFFFF]"
              >
                Privacy Policy
              </Link>
              .
            </p>
          ) : (
            <p className="font-mono">Zero client cookies &middot; HttpOnly session auth</p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-5 font-mono">
            <a href={`${marketingUrl}/docs`} className="transition-colors hover:text-[#FFFFFF]">
              Docs
            </a>
            <a href={`${marketingUrl}/pricing`} className="transition-colors hover:text-[#FFFFFF]">
              Pricing
            </a>
            <a href={`${marketingUrl}/security`} className="transition-colors hover:text-[#FFFFFF]">
              Security
            </a>
            <span className="text-[#8E8E88]">&copy; {year} WebPulse Analytics</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
