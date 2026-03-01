import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Wand2,
    Activity,
    Settings as SettingsIcon,
    LifeBuoy,
    LogOut,
    Crown,
    ChevronRight,
    Users as UsersIcon
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, plan } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Roadmap Generator', path: '/generator', icon: Wand2 },
        { name: 'Activity', path: '/activity', icon: Activity },
        // Only show Users to ADMINs
        ...(user?.role === 'ADMIN' ? [{ name: 'User Management', path: '/users', icon: UsersIcon }] : []),

    ];

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#0B0914] border-r border-white/5 flex flex-col z-[70] transition-all overflow-hidden lg:flex hidden">
            {/* Logo Section */}
            <div className="p-8 pb-10">
                <Link to="/" className="flex items-center space-x-3 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-full transform group-hover:scale-125 transition-transform" />
                        <Logo className="w-10 h-10 relative z-10" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-white">
                        PathFinder <span className="gradient-text text-sm">AI</span>
                    </span>
                </Link>
            </div>

            {/* Main Navigation */}
            <div className="flex-grow px-4 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all group ${isActive(item.path)
                            ? 'bg-gradient-to-r from-indigo-500/20 to-transparent text-indigo-400 border-l-4 border-indigo-500 rounded-l-none'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/2'
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-indigo-500' : 'text-slate-500 group-hover:text-slate-400'}`} />
                            <span>{item.name}</span>
                        </div>
                        {isActive(item.path) && <ChevronRight className="w-4 h-4" />}
                    </Link>
                ))}
            </div>

            {/* Bottom Section */}
            <div className="mt-auto p-4" ref={menuRef}>
                {/* Popup Menu */}
                {isMenuOpen && (
                    <div className="absolute bottom-20 left-4 w-[256px] bg-[#1A1826] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in mb-2">
                        {/* Menu Content */}
                        <div className="px-4 py-3 border-b border-white/5 mb-2">
                            <div className="text-sm font-bold text-white truncate">{user?.name || 'Admin'}</div>
                            <div className="text-xs text-slate-400 truncate">{user?.email || 'admin@pathfinder.ai'}</div>
                        </div>

                        <div className="px-2 space-y-0.5">
                            {plan === 'GO' && (
                                <button
                                    onClick={() => { setIsMenuOpen(false); navigate('/pricing'); }}
                                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <Crown className="w-4 h-4 text-indigo-400" />
                                    <span>Upgrade plan</span>
                                </button>
                            )}
                            <button
                                onClick={() => { setIsMenuOpen(false); navigate('/settings'); }}
                                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                <SettingsIcon className="w-4 h-4" />
                                <span>Settings</span>
                            </button>
                            <button
                                onClick={() => { setIsMenuOpen(false); navigate('/help'); }}
                                className="w-full flex items-center justify-between space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <LifeBuoy className="w-4 h-4" />
                                    <span>Help</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                            </button>
                        </div>

                        <div className="mt-2 pt-2 border-t border-white/5 px-2">
                            <button
                                onClick={() => { setIsMenuOpen(false); logout(); }}
                                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Log out</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Profile Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors group relative"
                >
                    <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-inner group-hover:shadow-indigo-500/20 transition-all">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#0B0914] rounded-full p-[2px]">
                            <div className="w-full h-full bg-emerald-500 rounded-full" />
                        </div>
                    </div>
                    <div className="flex flex-col flex-grow min-w-0 text-left">
                        <span className="text-sm font-bold text-white tracking-wide truncate">{user?.name || 'Admin'}</span>
                        <span className="text-xs text-slate-400 font-bold tracking-tight truncate capitalize">{plan ? `${plan} Plan` : 'GO Plan'}</span>
                    </div>
                </button>
            </div>
        </aside>
    );
}
