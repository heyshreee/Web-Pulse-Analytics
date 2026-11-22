import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Logo from '../components/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-ink wp-studio-canvas flex flex-col justify-between p-6">
      <header className="max-w-5xl w-full mx-auto py-2">
        <Logo to="/dashboard" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <p
          aria-hidden="true"
          className="select-none font-mono text-[6rem] sm:text-[9rem] font-bold leading-none tracking-tighter text-ink-muted/15"
        >
          404
        </p>
        <h1 className="text-lg font-semibold tracking-tight -mt-4 sm:-mt-6 mb-2 text-ink">Page not found</h1>
        <p className="text-xs font-mono text-ink-muted max-w-sm mx-auto mb-6">
          The requested route does not exist or has been relocated.
        </p>

        <Link
          to="/dashboard"
          className="btn-primary h-8 px-3.5 text-xs inline-flex items-center gap-1.5"
        >
          <Home className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Dashboard
        </Link>
      </main>

      <footer className="text-center py-3 text-[11px] font-mono text-ink-muted border-t border-line">
        © {new Date().getFullYear()} WebPulse Analytics
      </footer>
    </div>
  );
}
