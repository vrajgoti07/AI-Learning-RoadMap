import React from 'react';

export default function GlassCard({ children, className = '' }) {
    return (
        <div className={`glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-colors duration-300 ${className}`}>
            {/* Subtle background glow effect over the card */}
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl z-0 pointer-events-none"></div>
            <div className="relative z-10 h-full w-full">
                {children}
            </div>
        </div>
    );
}
