import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import GradientButton from '../components/GradientButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleSubmit = async (e) => {
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

            setSuccessMessage('If an account exists with that email, we have sent a password reset link.');
            setEmail('');
        } catch (err) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="glass-card p-8 sm:p-10 rounded-[2rem] border border-white/10 shadow-2xl relative z-10 w-full backdrop-blur-xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Reset Password</h2>
                    <p className="text-slate-400 text-sm">Enter your email to receive recovery instructions</p>
                </div>

                {successMessage ? (
                    <div className="text-center mb-6">
                        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 text-sm text-center">
                            {successMessage}
                        </div>
                        <Link to="/login" className="inline-flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                        <AuthInput
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={Mail}
                            required
                        />

                        <GradientButton
                            type="submit"
                            disabled={isLoading || !email}
                            className="w-full py-4 mt-6 text-sm font-bold flex items-center justify-center space-x-2"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <span>{isLoading ? 'Sending...' : 'Send Reset Link'}</span>
                            <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isHovered && !isLoading ? 'translate-x-1' : ''}`} />
                        </GradientButton>
                    </form>
                )}

                {!successMessage && (
                    <p className="text-center text-sm text-slate-400 mt-8">
                        Remember your password?{' '}
                        <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                            Sign in
                        </Link>
                    </p>
                )}
            </div>
        </AuthLayout>
    );
}
