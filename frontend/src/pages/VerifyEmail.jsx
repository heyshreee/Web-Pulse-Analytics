import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, BarChart2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import ThemeToggle from '../components/ThemeToggle';

export default function VerifyEmail() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            showToast('Email not found, please login again', 'error');
            navigate('/login');
        }
    }, [email, navigate, showToast]);

    // Focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, value) => {
        // Allow only numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace if current is empty
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
        // Handle Enter key
        if (e.key === 'Enter') {
            e.preventDefault();
            if (otp.join('').length === 6) {
                handleVerify(e);
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);

        // Focus last filled input or the next empty one
        const lastIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastIndex].focus();
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
            showToast('Please enter the complete 6-digit code', 'error');
            return;
        }

        setLoading(true);
        try {
            // Real API call
            await apiRequest('/auth/verify-email', {
                method: 'POST',
                body: JSON.stringify({ code, email })
            });

            showToast('Email verified successfully!', 'success');
            navigate('/dashboard');
        } catch (error) {
            showToast(error.message || 'Verification failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await apiRequest('/auth/resend-verification', {
                method: 'POST',
                body: JSON.stringify({ email })
            });
            showToast('Verification code resent', 'success');
        } catch (error) {
            showToast(error.message || 'Failed to resend code', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-8">
                    <Link to="/" className="flex items-center gap-3 group/logo">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-violet-500 text-white shadow-soft transition-transform duration-300 group-hover/logo:scale-105">
                            <BarChart2 className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">WebPulse Analytics</span>
                    </Link>
                    <div className="p-1 bg-white dark:bg-slate-900 rounded-xl shadow-soft border border-slate-200 dark:border-slate-800">
                        <ThemeToggle />
                    </div>
                </div>

                <div className="card card-pad">
                    <div className="text-center mb-8">
                        <div className="w-12 h-12 bg-violet-50 dark:bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Mail className="h-6 w-6 text-violet-500" />
                        </div>
                        <h2 className="page-title !text-2xl mb-2">Verify your email</h2>
                        <p className="page-sub">
                            We sent a code to your email address.<br />
                            Enter the 6-digit code below to continue.
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="flex justify-center gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-12 h-14 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-center text-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.join('').length !== 6}
                            className="btn-primary btn-lg w-full"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {loading ? 'Verifying...' : 'Verify account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center space-y-6">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Didn't receive the code?{' '}
                            <button onClick={handleResend} className="font-semibold text-violet-600 dark:text-violet-400 hover:underline underline-offset-4 transition-colors">
                                Resend code
                            </button>
                        </p>

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
