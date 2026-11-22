import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onRetry) {
            this.props.onRetry();
        }
    };

    render() {
        if (this.state.hasError) {
            if (this.props.scoped) {
                return (
                    <div className={`card card-pad p-6 flex flex-col items-center justify-center text-center ${this.props.className || ''}`}>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                            {this.props.title || 'Unable to display this widget'}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs">
                            {this.props.message || 'A data error occurred while rendering this card.'}
                        </p>
                        <button
                            onClick={this.handleRetry}
                            className="btn-secondary btn-sm"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Retry
                        </button>
                    </div>
                );
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070A10] transition-colors duration-500 p-4">
                    <div className="text-center p-8 sm:p-12 bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lift max-w-md w-full">
                        <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <AlertCircle className="h-7 w-7" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Something went wrong</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6 leading-relaxed">
                            An unexpected error occurred in this view. Please try reloading or return to the dashboard.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-primary btn-md flex-1 justify-center"
                            >
                                Reload View
                            </button>
                            <button
                                onClick={() => { this.setState({ hasError: false }); window.location.href = '/dashboard'; }}
                                className="btn-secondary btn-md flex-1 justify-center"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
