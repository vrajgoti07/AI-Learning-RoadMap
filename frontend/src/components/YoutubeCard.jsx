import React from 'react';
import { Play } from 'lucide-react';
import GlassCard from './GlassCard';

export default function YoutubeCard({ video }) {
    return (
        <GlassCard className="flex flex-col h-full group p-4 border border-white/10 hover:border-cyan-500/50">
            <div className="relative rounded-xl overflow-hidden mb-4 aspect-video">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-cyan-500 w-12 h-12 rounded-full flex items-center justify-center p-l-1 shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                        <Play className="w-5 h-5 text-white ml-1" fill="currentColor" />
                    </div>
                </div>
            </div>
            <div className="flex-1 flex flex-col">
                <span className="text-sm text-indigo-400 mb-2 font-medium">{video.channelName}</span>
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{video.title}</h3>
                <p className="text-slate-400 text-sm flex-1">{video.description}</p>
                <a href={video.url} className="mt-4 text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors flex items-center">
                    Watch Video &rarr;
                </a>
            </div>
        </GlassCard>
    );
}
