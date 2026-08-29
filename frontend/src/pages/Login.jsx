import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, BarChart2, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { setToken } from '../utils/auth';
import { useToast } from '../context/ToastContext';
import { useGoogleLogin } from '@react-oauth/google';
import GoogleLoading from '../components/GoogleLoading';
import Logo from '../components/Logo';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            // Token is set via HttpOnly cookie
            if (data.token) {
                setToken(data.token);
            }
            showToast('Welcome back!', 'success');
            navigate('/dashboard');
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
                showToast('Welcome back!', 'success');
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
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070A10] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
            {/* Header */}
            <header className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center">
                <Logo />
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Tabs */}
                    {!showVerification && (
                        <div className="flex w-full bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl mb-6 border border-slate-200 dark:border-slate-800">
                            <button className="flex-1 py-2.5 text-sm font-semibold text-white bg-slate-900 dark:bg-violet-500 rounded-lg shadow-sm transition-all">
                                Login
                            </button>
                            <Link to="/register" className="flex-1 py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-center transition-all">
                                Register
                            </Link>
                        </div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="card card-pad sm:p-8"
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
                                    <h2 className="auth-title font-display">
                                        Welcome back
                                    </h2>
                                    <p className="page-sub mt-2">Enter your details to access your dashboard.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest ml-1">Email Address</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                <input
                                                    type="email"
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all shadow-inner"
                                                    placeholder="name@company.com"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2 ml-1">
                                                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Password</label>
                                                <Link to="/forgot-password" className="text-[10px] font-black text-blue-600 hover:text-blue-500 uppercase tracking-tighter transition-colors">Forgot password?</Link>
                                            </div>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-12 py-3.5 text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all shadow-inner"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors focus:outline-none p-1"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary btn-lg w-full"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Sign in'
                                        )}
                                    </button>

                                    <div className="relative py-3">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="bg-white dark:bg-slate-900 px-4 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">Or continue with</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="btn-secondary btn-lg w-full"
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full max-w-7xl mx-auto p-6 text-center">
                <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                    By continuing, you agree to our <Link to="/terms" className="text-violet-600 dark:text-violet-400 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-violet-600 dark:text-violet-400 hover:underline">Privacy Policy</Link>.
                </p>
                <p className="text-slate-400 dark:text-slate-600 text-xs">© 2026 WebPulse</p>
            </footer>
        </div>
    );
}
