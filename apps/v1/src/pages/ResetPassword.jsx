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
        if (!pass) return { score: 0, label: 'None', color: 'bg-subtle' };
        let score = 0;
        if (pass.length > 6) score++;
        if (pass.length > 10) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-red-500' };
        if (score <= 4) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
        return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
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
            <AuthShell
                legal={false}
                eyebrow="01 // PASSWORD RESET"
                headline="Credentials updated."
                description="Sign back in with your new password to access your projects."
            >
                <div className="mkt-panel p-6 text-center sm:p-8">
                    <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-[2px] border border-white/[0.14] bg-[#050505]">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight text-[#FFFFFF]">Password updated</h1>
                    <p className="mb-6 mt-2 text-xs leading-relaxed text-[#969690]">
                        Your password has been reset. You can now sign in with your new credentials.
                    </p>
                    <Link to="/login" className="mkt-btn mkt-btn-primary mkt-btn-lg w-full">
                        Back to sign in
                    </Link>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            legal={false}
            eyebrow="01 // PASSWORD RESET"
            headline="Set a new password."
            description="Choose a strong password of at least six characters to secure your workspace."
        >
            <div className="mkt-panel p-6 sm:p-8">
                <div className="mb-6">
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#969690]">01 // CREDENTIALS</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#FFFFFF]">Create new password</h1>
                    <p className="mt-1.5 text-sm text-[#969690]">Choose a strong password for your account.</p>
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
                                className="absolute inset-y-0 right-3 flex items-center rounded-[2px] text-[#969690] transition-colors hover:text-[#FFFFFF]"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        {password && (
                            <div className="pt-2">
                                <div className="mb-1 flex h-1 gap-1">
                                    <div className={`flex-1 rounded-[1px] transition-colors ${strength.score >= 1 ? strength.color : 'bg-white/[0.11]'}`} />
                                    <div className={`flex-1 rounded-[1px] transition-colors ${strength.score >= 2 ? strength.color : 'bg-white/[0.11]'}`} />
                                    <div className={`flex-1 rounded-[1px] transition-colors ${strength.score >= 3 ? strength.color : 'bg-white/[0.11]'}`} />
                                </div>
                                <p className="font-mono text-[10px] text-[#969690]">
                                    Strength: <span className="font-semibold text-[#F5F5F4]">{strength.label}</span>
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
                                className="mkt-field peer !pl-10 !pr-11"
                                placeholder="••••••••"
                            />
                            <Lock
                                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969690] transition-colors peer-focus:text-[#FFFFFF]"
                                aria-hidden="true"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-3 flex items-center rounded-[2px] text-[#969690] transition-colors hover:text-[#FFFFFF]"
                                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mkt-btn mkt-btn-primary mkt-btn-lg w-full"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                        {loading ? 'Updating password...' : 'Update password'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-[#969690] transition-colors hover:text-[#FFFFFF]"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        Back to sign in
                    </Link>
                </div>
            </div>
        </AuthShell>
    );
}
