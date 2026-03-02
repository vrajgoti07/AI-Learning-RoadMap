import React, { useState } from 'react';
import GlassCard from './GlassCard';
import { ChevronDown, ChevronUp, BookOpen, Layout, CheckCircle2, Circle } from 'lucide-react';

export default function RoadmapCard({ phase, title, duration, description, projects, milestones, index, id, isCompleted, onToggleComplete }) {
    const [isExpanded, setIsExpanded] = useState(index === 0);

    return (
        <GlassCard className={`mb-4 border border-white/10 transition-all duration-300 ${isExpanded ? 'ring-2 ring-indigo-500/50 bg-white/5' : 'hover:bg-white/5'}`}>
            {/* Header / Clickable Area */}
            <div
                className="cursor-pointer p-6"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-400/5 px-3 py-1 rounded-full border border-cyan-400/10">
                            {phase || `Phase ${index + 1}`}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 flex items-center">
                            <Layout className="w-3 h-3 mr-1.5" />
                            {duration}
                        </span>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleComplete(id, isCompleted); }}
                            className={`flex items-center text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors ${isCompleted
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {isCompleted ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <Circle className="w-4 h-4 mr-1.5" />}
                            {isCompleted ? 'Completed' : 'Mark Complete'}
                        </button>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </div>
                </div>

                <h3 className={`text-xl font-black tracking-tight uppercase flex items-center ${isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                    <span className="text-indigo-500 mr-3">0{index + 1}</span>
                    {title}
                </h3>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-6 pb-6 animate-fade-in-up">
                    <div className="h-px bg-white/10 mb-6" />

                    <p className="text-slate-400 leading-relaxed mb-8 italic">
                        "{description}"
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Milestones */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center">
                                <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                                Core Milestones
                            </h4>
                            <div className="space-y-2">
                                {milestones?.map((m, idx) => (
                                    <div key={idx} className="flex items-center space-x-3 p-3 rounded-xl bg-white/2 border border-white/5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        <span className="text-xs font-bold text-slate-300">{m}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Projects */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center">
                                <Layout className="w-4 h-4 mr-2 text-cyan-500" />
                                Hands-on Projects
                            </h4>
                            <div className="space-y-2">
                                {projects?.map((proj, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 group hover:border-indigo-500/30 transition-all">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-black text-white truncate mr-2">{proj.name}</span>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${proj.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                                                proj.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-rose-500/20 text-rose-400'
                                                }`}>{proj.difficulty}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </GlassCard>
    );
}
