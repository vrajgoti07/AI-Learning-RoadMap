import React, { useState, useEffect } from 'react';
import {
    Users as UsersIcon,
    Search,
    MoreVertical,
    Shield,
    ShieldCheck,
    Mail,
    Calendar,
    ArrowUpRight,
    Filter,
    ShieldAlert,
    Eye
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import UserProgressModal from '../components/UserProgressModal';
import { api } from '../utils/api';

export default function Users() {
    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser?.role !== 'ADMIN') return;

        const fetchUsers = async () => {
            try {
                const data = await api.get('/users');
                const formattedUsers = data.map(u => ({
                    id: u._id,
                    name: u.name || u.email.split('@')[0],
                    email: u.email,
                    role: u.role || 'USER',
                    plan: u.plan || 'GO',
                    status: u.role === 'BANNED' ? 'Inactive' : 'Active',
                    joined: u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'
                }));
                setUsers(formattedUsers);
            } catch (error) {
                console.error("Failed to load users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentUser]);

    // Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Security Guard: Prevent rendering if not an Admin
    if (currentUser?.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white/2 border border-white/5 rounded-[3rem]">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-2xl">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">Access Restricted</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs max-w-sm leading-relaxed">
                    The User Directory is for administrative use only.
                </p>
            </div>
        );
    }

    const handleInspect = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Total Users', value: users.length, icon: UsersIcon, color: 'text-indigo-500' },
                    { label: 'PRO Members', value: users.filter(u => u.plan !== 'GO').length, icon: ShieldCheck, color: 'text-cyan-400' },
                    { label: 'Active Today', value: users.filter(u => u.joined === new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })).length, icon: Calendar, color: 'text-emerald-500' }
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-6 border border-white/5 bg-white/2">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                                <h4 className="text-2xl font-black text-white">{stat.value}</h4>
                            </div>
                            <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Table Section */}
            <GlassCard className="border border-white/5 bg-white/1 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <h3 className="text-xl font-black text-white tracking-tight">System Users</h3>
                    <div className="flex items-center space-x-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-64 transition-all text-white"
                            />
                        </div>
                        <button className="p-2.5 rounded-xl border border-white/10 text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">User Details</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Role & Plan</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Joined</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-white uppercase tracking-tight">{user.name}</div>
                                                <div className="text-[10px] font-bold text-slate-500 flex items-center mt-0.5">
                                                    <Mail className="w-3 h-3 mr-1.5 opacity-50" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col space-y-1.5">
                                            <div className="flex items-center space-x-2">
                                                {user.role === 'ADMIN' ? (
                                                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                                                ) : (
                                                    <Shield className="w-3.5 h-3.5 text-slate-600" />
                                                )}
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? 'text-indigo-400' : 'text-slate-500'}`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md w-fit uppercase tracking-widest ${user.plan === 'PRO PLUS' ? 'bg-cyan-500/10 text-cyan-400' :
                                                user.plan === 'PRO' ? 'bg-indigo-500/10 text-indigo-400' :
                                                    'bg-slate-500/10 text-slate-500'
                                                }`}>
                                                {user.plan}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-700'}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${user.status === 'Active' ? 'text-emerald-500' : 'text-slate-600'}`}>
                                                {user.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{user.joined}</span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleInspect(user)}
                                                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all font-black text-[10px] uppercase tracking-widest"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span className="hidden sm:inline">Inspect</span>
                                            </button>
                                            <button className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {/* Individual User Detail Modal */}
            <UserProgressModal
                user={selectedUser}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
