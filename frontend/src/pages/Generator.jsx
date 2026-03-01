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

export default function Generator() {
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const { plan } = useAuth();
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
                alert(error.message || "Failed to generate roadmap");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-100px)] animate-fade-in relative z-10 gap-8 px-4 md:px-8 xl:px-12 py-8 max-w-[1600px] mx-auto w-full">

            {/* Left Panel: The Hub */}
            <div className="w-full lg:w-1/3 space-y-6 flex flex-col">
                <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent flex-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Cpu className="w-32 h-32 text-indigo-400 rotate-12" />
                    </div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30 mb-6">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-[px]">System Online</span>
                        </div>

                        <h2 className="text-3xl font-black text-white mb-4 tracking-tighter leading-tight">
                            AI Journey <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 italic">Orchestrator</span>
                        </h2>

                        <p className="text-slate-400 text-sm font-bold leading-relaxed mb-8">
                            Connected to Gemini-1.5-Flash. High-density learning path optimization active.
                        </p>

                        <div className="space-y-4">
                            {[
                                { icon: Globe, label: "Global Curriculum Standard", val: "v1.4" },
                                { icon: ShieldCheck, label: "Validated Milestones", val: "99.8%" },
                                { icon: Terminal, label: "Tech Stack Awareness", val: "Active" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:bg-white/5">
                                    <div className="flex items-center space-x-3">
                                        <item.icon className="w-4 h-4 text-indigo-400" />
                                        <span className="text-[11px] font-medium text-slate-300 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-white">{item.val}</span>
                                </div>
                            ))}
                        </div>

                        {plan === 'GO' && (
                            <div className="mt-8 p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10">
                                <div className="flex items-center space-x-3 mb-2">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Free Capacity</span>
                                </div>
                                <div className="text-2xl font-black text-white mb-1">
                                    {10 - parseInt(localStorage.getItem('generation_count') || '0')} <span className="text-xs text-slate-500">Left</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 transition-all duration-1000"
                                        style={{ width: `${(10 - parseInt(localStorage.getItem('generation_count') || '0')) * 10}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel: Command Center */}
            <div className="w-full lg:w-2/3 space-y-6">
                <div className="glass-card p-1 lg:p-1.5 rounded-[3.5rem] bg-white/[0.03] border border-white/5 relative shadow-2xl overflow-hidden min-h-[500px] flex flex-col">

                    {/* Grid Background Effect */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
                    />

                    {!isGenerating ? (
                        <div className="relative z-10 p-8 lg:p-12 flex-1 flex flex-col">
                            <div className="mb-10 text-center lg:text-left">
                                <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-xl mb-4">
                                    <Sparkles className="w-6 h-6 text-indigo-400" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
                                    Synthesize Your <span className="gradient-text">Future.</span>
                                </h1>
                                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Command Input Interface</p>
                            </div>

                            <form onSubmit={handleGenerate} className="flex-1 flex flex-col">
                                <div className="relative group flex-1">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-[2.5rem] blur opacity-10 group-focus-within:opacity-25 transition-opacity duration-500" />
                                    <div className="relative flex flex-col h-full bg-[#0B0914]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden">
                                        <div className="flex items-center px-8 pt-8 pb-4 border-b border-white/5">
                                            <MessageSquareCode className="w-5 h-5 text-indigo-400 mr-3" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Prompt</span>
                                        </div>
                                        <textarea
                                            placeholder="Example: 'I want to master Fullstack Web Development using Next.js 14, focusing on performance optimization and scalable architecture...'"
                                            className="w-full bg-transparent border-none text-white font-bold text-xl lg:text-2xl p-8 focus:outline-none focus:ring-0 resize-none flex-1 placeholder:text-slate-700 custom-scrollbar"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            required
                                        />

                                        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5">
                                            <div className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                <div className={`w-2 h-2 rounded-full ${topic.length > 20 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                <span>Complexity: {topic.length > 20 ? 'Optimal' : 'Needs Detail'}</span>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={!topic}
                                                className="w-full md:w-auto px-10 py-5 bg-white text-indigo-900 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 group disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Start Synthesis
                                                <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            {/* Chips */}
                            <div className="mt-10">
                                <div className="flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                                    <Lightbulb className="w-3 h-3 mr-2 text-amber-500" />
                                    Intelligence Presets
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedTopics.map((sug, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setTopic(sug)}
                                            className="px-4 py-2 rounded-lg bg-white/2 border border-white/5 text-slate-400 font-bold text-[11px] hover:bg-white/5 hover:text-white hover:border-indigo-500/50 transition-all whitespace-nowrap"
                                        >
                                            {sug}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                            <div className="relative mb-16">
                                <div className="absolute inset-0 bg-indigo-500/30 blur-[60px] animate-pulse rounded-full" />
                                <div className="w-32 h-32 bg-[#151226] rounded-[2.5rem] border border-white/10 flex items-center justify-center relative z-10 shadow-2xl rotate-45 group overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent animate-pulse" />
                                    <Sparkles className="w-12 h-12 text-indigo-400 -rotate-45 animate-bounce-slow" />
                                </div>

                                {/* Scanner Effect Overlay */}
                                <div className="absolute -top-10 -left-10 w-[200px] h-[200px] pointer-events-none opacity-20">
                                    <div className="absolute inset-0 border-2 border-indigo-500/40 rounded-full animate-ping" />
                                    <div className="absolute inset-5 border-2 border-cyan-500/20 rounded-full animate-ping [animation-delay:0.5s]" />
                                </div>
                            </div>

                            <div className="max-w-md space-y-4">
                                <h3 className="text-4xl font-black text-white tracking-tighter">Synthesizing...</h3>
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0s]" />
                                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                                <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] pt-4 leading-relaxed">
                                    Analyzing prerequisites <br />
                                    Mapping knowledge nodes <br />
                                    Curating tutorial resources
                                </p>
                            </div>

                            <div className="w-full max-w-2xl mt-16 space-y-4 opacity-30 px-8">
                                {[1, 2].map(i => <SkeletonCard key={i} />)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
        </div>
    );
}
