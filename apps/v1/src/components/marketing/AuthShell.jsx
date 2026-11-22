import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../Logo';
import PageTransition from '../PageTransition';

/**
 * Stark monochrome studio chrome for authentication routes (/login, /register,
 * /verify-email, /forgot-password, /reset-password, /auth/google/callback).
 */
export function AuthTabs({ active }) {
  const base =
    'flex-1 rounded py-1.5 text-center text-xs font-medium transition-colors font-mono';
  return (
    <div className="mb-4 flex w-full items-center gap-1 rounded-lg border border-line bg-surface p-1">
      <Link
        to="/login"
        aria-current={active === 'login' ? 'page' : undefined}
        className={`${base} ${
          active === 'login' ? 'bg-ink text-canvas font-semibold' : 'text-ink-secondary hover:text-ink'
        }`}
      >
        Sign in
      </Link>
      <Link
        to="/register"
        aria-current={active === 'register' ? 'page' : undefined}
        className={`${base} ${
          active === 'register' ? 'bg-ink text-canvas font-semibold' : 'text-ink-secondary hover:text-ink'
        }`}
      >
        Create account
      </Link>
    </div>
  );
}

export default function AuthShell({ children, legal = true }) {
  const isProdDomain = typeof window !== 'undefined' &&
    (window.location.hostname === 'webpulseanalytics.tech' || window.location.hostname.endsWith('.webpulseanalytics.tech'));
  const defaultMarketing = isProdDomain ? 'https://webpulseanalytics.tech' : 'http://localhost:5174';
  const marketingUrl = (import.meta.env.VITE_MARKETING_URL || defaultMarketing).replace(/\/+$/, '');

  return (
    <div className="min-h-screen bg-black text-ink wp-studio-canvas relative flex flex-col justify-between">
      <a
        href="#auth-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-ink focus:px-3 focus:py-1.5 focus:text-xs focus:font-medium focus:text-canvas"
      >
        Skip to content
      </a>

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
        <Logo href={marketingUrl} />
        <a
          href={marketingUrl}
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink font-mono"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          Back to site
        </a>
      </header>

      <main
        id="auth-main"
        className="relative z-10 flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-8"
      >
        <PageTransition className="w-full max-w-sm">{children}</PageTransition>
      </main>

      <footer className="relative z-10 px-6 py-6 text-center border-t border-line">
        {legal && (
          <p className="mx-auto mb-1.5 max-w-md text-xs text-ink-muted">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-ink hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-ink hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        )}
        <p className="text-[11px] text-ink-muted font-mono">
          © {new Date().getFullYear()} WebPulse Analytics
        </p>
      </footer>
    </div>
  );
}
