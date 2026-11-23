import { Link } from 'react-router-dom';

export default function Logo({ to = '/', label = 'WebPulse', className = '' }) {
    return (
        <Link to={to} className={`flex items-center gap-2.5 group ${className}`}>
            <span className="relative flex h-8 items-center justify-center shrink-0">
                <img
                    src="/logo.png"
                    alt="WebPulse logo"
                    className="h-6 w-auto max-h-7 object-contain dark:invert-0 invert transition-transform duration-200 group-hover:scale-105"
                    decoding="async"
                />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display">
                {label}
            </span>
        </Link>
    );
}