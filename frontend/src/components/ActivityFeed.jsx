import React from 'react';
import {
    UserPlus,
    Zap,
    TrendingUp,
    ShieldCheck,
    Clock,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';

const activities = [
    { id: 1, type: 'signup', user: 'Emma Wilson', action: 'joined the platform', time: '2 mins ago', icon: UserPlus, color: 'text-indigo-400' },
    { id: 2, type: 'roadmap', user: 'John Doe', action: 'generated "Next.js Mastery"', time: '15 mins ago', icon: Zap, color: 'text-cyan-400' },
    { id: 3, type: 'progress', user: 'Sarah Smith', action: 'reached 50% in React Architecture', time: '1 hour ago', icon: TrendingUp, color: 'text-emerald-400' },
    { id: 4, type: 'upgrade', user: 'Alex Johnson', action: 'upgraded to PRO PLUS', time: '3 hours ago', icon: ShieldCheck, color: 'text-amber-400' },
    { id: 5, type: 'roadmap', user: 'Vraj Goti', action: 'generated "System Design"', time: '5 hours ago', icon: Zap, color: 'text-cyan-400' },
];

export default function ActivityFeed() {
    return (
        <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Live Activity</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Real-time platform events</p>
                </div>
                <button className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {activities.map((activity) => (
                    <div key={activity.id} className="group relative pl-6 border-l border-white/5 pb-2 last:pb-0">
                        {/* Timeline Dot */}
                        <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-[#151226] border border-white/10 group-hover:border-indigo-500 transition-colors" />

                        <div className="flex items-start space-x-4">
                            <div className={`p-2 rounded-xl bg-white/5 ${activity.color} shrink-0`}>
                                <activity.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                                        {activity.user}
                                    </span>
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center shrink-0 ml-4">
                                        <Clock className="w-2.5 h-2.5 mr-1" />
                                        {activity.time}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-bold leading-relaxed truncate">
                                    {activity.action}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-8 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all">
                View All Records
            </button>
        </div>
    );
}
