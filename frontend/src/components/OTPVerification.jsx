import { useState, useRef, useEffect } from 'react';
import { Mail, ArrowLeft, BarChart2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../utils/auth';

export default function OTPVerification({ email, onSuccess, onBack }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const { showToast } = useToast();
    const navigate = useNavigate();

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
            const data = await apiRequest('/auth/verify-email', {
                method: 'POST',
                body: JSON.stringify({ code, email })
            });

            if (data.token) {
                setToken(data.token);
            }

            showToast('Email verified successfully!', 'success');
            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/dashboard');
            }
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
        <div className="w-full">
            <div className="text-center mb-8">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20 inline-flex items-center justify-center mb-6">
                    <BarChart2 className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Verify your email</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    We sent a code to <span className="text-blue-600 dark:text-blue-400 font-bold">{email}</span>.<br />
                    Please enter the 6-digit code below to continue.
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
                            className="w-12 h-14 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 transition-all shadow-inner"
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 6}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm tracking-tight transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center active:scale-[0.98]"
                >
                    {loading ? 'Verifying...' : 'Verify Account'}
                </button>
            </form>

            <div className="mt-6 text-center space-y-4">
                <p className="text-sm text-slate-400">
                    Didn't receive the code?{' '}
                    <button onClick={handleResend} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Resend code
                    </button>
                </p>

                {onBack && (
                    <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </button>
                )}
            </div>
        </div>
    );
}
