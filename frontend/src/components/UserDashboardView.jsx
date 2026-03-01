import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    PlayCircle,
    Flame,
    Trophy,
    Target,
    Edit2,
    CheckCircle2,
    Lock,
    Zap,
    BookOpen,
    Clock,
    Plus,
    Compass
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { api } from '../utils/api';

const achievements = [
    { id: 1, title: 'First Steps', desc: 'Generate first roadmap', unlocked: true, icon: Target },
    { id: 2, title: 'Week Warrior', desc: '7 day streak', unlocked: true, icon: Flame },
    { id: 3, title: 'Deep Dive', desc: 'Complete 3 modules', unlocked: false, icon: BookOpen },
    { id: 4, title: 'Mastery', desc: 'Finish a roadmap', unlocked: false, icon: Trophy }
];

// Heatmap Data (7 columns x 5 rows)
const generateHeatmap = () => {
    const data = [];
    for (let i = 0; i < 35; i++) {
        data.push(Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0);
    }
    return data;
};
const heatmapData = generateHeatmap();

export default function UserDashboardView() {
    const navigate = useNavigate();
    const [goalModalOpen, setGoalModalOpen] = useState(false);
    const [recentRoadmaps, setRecentRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoadmaps = async () => {
            try {
                const data = await api.get('/roadmaps');
                setRecentRoadmaps(data);
            } catch (error) {
                console.error("Failed to fetch roadmaps:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRoadmaps();
    }, []);

    const hasData = recentRoadmaps.length > 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-500/20 rounded-full border-t-indigo-500 animate-[spin_1s_linear_infinite]" />
            </div>
        );
    }

    if (!hasData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white/2 border border-white/5 rounded-[3rem] animate-fade-in">
                <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20 shadow-2xl relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                    <Compass className="w-12 h-12 text-indigo-400 relative z-10" />
                </div>
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Your Journey Awaits</h2>
                <p className="text-slate-400 font-medium max-w-sm mb-8">
                    Generate your first personalized AI learning roadmap to kickstart your career growth.
                </p>
                <button
                    onClick={() => navigate('/generator')}
                    className="bg-gradient-to-r from-indigo-600 to-cyan-500 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-500/25 flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create Roadmap</span>
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* 1. Continue Learning Section */}
            <GlassCard className="p-8 border border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent relative overflow-hidden rounded-[2.5rem]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="max-w-xl">
                        <div className="flex items-center space-x-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">Continue Learning</span>
                            <span className="text-xs font-bold text-slate-400 flex items-center"><Clock className="w-3 h-3 mr-1" /> Sessions Active</span>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4 leading-tight">
                            {recentRoadmaps[0]?.topic || 'Your Next Goal'}
                        </h2>

                        <div className="mb-6">
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-slate-300">Module 3: Advanced React Patterns</span>
                                <span className="text-indigo-400">65%</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full w-[65%] shadow-[0_0_10px_#6366f1]" />
                            </div>
                        </div>

                        <button
                            onClick={() => navigate(`/roadmap/${recentRoadmaps[0]?.id}`)}
                            className="bg-white text-indigo-900 px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center space-x-2 hover:bg-slate-100 transition-all shadow-xl shadow-white/5"
                        >
                            <PlayCircle className="w-5 h-5" />
                            <span>Resume</span>
                        </button>
                    </div>

                    {/* Visual Graphic */}
                    <div className="hidden lg:flex w-40 h-40 relative items-center justify-center">
                        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full border-t-indigo-500 animate-[spin_10s_linear_infinite]" />
                        <div className="absolute inset-4 border-4 border-cyan-500/20 rounded-full border-b-cyan-500 animate-[spin_7s_linear_infinite_reverse]" />
                        <BookOpen className="w-12 h-12 text-white/80" />
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-8">

                    {/* 2. Recently Viewed Section (Horizontal Scroll) */}
                    <div>
                        <h3 className="text-lg font-black text-white px-1 mb-4 flex items-center justify-between">
                            <span>Recently Viewed</span>
                            <button className="text-[10px] text-indigo-400 uppercase tracking-widest hover:text-indigo-300">View All</button>
                        </h3>
                        <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                            {recentRoadmaps.slice(1).map((rm, i) => {
                                const colors = ['#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
                                const color = colors[i % colors.length];
                                return (
                                    <GlassCard onClick={() => navigate(`/roadmap/${rm.id}`)} key={rm.id} className="min-w-[240px] p-5 shrink-0 snap-center border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-colors group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5" style={{ color: color }}>
                                                <Target className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-black" style={{ color: color }}>0%</span>
                                        </div>
                                        <h4 className="text-sm font-black text-white mb-2 truncate group-hover:text-indigo-400 transition-colors">{rm.topic}</h4>
                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `0%`, backgroundColor: color }} />
                                        </div>
                                    </GlassCard>
                                )
                            })}
                        </div>
                    </div>

                    {/* 7. Learning Heatmap */}
                    <GlassCard className="p-6 border border-white/5 bg-white/[0.02]">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Activity Heatmap</h3>
                        <div className="flex gap-2 w-full overflow-x-auto custom-scrollbar pb-2">
                            {/* 7 cols, 5 rows logic simplified for UI demo */}
                            {Array.from({ length: 7 }).map((_, colIndex) => (
                                <div key={colIndex} className="flex flex-col gap-2 shrink-0">
                                    {Array.from({ length: 5 }).map((_, rowIndex) => {
                                        const intensity = heatmapData[colIndex * 5 + rowIndex];
                                        return (
                                            <div
                                                key={rowIndex}
                                                className={`w-8 h-8 rounded-md transition-colors ${intensity === 0 ? 'bg-white/5' :
                                                    intensity === 1 ? 'bg-indigo-500/20' :
                                                        intensity === 2 ? 'bg-indigo-500/40' :
                                                            intensity === 3 ? 'bg-indigo-500/60' :
                                                                'bg-indigo-500'
                                                    }`}
                                                title={`${intensity} activities`}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-end space-x-2 mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <span>Less</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 rounded-sm bg-white/5" />
                                <div className="w-3 h-3 rounded-sm bg-indigo-500/40" />
                                <div className="w-3 h-3 rounded-sm bg-indigo-500" />
                            </div>
                            <span>More</span>
                        </div>
                    </GlassCard>

                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-8">

                    {/* 3 & 4. Streak Badge & Weekly XP */}
                    <div className="grid grid-cols-2 gap-4">
                        <GlassCard className="p-5 border border-white/5 bg-white/[0.02] flex flex-col items-center text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mb-3 relative">
                                <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-md animate-pulse" />
                                <Flame className="w-6 h-6 text-orange-500 relative z-10" />
                            </div>
                            <span className="text-2xl font-black text-white">12</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Day Streak</span>
                        </GlassCard>

                        <GlassCard className="p-5 border border-cyan-500/20 bg-cyan-500/5 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mb-3 relative">
                                <Zap className="w-6 h-6 text-cyan-400 relative z-10" />
                            </div>
                            <span className="text-2xl font-black text-white">Lvl 4</span>
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3">1,240 / 2,000 XP</span>
                            <div className="w-full h-1.5 bg-cyan-500/20 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-400 w-[62%] shadow-[0_0_8px_#06b6d4]" />
                            </div>
                        </GlassCard>
                    </div>

                    {/* 5. Goal Tracker Card */}
                    <GlassCard className="p-6 border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Weekly Goal</h3>
                            <button className="text-slate-500 hover:text-indigo-400 transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-2xl font-black text-white">4 <span className="text-sm text-slate-500">/ 10 hrs</span></span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-indigo-500 w-[40%]" />
                        </div>
                        <p className="text-xs font-bold text-slate-400">Keep it up! 6 hours left to reach your target.</p>
                    </GlassCard>

                    {/* 6. Achievement Section */}
                    <GlassCard className="p-6 border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">Achievements</h3>
                            <span className="text-[10px] font-black text-indigo-400 px-2 py-0.5 bg-indigo-500/10 rounded-full">2/10</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {achievements.map((ach) => (
                                <div key={ach.id} className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${ach.unlocked ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5 opacity-50 grayscale'
                                    }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${ach.unlocked ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-600'
                                        }`}>
                                        {ach.unlocked ? <ach.icon className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    </div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-tight mb-0.5">{ach.title}</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                </div>
            </div>
        </div>
    );
}
