import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import GradientButton from '../components/GradientButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'An error occurred. Please try again.');
            }

            setSuccessMessage('An OTP has been sent to your email.');
            setIsOtpSent(true);
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Invalid OTP. Please try again.');
            }

            // OTP verified, navigate to reset password page with token
            navigate(`/reset-password?token=${data.reset_token}`);
        } catch (err) {
            setError(err.message || 'Verification failed. Please check your OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const customFeatures = [
        {
            icon: Mail,
            color: "indigo",
            title: "Check Your Inbox",
            desc: "We securely send a time-sensitive 6-digit OTP to your registered email."
        },
        {
            icon: ArrowRight,
            color: "cyan",
            title: "Quick Recovery",
            desc: "Verify your OTP and securely create a new password."
        }
    ];

    return (
        <AuthLayout
            title={
                <>
                    Account <span className="gradient-text">Recovery</span>
                </>
            }
            subtitle="Don't worry, it happens to the best of us. Let's get you back on track."
            features={customFeatures}
        >
            <div className="glass-card p-8 sm:p-10 rounded-[2rem] border border-white/10 shadow-2xl relative z-10 w-full backdrop-blur-xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {isOtpSent ? 'Verify OTP' : 'Reset Password'}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {isOtpSent
                            ? `Enter the 6-digit code sent to ${email}`
                            : 'Enter your email to receive an OTP'
                        }
                    </p>
                </div>

                {successMessage && !isOtpSent && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 text-sm text-center">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}>
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {!isOtpSent ? (
                        <AuthInput
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={Mail}
                            required
                        />
                    ) : (
                        <div className="space-y-4">
                            <AuthInput
                                label="6-Digit OTP"
                                type="text"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                icon={KeyRound}
                                required
                            />
                            {/* Allow user to go back and edit email */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOtpSent(false);
                                        setOtp('');
                                        setError('');
                                    }}
                                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                    Change Email?
                                </button>
                            </div>
                        </div>
                    )}

                    <GradientButton
                        type="submit"
                        disabled={isLoading || (!isOtpSent && !email) || (isOtpSent && otp.length !== 6)}
                        className="w-full py-4 mt-6 text-sm font-bold flex items-center justify-center space-x-2"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <span>
                            {isLoading
                                ? (isOtpSent ? 'Verifying...' : 'Sending...')
                                : (isOtpSent ? 'Verify OTP' : 'Send OTP')}
                        </span>
                        <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isHovered && !isLoading ? 'translate-x-1' : ''}`} />
                    </GradientButton>
                </form>

                <p className="text-center text-sm text-slate-400 mt-8">
                    Remember your password?{' '}
                    <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
