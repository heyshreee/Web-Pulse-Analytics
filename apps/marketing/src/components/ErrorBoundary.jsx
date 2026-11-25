import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#F5F5F4] px-5">
                    <div className="text-center p-8 sm:p-10 bg-[#0B0B0B] border border-[#262626] rounded-[4px] max-w-md w-full">
                        <div className="w-12 h-12 border border-[#EF4444]/40 bg-[#EF4444]/10 rounded-[4px] flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-5 h-5 text-[#EF4444]" aria-hidden="true" />
                        </div>
                        <h2 className="text-2xl font-semibold text-[#F5F5F4] mb-3 tracking-tight">
                            Something went wrong
                        </h2>
                        <p className="text-[#B3B3AF] text-base mb-8 leading-relaxed">
                            An unexpected client error occurred while rendering this page. Reload to restore the view.
                        </p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mkt-btn mkt-btn-primary mkt-btn-md w-full"
                        >
                            Reload page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
