import React from 'react';
import * as Icons from 'lucide-react';
import GlassCard from './GlassCard';

export default function StatCard({ label, value, iconName }) {
    const Icon = Icons[iconName] || Icons.Circle;

    return (
        <GlassCard className="border border-white/10">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-indigo-500/20 rounded-xl">
                    <Icon className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                    <p className="text-slate-400 text-sm font-medium">{label}</p>
                    <p className="text-3xl font-bold text-white">{value}</p>
                </div>
            </div>
        </GlassCard>
    );
}
