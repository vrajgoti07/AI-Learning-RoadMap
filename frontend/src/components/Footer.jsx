import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Logo from './Logo';
import { api } from '../utils/api';

export default function Footer() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const result = await api.post('/newsletter/subscribe', { email });
            setStatus('success');
            setMessage(result.message || 'Subscribed successfully!');
            setEmail('');
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            setStatus('error');
            setMessage(error.message || 'Something went wrong. Please try again.');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <footer className="relative border-t border-white/10 bg-[#0B0914] pt-20 pb-10 overflow-hidden mt-10">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center space-x-3 group w-fit">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-full transform group-hover:scale-125 transition-transform" />
                                <Logo className="w-8 h-8 relative z-10 transition-transform group-hover:scale-110" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-white">
                                PathFinder <span className="gradient-text">AI</span>
                            </span>
                        </Link>
                        <p className="text-sm text-slate-400 font-bold leading-relaxed max-w-xs">
                            Empowering your learning journey with AI-generated, highly customized career roadmaps and resources.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-all hover:scale-110 shadow-lg">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-all hover:scale-110 shadow-lg">
                                <Github className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-all hover:scale-110 shadow-lg">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Product</h4>
                        <ul className="space-y-4">
                            <li><Link to="/generator" className="text-sm font-bold text-slate-400 hover:text-indigo-400 transition-colors">Roadmap Generator</Link></li>
                            <li><Link to="/pricing" className="text-sm font-bold text-slate-400 hover:text-indigo-400 transition-colors">Pricing & Plans</Link></li>
                            <li><Link to="/dashboard" className="text-sm font-bold text-slate-400 hover:text-indigo-400 transition-colors">User Dashboard</Link></li>
                            <li><a href="#" className="text-sm font-bold text-slate-400 hover:text-indigo-400 transition-colors">Success Stories</a></li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Resources</h4>
                        <ul className="space-y-4">
                            <li><Link to="/help" className="text-sm font-bold text-slate-400 hover:text-cyan-400 transition-colors">Help Center</Link></li>
                            <li><a href="#" className="text-sm font-bold text-slate-400 hover:text-cyan-400 transition-colors">Documentation</a></li>
                            <li><a href="#" className="text-sm font-bold text-slate-400 hover:text-cyan-400 transition-colors">Community Forum</a></li>
                            <li><a href="#" className="text-sm font-bold text-slate-400 hover:text-cyan-400 transition-colors">System Status</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Stay Updated</h4>
                        <p className="text-sm text-slate-400 font-bold mb-4">
                            Subscribe to our newsletter for the latest AI learning strategies.
                        </p>
                        <form onSubmit={handleSubscribe} className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={status === 'loading'}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-12 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading' || !email}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center text-white hover:bg-indigo-400 hover:scale-105 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {status === 'loading' ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ArrowRight className="w-4 h-4" />
                                )}
                            </button>
                        </form>

                        {status === 'success' && (
                            <div className="mt-3 flex items-center space-x-2 text-emerald-400 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{message}</span>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="mt-3 flex items-center space-x-2 text-rose-400 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{message}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em]">
                        © {new Date().getFullYear()} PathFinder AI. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-6">
                        <a href="#" className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-[0.1em] transition-colors">Privacy Policy</a>
                        <a href="#" className="text-[11px] font-black text-slate-500 hover:text-white uppercase tracking-[0.1em] transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
