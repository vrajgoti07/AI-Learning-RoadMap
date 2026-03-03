import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Wand2,
    Activity,
    Settings as SettingsIcon,
    LifeBuoy,
    LogOut,
    Crown,
    ChevronRight,
    Users as UsersIcon,
    PanelLeftClose,
    PanelLeftOpen,
    MessageSquare,
    MoreHorizontal,
    Share2,
    UserPlus,
    Edit2,
    Pin,
    Archive,
    Trash2,
    Check
} from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { BASE_URL, api } from '../utils/api';
import ConfirmDialog from './ConfirmDialog';
import Toast from './Toast';

export default function Sidebar({ width, setWidth, isVisible, setIsVisible }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, plan } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isResizingState, setIsResizingState] = useState(false);
    const [recentRoadmaps, setRecentRoadmaps] = useState([]);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0 });
    const [renamingId, setRenamingId] = useState(null);
    const [renamingValue, setRenamingValue] = useState("");

    // Professional Dialog States
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [toast, setToast] = useState(null);

    const menuRef = useRef(null);
    const contextMenuRef = useRef(null);
    const isResizing = useRef(false);

    const fetchRoadmaps = async () => {
        try {
            const data = await api.get('/roadmaps');
            if (Array.isArray(data)) {
                setRecentRoadmaps(data);
            } else if (data && Array.isArray(data.items)) {
                setRecentRoadmaps(data.items);
            } else if (data && Array.isArray(data.data)) {
                setRecentRoadmaps(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch roadmaps for sidebar:", error);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchRoadmaps();
    }, [user, location.pathname]);
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing.current) return;
            const newWidth = e.clientX;
            // Increased min width to 260px to accommodate logo and text properly
            if (newWidth >= 260 && newWidth <= 450) {
                setWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            setIsResizingState(false);
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [setWidth]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
            if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
                setMenuOpenId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = async (id, action, value = null) => {
        setMenuOpenId(null);
        try {
            if (action === 'delete') {
                setConfirmAction({ id, action: 'delete' });
                setShowConfirm(true);
            } else if (action === 'rename') {
                await api.patch(`/roadmaps/${id}`, { topic: value });
                setRenamingId(null);
                fetchRoadmaps();
                setToast({ message: "Roadmap renamed successfully!", type: 'success' });
            } else if (action === 'pin') {
                const rm = recentRoadmaps.find(r => (r._id || r.id) === id);
                await api.patch(`/roadmaps/${id}`, { is_pinned: !rm.is_pinned });
                fetchRoadmaps();
                setToast({ message: rm.is_pinned ? "Roadmap unpinned" : "Roadmap pinned", type: 'info' });
            } else if (action === 'archive') {
                await api.patch(`/roadmaps/${id}`, { is_archived: true });
                fetchRoadmaps();
                setToast({ message: "Roadmap archived", type: 'success' });
            } else if (action === 'share') {
                const url = `${window.location.origin}/roadmap/${id}`;
                await navigator.clipboard.writeText(url);
                setToast({ message: "Link copied to clipboard!", type: 'success' });
            }
        } catch (err) {
            console.error(`Failed to ${action} roadmap:`, err);
            setToast({ message: `Failed to ${action} roadmap`, type: 'error' });
        }
    };

    const confirmDelete = async () => {
        if (!confirmAction) return;
        const { id } = confirmAction;
        try {
            await api.delete(`/roadmaps/${id}`);
            fetchRoadmaps();
            if (location.pathname === `/roadmap/${id}`) {
                navigate('/dashboard');
            }
            setToast({ message: "Roadmap deleted successfully", type: 'success' });
        } catch (err) {
            setToast({ message: "Failed to delete roadmap", type: 'error' });
        } finally {
            setShowConfirm(false);
            setConfirmAction(null);
        }
    };

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Roadmap Generator', path: '/generator', icon: Wand2 },
        { name: 'Activity', path: '/activity', icon: Activity },
        // Only show Users to ADMINs
        ...(user?.role === 'ADMIN' ? [{ name: 'User Management', path: '/users', icon: UsersIcon }] : []),

    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Show Sidebar Button (when hidden) */}
            {!isVisible && (
                <button
                    onClick={() => setIsVisible(true)}
                    className="fixed left-6 top-6 z-[80] p-2 bg-[#1A1826] border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all hover:scale-110 group"
                    title="Show Sidebar"
                >
                    <PanelLeftOpen className="w-5 h-5" />
                    <div className="absolute left-full ml-4 px-2 py-1 bg-[#1A1826] border border-white/10 rounded text-xs text-white opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                        Show sidebar
                    </div>
                </button>
            )}

            <aside
                className={`fixed left-0 top-0 bottom-0 bg-[#0B0914] border-r border-white/5 flex flex-col z-[70] lg:flex hidden ${!isVisible ? '-translate-x-full' : 'translate-x-0'} ${isResizingState ? '' : 'transition-all duration-300 ease-in-out'}`}
                style={{ width: `${width}px` }}
            >
                {/* Logo Section */}
                <div className="p-6 pb-8 flex items-center justify-between border-b border-white/5 mb-2">
                    <Link to="/" className="flex items-center space-x-3 group min-w-0 overflow-hidden flex-1">
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-md rounded-full transform group-hover:scale-125 transition-transform" />
                            <Logo className="w-9 h-9 relative z-10" />
                        </div>
                        <div className="flex items-baseline space-x-1 min-w-0">
                            <span className="text-xl font-black tracking-tight text-white truncate">
                                PathFinder
                            </span>
                            <span className="gradient-text text-sm font-bold tracking-tight">
                                AI
                            </span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors shrink-0 ml-2"
                        title="Close Sidebar"
                    >
                        <PanelLeftClose className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Navigation */}
                <div className="shrink-0 px-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all group ${isActive(item.path)
                                ? 'bg-gradient-to-r from-indigo-500/20 to-transparent text-indigo-400 border-l-4 border-indigo-500 rounded-l-none'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/2'
                                }`}
                        >
                            <div className="flex items-center space-x-3 min-w-0 uppercase">
                                <item.icon className={`w-5 h-5 shrink-0 ${isActive(item.path) ? 'text-indigo-500' : 'text-slate-500 group-hover:text-slate-400'}`} />
                                <span className="truncate">{item.name}</span>
                            </div>
                            {isActive(item.path) && <ChevronRight className="w-4 h-4 shrink-0" />}
                        </Link>
                    ))}
                </div>

                {/* Recent Roadmaps History (ChatGPT style) */}
                {user && (
                    <div className="flex-1 overflow-y-auto px-4 py-4 mt-2 space-y-1 custom-scrollbar min-h-0 border-t border-white/5 mx-4">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 mb-3">Recent Paths</div>
                        {recentRoadmaps.length === 0 && (
                            <div className="text-xs text-slate-500 italic pl-2">No past paths yet.</div>
                        )}
                        {recentRoadmaps.map((rm) => {
                            const rmId = rm._id || rm.id;
                            const isRenaming = renamingId === rmId;

                            return (
                                <div key={rmId} className="relative group/item">
                                    {isRenaming ? (
                                        <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 rounded-xl border border-indigo-500/30">
                                            <input
                                                autoFocus
                                                value={renamingValue}
                                                onChange={(e) => setRenamingValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleAction(rmId, 'rename', renamingValue);
                                                    if (e.key === 'Escape') setRenamingId(null);
                                                }}
                                                className="bg-transparent text-sm text-white outline-none w-full"
                                            />
                                            <button onClick={() => handleAction(rmId, 'rename', renamingValue)} className="text-emerald-400 hover:text-emerald-300">
                                                <Check className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <Link
                                                to={`/roadmap/${rmId}`}
                                                onClick={() => {
                                                    if (window.innerWidth < 1024) setIsVisible(false);
                                                }}
                                                className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all group ${isActive(`/roadmap/${rmId}`)
                                                    ? 'bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20'
                                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 font-medium border border-transparent'
                                                    }`}
                                                title={rm.topic}
                                            >
                                                <div className="flex items-center space-x-3 min-w-0">
                                                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive(`/roadmap/${rmId}`) ? 'text-indigo-500' : 'text-slate-500 group-hover:text-slate-400'}`} />
                                                    <span className="truncate leading-tight">{rm.topic}</span>
                                                </div>
                                                {rm.is_pinned && <Pin className="w-3 h-3 text-indigo-500 fill-indigo-500 shrink-0 ml-1" />}
                                            </Link>

                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setMenuPosition({ top: rect.top });
                                                    setMenuOpenId(menuOpenId === rmId ? null : rmId);
                                                }}
                                                className={`p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover/item:opacity-100 ${menuOpenId === rmId ? 'opacity-100 bg-white/10' : ''}`}
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Context Menu Popup */}
                                    {menuOpenId === rmId && (
                                        <div
                                            ref={contextMenuRef}
                                            className="fixed w-64 bg-[#151226] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] py-2 z-[999] animate-in fade-in zoom-in-95 duration-200"
                                            style={{
                                                left: `${width - 24}px`,
                                                top: `${Math.min(menuPosition.top, window.innerHeight - 320)}px`
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-indigo-500/5 blur-xl rounded-full pointer-events-none" />
                                            <div className="relative px-2 space-y-0.5">
                                                <button onClick={() => handleAction(rmId, 'share')} className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors group/btn">
                                                    <Share2 className="w-4 h-4 text-slate-500 group-hover/btn:text-indigo-400" />
                                                    <span>Share</span>
                                                </button>
                                                <button onClick={() => { setMenuOpenId(null); setToast({ message: "Study Groups coming soon!", type: 'info' }); }} className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors group/btn">
                                                    <UserPlus className="w-4 h-4 text-slate-500 group-hover/btn:text-indigo-400" />
                                                    <span>Start a group chat</span>
                                                </button>
                                                <button onClick={() => { setRenamingId(rmId); setRenamingValue(rm.topic); setMenuOpenId(null); }} className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors group/btn">
                                                    <Edit2 className="w-4 h-4 text-slate-500 group-hover/btn:text-indigo-400" />
                                                    <span>Rename</span>
                                                </button>

                                                <div className="h-px bg-white/5 my-1.5 mx-2" />

                                                <button onClick={() => handleAction(rmId, 'pin')} className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors group/btn">
                                                    <Pin className={`w-4 h-4 ${rm.is_pinned ? 'text-indigo-400' : 'text-slate-500 group-hover/btn:text-indigo-400'}`} />
                                                    <span>{rm.is_pinned ? 'Unpin chat' : 'Pin chat'}</span>
                                                </button>
                                                <button onClick={() => handleAction(rmId, 'archive')} className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors group/btn">
                                                    <Archive className="w-4 h-4 text-slate-500 group-hover/btn:text-indigo-400" />
                                                    <span>Archive</span>
                                                </button>
                                                <button onClick={() => handleAction(rmId, 'delete')} className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors group/btn">
                                                    <Trash2 className="w-4 h-4 text-red-500/50 group-hover/btn:text-red-400" />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Bottom Section */}
                <div className="mt-auto p-4" ref={menuRef}>
                    {/* Popup Menu */}
                    {isMenuOpen && (
                        <div className="absolute bottom-20 left-4 w-[256px] bg-[#1A1826] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in mb-2">
                            {/* Menu Content */}
                            <div className="px-4 py-3 border-b border-white/5 mb-2">
                                <div className="text-sm font-bold text-white truncate">{user?.name || 'Admin'}</div>
                                <div className="text-xs text-slate-400 truncate">{user?.email || 'admin@pathfinder.ai'}</div>
                            </div>

                            <div className="px-2 space-y-0.5">
                                {plan === 'GO' && (
                                    <button
                                        onClick={() => { setIsMenuOpen(false); navigate('/pricing'); }}
                                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <Crown className="w-4 h-4 text-indigo-400" />
                                        <span>Upgrade plan</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => { setIsMenuOpen(false); navigate('/settings'); }}
                                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <SettingsIcon className="w-4 h-4" />
                                    <span>Settings</span>
                                </button>
                                <button
                                    onClick={() => { setIsMenuOpen(false); navigate('/help'); }}
                                    className="w-full flex items-center justify-between space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <LifeBuoy className="w-4 h-4" />
                                        <span>Help</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>

                            <div className="mt-2 pt-2 border-t border-white/5 px-2">
                                <button
                                    onClick={() => { setIsMenuOpen(false); logout(); }}
                                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Log out</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Profile Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors group relative"
                    >
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-inner group-hover:shadow-indigo-500/20 transition-all overflow-hidden border border-white/10">
                                {user?.profile_pic ? (
                                    <img
                                        src={`${BASE_URL}${user.profile_pic}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = ''; // Fallback
                                        }}
                                    />
                                ) : (
                                    user?.name?.charAt(0).toUpperCase() || 'A'
                                )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#0B0914] rounded-full p-[2px]">
                                <div className="w-full h-full bg-emerald-500 rounded-full" />
                            </div>
                        </div>
                        <div className="flex flex-col flex-grow min-w-0 text-left">
                            <span className="text-sm font-bold text-white tracking-wide truncate">{user?.name || 'Admin'}</span>
                            <span className="text-xs text-slate-400 font-bold tracking-tight truncate capitalize">{plan ? `${plan} Plan` : 'GO Plan'}</span>
                        </div>
                    </button>
                </div>
                {/* Drag Handle */}
                <div
                    className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-indigo-500/30 transition-colors z-[80]"
                    onMouseDown={() => {
                        isResizing.current = true;
                        setIsResizingState(true);
                        document.body.style.cursor = 'col-resize';
                    }}
                />
            </aside>

            {/* Global Professional Dialogs */}
            <ConfirmDialog
                isOpen={showConfirm}
                title="Delete Roadmap"
                message="Are you sure you want to permanently delete this roadmap? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => { setShowConfirm(false); setConfirmAction(null); }}
            />

            <div className="fixed bottom-6 right-6 z-[10001] space-y-4">
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
        </>
    );
}
