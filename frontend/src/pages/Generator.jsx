import React, { useState } from 'react';
import {
    Layers,
    Target,
    Wand2,
    Rocket,
    Sparkles,
    AlertCircle,
    Search,
    ArrowRight,
    Lightbulb,
    Cpu,
    Zap,
    Globe,
    ShieldCheck,
    Terminal,
    MessageSquareCode
} from 'lucide-react';
import SkeletonCard from '../components/SkeletonCard';
import UpgradeModal from '../components/UpgradeModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function Generator() {
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const { plan } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const suggestedTopics = [
        "Fullstack Web Development",
        "Machine Learning Engineer",
        "iOS App Development",
        "Cloud Architecture (AWS)",
        "Cybersecurity Specialist"
    ];

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!topic) return;

        setIsGenerating(true);
        try {
            const response = await api.post('/roadmaps', { topic });
            const roadmapId = response.id || response._id;
            navigate(`/roadmap/${roadmapId}`);
        } catch (error) {
            if (error.message.includes('Limit reached') || error.message.includes('Free plan limit reached')) {
                setIsUpgradeModalOpen(true);
            } else {
                console.error("Failed to generate roadmap:", error);
                showToast(error.message || "Failed to generate roadmap", "error");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-100px)] flex flex-col justify-center animate-fade-in relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8 py-10 lg:py-0">

            {/* Main Center Area */}
            <div className="w-full flex-1 flex flex-col items-center justify-center -mt-10">
                {!isGenerating ? (
                    <>
                        <div className="text-center mb-10 mt-auto">
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                                What do you want to master today?
                            </h1>
                        </div>

                        {/* Input Container */}
                        <div className="w-full relative shadow-[0_0_80px_-20px_rgba(99,102,241,0.2)] rounded-3xl mx-auto group">
                            <form onSubmit={handleGenerate} className="relative z-20">
                                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                <div className="bg-[#151226]/80 backdrop-blur-2xl border border-white/10 group-hover:border-white/20 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 rounded-3xl transition-all duration-300 relative flex items-center pr-3 overflow-hidden shadow-2xl">
                                    <textarea
                                        placeholder="Message AI Orchestrator..."
                                        className="w-full bg-transparent border-transparent text-white font-medium text-lg lg:text-xl px-6 py-6 h-[80px] lg:h-[90px] focus:outline-none focus:ring-0 resize-none placeholder:text-slate-500 scrollbar-hide"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleGenerate(e);
                                            }
                                        }}
                                        required
                                    />

                                    {/* Integrated button */}
                                    <button
                                        type="submit"
                                        disabled={!topic.trim()}
                                        className="w-12 h-12 shrink-0 bg-white text-indigo-900 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md group/btn disabled:opacity-20 disabled:cursor-not-allowed border border-white"
                                    >
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Free Plan Limit Indicator Below Input*/}
                        {plan === 'GO' && (
                            <div className="flex justify-center mt-3">
                                <div className="inline-flex items-center px-3 py-1 bg-amber-500/5 rounded-full border border-amber-500/10">
                                    <Zap className="w-3 h-3 text-amber-500 mr-1.5" />
                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                        {10 - parseInt(localStorage.getItem('generation_count') || '0')} Credits Left
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Prompt Suggestions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl w-full mx-auto mt-12">
                            {suggestedTopics.slice(0, 4).map((sug, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setTopic(sug)}
                                    className="text-left px-5 py-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all text-slate-300 font-medium text-sm flex items-center group cursor-pointer"
                                >
                                    <span className="flex-1 truncate">{sug}</span>
                                    <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors ml-3 opacity-0 group-hover:opacity-100">
                                        <ArrowRight className="w-4 h-4 text-slate-400" />
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    /* Loading State */
                    <div className="w-full flex-1 flex flex-col items-center justify-center mt-auto animate-fade-in relative z-20">
                        <div className="relative mb-12">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] animate-pulse rounded-full" />
                            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-[#151226] rounded-[2.5rem] border border-white/10 flex items-center justify-center relative z-10 shadow-2xl rotate-45 group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-transparent animate-pulse delay-75" />
                                <Sparkles className="w-10 h-10 lg:w-12 lg:h-12 text-indigo-400 -rotate-45 animate-bounce-slow" />
                            </div>

                            {/* Scanning rings */}
                            <div className="absolute -top-10 -left-10 w-[200px] h-[200px] pointer-events-none opacity-30 hidden md:block">
                                <div className="absolute inset-0 border-[3px] border-indigo-500/30 rounded-full animate-ping [animation-duration:3s]" />
                                <div className="absolute inset-8 border-[3px] border-cyan-500/20 rounded-full animate-ping [animation-delay:1s] [animation-duration:3s]" />
                            </div>
                        </div>

                        <div className="space-y-4 max-w-lg text-center">
                            <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">Architecting Syllabus</h3>
                            <div className="flex items-center justify-center space-x-2 pt-2">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0s]" />
                                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] lg:text-xs pt-4">
                                Modeling highly effective learning permutations...
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Text */}
            <div className="mt-auto pt-16 pb-6 text-center">
                <p className="text-[10px] md:text-xs font-medium text-slate-500">
                    Gemini-1.5-Flash active. Roadmaps are AI-generated; review important milestones.
                </p>
            </div>

            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
        </div>
    );
}
