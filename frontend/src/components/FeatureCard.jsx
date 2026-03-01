import React from 'react';
import GlassCard from './GlassCard';

export default function FeatureCard({ icon: Icon, title, description }) {
    return (
        <GlassCard className="h-full group border border-white/5 hover:border-indigo-500/30 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] transition-all duration-500">
            <div className="h-full flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shrink-0 border border-white/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Icon className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mb-3 shrink-0">{title}</h3>
                <p className="text-xs sm:text-sm font-bold text-slate-400 leading-relaxed flex-grow">{description}</p>
            </div>
        </GlassCard>
    );
}
