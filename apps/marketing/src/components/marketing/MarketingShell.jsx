import MarketingNav from './MarketingNav';
import MarketingFooter from './MarketingFooter';
import PageTransition from '../PageTransition';

/**
 * Compatibility export; kept as null to keep header chrome architectural and clean.
 */
export function PreviewNotice() {
  return null;
}

/**
 * Shared Editorial Noir shell for all marketing routes:
 * skip-to-content link, architectural grid backdrop, navigation, transition, and footer.
 */
export default function MarketingShell({ children, grid = false, tone = 'default', transition = true }) {
  return (
    <div className="mkt-shell">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[2px] focus:bg-[#FFFFFF] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#050505]"
      >
        Skip to content
      </a>

      {grid && (
        <div
          aria-hidden="true"
          className={`${
            tone === 'hero' ? 'absolute inset-x-0 top-0 h-[760px]' : 'absolute inset-x-0 top-0 h-[360px]'
          } mkt-grid-bg pointer-events-none`}
        />
      )}

      <MarketingNav />

      <main id="main" className="relative z-10">
        {transition ? <PageTransition>{children}</PageTransition> : children}
      </main>

      <MarketingFooter />
    </div>
  );
}
