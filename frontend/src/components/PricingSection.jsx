import React from 'react';
import PricingCard from './PricingCard';
import { pricingData } from '../pricingData';

export default function PricingSection() {
    return (
        <section className="py-24 relative z-10" id="pricing">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent <span className="gradient-text">Pricing</span></h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Choose the perfect plan to accelerate your learning journey. Upgrade anytime.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                    {pricingData.map((plan, idx) => (
                        <PricingCard key={idx} plan={plan} />
                    ))}
                </div>
            </div>
        </section>
    );
}
