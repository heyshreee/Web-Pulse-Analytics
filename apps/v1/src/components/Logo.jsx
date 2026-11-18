import { Link } from 'react-router-dom';

export default function Logo({ to = '/', href, label = 'WebPulse', className = '' }) {
    const isExternal = href || (typeof to === 'string' && (to.startsWith('http://') || to.startsWith('https://')));
    const targetHref = href || to;

    const content = (
        <>
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden">
                <img src="/logo-128.png" alt="WebPulse logo" width="40" height="40" decoding="async" className="h-full w-full object-cover" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display">
                {label}
            </span>
        </>
    );

    if (isExternal) {
        return (
            <a href={targetHref} className={`flex items-center gap-2.5 group ${className}`}>
                {content}
            </a>
        );
    }

    return (
        <Link to={to} className={`flex items-center gap-2.5 group ${className}`}>
            {content}
        </Link>
    );
}