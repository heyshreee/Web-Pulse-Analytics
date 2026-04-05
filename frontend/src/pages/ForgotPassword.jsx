import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, BarChart2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';

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

            // Simulate API call (Removed)
            // await new Promise(resolve => setTimeout(resolve, 1500));

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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-500">
                <div className="w-full max-w-md bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 shadow-2xl text-center">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="h-8 w-8 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Check your email</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
                        We have sent a password reset link to<br />
                        <span className="text-blue-600 dark:text-white font-black">{email}</span>
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm tracking-tight transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-500">
            <div className="w-full max-w-md bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 shadow-2xl">
                <Link to="/" className="flex items-center gap-3 group mb-8">
                    <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform duration-300">
                        <BarChart2 className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-blue-600 transition-colors">WebPulse Analytics</span>
                </Link>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Reset Password</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                        Enter your email address and we will send you a<br />
                        link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-slate-400 group-focus-within:text-blue-500 transition-colors">@</span>
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all shadow-inner"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm tracking-tight transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center active:scale-[0.98]"
                    >
                        {loading ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : null}
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm font-black text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors uppercase tracking-widest text-[10px]">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
