import { Link } from 'react-router-dom';

export default function Logo({ to = '/', href, label = 'WebPulse', className = '' }) {
    const isExternal = href || (typeof to === 'string' && (to.startsWith('http://') || to.startsWith('https://')));
    const targetHref = href || to;

    const content = (
        <>
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