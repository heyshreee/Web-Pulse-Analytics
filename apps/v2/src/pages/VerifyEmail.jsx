import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import AuthShell from '../components/auth/AuthShell';

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
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
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
        inputRefs.current[lastIndex]?.focus();
    };

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
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
        <AuthShell
            legal={false}
            eyebrow="01 // VERIFY EMAIL"
            headline="Confirm your account address."
            description="One-time email verification ensures alert emails and billing notices reach the right inbox."
        >
            <div className="noir-panel p-6 sm:p-8">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-[2px] border border-white/[0.14] bg-[#050505]">
                        <Mail className="h-5 w-5 text-[#F5F5F4]" aria-hidden="true" />
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight text-[#FFFFFF]">Verify your email</h1>
                    <p className="mt-2 text-xs leading-relaxed text-[#969690]">
                        We sent a 6-digit code to <span className="font-mono text-[#F5F5F4]">{email}</span>.
                        <br />
                        Enter it below to activate your account.
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

                    <div>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 font-mono text-xs text-[#969690] transition-colors hover:text-[#FFFFFF]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </AuthShell>
    );
}
