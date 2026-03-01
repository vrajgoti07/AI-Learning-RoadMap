import React, { useState } from 'react';
import {
    User,
    CreditCard,
    Bell,
    Shield,
    Check,
    Crown,
    Zap,
    ChevronRight,
    Lock,
    LifeBuoy,
    Eye,
    EyeOff,
    Camera,
    Mail
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import UpgradeModal from '../components/UpgradeModal';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const { user, plan } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    // Password visibility state
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'plan', label: 'Billing & Plan', icon: CreditCard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-10 animate-fade-in max-w-2xl">
                        {/* Avatar Section */}
                        <div className="flex items-center space-x-6 pb-8 border-b border-white/5 group bg-white/[0.02] p-6 rounded-[2rem]">
                            <div className="relative cursor-pointer">
                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-500/20 group-hover:scale-105 transition-all">
                                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-[#1A1826] p-2.5 rounded-xl border border-white/5 hover:bg-indigo-500 transition-colors shadow-lg">
                                    <Camera className="w-4 h-4 text-slate-400 hover:text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight leading-tight mb-1">{user?.name || "Admin"}</h3>
                                <p className="text-xs text-slate-400 font-bold mb-3">{user?.role === 'ADMIN' ? 'Administrator' : 'User'} Account</p>
                                <div className="flex space-x-3">
                                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors border border-white/5">
                                        Upload New
                                    </button>
                                    <button className="px-4 py-2 text-slate-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest px-2">Personal Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/[0.02] p-6 rounded-[2rem]">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            defaultValue={user?.name || "Vraj Goti"}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                                        />
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            defaultValue={user?.email || "vraj@example.com"}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                                        />
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    </div>
                                </div>
                                <div className="col-span-1 sm:col-span-2 space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Bio (Optional)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Tell us a little about yourself..."
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none transition-all"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button className="bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                Save Changes
                            </button>
                        </div>
                    </div>
                );
            case 'plan':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-8 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 gap-6">
                            <div className="flex items-center space-x-5">
                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 ${plan === 'PRO' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                                    {plan === 'PRO' ? <Crown className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-white mb-1">Current Plan: {plan}</h4>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Next Billing: April 1, 2026</p>
                                </div>
                            </div>
                            {plan === 'GO' && (
                                <button
                                    onClick={() => setIsUpgradeModalOpen(true)}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20"
                                >
                                    Upgrade to PRO
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {['1 Roadmap / Month', 'Standard Support', 'Public Sharing', 'Cloud Sync'].map(f => (
                                <div key={f} className="flex items-center text-xs font-bold text-slate-500 p-4 rounded-xl bg-white/2 border border-white/5">
                                    <Check className="w-4 h-4 text-emerald-500 mr-3" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-10 animate-fade-in max-w-xl">
                        {/* Password Reset Section */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">Change Password</h3>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 pr-12 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 pr-12 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 pr-12 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500/20 transition-all">
                                    Update Password
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="pt-8 border-t border-white/5 space-y-6">
                            <div className="flex items-center space-x-3 mb-2">
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                    <Shield className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Danger Zone</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Irreversible actions</p>
                                </div>
                            </div>

                            <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h4 className="text-white font-bold text-sm mb-1">Delete Account</h4>
                                    <p className="text-xs text-slate-400 font-bold">Permanently delete your account and all associated data. This action cannot be undone.</p>
                                </div>
                                <button className="shrink-0 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'notifications':
                const notificationOptions = [
                    { title: 'Email Reports', desc: 'Weekly learning progress and path insights', icon: Mail, color: 'indigo' },
                    { title: 'Browser Alerts', desc: 'Real-time milestone and streak notifications', icon: Bell, color: 'cyan' },
                    { title: 'Marketing', desc: 'New feature updates and curated tips', icon: Crown, color: 'purple' }
                ];
                return (
                    <div className="space-y-6 animate-fade-in max-w-2xl">
                        {notificationOptions.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white/[0.02] hover:bg-white/[0.04] rounded-3xl border border-white/5 transition-all group shadow-xl">
                                    <div className="flex items-center space-x-5 mb-4 sm:mb-0">
                                        <div className={`p-4 rounded-2xl bg-${item.color}-500/10 text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-black text-white uppercase tracking-widest mb-1">{item.title}</h5>
                                            <p className="text-xs text-slate-400 font-bold">{item.desc}</p>
                                        </div>
                                    </div>

                                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-16 sm:ml-0">
                                        <input type="checkbox" className="sr-only peer" defaultChecked={i < 2} />
                                        <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-cyan-400 shadow-inner"></div>
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-fade-in">
            {/* Nav Rail */}
            <div className="lg:col-span-3 bg-white/2 p-3 rounded-[2rem] border border-white/5">
                <nav className="space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${activeTab === tab.id
                                    ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20'
                                    : 'text-slate-500 hover:bg-white/2'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`} />
                                    <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                                </div>
                                <ChevronRight className={`w-4 h-4 ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`} />
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-9">
                <GlassCard className="p-10 border border-white/5 bg-white/1 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl min-h-[500px]">
                    <h2 className="text-2xl font-black text-white mb-10 tracking-tight">
                        {tabs.find(t => t.id === activeTab).label} Settings
                    </h2>
                    {renderTabContent()}
                </GlassCard>
            </div>

            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
        </div>
    );
}
