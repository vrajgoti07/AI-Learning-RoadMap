import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Menu,
    X,
    LogOut,
    LayoutDashboard,
    Wand2,
    Settings as SettingsIcon,
    Crown,
    Home as HomeIcon
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, plan } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/', icon: HomeIcon },
        { name: 'Roadmap Generator', path: '/generator', icon: Wand2 },
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, protected: true },
        { name: 'Pricing', path: '/pricing', icon: Crown },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed top-0 left-0 right-0 z-[60] px-4 py-4 sm:px-6 lg:px-8 pointer-events-none">
            <nav className={`
                max-w-7xl mx-auto w-full transition-all duration-500 pointer-events-auto
                ${scrolled
                    ? 'bg-background/80 backdrop-blur-xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl py-3 px-6'
                    : 'bg-transparent border-transparent py-4 px-2'
                }
                border
            `}>
                <div className="flex justify-between items-center relative">
                    {/* Logo & Brand (Left) */}
                    <div className="flex items-center z-10 pointer-events-auto">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-full transform group-hover:scale-125 transition-transform" />
                                <Logo className="w-9 h-9 relative z-10 transition-transform group-hover:scale-110" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-white hidden sm:block">
                                PathFinder <span className="gradient-text">AI</span>
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links (Center) */}
                    <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none z-0">
                        <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/5 pointer-events-auto">
                            {navLinks.map((link) => (
                                (!link.protected || user) && (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center space-x-2 ${isActive(link.path)
                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <link.icon className="w-4 h-4" />
                                        <span>{link.name}</span>
                                    </Link>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Desktop Auth/Settings (Right) */}
                    <div className="hidden lg:flex items-center z-10 pointer-events-auto">
                        {user ? (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/settings"
                                    className="p-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-indigo-500 hover:bg-white/5 transition-all"
                                    title="Account Settings"
                                >
                                    <SettingsIcon className="w-5 h-5" />
                                </Link>

                                <div className="flex items-center space-x-3 bg-indigo-500/10 border border-indigo-500/20 p-1.5 pr-4 rounded-xl group cursor-pointer hover:bg-indigo-500/20 transition-all">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-indigo-500/30">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-white leading-none mb-1">{user.name.split(' ')[0]}</span>
                                        <span className={`text-[9px] font-black uppercase tracking-widest leading-none ${plan === 'PRO' ? 'text-indigo-400' : 'text-slate-500'}`}>
                                            {plan} Level
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={logout}
                                    className="p-2.5 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-6">
                                <Link to="/login" className="text-sm font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest">
                                    Log In
                                </Link>
                                <Link to="/signup" className="text-sm font-black bg-white text-slate-900 px-6 py-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 uppercase tracking-widest relative overflow-hidden group">
                                    <span className="relative z-10">Join Now</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="lg:hidden flex items-center z-10 pointer-events-auto">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isOpen && (
                    <div className="lg:hidden mt-4 bg-background border border-white/10 p-4 rounded-2xl shadow-2xl animate-fade-in">
                        <div className="space-y-2">
                            {navLinks.map((link) => (
                                (!link.protected || user) && (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center space-x-3 p-4 rounded-xl text-sm font-bold transition-all ${isActive(link.path)
                                            ? 'bg-indigo-500 text-white shadow-lg'
                                            : 'text-slate-400 hover:bg-white/5'
                                            }`}
                                    >
                                        <link.icon className="w-5 h-5" />
                                        <span>{link.name}</span>
                                    </Link>
                                )
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5">
                            {!user ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center py-3 font-bold text-xs uppercase tracking-widest text-slate-400 border border-white/10 rounded-xl">
                                        Log In
                                    </Link>
                                    <Link to="/signup" onClick={() => setIsOpen(false)} className="flex items-center justify-center py-3 font-bold text-xs uppercase tracking-widest bg-indigo-500 text-white rounded-xl">
                                        Join Free
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-4 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5">
                                        <SettingsIcon className="w-5 h-5" />
                                        <span>Account Settings</span>
                                    </Link>
                                    <button onClick={() => { logout(); setIsOpen(false) }} className="w-full flex items-center space-x-3 p-4 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/5 transition-all text-left">
                                        <LogOut className="w-5 h-5" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
}
