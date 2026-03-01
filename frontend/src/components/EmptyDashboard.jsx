import React from 'react';
import { Rocket, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmptyDashboard() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full" />
                <div className="w-24 h-24 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl flex items-center justify-center relative z-10">
                    <Rocket className="w-12 h-12 text-indigo-500 dark:text-cyan-400 animate-float" />
                </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">No Roadmaps Yet</h3>
            <p className="text-slate-500 max-w-md mb-10 text-lg leading-relaxed">
                Your learning dashboard is waiting! Generate your first AI-engineered roadmap to start tracking your career milestones.
            </p>

            <button
                onClick={() => navigate('/generator')}
                className="group flex items-center space-x-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
            >
                <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Generate First Roadmap</span>
            </button>
        </div>
    );
}
