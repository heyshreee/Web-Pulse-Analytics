import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { setToken } from '../utils/auth';
import { useToast } from '../context/ToastContext';
import { useGoogleLogin } from '@react-oauth/google';
import GoogleLoading from '../components/GoogleLoading';
import Logo from '../components/Logo';
import OTPVerification from '../components/OTPVerification';
import { Button } from '../components/ui/Button';
import { LiveChip } from '../components/ui/Display';

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
            if (loginData.token) {
                setToken(loginData.token);
            }
            showToast('Account created successfully!', 'success');
            navigate('/dashboard');
        } catch (err) {
            showToast(err.message || 'Registration failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsGoogleLoading(true);
            try {
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
        <div className="auth-layout">
            <div className="auth-panel">
                <div className="auth-inner">
                    <div className="mb-6 flex items-center justify-between">
                        <Logo />
                        <Link
                            to="/"
                            className="text-xs font-semibold hover:underline"
                            style={{ color: 'var(--muted-foreground)' }}
                        >
                            Back to site
                        </Link>
                    </div>

                    {!showVerification && (
                        <div className="segmented mb-6" role="tablist">
                            <Link
                                to="/login"
                                className="segmented-btn"
                                role="tab"
                                aria-selected="false"
                            >
                                Sign in
                            </Link>
                            <button
                                type="button"
                                className="segmented-btn is-active"
                                role="tab"
                                aria-selected="true"
                            >
                                Register
                            </button>
                        </div>
                    )}

                    {showVerification ? (
                        <OTPVerification
                            email={email}
                            onSuccess={() => navigate('/dashboard')}
                            onBack={() => setShowVerification(false)}
                        />
                    ) : (
                        <>
                            <div className="mb-6">
                                <h1 className="auth-title">Create account</h1>
                                <p className="auth-desc">Start tracking real-time metrics with a free account in 30 seconds.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="stack-4">
                                <div className="field">
                                    <label className="field-label" htmlFor="register-name">Full Name</label>
                                    <div className="relative">
                                        <User
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                                            style={{ color: 'var(--muted-foreground)' }}
                                        />
                                        <input
                                            id="register-name"
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="input pl-10"
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                </div>

                                <div className="field">
                                    <label className="field-label" htmlFor="register-email">Email Address</label>
                                    <div className="relative">
                                        <Mail
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                                            style={{ color: 'var(--muted-foreground)' }}
                                        />
                                        <input
                                            id="register-email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="input pl-10"
                                            placeholder="name@company.com"
                                        />
                                    </div>
                                </div>

                                <div className="field">
                                    <label className="field-label" htmlFor="register-password">Password</label>
                                    <div className="relative">
                                        <Lock
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                                            style={{ color: 'var(--muted-foreground)' }}
                                        />
                                        <input
                                            id="register-password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            minLength={6}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="input pl-10 pr-10"
                                            placeholder="Minimum 6 characters"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:opacity-75 transition-opacity"
                                            style={{ color: 'var(--muted-foreground)' }}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    block
                                    loading={loading}
                                >
                                    Create Free Account
                                </Button>

                                <div className="divider-text">Or register with</div>

                                <Button
                                    type="button"
                                    kind="outline"
                                    size="lg"
                                    block
                                    onClick={handleGoogleLogin}
                                >
                                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
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
                                </Button>
                            </form>

                            <p className="mt-8 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                By signing up, you agree to our{' '}
                                <Link to="/terms" className="hover:underline" style={{ color: 'var(--foreground)' }}>Terms</Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="hover:underline" style={{ color: 'var(--foreground)' }}>Privacy Policy</Link>.
                            </p>
                        </>
                    )}
                </div>
            </div>

            <div className="auth-aside">
                <div style={{ maxWidth: 440 }}>
                    <div className="mb-4">
                        <LiveChip label="Developer First Analytics" />
                    </div>
                    <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2, color: 'var(--foreground)' }}>
                        All your metrics in one lightweight, reactive cockpit.
                    </h2>
                    <p className="mt-3" style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)' }}>
                        Join thousands of creators, engineers, and product teams observing web traffic in real time.
                    </p>

                    <div className="mt-8 p-5 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl" style={{ background: 'var(--accent)', color: 'var(--primary)' }}>
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Instant Setup</h3>
                                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                                    Paste a single script tag into your Next.js, React, Astro, or static HTML site to start tracking immediately.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t grid grid-cols-3 gap-3 text-center" style={{ borderColor: 'var(--border)' }}>
                            <div>
                                <div className="text-lg font-bold tnum" style={{ color: 'var(--foreground)' }}>Free</div>
                                <div className="text-2xs" style={{ color: 'var(--muted-foreground)' }}>Tier available</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold tnum" style={{ color: 'var(--foreground)' }}>&lt;1 KB</div>
                                <div className="text-2xs" style={{ color: 'var(--muted-foreground)' }}>Script bundle</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold tnum" style={{ color: 'var(--foreground)' }}>0 setup</div>
                                <div className="text-2xs" style={{ color: 'var(--muted-foreground)' }}>Config needed</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
