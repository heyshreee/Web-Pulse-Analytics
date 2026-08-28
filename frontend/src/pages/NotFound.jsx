import { Link } from 'react-router-dom';
import { BarChart2, ArrowLeft, Home } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300">
            <header className="p-6 md:px-12 md:py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800">
                        <img src="/logo-01.png" alt="WebPulse logo" className="h-full w-full object-cover" />
                    </div>
                    <span className="font-bold tracking-tight text-slate-900 dark:text-white">WebPulse</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-1 bg-white dark:bg-slate-900 rounded-xl shadow-soft border border-slate-200 dark:border-slate-800">
                        <ThemeToggle />
                    </div>
                    <Link to="/login" className="btn-secondary btn-sm">Log in</Link>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-4 pb-16 text-center">
                <div className="text-[9rem] md:text-[12rem] font-bold leading-none tracking-tighter text-slate-900/[0.05] dark:text-white/[0.05] select-none">
                    404
                </div>
                <h2 className="page-title -mt-10 mb-3 font-display">Page not found</h2>
                <p className="page-sub max-w-lg mx-auto mb-10">
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link to="/dashboard" className="btn-primary btn-md">
                        <Home className="h-4 w-4" />
                        Back to dashboard
                    </Link>
                    <Link to="/" className="btn-secondary btn-md">
                        <ArrowLeft className="h-4 w-4" />
                        Go home
                    </Link>
                </div>
            </main>

            <footer className="p-6 md:px-12 md:py-6 text-center">
                <p className="text-slate-400 dark:text-slate-600 text-xs">
                    © 2026 WebPulse
                </p>
            </footer>
        </div>
    );
}
