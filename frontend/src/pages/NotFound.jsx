import React from 'react';
import { Rocket, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col text-white">
            <Navbar />

            <main className="flex-grow flex items-center justify-center p-6 pt-20">
                <div className="max-w-xl w-full text-center animate-fade-in">
                    <div className="relative mb-12 flex justify-center">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
                        <div className="relative z-10 text-[12rem] font-black leading-none tracking-tighter text-white/5 opacity-10 select-none">
                            404
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Rocket className="w-24 h-24 text-cyan-400 rotate-45 animate-float" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
                        Lost in <span className="gradient-text">Cyberspace?</span>
                    </h1>

                    <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-md mx-auto">
                        The roadmap you're looking for was either deleted, moved, or never existed in this dimension.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20"
                        >
                            <Home className="w-5 h-5" />
                            <span>Return Home</span>
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/10 text-slate-400 font-bold hover:bg-white/5 transition-all"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
