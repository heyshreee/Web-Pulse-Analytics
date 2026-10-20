import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import AuthShell from '../components/marketing/AuthShell';

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
        if (!pass) return { score: 0, label: 'None', color: 'bg-slate-700' };
        let score = 0;
        if (pass.length > 6) score++;
        if (pass.length > 10) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
        if (score <= 4) return { score: 2, label: 'Medium', color: 'bg-yellow-500' };
        return { score: 3, label: 'Strong', color: 'bg-green-500' };
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

    if (success) {
        return (
            <AuthShell legal={false}>
                <div className="mkt-panel p-7 text-center sm:p-8">
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                        <CheckCircle2 className="h-7 w-7 text-emerald-300" aria-hidden="true" />
                    </div>
                    <h1 className="mkt-h3 !text-2xl">Password updated</h1>
                    <p className="mkt-body mb-8 mt-2">
                        Your password has been successfully reset.<br />
                        You can now log in with your new password.
                    </p>
                    <Link to="/login" className="mkt-btn mkt-btn-primary mkt-btn-lg w-full">
                        Back to login
                    </Link>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell legal={false}>
            <div className="mkt-panel p-7 sm:p-8">
                <div className="mb-8 text-center">
                    <h1 className="mkt-h3 !text-2xl">Create new password</h1>
                    <p className="mkt-body mt-2">Choose a strong password to secure your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="reset-password" className="mkt-label">New password</label>
                        <div className="relative">
                            <input
                                id="reset-password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mkt-field peer !pl-11 !pr-11"
                                placeholder="••••••••"
                            />
                            <Lock
                                className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-violet-300"
                                aria-hidden="true"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3.5 flex items-center text-slate-500 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 rounded"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                            </button>
                        </div>

                        {password && (
                            <div className="pt-2">
                                <div className="mb-1.5 flex h-1 gap-1.5">
                                    <div className={`flex-1 rounded-full transition-all duration-500 ${strength.score >= 1 ? strength.color : 'bg-white/[0.08]'}`}></div>
                                    <div className={`flex-1 rounded-full transition-all duration-500 ${strength.score >= 2 ? strength.color : 'bg-white/[0.08]'}`}></div>
                                    <div className={`flex-1 rounded-full transition-all duration-500 ${strength.score >= 3 ? strength.color : 'bg-white/[0.08]'}`}></div>
                                </div>
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                                    Strength: <span className={strength.color.replace('bg-', 'text-')}>{strength.label}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="reset-confirm" className="mkt-label">Confirm password</label>
                        <div className="relative">
                            <input
                                id="reset-confirm"
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mkt-field peer !pl-11 !pr-11"
                                placeholder="••••••••"
                            />
                            <Lock
                                className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-violet-300"
                                aria-hidden="true"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-3.5 flex items-center text-slate-500 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 rounded"
                                aria-label="Toggle password visibility"
                            >
                                {showConfirmPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mkt-btn mkt-btn-primary mkt-btn-lg !mt-6 w-full"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                        {loading ? 'Updating...' : 'Update password'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-violet-300"
                    >
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        Back to login
                    </Link>
                </div>
            </div>
        </AuthShell>
    );
}
