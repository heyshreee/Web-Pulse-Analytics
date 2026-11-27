import AuthShell from './auth/AuthShell';

export default function GoogleLoading() {
    return (
        <AuthShell legal={false}>
            <div className="noir-panel flex flex-col items-center p-6 text-center sm:p-8">
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                    <div
                        className="absolute inset-0 animate-spin rounded-full border border-white/[0.11] border-t-[#FFFFFF]"
                        aria-hidden="true"
                    />
                    <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.14] bg-[#050505]">
                        <svg className="block h-7 w-7 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-center text-base font-semibold tracking-tight text-[#FFFFFF]">
                    Connecting Google account...
                </h2>
                <p className="mx-auto mt-1.5 max-w-[260px] text-center font-mono text-xs leading-relaxed text-[#969690]">
                    Authenticating your Google session with WebPulse.
                </p>

                <div className="mx-auto mt-6 inline-flex items-center justify-center gap-2 rounded-[2px] border border-white/[0.11] bg-[#050505] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#C8C8C4]">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                    <span>Encrypted OAuth handoff</span>
                </div>
            </div>
        </AuthShell>
    );
}
