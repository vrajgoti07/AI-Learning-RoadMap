import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children }) {
    const location = useLocation();
    const { user } = useAuth();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    // Map path to title
    const getTitle = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'Dashboard';
        if (path === '/generator') return 'Roadmap Generator';
        if (path === '/settings') return 'Settings';
        if (path === '/users') return 'User Management';
        if (path.startsWith('/roadmap/')) return 'Roadmap Detail';
        return 'Overview';
    };

    return (
        <div className="min-h-screen bg-[#0B0914] flex">
            {/* Sidebar is fixed on desktop */}
            <Sidebar />

            {/* Mobile Header (Hidden on Large screens) */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0B0914] border-b border-white/5 z-50 flex items-center justify-between px-6">
                <div className="flex items-center space-x-3">
                    <Menu className="w-6 h-6 text-slate-400" />
                    <span className="font-black text-white tracking-tight">PathFinder</span>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-grow lg:ml-72 flex flex-col min-h-screen">
                {/* Internal Top Bar (Dashboard style) */}
                <header className="h-20 flex items-center justify-between px-8 lg:px-12 shrink-0 z-50">
                    <h1 className="text-2xl font-black text-white tracking-tight">{getTitle()}</h1>

                    <div className="flex items-center space-x-6 relative">
                        <div className="relative group hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search paths..."
                                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-64 transition-all text-white"
                            />
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className={`relative p-2 rounded-xl transition-all ${isNotificationOpen ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-400 rounded-full border-2 border-[#0B0914]" />
                            </button>

                            <NotificationDropdown
                                isOpen={isNotificationOpen}
                                onClose={() => setIsNotificationOpen(false)}
                                role={user?.role || 'ADMIN'}
                            />
                        </div>
                    </div>
                </header>

                {/* Content Container */}
                <div className="flex-grow p-8 lg:p-12 pt-4">
                    {children}
                </div>
            </main>
        </div>
    );
}
