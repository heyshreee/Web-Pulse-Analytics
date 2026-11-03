import { Link } from 'react-router-dom';

export default function Logo({ to = '/', label = 'WebPulse', className = '' }) {
    return (
        <Link to={to} className={`flex items-center gap-2.5 group ${className}`}>
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden">
                <img src="/logo-128.png" alt="WebPulse logo" width="40" height="40" decoding="async" className="h-full w-full object-cover" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display">
                {label}
            </span>
        </Link>
    );
}