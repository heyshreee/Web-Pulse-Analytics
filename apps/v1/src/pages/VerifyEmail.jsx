import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { setSession } from '../utils/auth';
import { useToast } from '../context/ToastContext';
import AuthShell from '../components/marketing/AuthShell';

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
        <AuthShell legal={false}>
            <div className="mkt-panel p-6 sm:p-7">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-subtle">
                        <Mail className="h-5 w-5 text-ink" aria-hidden="true" />
                    </div>
                    <h1 className="text-lg font-semibold text-ink">Verify your email</h1>
                    <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                        We sent a code to <span className="font-mono text-ink">{email}</span>.<br />
                        Enter the 6-digit code below to continue.
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-5">
                    <div className="flex justify-center gap-1.5">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                aria-label={`Digit ${index + 1}`}
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
                        Didn't receive the email?{' '}
                        <button
                            onClick={handleResend}
                            className="text-ink font-medium hover:underline"
                        >
                            Resend code
                        </button>
                    </p>

                    <div>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-ink-muted transition-colors hover:text-ink"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </AuthShell>
    );
}
