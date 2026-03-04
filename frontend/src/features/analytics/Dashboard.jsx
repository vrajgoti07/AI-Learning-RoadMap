import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Trophy, Flame, Target, Activity, Star } from 'lucide-react';
import { api } from '../../utils/api';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [analyticsRes, predictRes] = await Promise.all([
                    api.get('/analytics/dashboard'),
                    api.get('/ai/recommend')
                ]);
                setData(analyticsRes);
                setPredictions(predictRes);
            } catch (error) {
                console.error("Failed to load analytics or predictions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-500/20 rounded-full border-t-indigo-500 animate-[spin_1s_linear_infinite]" />
            </div>
        );
    }

    if (!data) return null;

    const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

    return (
        <div className="animate-fade-in pb-20 max-w-7xl mx-auto space-y-8 mt-10">

            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#151226]/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex items-center gap-4 hover:border-indigo-500/30 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Star className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium">Total XP</p>
                        <h3 className="text-2xl font-black text-white">{data.total_xp}</h3>
                    </div>
                </div>

                <div className="bg-[#151226]/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex items-center gap-4 hover:border-emerald-500/30 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium">Current Level</p>
                        <h3 className="text-2xl font-black text-white">{data.current_level}</h3>
                    </div>
                </div>

                <div className="bg-[#151226]/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex items-center gap-4 hover:border-orange-500/30 transition-colors hidden md:flex">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                        <Flame className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm font-medium">Learning Streak</p>
                        <h3 className="text-2xl font-black text-white">{data.streak} Days</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-[#151226]/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-400" />
                            XP Over Time (Last 7 Days)
                        </h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.recent_activity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="day" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '1rem', color: '#fff' }}
                                    itemStyle={{ color: '#818cf8' }}
                                />
                                <Area type="monotone" dataKey="xp" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="space-y-6">
                    <div className="bg-[#151226]/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Trophy className="w-4 h-4" /> Strongest Topics
                        </h3>
                        {data.top_skills?.length > 0 ? (
                            <div className="space-y-3">
                                {data.top_skills.map((skill, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                        <span className="text-gray-300 font-medium text-sm">{skill.topic}</span>
                                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full uppercase">Mastered</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm mt-2">Complete quizzes to identify your strengths.</p>
                        )}
                    </div>

                    <div className="bg-[#151226]/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
                        <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4" /> Needs Improvement
                        </h3>
                        {data.skills_to_improve?.length > 0 ? (
                            <div className="space-y-3">
                                {data.skills_to_improve.map((skill, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-rose-500/10">
                                        <span className="text-gray-300 font-medium text-sm">{skill.topic}</span>
                                        <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-full uppercase">Review</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm mt-2">No weak areas identified yet. Keep it up!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Predictive Engine Section */}
            {predictions && (
                <div className="mt-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white flex items-center gap-2">
                                AI Predictive PathFinder
                                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-[10px] text-indigo-300 uppercase tracking-widest border border-indigo-500/30">Beta</span>
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">{predictions.reasoning}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        {/* Predicted Gaps */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Predicted Skill Gaps</h4>
                            {predictions.skill_gaps?.map((gap, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-rose-400" />
                                    <span className="text-white text-sm font-medium">{gap}</span>
                                </div>
                            ))}
                        </div>

                        {/* Recommended Next Moves */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Recommended Next Topics</h4>
                            {predictions.recommended_topics?.map((topic, i) => (
                                <div key={i} className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                    <span className="text-indigo-100 text-sm font-medium">{topic}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
