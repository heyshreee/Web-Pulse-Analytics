import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import AuthShell from '../components/marketing/AuthShell';

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
            // Real API call
            await apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });

            setSubmitted(true);
            showToast('Reset link sent successfully', 'success');
        } catch (error) {
            showToast(error.message || 'Failed to send reset link', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <AuthShell legal={false}>
                <div className="mkt-panel p-7 text-center sm:p-8">
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
                        <Mail className="h-7 w-7 text-emerald-300" aria-hidden="true" />
                    </div>
                    <h1 className="mkt-h3 !text-2xl">Check your email</h1>
                    <p className="mkt-body mb-8 mt-2">
                        We have sent a password reset link to<br />
                        <span className="font-semibold text-slate-100">{email}</span>
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
                    <h1 className="mkt-h3 !text-2xl">Reset password</h1>
                    <p className="mkt-body mt-2">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="forgot-email" className="mkt-label">Email address</label>
                        <div className="relative">
                            <input
                                id="forgot-email"
                                type="email"
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="mkt-btn mkt-btn-primary mkt-btn-lg w-full"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                        {loading ? 'Sending...' : 'Send Reset Link'}
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
