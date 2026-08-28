import { BarChart2 } from 'lucide-react';

export default function GoogleLoading() {
    return (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-50 flex flex-col items-center justify-center p-4 transition-colors duration-300">
            <div className="absolute top-8 left-8 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-violet-500 text-white shadow-soft">
                    <BarChart2 className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">WebPulse</span>
            </div>

            <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin w-24 h-24 -m-2"></div>
                <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center relative z-10 border border-slate-200 dark:border-slate-800 shadow-soft">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                </div>
            </div>

            <h2 className="page-title !text-xl mb-2">Connecting your Google account...</h2>
            <p className="page-sub max-w-xs text-center">
                Securely authenticating with Google Workspace to sync your projects.
            </p>

            <div className="mt-12 flex items-center gap-2 text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Secure encrypted connection
            </div>
        </div>
    );
}
