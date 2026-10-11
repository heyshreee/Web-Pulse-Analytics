import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';
import { Button } from '../components/ui/Button';
import { LiveChip } from '../components/ui/Display';

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
        <div className="auth-layout">
            <div className="auth-panel">
                <div className="auth-inner">
                    <div className="mb-6 flex items-center justify-between">
                        <Logo />
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                            style={{ color: 'var(--muted-foreground)' }}
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to login
                        </Link>
                    </div>

                    <div className="text-center mb-6">
                        <div
                            className="flex h-12 w-12 items-center justify-center rounded-2xl mx-auto mb-4"
                            style={{ background: 'var(--accent)', color: 'var(--primary)' }}
                        >
                            <Mail className="h-6 w-6" />
                        </div>
                        <h1 className="auth-title !text-2xl mb-2">Verify your email</h1>
                        <p className="auth-desc">
                            We sent a 6-digit code to <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{email}</span>.<br />
                            Please enter it below to activate your account.
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="flex justify-center gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-12 h-14 text-center text-xl font-semibold rounded-xl transition-all"
                                    style={{
                                        background: 'var(--background)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--foreground)'
                                    }}
                                />
                            ))}
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            block
                            loading={loading}
                            disabled={otp.join('').length !== 6}
                        >
                            Verify Account
                        </Button>
                    </form>

                    <div className="mt-6 text-center space-y-3">
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            Didn't receive the code?{' '}
                            <button
                                type="button"
                                onClick={handleResend}
                                className="font-semibold hover:underline underline-offset-4 transition-colors"
                                style={{ color: 'var(--primary)' }}
                            >
                                Resend code
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            <div className="auth-aside">
                <div style={{ maxWidth: 440 }}>
                    <div className="mb-4">
                        <LiveChip label="Account Activation" />
                    </div>
                    <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2, color: 'var(--foreground)' }}>
                        One step away from your live pulse dashboard.
                    </h2>
                    <p className="mt-3" style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)' }}>
                        Verifying your email ensures that your real-time alerts, weekly digests, and usage threshold warnings arrive promptly.
                    </p>
                </div>
            </div>
        </div>
    );
}
