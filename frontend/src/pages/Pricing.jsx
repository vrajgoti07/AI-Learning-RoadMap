import React from 'react';
import { Check, Zap, Crown, Rocket, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const plans = [
    {
        name: 'GO',
        price: '0',
        description: 'Perfect for exploring and starting your learning journey.',
        features: [
            '3 AI Roadmap Generations / mo',
            'Progress Tracking (Basic)',
            'Community Access',
            'Cloud Sync (Limited)',
            'Public Sharing'
        ],
        icon: Zap,
        color: 'text-amber-500',
        buttonText: 'Current Plan',
    },
    {
        name: 'PRO',
        price: '19',
        description: 'For serious learners who want unlimited power and speed.',
        features: [
            'Unlimited Roadmap Generations',
            'Advanced Video Analytics',
            'PDF & Image Exports',
            'Priority AI Engine Access',
            'Personalized Mentorship Simulation',
            'No Watermarks'
        ],
        icon: Crown,
        color: 'text-indigo-500',
        buttonText: 'Upgrade to PRO',
        popular: true
    },
    {
        name: 'PRO PLUS',
        price: '49',
        description: 'The ultimate power for professionals and teams.',
        features: [
            'Everything in PRO plan',
            'Personal AI Career Coach',
            'Early Access to New Features',
            '1-on-1 Strategy Sessions',
            'Unlimited Private Workspaces',
            'Custom Path Branding'
        ],
        icon: Sparkles,
        color: 'text-cyan-400',
        buttonText: 'Get PRO PLUS',
    }
];

export default function Pricing() {
    const { plan, upgradePlan, user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleUpgrade = (planName) => {
        if (planName !== 'GO') {
            upgradePlan(planName);
            showToast(`Success! You are now a ${planName} member.`, 'success');
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0914] text-white flex flex-col pt-20">
            {!user && <Navbar />}

            <main className="flex-grow flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="text-center mb-16 relative z-10 animate-fade-in">
                    <h1 className="text-5xl font-black mb-4 tracking-tight">Flexible <span className="gradient-text">Plans</span></h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Unlock your full potential today</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl w-full relative z-10">
                    {plans.map((p, i) => (
                        <div
                            key={p.name}
                            className={`
                                relative p-8 lg:p-10 rounded-[2.5rem] border transition-all duration-500 animate-fade-up flex flex-col
                                ${p.popular ? 'bg-indigo-500/5 border-indigo-500/30 shadow-2xl shadow-indigo-500/10 scale-105 z-10' : 'bg-white/2 border-white/5 hover:border-white/10'}
                                ${p.name === 'PRO PLUS' ? 'border-cyan-500/20 bg-cyan-500/[0.02]' : ''}
                            `}
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            {p.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                    Recommended
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-8">
                                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${p.color}`}>
                                    <p.icon className="w-8 h-8" />
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black">${p.price}</span>
                                    <span className="text-slate-500 text-sm font-bold ml-1">/mo</span>
                                </div>
                            </div>

                            <h3 className="text-2xl font-black mb-4">{p.name}</h3>
                            <p className="text-sm text-slate-500 font-medium mb-10 leading-relaxed min-h-[48px]">{p.description}</p>

                            <div className="space-y-4 mb-12 flex-grow">
                                {p.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start text-sm font-bold text-slate-400">
                                        <Check className="w-4 h-4 text-emerald-500 mr-3 mt-0.5 shrink-0" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleUpgrade(p.name)}
                                disabled={plan === p.name}
                                className={`
                                    w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all
                                    ${plan === p.name
                                        ? 'bg-white/5 text-slate-500 cursor-default border border-white/5'
                                        : p.name === 'PRO PLUS'
                                            ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]'
                                            : 'bg-white text-slate-900 shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-[0.98]'
                                    }
                                `}
                            >
                                {plan === p.name ? 'Current Plan' : p.buttonText}
                            </button>
                        </div>
                    ))}
                </div>

                {!user && (
                    <button
                        onClick={() => navigate('/')}
                        className="mt-20 text-slate-500 hover:text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center"
                    >
                        <span>Back to Home</span>
                    </button>
                )}
            </main>

            {!user && <Footer />}
        </div>
    );
}
