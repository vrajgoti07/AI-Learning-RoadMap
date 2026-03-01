import React from 'react';

export default function SkeletonCard({ className = "" }) {
    return (
        <div className={`glass-card p-6 rounded-2xl border border-white/5 overflow-hidden relative ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"
                style={{ backgroundSize: '200% 100%' }} />

            <div className="h-6 w-3/4 bg-white/5 rounded-md mb-4" />
            <div className="space-y-3">
                <div className="h-4 w-full bg-white/5 rounded-md" />
                <div className="h-4 w-5/6 bg-white/5 rounded-md" />
                <div className="h-4 w-4/6 bg-white/5 rounded-md" />
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className="h-8 w-24 bg-white/5 rounded-full" />
                <div className="h-6 w-16 bg-white/5 rounded-md" />
            </div>
        </div>
    );
}
