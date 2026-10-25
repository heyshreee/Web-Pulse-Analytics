import { useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import MarketingNav from './MarketingNav';
import MarketingFooter, { REPO_URL } from './MarketingFooter';
import PageTransition from '../PageTransition';

const NOTICE_KEY = 'webpulse:v1-notice-dismissed';

/**
 * Slim, dismissible notice that keeps the honest "V1 preview" framing from the
 * original construction banner without the blinking treatment.
 */
export function PreviewNotice() {
  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem(NOTICE_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const dismiss = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(NOTICE_KEY, '1');
    } catch {
      /* storage unavailable — ignore */
    }
  };

  if (!visible) return null;

  return (
    <div className="relative z-40 border-b border-white/[0.06] bg-white/[0.02]">
      <div className="mkt-container relative flex items-center justify-center gap-3 py-2 pr-11">
        <span className="mkt-live-dot !h-1.5 !w-1.5" aria-hidden="true" />
        <p className="text-center text-xs text-slate-400">
          <span className="font-semibold text-slate-300">V1 preview.</span>{' '}
          WebPulse is built in the open and still evolving.{' '}
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-medium text-violet-300 underline-offset-2 hover:text-violet-200 hover:underline"
          >
            Follow development
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss preview notice"
          className="absolute right-4 inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Shared shell for every marketing page: skip link, preview notice, navigation,
 * page background and footer. Dashboard routes never render this layout.
 *
 * `transition` wraps the page content in the shared route transition; pages
 * that render their own persistent chrome (e.g. the docs layout) opt out and
 * animate just their outlet instead.
 */
export default function MarketingShell({ children, grid = true, tone = 'default', transition = true }) {
  return (
    <div className="mkt-shell">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-violet-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      {grid && (
        <div
          aria-hidden="true"
          className={`${
            tone === 'hero' ? 'absolute inset-x-0 top-0 h-[900px]' : 'absolute inset-x-0 top-0 h-[420px]'
          } mkt-grid-bg`}
        />
      )}

      <PreviewNotice />
      <MarketingNav />

      <main id="main" className="relative z-10">
        {transition ? <PageTransition>{children}</PageTransition> : children}
      </main>

      <MarketingFooter />
    </div>
  );
}

