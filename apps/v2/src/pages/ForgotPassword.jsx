import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import AuthShell from '../components/auth/AuthShell';

const RECOVERY_SPECS = [
    {
        value: 'Single-use',
        label: 'Reset token',
        detail: 'Password reset links expire cleanly and cannot be reused',
    },
    {
        value: 'Salted hash',
        label: 'Credential storage',
        detail: 'Passwords and telemetry API keys are never stored in plaintext',
    },
    {
        value: 'HttpOnly',
        label: 'Session cookies',
        detail: 'Browser scripts never touch or read session tokens directly',
    },
];

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
        <AuthShell
            legal={false}
            eyebrow="01 // PASSWORD RECOVERY"
            headline="Recover workspace access safely."
            description="Enter your account email and we will send instructions to reset your password."
            specs={RECOVERY_SPECS}
        >
            <div className="noir-panel p-6 sm:p-8">
                {submitted ? (
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-[2px] border border-white/[0.14] bg-[#050505]">
                            <Mail className="h-5 w-5 text-[#F5F5F4]" aria-hidden="true" />
                        </div>
                        <h1 className="text-xl font-semibold tracking-tight text-[#FFFFFF]">Check your email</h1>
                        <p className="mb-6 mt-2 text-xs leading-relaxed text-[#969690]">
                            We have sent a password reset link to
                            <br />
                            <span className="font-mono text-[#F5F5F4]">{email}</span>
                        </p>
                        <Link to="/login" className="noir-btn noir-btn-primary w-full">
                            Back to sign in
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#969690]">
                                01 // RECOVERY
                            </p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#FFFFFF]">
                                Reset password
                            </h1>
                            <p className="mt-1.5 text-sm text-[#969690]">
                                Enter your email address and we&apos;ll send you a reset link.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="noir-label" htmlFor="forgot-email">Email address</label>
                                <div className="relative">
                                    <input
                                        id="forgot-email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="noir-field peer !pl-10"
                                        placeholder="name@company.com"
                                    />
                                    <Mail
                                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969690] transition-colors peer-focus:text-[#FFFFFF]"
                                        aria-hidden="true"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="noir-btn noir-btn-primary w-full"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : 'Send reset link'}
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
                    </>
                )}
            </div>
        </AuthShell>
    );
}
