import { Link } from 'react-router-dom';

export default function Logo({ to = '/', label = 'WebPulse', className = '' }) {
    return (
        <Link
            to={to}
            className={`inline-flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFFFF] rounded-[2px] ${className}`.trim()}
        >
            <span className="relative flex h-7 items-center justify-center shrink-0">
                <img
                    src="/logo.png"
                    alt="WebPulse mark"
                    className="h-5 w-auto max-h-6 object-contain opacity-95 transition-opacity duration-200 group-hover:opacity-100"
                    decoding="async"
                />
            </span>
            <span className="text-[17px] font-semibold tracking-[-0.025em] text-[#F5F5F4] font-display">
                {label}
            </span>
        </Link>
    );
}
