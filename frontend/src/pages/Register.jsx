import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars -- `motion` is only used as a JSX member expression
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, Lock, Loader2, User, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { setToken } from '../utils/auth';
import { useToast } from '../context/ToastContext';
import { useGoogleLogin } from '@react-oauth/google';
import GoogleLoading from '../components/GoogleLoading';
import AuthShell, { AuthTabs } from '../components/marketing/AuthShell';
import OTPVerification from '../components/OTPVerification';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const reduceMotion = useReducedMotion();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password }),
            });

            if (data.requireVerification) {
                showToast(data.message || 'Please verify your email', 'success');
                setShowVerification(true);
                return;
            }

            // Auto-login after registration (fallback if no verification needed)
            const loginData = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            // Token is set via HttpOnly cookie
            if (loginData.token) {
                setToken(loginData.token);
            }
            showToast('Account created successfully!', 'success');
            navigate('/dashboard');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsGoogleLoading(true);
            try {
                // Send access token to backend to verify and login/register
                const data = await apiRequest('/auth/google-login', {
                    method: 'POST',
                    body: JSON.stringify({
                        token: tokenResponse.access_token
                    }),
                });

                if (data.token) {
                    setToken(data.token);
                }
                showToast('Account created successfully!', 'success');
                navigate('/dashboard');
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

    return (
        <AuthShell>
            {!showVerification && <AuthTabs active="register" />}

            <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease: 'easeOut' }}
                className="mkt-panel p-7 sm:p-8"
            >
                {showVerification ? (
                    <OTPVerification
                        email={email}
                        onSuccess={() => navigate('/dashboard')}
                        onBack={() => setShowVerification(false)}
                    />
                ) : (
                    <>
                        <div className="mb-8">
                            <h1 className="mkt-h3 !text-2xl">Create account</h1>
                            <p className="mkt-body mt-2">Start tracking your visitors today.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="register-name" className="mkt-label">Full name</label>
                                    <div className="relative">
                                        <input
                                            id="register-name"
                                            type="text"
                                            required
                                            autoComplete="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="mkt-field peer !pl-11"
                                            placeholder="John Doe"
                                        />
                                        <User
                                            className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-violet-300"
                                            aria-hidden="true"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="register-email" className="mkt-label">Email address</label>
                                    <div className="relative">
                                        <input
                                            id="register-email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="mkt-field peer !pl-11"
                                            placeholder="name@company.com"
                                        />
                                        <Mail
                                            className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-violet-300"
                                            aria-hidden="true"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="register-password" className="mkt-label">Password</label>
                                    <div className="relative">
                                        <input
                                            id="register-password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            minLength={6}
                                            autoComplete="new-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="mkt-field peer !pl-11 !pr-12"
                                            placeholder="••••••••"
                                        />
                                        <Lock
                                            className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-violet-300"
                                            aria-hidden="true"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                                    'Create account'
                                )}
                            </button>

                            <div className="flex items-center gap-4">
                                <span className="h-px flex-1 bg-white/[0.07]" aria-hidden="true" />
                                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                                    Or continue with
                                </span>
                                <span className="h-px flex-1 bg-white/[0.07]" aria-hidden="true" />
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="mkt-btn mkt-btn-secondary mkt-btn-lg w-full"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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
