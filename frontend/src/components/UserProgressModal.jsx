import React from 'react';
import {
    X,
    Zap,
    Calendar,
    Clock,
    Target,
    ExternalLink,
    Search,
    Filter
} from 'lucide-react';
import GlassCard from './GlassCard';

const userSpecificRoadmaps = [
    { id: 101, title: 'Adv. React Architecture', progress: 85, lastWorked: '2 hours ago', difficulty: 'Advanced', modules: 12 },
    { id: 102, title: 'System Design 101', progress: 30, lastWorked: '1 day ago', difficulty: 'Beginner', modules: 8 },
    { id: 103, title: 'Node.js Performance', progress: 10, lastWorked: '3 days ago', difficulty: 'Intermediate', modules: 15 },
];

export default function UserProgressModal({ user, isOpen, onClose }) {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-[#151226] border border-white/5 rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] animate-scale-up overflow-hidden">
                {/* Header Section */}
                <div className="p-8 pb-4 flex items-center justify-between border-b border-white/5 relative bg-gradient-to-br from-indigo-500/5 to-transparent">
                    <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-indigo-500/20">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-1.5">{user.name}</h3>
                            <div className="flex items-center space-x-3">
                                <span className="text-[10px] font-black text-slate-500 border border-white/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{user.email}</span>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${user.plan === 'PRO PLUS' ? 'bg-cyan-500/10 text-cyan-400' :
                                        user.plan === 'PRO' ? 'bg-indigo-500/10 text-indigo-400' :
                                            'bg-slate-500/10 text-slate-500'
                                    }`}>
                                    {user.plan} MEMBER
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group">
                        <X className="w-5 h-5 text-slate-500 group-hover:text-white" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Member Quick Stats */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">User Performance</h4>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Active Paths', value: '3', icon: Target, color: 'text-indigo-400' },
                                        { label: 'Completion Rate', value: '64%', icon: Zap, color: 'text-cyan-400' },
                                        { label: 'Total Time', value: '18h 40m', icon: Clock, color: 'text-amber-500' },
                                        { label: 'Last Log', value: 'Today', icon: Calendar, color: 'text-emerald-500' }
                                    ].map((stat, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{stat.label}</span>
                                            </div>
                                            <span className="text-xs font-black text-white">{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button className="w-full py-4 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2">
                                <Search className="w-4 h-4" />
                                <span>Audit Records</span>
                            </button>
                        </div>

                        {/* Generated Roadmaps List */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Roadmaps</h4>
                                <Filter className="w-4 h-4 text-slate-600 cursor-pointer" />
                            </div>

                            <div className="space-y-4">
                                {userSpecificRoadmaps.map((roadmap) => (
                                    <div key={roadmap.id} className="p-5 bg-white/2 border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400">
                                                    <Zap className="w-5 h-5 shadow-[0_0_10px_currentColor]" />
                                                </div>
                                                <div>
                                                    <h5 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{roadmap.title}</h5>
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{roadmap.difficulty} • {roadmap.modules} Modules</span>
                                                </div>
                                            </div>
                                            <button className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-white transition-colors">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="flex-grow">
                                                <div className="flex justify-between mb-1.5">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Progress</span>
                                                    <span className="text-[10px] font-black text-white">{roadmap.progress}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                                                        style={{ width: `${roadmap.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1.5">Activity</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{roadmap.lastWorked}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="p-6 bg-white/[0.01] border-t border-white/5 text-center">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Confidential Platform Data • PathFinder AI Admin Panel</p>
                </div>
            </div>
        </div>
    );
}
