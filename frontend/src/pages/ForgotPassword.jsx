import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';
import { Button } from '../components/ui/Button';
import { LiveChip } from '../components/ui/Display';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            showToast('Please enter your email address', 'error');
            return;
        }

        setLoading(true);
        try {
            await apiRequest('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email })
            });

            setSubmitted(true);
            showToast('Reset link sent successfully', 'success');
        } catch (error) {
            showToast(error.message || 'Failed to send reset link', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-panel">
                <div className="auth-inner">
                    <div className="mb-6 flex items-center justify-between">
                        <Logo />
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                            style={{ color: 'var(--muted-foreground)' }}
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to login
                        </Link>
                    </div>

                    {submitted ? (
                        <div className="text-center py-4">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                                style={{ background: 'var(--success-soft)', color: 'var(--success-text)' }}
                            >
                                <CheckCircle2 className="h-7 w-7" />
                            </div>
                            <h2 className="auth-title !text-2xl mb-2">Check your email</h2>
                            <p className="auth-desc mb-8">
                                We have sent a password reset link to<br />
                                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{email}</span>
                            </p>
                            <Link to="/login" className="btn btn--block" style={{ minHeight: '44px' }}>
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h1 className="auth-title">Reset password</h1>
                                <p className="auth-desc">Enter your email and we'll send you instructions to reset your account password.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="stack-4">
                                <div className="field">
                                    <label className="field-label" htmlFor="forgot-email">Email Address</label>
                                    <div className="relative">
                                        <Mail
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                                            style={{ color: 'var(--muted-foreground)' }}
                                        />
                                        <input
                                            id="forgot-email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="input pl-10"
                                            placeholder="name@company.com"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    block
                                    loading={loading}
                                >
                                    Send Reset Link
                                </Button>
                            </form>

                            <div className="mt-8 text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                                    style={{ color: 'var(--muted-foreground)' }}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Remember your password? Sign in
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="auth-aside">
                <div style={{ maxWidth: 440 }}>
                    <div className="mb-4">
                        <LiveChip label="Account Security" />
                    </div>
                    <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2, color: 'var(--foreground)' }}>
                        Secure password recovery with encrypted magic tokens.
                    </h2>
                    <p className="mt-3" style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)' }}>
                        Password reset links expire within 60 minutes and can only be used once to safeguard your analytics workspace.
                    </p>

                    <div className="mt-8 p-5 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl" style={{ background: 'var(--accent)', color: 'var(--primary)' }}>
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Security Guaranteed</h3>
                                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                                    We use cryptographic salted hashes for authentication. No credentials or telemetry keys are ever stored in plaintext.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
