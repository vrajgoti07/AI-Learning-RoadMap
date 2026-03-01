import React, { useState, useEffect } from 'react';
import {
    Users,
    TrendingUp,
    CreditCard,
    Activity,
    ShieldCheck,
    Ban,
    UserPlus,
    RefreshCw,
    MoreVertical,
    DollarSign,
    Zap,
    ShieldAlert
} from 'lucide-react';
import {
    BarChart, Bar,
    LineChart, Line,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import GlassCard from './GlassCard';
import { api } from '../utils/api';

export default function AdminDashboardView() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total_users: 0, total_roadmaps: 0, premium_users: 0 });
    const [planData, setPlanData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        if (user?.role !== 'ADMIN') return;

        const fetchData = async () => {
            try {
                const [st, pd, td, ul, ra] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/plan-distribution'),
                    api.get('/admin/roadmap-trends'),
                    api.get('/users'),
                    api.get('/admin/recent-activity')
                ]);

                setStats(st);
                setRecentActivity(ra);

                // Map Plan Distribution
                const colorMap = { 'GO': '#f8fafc', 'PRO': '#06b6d4', 'PLUS': '#6366f1', 'PRO PLUS': '#8b5cf6' };
                setPlanData(pd.map(p => ({
                    name: p.plan,
                    value: p.count,
                    color: colorMap[p.plan] || '#10b981'
                })));

                // Map Trends
                setTrendData(td.map(t => ({
                    day: t.date.split('-')[2], // get just the day
                    count: t.count
                })));

                setUsersList(ul);
            } catch (error) {
                console.error("Admin fetch failed:", error);
            }
        };

        fetchData();
    }, [user]);

    if (user?.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white/2 border border-white/5 rounded-[3rem]">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-2xl">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">Access Restricted</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs max-w-sm leading-relaxed">
                    This section is reserved for platform administrators only.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in">
            {/* 1. Admin Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {[
                    { title: 'Total Users', value: stats.total_users || '0', trend: 'UP', sub: 'Total registered', icon: Users, color: 'text-indigo-400' },
                    { title: 'Premium Plans', value: stats.premium_users || '0', trend: 'LIVE', sub: 'Paying users', icon: CreditCard, color: 'text-cyan-400' },
                    { title: 'Roadmaps Gen', value: stats.total_roadmaps || '0', trend: 'AI', sub: 'Total AI paths', icon: Activity, color: 'text-emerald-400' },
                    { title: 'System Status', value: 'ONLINE', trend: 'STABLE', sub: 'API connection', icon: TrendingUp, color: 'text-amber-400' }
                ].map((card, i) => (
                    <GlassCard key={i} className="p-7 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl shadow-inner">
                                <card.icon className={`w-6 h-6 ${card.color}`} />
                            </div>
                            <span className="text-[10px] font-black px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shadow-sm">{card.trend}</span>
                        </div>
                        <div className="text-3xl font-black text-white tracking-tighter mb-2">{card.value}</div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{card.title}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{card.sub}</span>
                        </div>
                    </GlassCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                {/* Main Charts Column */}
                <div className="lg:col-span-8 space-y-8 lg:space-y-10">
                    {/* 3. Roadmap Generation Trend */}
                    <GlassCard className="p-8 lg:p-10 border border-white/5 bg-white/[0.02] shadow-2xl">
                        <div className="mb-8">
                            <h3 className="text-xl font-black text-white tracking-tight">Generation Trends</h3>
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-2">Roadmaps created over last 30 days</p>
                        </div>
                        <div className="h-[280px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.05} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} dx={-10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0B0914', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}
                                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 800 }}
                                    />
                                    <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#0B0914', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    {/* 4. Recent User Activity */}
                    <GlassCard className="p-8 lg:p-10 border border-white/5 bg-white/[0.02] overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-white tracking-tight">Recent Activity</h3>
                            <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300">View Log</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">User</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Action</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                                        <th className="pb-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right pr-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentActivity.map((log) => (
                                        <tr key={log.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                            <td className="py-5 pl-2 font-bold text-sm text-white">{log.user}</td>
                                            <td className="py-5 font-bold text-xs text-slate-400">{log.action}</td>
                                            <td className="py-5 font-bold text-xs text-slate-500">{log.date}</td>
                                            <td className="py-5 text-right pr-2">
                                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${log.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' :
                                                    log.status === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' :
                                                        'bg-cyan-500 shadow-[0_0_8px_#06b6d4]'
                                                    }`} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>

                    {/* 5. User Management Mini-Table */}
                    <GlassCard className="p-8 lg:p-10 border border-white/5 bg-white/[0.02] overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-white tracking-tight">Quick Manage</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <tbody>
                                    {usersList.slice(0, 10).map((usr) => (
                                        <tr key={usr.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                                            <td className="py-4 pl-2">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-sm uppercase">
                                                        {usr.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-white">{usr.name}</div>
                                                        <div className="text-[10px] font-bold text-slate-500">{usr.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${usr.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-400'
                                                    }`}>{usr.role}</span>
                                            </td>
                                            <td className="py-4 text-right pr-2">
                                                <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors" title="Promote">
                                                        <ShieldCheck className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Ban User">
                                                        <Ban className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>

                {/* Right Analytics Column */}
                <div className="lg:col-span-4 space-y-8 lg:space-y-10">
                    {/* 2. Plan Distribution Chart */}
                    <GlassCard className="p-8 border border-white/5 bg-white/[0.02] shadow-2xl">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">Plan Distribution</h3>
                        <div className="h-[220px] flex items-center justify-center relative -mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={planData}
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value" stroke="none"
                                    >
                                        {planData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0B0914', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                                <span className="text-2xl font-black text-white">{stats.total_users || '0'}</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Total</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-3 gap-2">
                            {planData.map(plan => (
                                <div key={plan.name} className="flex flex-col items-center text-center p-3 rounded-xl bg-white/[0.03]">
                                    <div className="w-3 h-3 rounded-full mb-2 shadow-lg" style={{ backgroundColor: plan.color, shadowColor: plan.color }} />
                                    <span className="text-[10px] font-black text-white uppercase tracking-wider">{plan.name}</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    {/* 6. Upgrade Conversion Analytics */}
                    <GlassCard className="p-8 border border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent shadow-2xl">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Conversion</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">Upgrade Metrics</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-slate-400">Upgrade Rate</span>
                                    <span className="text-emerald-400">12.4%</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[12.4%]" />
                                </div>
                            </div>
                            <div className="pt-2">
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="text-slate-400">Avg Revenue Per User</span>
                                    <span className="text-cyan-400 text-lg">$18.50</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* 7. Quick Actions Panel */}
                    <GlassCard className="p-8 border border-white/5 bg-white/[0.02] shadow-2xl">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Quick Actions</h3>
                        <div className="space-y-4">
                            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                                <div className="flex items-center space-x-3">
                                    <UserPlus className="w-4 h-4 text-slate-400 group-hover:text-white" />
                                    <span className="text-xs font-bold text-slate-300 group-hover:text-white">Invite User</span>
                                </div>
                            </button>
                            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors group">
                                <div className="flex items-center space-x-3">
                                    <Zap className="w-4 h-4 text-indigo-400" />
                                    <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300">Run Promotion</span>
                                </div>
                            </button>
                            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-red-500/5 hover:bg-red-500/10 transition-colors group">
                                <div className="flex items-center space-x-3">
                                    <RefreshCw className="w-4 h-4 text-red-400" />
                                    <span className="text-xs font-bold text-red-500">Reset Analytics</span>
                                </div>
                            </button>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
