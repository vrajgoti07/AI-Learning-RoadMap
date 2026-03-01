import React from 'react';
import { Circle, CheckCircle } from 'lucide-react';

export default function Timeline({ milestones, completedIndex = -1 }) {
    return (
        <div className="space-y-6">
            <h4 className="text-lg font-semibold text-white mb-4">Milestones</h4>
            <div className="relative border-l border-indigo-500/30 ml-3 space-y-8">
                {milestones.map((milestone, idx) => {
                    const isCompleted = idx <= completedIndex;
                    return (
                        <div key={idx} className="relative pl-6">
                            <span className="absolute -left-[13px] top-1 bg-background rounded-full">
                                {isCompleted ? (
                                    <CheckCircle className="w-6 h-6 text-cyan-400 bg-background" />
                                ) : (
                                    <Circle className="w-6 h-6 text-indigo-500 bg-background" />
                                )}
                            </span>
                            <p className={`text-base ${isCompleted ? 'text-cyan-100' : 'text-slate-300'}`}>
                                {milestone}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
