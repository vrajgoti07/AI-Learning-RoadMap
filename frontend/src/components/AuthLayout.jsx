import React from 'react';
import { BrainCircuit, Target, Zap } from 'lucide-react';
import Logo from './Logo';

export default function AuthLayout({ children, title, subtitle, features }) {
    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
            {/* LEFT SECTION - Brand Panel */}
            <div className="w-full md:w-1/2 min-h-[40vh] md:min-h-screen relative hidden md:flex flex-col justify-center p-12 lg:p-24 border-r border-white/5 bg-darkPanel">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full animate-glow-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full animate-glow-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="relative z-10 w-full max-w-lg mx-auto">
                    <div className="flex items-center space-x-2 mb-12">
                        <Logo className="w-10 h-10 drop-shadow-lg" />
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                            PathFinder AI
                        </span>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight leading-tight">
                        {title || (
                            <>
                                Accelerate Your <br />
                                <span className="gradient-text">Learning Journey</span>
                            </>
                        )}
                    </h1>

                    <p className="text-slate-400 text-lg mb-12 leading-relaxed">
                        {subtitle || "Join thousands of developers using our AI-driven roadmaps to reach their career milestones faster."}
                    </p>

                    <div className="space-y-8">
                        {(features || [
                            {
                                icon: BrainCircuit,
                                color: "indigo",
                                title: "Smart Customization",
                                desc: "AI analyzes your skills to build the optimal curriculum."
                            },
                            {
                                icon: Target,
                                color: "cyan",
                                title: "Clear Milestones",
                                desc: "Track progress with exact objectives and timeline phases."
                            },
                            {
                                icon: Zap,
                                color: "purple",
                                title: "Actionable Resources",
                                desc: "Filter signal from noise with curated YouTube courses."
                            }
                        ]).map((feature, idx) => {
                            const Icon = feature.icon;
                            // Simplify color mapping for dynamic rendering
                            const colorClasses = {
                                indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
                                cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
                                purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
                                emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                                rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
                            };

                            const classes = colorClasses[feature.color] || colorClasses.indigo;

                            return (
                                <div key={idx} className="flex items-start">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mr-4 border ${classes.split(' ')[0]} ${classes.split(' ')[1]}`}>
                                        <Icon className={`w-6 h-6 ${classes.split(' ')[2]}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium mb-1">{feature.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* RIGHT SECTION - Auth Form Panel */}
            <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-12 relative">
                {/* Mobile Brand Show */}
                <div className="absolute top-8 left-8 md:hidden flex items-center space-x-2">
                    <Logo className="w-8 h-8 drop-shadow-md" />
                    <span className="text-xl font-bold gradient-text">PathFinder AI</span>
                </div>

                <div className="w-full max-w-md animate-fade-in z-10 relative">
                    {/* Soft subtle glow behind the auth card */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-[2.5rem] blur-2xl z-0 pointer-events-none"></div>
                    {children}
                </div>
            </div>
        </div>
    );
}
