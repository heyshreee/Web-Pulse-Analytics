import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            if (!code) {
                navigate('/login');
                return;
            }

            try {
                // Simulate processing delay for visual effect
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Replace with actual API call
                // const { token, user } = await apiRequest('/auth/google/callback', { method: 'POST', body: JSON.stringify({ code }) });
                // localStorage.setItem('token', token);

                showToast('Successfully connected Google account', 'success');
                navigate('/dashboard');
            } catch {
                showToast('Failed to connect Google account', 'error');
                navigate('/login');
            }
        };

        handleCallback();
    }, [searchParams, navigate, showToast]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] flex flex-col items-center justify-center p-4 transition-colors duration-300">
            <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin w-24 h-24 -m-2"></div>
                <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-soft border border-slate-200 dark:border-slate-800 relative z-10">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 7.07 1l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                </div>
            </div>

            <h2 className="page-title !text-2xl mb-2">Syncing your account...</h2>
            <p className="page-sub max-w-xs text-center">
                Securely authenticating with Google to connect your WebPulse streams.
            </p>

            <div className="mt-12 flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-soft">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Secure encrypted sync active</span>
            </div>
        </div>
    );
}
