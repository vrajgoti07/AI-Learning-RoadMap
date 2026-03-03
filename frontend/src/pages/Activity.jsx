import React, { useState, useEffect } from 'react';
import { Activity as ActivityIcon, Clock, Filter, Search, ShieldCheck, Zap, LogIn, UserPlus, Database, Settings } from 'lucide-react';
import { api } from '../utils/api';
import { formatDistanceToNow } from 'date-fns';

export default function Activity() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    const fetchLogs = async () => {
        try {
            const data = await api.get('/activity');
            setLogs(data);
        } catch (error) {
            console.error("Failed to fetch activity logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getActionIcon = (action) => {
        switch (action) {
            case 'LOGIN':
            case 'GOOGLE_AUTH':
                return <LogIn className="w-5 h-5 text-emerald-400" />;
            case 'SIGNUP':
                return <UserPlus className="w-5 h-5 text-indigo-400" />;
            case 'GENERATE_ROADMAP':
                return <Zap className="w-5 h-5 text-yellow-400" />;
            case 'UPDATE_PROFILE':
            case 'UPDATE_THEME':
                return <Settings className="w-5 h-5 text-slate-400" />;
            case 'ADMIN_ACTION':
                return <ShieldCheck className="w-5 h-5 text-amber-400" />;
            default:
                return <Database className="w-5 h-5 text-slate-400" />;
        }
    };

    const getActionTitle = (log) => {
        const action = log.action;
        const details = log.details || {};

        switch (action) {
            case 'LOGIN': return 'Account Login';
            case 'GOOGLE_AUTH': return 'Google Authentication';
            case 'SIGNUP': return 'New Account Created';
            case 'GENERATE_ROADMAP': return `Generated Roadmap: ${details.topic || 'New Path'}`;
            case 'UPDATE_PROFILE': return 'Profile Updated';
            case 'UPDATE_THEME': return `Theme Switched to ${details.theme || 'Default'}`;
            case 'ADMIN_ACTION': return `Admin Action: ${details.type || 'System'}`;
            default: return action.replace(/_/g, ' ');
        }
    };

    const filteredLogs = filter === 'ALL'
        ? logs
        : logs.filter(log => log.action === filter);

    return (
        <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                        <ActivityIcon className="w-10 h-10 text-indigo-500" />
                        Activity <span className="gradient-text">Log</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Keep track of your journey and system events.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="appearance-none bg-[#1A1826] border border-white/10 rounded-2xl px-6 py-3 text-sm font-bold text-slate-300 outline-none hover:border-indigo-500/50 transition-all cursor-pointer pr-12"
                        >
                            <option value="ALL">All Activity</option>
                            <option value="GENERATE_ROADMAP">Roadmaps</option>
                            <option value="LOGIN">Logins</option>
                            <option value="UPDATE_PROFILE">Settings</option>
                        </select>
                        <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none group-hover:text-indigo-400 transition-colors" />
                    </div>
                </div>
            </div>

            {/* Logs List */}
            <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-[27px] top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-white/5 to-transparent hidden sm:block" />

                <div className="space-y-6 relative">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex gap-6 animate-pulse">
                                <div className="w-14 h-14 rounded-2xl bg-white/5 shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-6 bg-white/5 rounded-lg w-1/4" />
                                    <div className="h-4 bg-white/5 rounded-lg w-1/2" />
                                </div>
                            </div>
                        ))
                    ) : filteredLogs.length === 0 ? (
                        <div className="text-center py-20 bg-[#1A1826] rounded-[2rem] border border-white/5">
                            <Database className="w-16 h-16 text-slate-600 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-bold text-white mb-2">No activity found</h3>
                            <p className="text-slate-500">Your recent actions will appear here once you start using the platform.</p>
                        </div>
                    ) : (
                        filteredLogs.map((log) => (
                            <div key={log._id} className="flex gap-6 group">
                                {/* Icon Container */}
                                <div className="relative shrink-0 sm:mt-1">
                                    <div className="w-14 h-14 rounded-2xl bg-[#1A1826] border border-white/10 flex items-center justify-center relative z-10 group-hover:border-indigo-500/40 transition-all group-hover:scale-110 shadow-xl">
                                        {getActionIcon(log.action)}
                                    </div>
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 bg-[#1A1826]/40 hover:bg-[#1A1826] border border-white/5 hover:border-white/10 p-6 rounded-[2rem] transition-all group-hover:translate-x-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                        <h3 className="text-lg font-black text-white tracking-wide">
                                            {getActionTitle(log)}
                                        </h3>
                                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-slate-400 font-medium">
                                        {log.ip_address && (
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-lg border border-white/5">
                                                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                                                {log.ip_address}
                                            </span>
                                        )}
                                        {log.details && Object.keys(log.details).length > 0 && (
                                            <span className="text-indigo-400 italic">
                                                {Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
