import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, Moon, User, BarChart2, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { setToken } from '../utils/auth';
import { useToast } from '../context/ToastContext';
import { useGoogleLogin } from '@react-oauth/google';
import GoogleLoading from '../components/GoogleLoading';
import OTPVerification from '../components/OTPVerification';
import ThemeToggle from '../components/ThemeToggle';

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
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-blue-500/30 transition-colors duration-500">
            {/* Header */}
            <header className="w-full max-w-7xl mx-auto p-6 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3 group/logo">
                    <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-600/20 group-hover/logo:rotate-12 transition-all duration-300">
                        <BarChart2 className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter group-hover/logo:text-blue-600 transition-colors">WebPulse <span className="text-blue-600">Analytics</span></span>
                </Link>
                <div className="p-1 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Tabs */}
                    {!showVerification && (
                        <div className="flex w-full bg-white dark:bg-slate-900/50 p-1.5 rounded-2xl mb-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                            <Link to="/login" className="flex-1 py-2.5 text-sm font-black text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white text-center transition-all">
                                Login
                            </Link>
                            <button className="flex-1 py-2.5 text-sm font-black text-white bg-blue-600 rounded-xl shadow-xl shadow-blue-600/20 transition-all">
                                Register
                            </button>
                        </div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/50 rounded-3xl p-10 shadow-2xl transition-all"
                    >
                        {showVerification ? (
                            <OTPVerification
                                email={email}
                                onSuccess={() => navigate('/dashboard')}
                                onBack={() => setShowVerification(false)}
                            />
                        ) : (
                            <>
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">
                                        Create Account
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">Start tracking your visitors today.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest ml-1">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all shadow-inner"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                        </div>
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
                                            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest ml-1">Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    minLength={6}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-12 py-3.5 text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all shadow-inner"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
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
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-600/25 active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            'Create Account'
                                        )}
                                    </button>

                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                                        </div>
                                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                                            <span className="bg-white dark:bg-slate-900 px-4 text-slate-400 dark:text-slate-600">Or continue with</span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        className="w-full bg-white dark:bg-slate-950/50 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-sm"
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
                                        Google
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full max-w-7xl mx-auto p-6 text-center text-slate-500 text-sm">
                <p className="mb-2">
                    By continuing, you agree to our <Link to="/terms" className="text-blue-500 hover:text-blue-400">Terms of Service</Link> and <Link to="/privacy" className="text-blue-500 hover:text-blue-400">Privacy Policy</Link>.
                </p>
                <p className="text-slate-500 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest">© 2026 WebPulse Analytics Inc. All rights reserved.</p>
            </footer>
        </div>
    );
}
