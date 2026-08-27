import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X, Shield, Activity } from 'lucide-react';

const variants = {
    success: {
        icon: CheckCircle,
        iconColor: 'text-emerald-500',
        bar: 'bg-emerald-500',
        title: 'Success',
    },
    error: {
        icon: XCircle,
        iconColor: 'text-red-500',
        bar: 'bg-red-500',
        title: 'Error',
    },
    warning: {
        icon: AlertTriangle,
        iconColor: 'text-amber-500',
        bar: 'bg-amber-500',
        title: 'Warning',
    },
    info: {
        icon: Info,
        iconColor: 'text-blue-500',
        bar: 'bg-blue-500',
        title: 'Info',
    },
    security: {
        icon: Shield,
        iconColor: 'text-orange-500',
        bar: 'bg-orange-500',
        title: 'Security Alert',
    },
    system: {
        icon: Activity,
        iconColor: 'text-violet-500',
        bar: 'bg-violet-500',
        title: 'System Update',
    }
};

export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
    const [isVisible, setIsVisible] = useState(false);
    const variant = variants[type] || variants.info;
    const Icon = variant.icon;

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="relative overflow-hidden flex items-center gap-3.5 p-4 pr-12 min-w-[320px] max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lift">
                {/* Accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${variant.bar}`} />

                {/* Icon */}
                <div className={`shrink-0 ml-1 ${variant.iconColor}`}>
                    <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">
                        {variant.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {message}
                    </p>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
