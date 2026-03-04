import React, { useState } from 'react';
import GlassCard from './GlassCard';
import { ChevronDown, ChevronUp, BookOpen, Layout, CheckCircle2, Circle, Activity, Lock } from 'lucide-react';

export default function RoadmapCard({ phase, title, duration, description, projects, milestones, index, id, isCompleted, onToggleComplete, isLocked, onTakeQuiz, quizAvailable }) {
    const [isExpanded, setIsExpanded] = useState(index === 0);

    return (
        <GlassCard className={`mb-4 border border-white/10 transition-all duration-300 ${isExpanded ? 'ring-2 ring-indigo-500/50 bg-white/5' : 'hover:bg-white/5'}`}>
            {/* Header / Clickable Area */}
            <div
                className="cursor-pointer p-6"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-3">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-400/5 px-3 py-1 rounded-full border border-cyan-400/10">
                                {phase || `Phase ${index + 1}`}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 flex items-center">
                                <Layout className="w-3 h-3 mr-1.5" />
                                {duration}
                            </span>
                        </div>
                        <h3 className={`text-2xl font-black tracking-tight uppercase flex items-center transition-all duration-500 ${isCompleted ? 'text-slate-500 line-through decoration-emerald-500/50 decoration-2' : 'text-white'}`}>
                            <span className={`mr-3 transition-colors duration-500 ${isCompleted ? 'text-emerald-500/50' : 'text-indigo-500'}`}>0{index + 1}</span>
                            {title}
                        </h3>
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                        <div className="flex items-center space-x-3">
                            {quizAvailable && !isCompleted && !isLocked && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onTakeQuiz(); }}
                                    className="flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-2xl transition-all duration-300 transform active:scale-[0.92] shadow-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/40 hover:text-white"
                                >
                                    <Activity className="w-4 h-4" />
                                    <span>Take Quiz</span>
                                </button>
                            )}

                            {!quizAvailable && (
                                <button
                                    disabled={isLocked}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isLocked) onToggleComplete(id, isCompleted);
                                    }}
                                    className={`flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-2xl transition-all duration-300 transform active:scale-[0.92] shadow-lg
                                    ${isLocked
                                            ? 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
                                            : isCompleted
                                                ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-400 hover:shadow-emerald-400/30'
                                                : 'bg-[#151226]/50 text-slate-400 border border-white/10 hover:bg-white/5 hover:text-white hover:border-indigo-500/50 backdrop-blur-md'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 animate-in zoom-in spin-in-12 duration-300" />
                                            <span>Mastered</span>
                                        </>
                                    ) : (
                                        <>
                                            {isLocked ? <Lock className="w-4 h-4" /> : <Circle className="w-4 h-4 group-hover:text-indigo-400 transition-colors" />}
                                            <span>{isLocked ? 'Locked' : 'Mark Complete'}</span>
                                        </>
                                    )}
                                </button>
                            )}
                            {quizAvailable && isCompleted && (
                                <div className="flex items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Quiz Passed</span>
                                </div>
                            )}
                            <div className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors pointer-events-none">
                                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </div>
                        </div>
                    </div>
                </div>
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
                                        <span className="text-xs font-bold text-slate-300">
                                            {typeof m === 'string' ? m : (m.title || m.name || m.label || JSON.stringify(m))}
                                        </span>
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
                                            <span className="text-xs font-black text-white truncate mr-2">{proj?.name || 'Lab Project'}</span>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${proj?.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                                                proj?.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-rose-500/20 text-rose-400'
                                                }`}>{proj?.difficulty || 'Practice'}</span>
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
