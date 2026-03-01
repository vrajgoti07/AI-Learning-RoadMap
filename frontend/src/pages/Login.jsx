import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import AuthInput from '../components/AuthInput';
import GradientButton from '../components/GradientButton';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="glass-card p-8 sm:p-10 rounded-[2rem] border border-white/10 shadow-2xl relative z-10 w-full backdrop-blur-xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
                    <p className="text-slate-400 text-sm">Sign in to continue your learning journey</p>
                </div>

                <form onSubmit={handleLogin}>
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

                    <AuthInput
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon={Lock}
                        required
                    />

                    <div className="flex items-center justify-between mb-8">
                        <label className="flex items-center space-x-2 cursor-pointer group">
                            <input type="checkbox" className="form-checkbox bg-background border-white/10 rounded text-indigo-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 transition-colors group-hover:border-indigo-400" />
                            <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                            Forgot password?
                        </Link>
                    </div>

                    <GradientButton
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 text-sm font-bold flex items-center justify-center space-x-2"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                        <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isHovered && !isLoading ? 'translate-x-1' : ''}`} />
                    </GradientButton>
                </form>

                <div className="mt-8 mb-6 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-[#151226] px-4 text-slate-500">Or continue with</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button type="button" className="flex items-center justify-center px-4 py-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-white text-sm font-medium transition-colors">
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>
                    <button type="button" className="flex items-center justify-center px-4 py-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-white text-sm font-medium transition-colors">
                        <Github className="w-5 h-5 mr-2" />
                        GitHub
                    </button>
                </div>

                <p className="text-center text-sm text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                        Create an account
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
