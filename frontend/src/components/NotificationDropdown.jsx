import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    Zap,
    Clock,
    AlertCircle,
    CheckCircle2,
    Crown,
    X,
    Bell
} from 'lucide-react';
import { api } from '../utils/api';

export default function NotificationDropdown({ isOpen, onClose, role }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const data = await api.get('/notifications');
                // The backend currently only tracks basic messages, we will enrich them with UI icons for now
                const enriched = data.map((n, idx) => ({
                    ...n,
                    title: 'System Alert',
                    desc: n.message,
                    icon: Bell,
                    color: 'text-indigo-500',
                    time: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setNotifications(enriched);
            } catch (error) {
                console.error("Failed to load notifications", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop for closing */}
            <div className="fixed inset-0 z-[80]" onClick={onClose} />

            <div className="absolute top-full right-0 mt-4 w-96 bg-[#151226] border border-white/5 rounded-[2rem] shadow-2xl p-6 z-[90] animate-fade-in origin-top-right">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h4 className="text-lg font-black text-white tracking-tight">Notifications</h4>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">You have {notifications.filter(n => n.unread).length} unread alerts</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-4 h-4 text-slate-500" />
                    </button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-4 text-slate-500 text-xs font-bold uppercase tracking-widest">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-4 text-slate-500 text-xs font-bold uppercase tracking-widest">No notifications</div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${notif.unread ? 'bg-white/5 border-indigo-500/20' : 'bg-transparent border-white/5 hover:bg-white/[0.02]'
                                    }`}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className={`p-2.5 rounded-xl bg-white/5 ${notif.color} shrink-0`}>
                                        <notif.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h5 className="text-xs font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                                            {notif.title}
                                        </h5>
                                        <p className="text-[11px] text-slate-500 font-bold mt-0.5 leading-relaxed truncate">
                                            {notif.desc}
                                        </p>
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2 block">
                                            {notif.time}
                                        </span>
                                    </div>
                                    {notif.unread && (
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1] mt-1.5" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <button className="w-full mt-6 py-3.5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                    Mark all as read
                </button>
            </div>
        </>
    );
}
