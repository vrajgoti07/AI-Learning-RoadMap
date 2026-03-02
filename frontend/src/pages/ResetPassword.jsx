import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import GradientButton from '../components/GradientButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token. Please request a new password reset link.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!token) {
            setError('Invalid or missing reset token.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, new_password: password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to reset password. The link might be expired.');
            }

            setSuccessMessage('Your password has been reset successfully!');
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const customFeatures = [
        {
            icon: Lock,
            color: "emerald",
            title: "Bank-Grade Security",
            desc: "Your new password is encrypted immediately before storing."
        },
        {
            icon: ArrowRight,
            color: "cyan",
            title: "Instant Access",
            desc: "Once reset, you'll be redirected instantly to log back into your learning journey."
        }
    ];

    return (
        <AuthLayout
            title={
                <>
                    Secure <span className="gradient-text">Reset</span>
                </>
            }
            subtitle="Choose a strong, unique password to protect your learning progress."
            features={customFeatures}
        >
            <div className="glass-card p-8 sm:p-10 rounded-[2rem] border border-white/10 shadow-2xl relative z-10 w-full backdrop-blur-xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create New Password</h2>
                    <p className="text-slate-400 text-sm">Enter your new password below</p>
                </div>

                {successMessage ? (
                    <div className="text-center mb-6">
                        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 text-sm text-center">
                            {successMessage}
                        </div>
                        <p className="text-slate-400 text-sm mb-4">Redirecting you to login in a few seconds...</p>
                        <Link to="/login" className="inline-flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mb-4">
                            <AuthInput
                                label="New Password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={Lock}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <AuthInput
                                label="Confirm New Password"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                icon={Lock}
                                required
                            />
                        </div>

                        <GradientButton
                            type="submit"
                            disabled={isLoading || !token}
                            className="w-full py-4 text-sm font-bold flex items-center justify-center space-x-2"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <span>{isLoading ? 'Resetting...' : 'Reset Password'}</span>
                            <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isHovered && !isLoading ? 'translate-x-1' : ''}`} />
                        </GradientButton>
                    </form>
                )}
            </div>
        </AuthLayout>
    );
}
