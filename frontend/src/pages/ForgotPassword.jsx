import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, BarChart2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import ThemeToggle from '../components/ThemeToggle';

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
            <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] flex items-center justify-center p-4 transition-colors duration-300">
                <div className="w-full max-w-md card card-pad text-center">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Mail className="h-7 w-7 text-emerald-500" />
                    </div>
                    <h2 className="page-title !text-2xl mb-2 font-display">Check your email</h2>
                    <p className="page-sub mb-8">
                        We have sent a password reset link to<br />
                        <span className="font-semibold text-slate-900 dark:text-white">{email}</span>
                    </p>
                    <Link to="/login" className="btn-primary btn-lg w-full">
                        Back to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A10] flex items-center justify-center p-4 transition-colors duration-300">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-8">
                    <Link to="/" className="flex items-center gap-3 group/logo">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-violet-500 text-white shadow-soft transition-transform duration-300 group-hover/logo:scale-105">
                            <BarChart2 className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">WebPulse</span>
                    </Link>
                    <div className="p-1 bg-white dark:bg-slate-900 rounded-xl shadow-soft border border-slate-200 dark:border-slate-800">
                        <ThemeToggle />
                    </div>
                </div>

                <div className="card card-pad">
                    <div className="text-center mb-8">
                        <h2 className="page-title !text-2xl mb-2 font-display">Reset password</h2>
                        <p className="page-sub">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="label">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-10"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white transition-colors">
                            <ArrowLeft className="h-4 w-4" />
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
