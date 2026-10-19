import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import AuthShell from '../components/marketing/AuthShell';

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
        <AuthShell legal={false}>
            <div className="mkt-panel p-8 text-center sm:p-10">
                <div className="relative mx-auto mb-8 h-20 w-20">
                    <div
                        className="absolute -inset-2 h-24 w-24 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500"
                        aria-hidden="true"
                    ></div>
                    <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0B0F17] shadow-lg">
                        <svg className="h-10 w-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </div>
                </div>

                <h1 className="mkt-h3 !text-2xl">Syncing your account...</h1>
                <p className="mkt-body mx-auto mt-2 max-w-xs">
                    Securely authenticating with Google to connect your WebPulse streams.
                </p>

                <div className="mx-auto mt-10 inline-flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-2.5">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Secure encrypted sync active
                    </span>
                </div>
            </div>
        </AuthShell>
    );
}
