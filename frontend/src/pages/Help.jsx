import React from 'react';
import {
    LifeBuoy,
    BookOpen,
    MessageSquare,
    PlayCircle,
    ChevronRight,
    Search
} from 'lucide-react';
import GlassCard from '../components/GlassCard';

export default function Help() {
    return (
        <div className="space-y-10 animate-fade-in max-w-5xl mx-auto pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                        Help & <span className="text-indigo-400">Support</span>
                    </h1>
                    <p className="text-slate-400 font-bold max-w-xl">
                        Find answers to common questions, explore our knowledge base, or get in touch with our technical team.
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search for answers..."
                        className="w-full bg-[#151226] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-600 font-bold transition-all"
                    />
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-black text-white mb-2 tracking-tight">Documentation</h3>
                    <p className="text-xs text-slate-500 font-bold mb-6">Detailed guides on how to use PathFinder AI features effectively.</p>
                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-indigo-400 group-hover:text-indigo-300">
                        Read Docs <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                </GlassCard>

                <GlassCard className="p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-black text-white mb-2 tracking-tight">Video Tutorials</h3>
                    <p className="text-xs text-slate-500 font-bold mb-6">Step-by-step video lessons to help you get started quickly.</p>
                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-cyan-400 group-hover:text-cyan-300">
                        Watch Videos <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                </GlassCard>

                <GlassCard className="p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group shadow-xl">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-black text-white mb-2 tracking-tight">Community Forum</h3>
                    <p className="text-xs text-slate-500 font-bold mb-6">Join discussions, ask questions, and share your learning roadmaps.</p>
                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-emerald-400 group-hover:text-emerald-300">
                        Join Community <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                </GlassCard>
            </div>

            {/* Support Ticket Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <GlassCard className="p-8 border border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent shadow-2xl lg:col-span-2">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-3 bg-indigo-500/20 rounded-xl">
                            <LifeBuoy className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Submit a Request</h2>
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">Our technical team normally responds within 24 hours</p>
                        </div>
                    </div>

                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Issue Type</label>
                                <select className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none">
                                    <option value="technical">Technical Issue</option>
                                    <option value="billing">Billing Inquiry</option>
                                    <option value="feature">Feature Request</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Priority</label>
                                <select className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High (PRO Only)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Subject</label>
                            <input
                                type="text"
                                placeholder="E.g., Problem generating python roadmap..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">Detailed Description</label>
                            <textarea
                                rows={5}
                                placeholder="Please provide as much detail as possible about your issue..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none transition-all"
                            ></textarea>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="button"
                                className="bg-gradient-to-r from-indigo-500 to-cyan-400 hover:from-indigo-600 hover:to-cyan-500 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 transition-all"
                            >
                                Send Request
                            </button>
                        </div>
                    </form>
                </GlassCard>

                {/* FAQ Sidebar */}
                <div className="space-y-6">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                        {[
                            { q: "How do I upgrade my plan?", a: "You can upgrade your plan at any time from the Pricing page accessible via the sidebar menu." },
                            { q: "Can I share my roadmaps?", a: "Yes, PRO users have the ability to generate public links for their roadmaps." },
                            { q: "How is XP calculated?", a: "XP is earned by completing tasks, maintaining streaks, and finishing roadmaps." },
                            { q: "What happens if I downgrade?", a: "Your existing roadmaps are kept safe, but you lose access to premium features until you upgrade again." },
                        ].map((faq, i) => (
                            <GlassCard key={i} className="p-5 border border-white/5 object-cover cursor-pointer hover:bg-white/[0.03] transition-colors">
                                <h4 className="text-sm font-bold text-white mb-2 leading-snug">{faq.q}</h4>
                                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{faq.a}</p>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
