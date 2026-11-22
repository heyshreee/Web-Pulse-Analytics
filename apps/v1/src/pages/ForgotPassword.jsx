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
                <div className="mkt-panel p-6 text-center sm:p-7">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-line bg-subtle">
                        <Mail className="h-5 w-5 text-ink" aria-hidden="true" />
                    </div>
                    <h1 className="text-lg font-semibold text-ink">Check your email</h1>
                    <p className="text-xs text-ink-muted mb-6 mt-1.5 leading-relaxed">
                        We have sent a password reset link to<br />
                        <span className="font-mono text-ink">{email}</span>
                    </p>
                    <Link to="/login" className="mkt-btn mkt-btn-primary w-full h-8 text-xs">
                        Back to sign in
                    </Link>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell legal={false}>
            <div className="mkt-panel p-6 sm:p-7">
                <div className="mb-6 text-center">
                    <h1 className="text-lg font-semibold text-ink">Reset password</h1>
                    <p className="text-xs text-ink-muted mt-1">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="forgot-email" className="mkt-label">Email address</label>
                        <div className="relative">
                            <input
                                id="forgot-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mkt-field peer !pl-9"
                                placeholder="name@company.com"
                            />
                            <Mail
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted transition-colors peer-focus:text-ink"
                                aria-hidden="true"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mkt-btn mkt-btn-primary w-full h-8 text-xs"
                    >
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" aria-hidden="true" /> : null}
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted transition-colors hover:text-ink"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        Back to sign in
                    </Link>
                </div>
            </div>
        </AuthShell>
    );
}
