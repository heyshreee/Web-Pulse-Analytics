import { Link } from 'react-router-dom';

export default function Logo({ to = '/', href, label = 'WebPulse', tone = 'default', className = '' }) {
    const isExternal = href || (typeof to === 'string' && (to.startsWith('http://') || to.startsWith('https://')));
    const targetHref = href || to;
    const isNoir = tone === 'noir';

    const content = (
        <>
            <span className="relative flex h-8 items-center justify-center shrink-0">
                <img
                    src="/logo.png"
                    alt="WebPulse logo"
                    className={`h-6 w-auto max-h-7 object-contain transition-transform duration-200 group-hover:scale-105 ${
                        isNoir ? 'invert-0' : 'dark:invert-0 invert'
                    }`}
                    decoding="async"
                />
            </span>
            <div className="flex items-center gap-2">
                <span
                    className={`text-lg tracking-tight ${
                        isNoir
                            ? 'font-semibold tracking-[-0.025em] text-[#F5F5F4]'
                            : 'font-bold text-slate-900 dark:text-slate-100 font-display'
                    }`}
                >
                    {label}
                </span>
                <span
                    className={
                        isNoir
                            ? 'inline-flex items-center rounded-[2px] border border-white/20 bg-[#141414] px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#C8C8C4]'
                            : 'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                    }
                >
                    Beta
                </span>
            </div>
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