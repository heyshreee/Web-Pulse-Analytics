import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, Shield, Activity } from 'lucide-react';

const variants = {
    success: { icon: CheckCircle, tone: 'text-success' },
    error: { icon: XCircle, tone: 'text-error' },
    warning: { icon: AlertTriangle, tone: 'text-warning' },
    info: { icon: Info, tone: 'text-info' },
    security: { icon: Shield, tone: 'text-warning' },
    system: { icon: Activity, tone: 'text-info' },
};

/**
 * Toast rendered inside the provider's `.toast-region` stack. The provider owns
 * dismissal timing; this component only animates in/out and handles its own
 * action link.
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
    const variant = variants[type] || variants.info;
    const Icon = variant.icon;
    const heading = title || message;

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
        setTimeout(onClose, 200);
    };

    return (
        <div className="toast" data-leaving={leaving} role="status" aria-live="polite">
            <span className={`toast-icon ${tone ? variant.tone : variant.tone}`}>
                <Icon size={16} />
            </span>
            <span className="toast-text">
                <span className="toast-title">{heading}</span>
                {description ? <span className="toast-desc">{description}</span> : null}
                {action ? (
                    <button
                        type="button"
                        className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-info hover:underline"
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
                className="toast-icon muted hover:text-foreground"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    aria-hidden="true"
                >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            </button>
        </div>
    );
}