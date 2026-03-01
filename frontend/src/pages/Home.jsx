import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BrainCircuit, Target, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GradientButton from '../components/GradientButton';
import FeatureCard from '../components/FeatureCard';
import PricingSection from '../components/PricingSection';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col pt-4">
            <Navbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative pt-20 pb-32 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-background" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full" />
                        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/20 blur-[100px] rounded-full" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card border border-indigo-500/30 mb-8 mt-10 opacity-0 animate-fade-up">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm font-medium text-slate-300">AI-Powered Learning Paths</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight opacity-0 animate-fade-up" style={{ animationDelay: '0.2s' }}>
                            Master Any Skill with<br />
                            <span className="gradient-text">Intelligent Roadmaps</span>
                        </h1>

                        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 opacity-0 animate-fade-up" style={{ animationDelay: '0.4s' }}>
                            Generate personalized, structured learning paths mapped specifically to your career goals using advanced AI.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 opacity-0 animate-fade-up" style={{ animationDelay: '0.6s' }}>
                            <GradientButton onClick={() => navigate('/generator')} className="text-lg px-8 py-4">
                                <span>Start Learning Now</span>
                                <span className="text-xl group-hover:translate-x-1 transition-transform inline-block">&rarr;</span>
                            </GradientButton>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-8 py-4 text-lg font-medium text-white glass-card hover:bg-white/5 transition-colors rounded-2xl"
                            >
                                View Dashboard
                            </button>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 relative z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16 opacity-0 animate-fade-up" style={{ animationDelay: '0.8s' }}>
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why PathFinder AI?</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                                Our platform uses state-of-the-art LLMs to create tailored curriculum designed for rapid skill acquisition.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="opacity-0 animate-fade-up h-full" style={{ animationDelay: '1.0s' }}>
                                <FeatureCard
                                    icon={BrainCircuit}
                                    title="AI Customization"
                                    description="Algorithms analyze your current level and goals to generate the optimal learning sequence."
                                />
                            </div>
                            <div className="opacity-0 animate-fade-up h-full" style={{ animationDelay: '1.2s' }}>
                                <FeatureCard
                                    icon={Target}
                                    title="Milestone Tracking"
                                    description="Clear objectives and practical projects validate your skills at every step."
                                />
                            </div>
                            <div className="opacity-0 animate-fade-up h-full" style={{ animationDelay: '1.4s' }}>
                                <FeatureCard
                                    icon={Zap}
                                    title="Rapid Progress"
                                    description="Eliminate analysis paralysis. Know exactly what to learn next, and why."
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <PricingSection />
            </main>

            <Footer />
        </div>
    );
}
