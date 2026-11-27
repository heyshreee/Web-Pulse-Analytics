import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars -- `motion` is only used as a JSX member expression
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { setSession, clearSession, wasJustLoggedOut, getSafeReturnUrl } from '../utils/auth';
import { useToast } from '../context/ToastContext';
import { useGoogleLogin } from '@react-oauth/google';
import GoogleLoading from '../components/GoogleLoading';
import AuthShell, { AuthTabs } from '../components/marketing/AuthShell';
import OTPVerification from '../components/OTPVerification';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const reduceMotion = useReducedMotion();

    const returnUrl = getSafeReturnUrl(searchParams.get('returnUrl') || location.state?.from?.pathname);

    useEffect(() => {
        if (location.state?.loggedOut || wasJustLoggedOut()) {
            clearSession();
            return;
        }

        let isMounted = true;
        // Verify active HttpOnly session with backend rather than trusting localStorage alone.
        apiRequest('/auth/me')
            .then((userData) => {
                if (isMounted && userData && userData.id) {
                    setSession();
                    navigate(returnUrl, { replace: true });
                }
            })
            .catch((err) => {
                if (isMounted && err?.status !== 503) {
                    clearSession();
                }
            });

        return () => {
            isMounted = false;
        };
    }, [location.state, navigate, returnUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            // The session is delivered as an HttpOnly cookie; the browser
            // only keeps a non-sensitive flag that a session exists.
            setSession();
            showToast('Welcome back!', 'success');
            navigate(returnUrl, { replace: true });
        } catch (err) {
            if (err.data && err.data.requireVerification) {
                setShowVerification(true);
                return;
            }
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (response) => {
            setIsGoogleLoading(true);
            try {
                await apiRequest('/auth/google-login', {
                    method: 'POST',
                    body: JSON.stringify({
                        token: response.access_token,
                        code: response.code,
                        idToken: response.id_token
                    }),
                });

                setSession();
                showToast('Welcome back!', 'success');
                navigate(returnUrl, { replace: true });
            } catch (err) {
                showToast(err.message || 'Google login failed', 'error');
                setIsGoogleLoading(false);
            }
        },
        onError: () => {
            showToast('Google login failed', 'error');
            setIsGoogleLoading(false);
        }
    });

    if (isGoogleLoading) {
        return <GoogleLoading />;
    }

    const selectedPlan = searchParams.get('plan');

    return (
        <AuthShell
            showGlobe
            eyebrow="01 // SIGN IN"
            headline="Understand your traffic, not your users."
            description="Real-time web analytics in one lightweight script. Sign in to inspect active visitors, referrers, and event logs."
        >
            {!showVerification && <AuthTabs active="login" />}

            <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: 'easeOut' }}
                className="mkt-panel p-6 sm:p-8"
            >
                {showVerification ? (
                    <OTPVerification
                        email={email}
                        onSuccess={() => navigate(returnUrl, { replace: true })}
                        onBack={() => setShowVerification(false)}
                    />
                ) : (
                    <>
                        {selectedPlan && (
                            <div className="mb-5 flex items-center justify-between rounded-[2px] border border-white/20 bg-[#141414] px-3 py-2 font-mono text-[11px]">
                                <span className="uppercase tracking-[0.12em] text-[#969690]">Selected plan</span>
                                <span className="font-semibold uppercase tracking-[0.12em] text-[#FFFFFF]">
                                    {selectedPlan}
                                </span>
                            </div>
                        )}

                        <div className="mb-6">
                            <h1 className="text-2xl font-semibold tracking-[-0.025em] text-[#FFFFFF]">
                                Welcome back
                            </h1>
                            <p className="mt-1.5 text-sm text-[#969690]">
                                Enter your credentials to open your dashboard.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="login-email" className="mkt-label">Email address</label>
                                    <div className="relative">
                                        <input
                                            id="login-email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="mkt-field peer !pl-10"
                                            placeholder="name@company.com"
                                        />
                                        <Mail
                                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969690] transition-colors peer-focus:text-[#FFFFFF]"
                                            aria-hidden="true"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label htmlFor="login-password" className="mkt-label !mb-0">Password</label>
                                        <Link
                                            to="/forgot-password"
                                            className="font-mono text-xs text-[#C8C8C4] underline-offset-4 transition-colors hover:text-[#FFFFFF] hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="login-password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="mkt-field peer !pl-10 !pr-11"
                                            placeholder="••••••••"
                                        />
                                        <Lock
                                            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969690] transition-colors peer-focus:text-[#FFFFFF]"
                                            aria-hidden="true"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[2px] p-1 text-[#969690] transition-colors hover:text-[#FFFFFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFFFFF]"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mkt-btn mkt-btn-primary mkt-btn-lg w-full"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                ) : (
                                    'Sign in'
                                )}
                            </button>

                            <div className="flex items-center gap-3">
                                <span className="h-px flex-1 bg-white/[0.11]" aria-hidden="true" />
                                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#969690]">
                                    Or continue with
                                </span>
                                <span className="h-px flex-1 bg-white/[0.11]" aria-hidden="true" />
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="mkt-btn mkt-btn-secondary mkt-btn-lg w-full"
                            >
                                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Continue with Google
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </AuthShell>
    );
}
