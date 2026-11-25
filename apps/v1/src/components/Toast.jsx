import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X, Shield, Activity } from 'lucide-react';

const variants = {
    success: {
        icon: CheckCircle,
        iconColor: 'text-[#FFFFFF]',
        bar: 'bg-[#FFFFFF]',
        title: 'Success',
    },
    error: {
        icon: XCircle,
        iconColor: 'text-[#EF4444]',
        bar: 'bg-[#EF4444]',
        title: 'Error',
    },
    warning: {
        icon: AlertTriangle,
        iconColor: 'text-[#E5E5E5]',
        bar: 'bg-[#A3A3A3]',
        title: 'Warning',
    },
    info: {
        icon: Info,
        iconColor: 'text-[#F5F5F4]',
        bar: 'bg-[#969690]',
        title: 'Info',
    },
    security: {
        icon: Shield,
        iconColor: 'text-[#FFFFFF]',
        bar: 'bg-[#FFFFFF]',
        title: 'Security Alert',
    },
    system: {
        icon: Activity,
        iconColor: 'text-[#FFFFFF]',
        bar: 'bg-[#FFFFFF]',
        title: 'System Update',
    },
};

export default function Toast({ message, type = 'info', onClose, duration = 5000, action = null }) {
    const [isVisible, setIsVisible] = useState(true);
    const variant = variants[type] || variants.info;
    const Icon = variant.icon;

    const dismiss = () => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 220);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onClose?.(), 220);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-5 right-5 z-[100] transition-all duration-200 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            }`}
        >
            <div className="relative flex min-w-[300px] max-w-md items-start gap-3.5 overflow-hidden rounded-[2px] border border-white/[0.16] bg-[#0A0A0A] p-4 pr-11 font-sans text-[#F5F5F4] shadow-[0_20px_60px_rgba(0,0,0,0.92)]">
                <div className={`absolute bottom-0 left-0 top-0 w-[2px] ${variant.bar}`} aria-hidden="true" />

                <div className={`ml-1 mt-0.5 shrink-0 ${variant.iconColor}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                </div>

                <div className="min-w-0 flex-1">
                    <h4 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#FFFFFF]">
                        {variant.title}
                    </h4>
                    <p className="mt-1 text-sm leading-snug text-[#C8C8C4]">
                        {message}
                    </p>
                    {action && (
                        <button
                            type="button"
                            onClick={() => {
                                dismiss();
                                action.onClick?.();
                            }}
                            className="mt-2.5 inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#FFFFFF] underline underline-offset-4 transition-colors hover:text-[#C8C8C4]"
                        >
                            {action.icon}
                            {action.label}
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    aria-label="Close notification"
                    onClick={dismiss}
                    className="absolute right-3.5 top-3.5 rounded-[2px] p-0.5 text-[#969690] transition-colors hover:text-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFFFF]"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
