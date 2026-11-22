import { useState, useRef, useEffect } from 'react';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { setSession } from '../utils/auth';

export default function OTPVerification({ email, onSuccess, onBack }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
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
            await apiRequest('/auth/verify-email', {
                method: 'POST',
                body: JSON.stringify({ code, email })
            });

            setSession();

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
            <div className="text-center mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-subtle mx-auto mb-3">
                    <Mail className="h-5 w-5 text-ink" />
                </div>
                <h2 className="text-lg font-semibold text-ink mb-1">Verify your email</h2>
                <p className="text-xs text-ink-muted">
                    We sent a code to <span className="font-mono text-ink">{email}</span>.<br />
                    Please enter the 6-digit code below to continue.
                </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-5">
                <div className="flex justify-center gap-1.5">
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
                            className="w-10 h-12 bg-black border border-line rounded text-center text-lg font-mono font-semibold text-ink focus:outline-none focus:border-line-strong transition-colors"
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 6}
                    className="mkt-btn mkt-btn-primary w-full h-8 text-xs disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                    {loading ? 'Verifying...' : 'Verify account'}
                </button>
            </form>

            <div className="mt-5 text-center space-y-3">
                <p className="text-xs text-ink-muted">
                    Didn't receive code?{' '}
                    <button
                        onClick={handleResend}
                        className="text-ink font-medium hover:underline"
                    >
                        Resend
                    </button>
                </p>

                {onBack && (
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted hover:text-ink transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        Back
                    </button>
                )}
            </div>
        </div>
    );
}
