import React from 'react';
import { Check } from 'lucide-react';

export default function PricingCard({ plan }) {
    const { name, price, period, description, features, buttonText, isPopular } = plan;

    return (
        <div className={`relative ${isPopular ? 'scale-105 z-10 md:-mt-8 md:-mb-8' : 'z-0'} transition-transform duration-300 group`}>
            {isPopular && (
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            )}

            <div className={`relative h-full glass-card p-8 rounded-3xl flex flex-col ${isPopular ? 'border-2 border-indigo-500/50' : 'border border-white/10'} hover:border-cyan-500/30 transition-colors`}>
                {isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-lg">
                            Most Popular
                        </span>
                    </div>
                )}

                <div className="mb-8 mt-2">
                    <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
                    <div className="flex items-baseline mb-4">
                        <span className="text-4xl font-extrabold text-white">{price}</span>
                        {period && <span className="text-slate-400 ml-1">{period}</span>}
                    </div>
                    <p className="text-slate-400 text-sm">{description}</p>
                </div>

                <div className="flex-grow">
                    <ul className="space-y-4 mb-8">
                        {features.map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                                <Check className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
                                <span className="text-slate-300 text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <button className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 ${isPopular ? 'glow-button text-white' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
                    {buttonText}
                </button>
            </div>
        </div>
    );
}
