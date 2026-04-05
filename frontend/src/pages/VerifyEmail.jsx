import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, BarChart2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';

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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-500">
            <div className="w-full max-w-md bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 shadow-2xl">
                <Link to="/" className="flex items-center gap-3 group mb-8">
                    <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform duration-300">
                        <BarChart2 className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-blue-600 transition-colors">WebPulse Analytics</span>
                </Link>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Verify your email</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                    We sent a code to your email address.<br />
                    Please enter the 6-digit code below to continue.
                </p>

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
                                className="w-12 h-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 transition-all shadow-inner"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.join('').length !== 6}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm tracking-tight transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center active:scale-[0.98]"
                    >
                        {loading ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : null}
                        {loading ? 'Verifying...' : 'Verify Account'}
                    </button>
                </form>

                <div className="mt-8 text-center space-y-6">
                    <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                        Didn't receive the code?{' '}
                        <button onClick={handleResend} className="text-blue-600 hover:text-blue-500 font-black transition-colors underline decoration-blue-500/30 underline-offset-4">
                            Resend code
                        </button>
                    </p>

                    <Link to="/login" className="inline-flex items-center gap-2 text-sm font-black text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors uppercase tracking-widest text-[10px]">
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
