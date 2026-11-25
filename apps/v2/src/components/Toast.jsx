import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, Shield, Activity, X } from 'lucide-react';

const variants = {
    success: { icon: CheckCircle, tone: 'text-[#FFFFFF]', bar: 'bg-[#FFFFFF]', label: 'Success' },
    error: { icon: XCircle, tone: 'text-[#EF4444]', bar: 'bg-[#EF4444]', label: 'Error' },
    warning: { icon: AlertTriangle, tone: 'text-[#E5E5E5]', bar: 'bg-[#A3A3A3]', label: 'Warning' },
    info: { icon: Info, tone: 'text-[#F5F5F4]', bar: 'bg-[#969690]', label: 'Info' },
    security: { icon: Shield, tone: 'text-[#FFFFFF]', bar: 'bg-[#FFFFFF]', label: 'Security Alert' },
    system: { icon: Activity, tone: 'text-[#FFFFFF]', bar: 'bg-[#FFFFFF]', label: 'System Update' },
};

/**
 * Editorial Noir toast rendered inside `.toast-region` stack.
 */
export default function Toast({
    message,
    title,
    description,
    type = 'info',
    tone,
    onClose,
    duration = 5000,
    action = null,
}) {
    const [leaving, setLeaving] = useState(false);
    const variantKey = tone || type || 'info';
    const variant = variants[variantKey] || variants.info;
    const Icon = variant.icon;
    const bodyText = description || title || message;
    const headerText = description ? (title || variant.label) : variant.label;

    useEffect(() => {
        if (!onClose || duration === Infinity) return undefined;
        const timer = setTimeout(() => {
            setLeaving(true);
            setTimeout(onClose, 200);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const dismiss = () => {
        setLeaving(true);
        setTimeout(() => onClose?.(), 200);
    };

    return (
        <div
            className="toast relative overflow-hidden rounded-[2px] border border-white/[0.16] bg-[#0A0A0A] p-4 pr-11 font-sans text-[#F5F5F4] shadow-[0_20px_60px_rgba(0,0,0,0.92)]"
            data-leaving={leaving}
            role="status"
            aria-live="polite"
        >
            <div className={`absolute bottom-0 left-0 top-0 w-[2px] ${variant.bar}`} aria-hidden="true" />
            <span className={`toast-icon ml-1 mt-0.5 shrink-0 ${variant.tone}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="toast-text min-w-0 flex-1">
                <span className="toast-title block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#FFFFFF]">
                    {headerText}
                </span>
                {bodyText ? (
                    <span className="toast-desc mt-1 block text-sm leading-snug text-[#C8C8C4]">
                        {bodyText}
                    </span>
                ) : null}
                {action ? (
                    <button
                        type="button"
                        className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#FFFFFF] underline underline-offset-4 hover:text-[#C8C8C4]"
                        onClick={() => {
                            dismiss();
                            action.onClick?.();
                        }}
                    >
                        {action.label}
                    </button>
                ) : null}
            </span>
            <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss notification"
                className="absolute right-3.5 top-3.5 rounded-[2px] p-0.5 text-[#969690] transition-colors hover:text-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFFFF]"
            >
                <X className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
}
