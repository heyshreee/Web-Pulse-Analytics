import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';
import { Button } from '../components/ui/Button';
import { LiveChip } from '../components/ui/Display';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { showToast } = useToast();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const getStrength = (pass) => {
        if (!pass) return { score: 0, label: 'None', color: 'var(--muted)' };
        let score = 0;
        if (pass.length > 6) score++;
        if (pass.length > 10) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score <= 2) return { score: 1, label: 'Weak', color: 'var(--error)' };
        if (score <= 4) return { score: 2, label: 'Medium', color: 'var(--warning)' };
        return { score: 3, label: 'Strong', color: 'var(--success)' };
    };

    const strength = getStrength(password);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        setLoading(true);
        try {
            await apiRequest('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, password })
            });

            setSuccess(true);
            showToast('Password updated successfully', 'success');
        } catch (error) {
            showToast(error.message || 'Failed to reset password', 'error');
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

                    {success ? (
                        <div className="text-center py-4">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                                style={{ background: 'var(--success-soft)', color: 'var(--success-text)' }}
                            >
                                <CheckCircle2 className="h-7 w-7" />
                            </div>
                            <h2 className="auth-title !text-2xl mb-2">Password updated</h2>
                            <p className="auth-desc mb-8">
                                Your password has been successfully reset.<br />
                                You can now sign in with your new password.
                            </p>
                            <Link to="/login" className="btn btn--block" style={{ minHeight: '44px' }}>
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h1 className="auth-title">Choose new password</h1>
                                <p className="auth-desc">Choose a strong password to safeguard your WebPulse workspace.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="stack-4">
                                <div className="field">
                                    <label className="field-label" htmlFor="new-password">New Password</label>
                                    <div className="relative">
                                        <Lock
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                                            style={{ color: 'var(--muted-foreground)' }}
                                        />
                                        <input
                                            id="new-password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="input pl-10 pr-10"
                                            placeholder="••••••••"
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
                                    {password && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                                                <div
                                                    className="h-full transition-all duration-300"
                                                    style={{
                                                        width: `${(strength.score / 3) * 100}%`,
                                                        background: strength.color
                                                    }}
                                                />
                                            </div>
                                            <span className="text-2xs font-semibold" style={{ color: strength.color }}>
                                                {strength.label}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="field">
                                    <label className="field-label" htmlFor="confirm-password">Confirm Password</label>
                                    <div className="relative">
                                        <Lock
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                                            style={{ color: 'var(--muted-foreground)' }}
                                        />
                                        <input
                                            id="confirm-password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="input pl-10 pr-10"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:opacity-75 transition-opacity"
                                            style={{ color: 'var(--muted-foreground)' }}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    block
                                    loading={loading}
                                >
                                    Update Password
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            <div className="auth-aside">
                <div style={{ maxWidth: 440 }}>
                    <div className="mb-4">
                        <LiveChip label="Account Protection" />
                    </div>
                    <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2, color: 'var(--foreground)' }}>
                        Robust identity protection across all devices.
                    </h2>
                    <p className="mt-3" style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)' }}>
                        Updating your password automatically invalidates prior active browser sessions and issues fresh cryptographically signed tokens.
                    </p>
                </div>
            </div>
        </div>
    );
}
