import { Link } from 'react-router-dom';
import Logo from '../Logo';
import PageTransition from '../PageTransition';

/**
 * Minimal dark chrome shared by the authentication pages (/login, /register,
 * /verify-email, /forgot-password, /reset-password, /auth/google/callback).
 *
 * These routes are always forced dark by ThemeContext, so this shell is
 * dark-only by design; the dashboard keeps its own light/dark behavior.
 */
/**
 * Login / Register segmented switch shown above the auth card.
 */
export function AuthTabs({ active }) {
  const base =
    'flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-colors';
  return (
    <div className="mb-6 flex w-full items-center gap-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
      <Link
        to="/login"
        aria-current={active === 'login' ? 'page' : undefined}
        className={`${base} ${
          active === 'login' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
        }`}
      >
        Login
      </Link>
      <Link
        to="/register"
        aria-current={active === 'register' ? 'page' : undefined}
        className={`${base} ${
          active === 'register' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
        }`}
      >
        Register
      </Link>
    </div>
  );
}

export default function AuthShell({ children, legal = true }) {
  return (
    <div className="mkt-shell min-h-screen">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[420px] mkt-grid-bg" />
      <div
        aria-hidden="true"
        className="mkt-glow left-1/2 top-[-180px] h-[400px] w-[680px] max-w-[110vw] -translate-x-1/2 bg-violet-600/20"
      />

      <a
        href="#auth-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-violet-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center px-5 py-6 sm:px-8">
        {/* Logo renders its own home <Link>; wrapping it in another link would nest anchors. */}
        <Logo />
      </header>

      <main
        id="auth-main"
        className="relative z-10 flex min-h-[calc(100vh-13rem)] items-center justify-center px-4 py-10"
      >
        <PageTransition className="w-full max-w-md">{children}</PageTransition>
      </main>

      <footer className="relative z-10 px-6 py-8 text-center">
        {legal && (
          <p className="mx-auto mb-2 max-w-md text-sm text-slate-500">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-violet-300 hover:text-violet-200 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-violet-300 hover:text-violet-200 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        )}
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} WebPulse Analytics
        </p>
      </footer>
    </div>
  );
}
