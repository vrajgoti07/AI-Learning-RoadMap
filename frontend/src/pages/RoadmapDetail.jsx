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
    Lock,
    Send,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import Timeline from '../components/Timeline';
import RoadmapCard from '../components/RoadmapCard';
import YoutubeCard from '../components/YoutubeCard';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import QuizModal from '../features/quiz/QuizModal';
import UpgradeModal from '../components/UpgradeModal';

export default function RoadmapDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { plan } = useAuth();
    const { showToast } = useToast();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    // AI Refinement States
    const [prompt, setPrompt] = useState("");
    const [isRefining, setIsRefining] = useState(false);

    // Quiz States
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [selectedNodeData, setSelectedNodeData] = useState(null);

    // State for the roadmap
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoadmap = async () => {
            setLoading(true);
            setRoadmap(null); // Clear previous roadmap explicitly to prevent old render
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
        showToast("Exporting your roadmap as PDF...", "info");
    };

    const handleToggleComplete = async (nodeId, currentStatus) => {
        try {
            console.log("Toggling:", nodeId, "Current Status:", currentStatus);
            const response = await api.patch(`/roadmaps/${id}/progress`, {
                node_id: nodeId,
                is_completed: !currentStatus
            });
            console.log("Response from server:", response);
            setRoadmap(response);
        } catch (err) {
            console.error("Failed to update progress:", err);
            // Most likely we are getting a 400 or 404 from the server
            // Let's ensure the user sees exactly what the API thinks is wrong
            showToast(err.response?.data?.detail || err.message || "Failed to update progress", "error");
        }
    };

    const handleOpenQuiz = (node) => {
        setSelectedNodeData(node);
        setIsQuizOpen(true);
    };

    const handleQuizSuccess = async (score, xp) => {
        if (score >= 50 && selectedNodeData) {
            // Mark Node as Complete if they pass
            await handleToggleComplete(selectedNodeData.id, false);
        }
    };

    const handleRefine = async (e) => {
        if (e) e.preventDefault();
        if (!prompt.trim() || isRefining) return;

        setIsRefining(true);
        try {
            const response = await api.post(`/roadmaps/${id}/refine`, {
                prompt: prompt
            });
            setRoadmap(response);
            setPrompt("");
            showToast("Roadmap successfully refined!", "success");
        } catch (err) {
            console.error("Refinement failed:", err);
            showToast(err.message || "Failed to refine roadmap. Please try again.", "error");
        } finally {
            setIsRefining(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleRefine();
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

    // Extract nodes robustly
    let rawNodes = [];
    if (roadmap?.roadmap_data) {
        if (Array.isArray(roadmap.roadmap_data.nodes)) {
            rawNodes = roadmap.roadmap_data.nodes;
        } else if (Array.isArray(roadmap.roadmap_data)) {
            rawNodes = roadmap.roadmap_data;
        }
    }

    const handleRegenerate = async () => {
        try {
            setLoading(true);
            const res = await api.post(`/roadmaps`, {
                topic: roadmap.topic,
                difficulty: roadmap.level || 'beginner'
            });
            // Navigate to the new roadmap
            navigate(`/roadmap/${res.roadmap_id || res.id || res._id}`);
        } catch (err) {
            console.error("Regeneration failed:", err);
            showToast(err.message || "Failed to start regeneration. Please try again manually.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (roadmap.status === 'processing') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
                <div className="w-20 h-20 border-4 border-indigo-500/20 rounded-full border-t-indigo-500 animate-[spin_1s_linear_infinite] mb-8" />
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Crafting Your Curriculum...</h2>
                <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                    Our AI Professor is designing a personalized learning path tailored to your goals. This usually takes 10-20 seconds.
                </p>
                <div className="mt-8 flex gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                </div>
            </div>
        );
    }

    if (roadmap.status === 'failed' || rawNodes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20 shadow-[0_0_30px_rgba(244,63,94,0.15)] relative">
                    <AlertTriangle className="w-10 h-10 text-rose-500 relative z-10" />
                    <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full" />
                </div>
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Something went wrong</h2>
                <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                    We encountered an error while loading this roadmap. Please try regenerating it.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleRegenerate}
                        disabled={loading}
                        className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-black shadow-xl shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center space-x-3"
                    >
                        <Zap className="w-5 h-5 fill-white" />
                        <span>Regenerate Now</span>
                    </button>
                    <button
                        onClick={() => navigate('/generator')}
                        className="px-8 py-4 bg-white/5 text-slate-400 rounded-2xl font-bold hover:bg-white/10 transition-all text-sm uppercase tracking-widest border border-white/5"
                    >
                        Back to Generator
                    </button>
                </div>
            </div>
        );
    }

    // Map the backend nodes to the format Expected by RoadmapCard safely
    const displayNodes = (Array.isArray(rawNodes) ? rawNodes : []).map((n, i) => {
        const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
        return {
            ...n,
            id: String(n?.id || i),
            description: n?.desc || n?.description || '',
            title: n?.label || n?.title || `Phase ${i + 1}`,
            color: colors[i % colors.length],
            milestones: Array.isArray(n?.milestones) ? n.milestones : [],
            projects: Array.isArray(n?.projects) ? n.projects : [],
            quiz: Array.isArray(n?.quiz) ? n.quiz : [],
            videos: Array.isArray(n?.videos) ? n.videos : []
        };
    });

    // Collect all videos from all nodes for the sidebar
    const allVideos = displayNodes.reduce((acc, node) => {
        if (node && Array.isArray(node.videos) && node.videos.length > 0) {
            return [...acc, ...node.videos];
        }
        return acc;
    }, []);

    // Calculate Progress Percentage safely
    const completedNodes = Array.isArray(roadmap?.completed_nodes) ? roadmap.completed_nodes : [];
    const totalNodesCount = displayNodes.length > 0 ? displayNodes.length : 1;
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
                        Mastering <span className="gradient-text">{roadmap?.topic || 'Subject'}</span>
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">{roadmap?.level || 'Beginner'}</span>
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-slate-600" />
                            <span>12-16 Weeks</span>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-slate-600" />
                            <span>Created {roadmap?.created_at ? new Date(roadmap.created_at).toLocaleDateString() : 'Recently'}</span>
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
                            milestones={[...(Array.isArray(displayNodes) ? displayNodes.map((m) => m?.milestones?.[0] || m?.title || 'Core Objective') : []), "Final Launch"]}
                            completedIndex={Math.round((completedNodes.length / totalNodesCount) * (displayNodes?.length || 0))}
                        />
                    </div>

                    {/* Modules */}
                    <div className="space-y-6">
                        {displayNodes.map((phase, idx) => {
                            // A node is locked if it's not the first node AND the previous node is NOT completed
                            const isLocked = idx > 0 && !completedNodes.includes(displayNodes[idx - 1].id);
                            const hasQuiz = phase.quiz && phase.quiz.length > 0;

                            return (
                                <RoadmapCard
                                    key={idx}
                                    index={idx}
                                    {...phase}
                                    isCompleted={completedNodes.includes(phase.id)}
                                    onToggleComplete={handleToggleComplete}
                                    isLocked={isLocked}
                                    quizAvailable={hasQuiz}
                                    onTakeQuiz={() => handleOpenQuiz(phase)}
                                />
                            );
                        })}
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

            {/* Quiz Modal */}
            <QuizModal
                isOpen={isQuizOpen}
                onClose={() => setIsQuizOpen(false)}
                topic={roadmap.topic}
                nodeData={selectedNodeData}
                roadmapId={id}
                onSubmitSuccess={handleQuizSuccess}
            />

            {/* Sticky Chat Input for Refinement */}
            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 pointer-events-none z-50">
                <div className="max-w-4xl mx-auto">
                    <div className="relative pointer-events-auto">
                        {isRefining && (
                            <div className="absolute inset-0 bg-[#0f0c29]/80 backdrop-blur-sm z-10 rounded-2xl flex flex-col items-center justify-center border border-indigo-500/30">
                                <div className="flex space-x-2 mb-3">
                                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-[bounce_1s_infinite_0ms]" />
                                    <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_200ms]" />
                                    <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_400ms]" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 animate-pulse">
                                    Professor is refining curriculum...
                                </span>
                            </div>
                        )}
                        <form
                            onSubmit={handleRefine}
                            className="relative group bg-[#0f0c29]/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden transition-all focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10"
                        >
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isRefining}
                                placeholder="Message AI to refine this roadmap (e.g., 'Make it harder' or 'Focus on Security')..."
                                className="w-full bg-transparent text-white px-6 py-6 pb-16 outline-none resize-none min-h-[120px] placeholder:text-slate-600 disabled:opacity-50"
                                rows="1"
                            />

                            <div className="absolute bottom-4 right-4 left-6 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hidden sm:block">
                                    {isRefining ? 'Updating Syllabus...' : 'Shift + Enter for new line'}
                                </span>
                                <button
                                    type="submit"
                                    disabled={!prompt.trim() || isRefining}
                                    className="p-3 bg-white text-slate-900 rounded-xl font-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 flex items-center justify-center ml-auto"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
}
