import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Logo from '../components/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-6">
      <header className="max-w-6xl w-full mx-auto py-4">
        <Logo to="/dashboard" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <p
          aria-hidden="true"
          className="select-none font-mono text-[7rem] font-bold leading-none tracking-tighter text-white/[0.07] sm:text-[10rem]"
        >
          404
        </p>
        <h1 className="text-3xl font-bold tracking-tight -mt-6 sm:-mt-10 mb-3">Page not found</h1>
        <p className="text-slate-400 max-w-md mx-auto mb-8 text-sm">
          The dashboard route you are looking for does not exist or has moved.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Back to Dashboard
        </Link>
      </main>

      <footer className="text-center py-4 text-xs text-slate-500">
        © {new Date().getFullYear()} WebPulse Analytics
      </footer>
    </div>
  );
}
