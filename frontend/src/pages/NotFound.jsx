import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import { Button } from '../components/ui/Button';

export default function NotFound() {
    return (
        <div
            className="min-h-screen flex flex-col font-sans transition-colors duration-300"
            style={{ background: 'var(--background)', color: 'var(--foreground)' }}
        >
            <header className="p-6 md:px-12 md:py-6 flex items-center justify-between">
                <Logo />
                <div className="flex items-center gap-2">
                    <Link to="/login" className="btn btn--outline btn--sm">
                        Sign in
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-4 pb-16 text-center">
                <div
                    className="text-[8rem] md:text-[11rem] font-bold leading-none tracking-tighter select-none opacity-10"
                    style={{ color: 'var(--foreground)' }}
                >
                    404
                </div>
                <h1 className="page-title -mt-8 mb-3">Page not found</h1>
                <p className="page-desc max-w-md mx-auto mb-8">
                    The page you are looking for does not exist, has been moved, or is temporarily unavailable.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link to="/dashboard" className="btn btn--primary">
                        <Home className="h-4 w-4" />
                        Back to dashboard
                    </Link>
                    <Link to="/" className="btn btn--outline">
                        <ArrowLeft className="h-4 w-4" />
                        Go to homepage
                    </Link>
                </div>
            </main>

            <footer className="p-6 md:px-12 md:py-6 text-center border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    © 2026 WebPulse Analytics. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
