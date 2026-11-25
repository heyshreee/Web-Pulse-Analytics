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
            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-[2px] border border-white/[0.14] bg-[#050505]">
                    <Mail className="h-5 w-5 text-[#F5F5F4]" aria-hidden="true" />
                </div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#969690]">Verification</p>
                <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-[#FFFFFF]">Verify your email</h2>
                <p className="mt-2 text-xs leading-relaxed text-[#969690]">
                    We sent a 6-digit code to <span className="font-mono text-[#F5F5F4]">{email}</span>.
                    <br />
                    Enter the code below to continue.
                </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-5">
                <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            aria-label={`Verification code digit ${index + 1}`}
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className="h-12 w-11 rounded-[2px] border border-white/[0.14] bg-[#050505] text-center font-mono text-lg font-semibold text-[#FFFFFF] transition-colors focus:border-[#FFFFFF] focus:outline-none"
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={loading || otp.join('').length !== 6}
                    className="noir-btn noir-btn-primary w-full disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                    {loading ? 'Verifying...' : 'Verify account'}
                </button>
            </form>

            <div className="mt-5 space-y-3 text-center">
                <p className="text-xs text-[#969690]">
                    Didn&apos;t receive the code?{' '}
                    <button
                        type="button"
                        onClick={handleResend}
                        className="font-medium text-[#F5F5F4] underline underline-offset-4 transition-colors hover:text-[#FFFFFF]"
                    >
                        Resend code
                    </button>
                </p>

                {onBack && (
                    <div>
                        <button
                            type="button"
                            onClick={onBack}
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#969690] transition-colors hover:text-[#FFFFFF]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                            Back to login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
