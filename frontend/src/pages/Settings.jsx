import React, { useState, useRef, useEffect } from 'react';
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
    Mail,
    History,
    RotateCcw,
    Trash2,
    MessageSquare,
    ExternalLink
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import UpgradeModal from '../components/UpgradeModal';
import { useAuth } from '../context/AuthContext';
import { api, BASE_URL } from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function Settings() {
    const { user, plan, updateUserInfo, logout } = useAuth();
    const { showToast, confirm } = useToast();
    const [activeTab, setActiveTab] = useState('profile');
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Password visibility state
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Profile info state
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Delete account state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteEmailInput, setDeleteEmailInput] = useState('');
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    // Archived roadmaps state
    const [archivedRoadmaps, setArchivedRoadmaps] = useState([]);
    const [isLoadingArchived, setIsLoadingArchived] = useState(false);

    useEffect(() => {
        if (user) {
            setDisplayName(user.name || '');
            setBio(user.bio || '');
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'archived') {
            fetchArchivedRoadmaps();
        }
    }, [activeTab]);

    const fetchArchivedRoadmaps = async () => {
        setIsLoadingArchived(true);
        try {
            const data = await api.get('/roadmaps?archived=true');
            setArchivedRoadmaps(data);
        } catch (error) {
            console.error('Fetch archived error:', error);
            showToast('Failed to load archived roadmaps', 'error');
        } finally {
            setIsLoadingArchived(false);
        }
    };

    const handleRestore = async (id) => {
        try {
            await api.patch(`/roadmaps/${id}`, { is_archived: false });
            showToast('Roadmap restored to sidebar', 'success');
            fetchArchivedRoadmaps();
        } catch (error) {
            showToast('Failed to restore roadmap', 'error');
        }
    };

    const handleDeleteArchived = async (rmId) => {
        const confirmed = await confirm(
            'Are you sure you want to permanently delete this roadmap? This action cannot be undone.',
            'Delete Forever'
        );
        if (!confirmed) return;

        try {
            await api.delete(`/roadmaps/${rmId}`);
            showToast('Roadmap permanently deleted', 'success');
            fetchArchivedRoadmaps();
        } catch (error) {
            showToast('Failed to delete roadmap', 'error');
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'archived', label: 'Archived', icon: History },
        { id: 'plan', label: 'Billing & Plan', icon: CreditCard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield }
    ];

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }

        setIsChangingPassword(true);

        try {
            await api.put('/users/change-password', {
                current_password: currentPassword,
                new_password: newPassword
            });

            setPasswordSuccess('Password updated successfully!');
            // Clear form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

            // Clear success message after 3 seconds
            setTimeout(() => setPasswordSuccess(''), 3000);
        } catch (error) {
            setPasswordError(error.message || 'Failed to update password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            showToast('Please select a valid image file', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            const data = await api.postMultipart('/users/profile-picture', formData);

            if (data.status === 'success') {
                // Refresh user data in context
                if (updateUserInfo) {
                    updateUserInfo({ profile_pic: data.profile_pic });
                }
                showToast('Profile picture updated successfully!', 'success');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast(error.message || 'Failed to upload image', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemovePhoto = async () => {
        const confirmed = await confirm(
            'Are you sure you want to remove your profile picture? This action cannot be undone.',
            'Remove Profile Photo'
        );

        if (!confirmed) return;

        try {
            await api.delete('/users/profile-picture');
            if (updateUserInfo) {
                updateUserInfo({ profile_pic: null });
            }
            showToast('Profile picture removed', 'success');
        } catch (error) {
            console.error('Remove error:', error);
            showToast('Failed to remove image', 'error');
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);

        try {
            const data = await api.put('/users/profile', {
                name: displayName,
                bio: bio
            });

            if (data.status === 'success') {
                if (updateUserInfo) {
                    updateUserInfo({ name: displayName, bio: bio });
                }
                showToast('Profile updated successfully!', 'success');
                setIsEditingProfile(false);
            }
        } catch (error) {
            console.error('Profile update error:', error);
            showToast(error.message || 'Failed to update profile', 'error');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleCancelEdit = () => {
        if (user) {
            setDisplayName(user.name || '');
            setBio(user.bio || '');
        }
        setIsEditingProfile(false);
    };

    const handleDeleteAccount = async () => {
        setIsDeletingAccount(true);
        try {
            await api.delete('/users/account');
            showToast('Account deleted successfully', 'success');
            logout();
        } catch (error) {
            console.error('Delete account error:', error);
            showToast(error.message || 'Failed to delete account', 'error');
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-10 animate-fade-in max-w-2xl">
                        {/* Avatar Section */}
                        <div className="flex items-center space-x-6 pb-8 border-b border-white/5 group bg-white/[0.02] p-6 rounded-[2rem]">
                            <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-500/20 group-hover:scale-105 transition-all overflow-hidden">
                                    {user?.profile_pic ? (
                                        <img
                                            src={`${BASE_URL}${user.profile_pic}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = ''; // Fallback to initial
                                            }}
                                        />
                                    ) : (
                                        user?.name?.charAt(0).toUpperCase() || 'A'
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-[#1A1826] p-2.5 rounded-xl border border-white/5 hover:bg-indigo-500 transition-colors shadow-lg">
                                    <Camera className="w-4 h-4 text-slate-400 hover:text-white" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight leading-tight mb-1">{user?.name || "Admin"}</h3>
                                <p className="text-xs text-slate-400 font-bold mb-3">{user?.role === 'ADMIN' ? 'Administrator' : 'User'} Account</p>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors border border-white/5 disabled:opacity-50"
                                    >
                                        {isUploading ? 'Uploading...' : 'Upload New'}
                                    </button>
                                    {user?.profile_pic && (
                                        <button
                                            onClick={handleRemovePhoto}
                                            className="px-4 py-2 text-slate-500 hover:text-red-400 text-[10px] font-black uppercase tracking-widest transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
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
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            disabled={!isEditingProfile}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            disabled={true}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-slate-400"
                                        />
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    </div>
                                </div>
                                <div className="col-span-1 sm:col-span-2 space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Bio (Optional)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Tell us a little about yourself..."
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        disabled={!isEditingProfile}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end gap-3">
                            {!isEditingProfile ? (
                                <>
                                    <button
                                        onClick={() => setIsEditingProfile(true)}
                                        className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all border border-white/5"
                                    >
                                        Edit Profile
                                    </button>
                                    <button
                                        disabled={true}
                                        className="bg-gradient-to-r from-indigo-500 to-cyan-400 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 transition-all opacity-50 cursor-not-allowed"
                                    >
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={isSavingProfile}
                                        className="bg-white/5 hover:bg-white/10 text-slate-300 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all border border-white/5 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleProfileUpdate}
                                        disabled={isSavingProfile}
                                        className="bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSavingProfile ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                );
            case 'archived':
                return (
                    <div className="space-y-6 animate-fade-in max-w-3xl">
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Archived Roadmaps</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Chat history you've hidden from sidebar</p>
                            </div>
                            <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-indigo-400 border border-white/5">
                                {archivedRoadmaps.length} Items
                            </span>
                        </div>

                        {isLoadingArchived ? (
                            <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading archives...</p>
                            </div>
                        ) : archivedRoadmaps.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-white/[0.01] rounded-[2rem] border border-dashed border-white/5">
                                <div className="p-4 bg-white/5 rounded-2xl text-slate-500">
                                    <History className="w-8 h-8 opacity-20" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-400">No archived roadmaps found</p>
                                    <p className="text-xs text-slate-600 mt-1">Chats you archive will appear here</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {archivedRoadmaps.map((rm) => {
                                    const rmId = rm._id || rm.id;
                                    return (
                                        <div key={rmId} className="flex items-center justify-between p-5 bg-white/[0.02] hover:bg-white/[0.04] rounded-3xl border border-white/5 transition-all group">
                                            <div className="flex items-center space-x-4 min-w-0">
                                                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                                                    <MessageSquare className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-bold text-white truncate">{rm.topic}</h4>
                                                    <p className="text-[10px] text-slate-500 font-medium">Archived on {new Date(rm.updated_at || rm.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => window.open(`/roadmap/${rmId}`, '_blank')}
                                                    className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                                    title="View Roadmap"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRestore(rmId)}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-indigo-500/20"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                    <span>Restore</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteArchived(rmId)}
                                                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete Permanently"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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
                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">Change Password</h3>

                            {/* Error Message */}
                            {passwordError && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                    <p className="text-xs font-bold text-red-400">{passwordError}</p>
                                </div>
                            )}

                            {/* Success Message */}
                            {passwordSuccess && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                    <p className="text-xs font-bold text-emerald-400">{passwordSuccess}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 pr-12 transition-all"
                                        required
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
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 pr-12 transition-all"
                                            required
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
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 pr-12 transition-all"
                                            required
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
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>

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
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDeleteEmailInput('');
                                        setIsDeleteModalOpen(true);
                                    }}
                                    className="shrink-0 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                >
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

            {/* Delete Account Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => !isDeletingAccount && setIsDeleteModalOpen(false)}></div>
                    <div className="relative w-full max-w-md bg-[#151226] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden animate-fade-in-up">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none" />

                        <div className="flex flex-col space-y-6 relative z-10">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
                                    <Shield className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight">Delete Account</h3>
                                    <p className="text-xs font-bold text-slate-400">This action is irreversible</p>
                                </div>
                            </div>

                            <p className="text-sm font-bold text-slate-300">
                                You are about to permanently delete your account and all associated data. To confirm, please type your email address below:
                            </p>

                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-xs font-black text-white text-center break-all">{user?.email}</p>
                            </div>

                            <input
                                type="text"
                                value={deleteEmailInput}
                                onChange={(e) => setDeleteEmailInput(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all font-sans"
                            />

                            <div className="flex w-full space-x-3 pt-4">
                                <button
                                    onClick={() => {
                                        setIsDeleteModalOpen(false);
                                        setDeleteEmailInput('');
                                    }}
                                    disabled={isDeletingAccount}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest transition-all border border-white/5 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={isDeletingAccount || deleteEmailInput !== user?.email}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeletingAccount ? "Deleting..." : "Delete Account"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
