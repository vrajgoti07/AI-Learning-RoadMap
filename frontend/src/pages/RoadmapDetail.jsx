import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    Share2,
    Clock,
    CheckCircle2,
    Calendar,
    Youtube,
    ExternalLink,
    Lock
} from 'lucide-react';
import Timeline from '../components/Timeline';
import RoadmapCard from '../components/RoadmapCard';
import YoutubeCard from '../components/YoutubeCard';
import GlassCard from '../components/GlassCard';
import UpgradeModal from '../components/UpgradeModal';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function RoadmapDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { plan } = useAuth();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    // State for the roadmap
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                const data = await api.get(`/roadmaps/${id}`);
                setRoadmap(data);
            } catch (error) {
                console.error("Failed to load roadmap:", error);
                // navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchRoadmap();
    }, [id]);

    const handleExport = () => {
        if (plan !== 'PRO') {
            setIsUpgradeModalOpen(true);
            return;
        }
        alert("Exporting your roadmap as PDF... (Simulation)");
    };

    const handleToggleComplete = async (nodeId, currentStatus) => {
        try {
            const response = await api.patch(`/roadmaps/${id}/progress`, {
                node_id: nodeId,
                is_completed: !currentStatus
            });
            setRoadmap(response);
        } catch (err) {
            console.error("Failed to update progress", err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-indigo-500/20 rounded-full border-t-indigo-500 animate-[spin_1s_linear_infinite]" />
            </div>
        );
    }

    if (!roadmap) {
        return <div className="text-white text-center mt-20">Roadmap not found!</div>;
    }

    // Map the backend nodes to the format Expected by RoadmapCard
    const displayNodes = roadmap.roadmap_data?.nodes?.map((n, i) => {
        const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
        return {
            ...n,
            description: n.desc,
            title: n.label,
            color: colors[i % colors.length],
            milestones: n.milestones || [],
            projects: n.projects || []
        };
    }) || [];

    // Collect all videos from all nodes for the sidebar
    const allVideos = roadmap.roadmap_data?.nodes?.reduce((acc, node) => {
        if (node.videos && node.videos.length > 0) {
            return [...acc, ...node.videos];
        }
        return acc;
    }, []) || [];

    // Calculate Progress Percentage
    const completedNodes = roadmap.completed_nodes || [];
    const totalNodesCount = displayNodes.length || 1;
    const progressPercentage = Math.round((completedNodes.length / totalNodesCount) * 100);

    return (
        <div className="animate-fade-in pb-20">
            {/* Detail Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center space-x-2 text-slate-500 hover:text-indigo-500 transition-colors mb-6 font-black text-[10px] uppercase tracking-widest group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Return to Paths</span>
                    </button>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                        Mastering <span className="gradient-text">{roadmap.topic}</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">{roadmap.level}</span>
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-slate-600" />
                            <span>12-16 Weeks</span>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-slate-600" />
                            <span>Created {new Date(roadmap.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                    <button
                        onClick={handleExport}
                        className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${plan === 'PRO'
                            ? 'bg-white text-slate-900 shadow-white/5 hover:scale-105 active:scale-95'
                            : 'bg-white/2 text-slate-500 border border-white/5 grayscale'
                            }`}
                    >
                        {plan !== 'PRO' ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        <span>Export Path</span>
                    </button>
                    <button className="p-4 rounded-2xl border border-white/5 text-slate-500 hover:bg-white/5 transition-all">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-12">
                    {/* Progress Tracker */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Learning Sequence</h2>
                            <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/5 px-4 py-1.5 rounded-full border border-cyan-400/10 uppercase tracking-[0.2em]">{progressPercentage}% Mastery</span>
                        </div>
                        <Timeline
                            milestones={[...(displayNodes.length > 0 ? displayNodes.map((m) => m.milestones[0]) : []), "Final Launch"]}
                            completedIndex={Math.round((completedNodes.length / totalNodesCount) * displayNodes.length)}
                        />
                    </div>

                    {/* Modules */}
                    <div className="space-y-6">
                        {displayNodes.map((phase, idx) => (
                            <RoadmapCard
                                key={idx}
                                index={idx}
                                {...phase}
                                isCompleted={completedNodes.includes(phase.id)}
                                onToggleComplete={handleToggleComplete}
                            />
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-10">
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8 flex items-center">
                            <Youtube className="w-6 h-6 mr-3 text-red-500" />
                            Practical Tutorials
                        </h3>
                        <div className="space-y-4">
                            {allVideos.length > 0 ? (
                                allVideos.map((video, idx) => (
                                    <YoutubeCard key={idx} video={video} />
                                ))
                            ) : (
                                <div className="p-8 border border-white/5 bg-white/2 rounded-2xl text-center">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No tutorials fetched yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-widest mb-8 flex items-center">
                            <CheckCircle2 className="w-6 h-6 mr-3 text-emerald-500" />
                            Hands-on Labs
                        </h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <GlassCard key={i} className="p-6 border border-white/5 bg-white/2 hover:scale-[1.02] transition-transform cursor-pointer">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1.5">Lab Simulation #{i}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold">Industry-standard project briefing for Phase {i}</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-600" />
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
        </div>
    );
}
