import React, { useState } from 'react';
import { Check, X, Crown, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function UpgradeModal({ isOpen, onClose }) {
    const [isLoading, setIsLoading] = useState(false);

    // Fallback: we should refresh the user context properly when integrated
    const { user, upgradePlan } = useAuth();

    if (!isOpen) return null;

    // Dynamically load the Razorpay script
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            // 1. Load Razorpay script
            const res = await loadRazorpayScript();
            if (!res) {
                alert("Razorpay SDK failed to load. Are you online?");
                return;
            }

            // 2. Create an order on our Backend
            const backendOrder = await api.post("/subscriptions/create-order", {
                amount: 12, // $12 simulated as 12 INR just for sandbox test purposes
                currency: "INR"
            });

            // 3. Setup Razorpay Checkout Options
            const options = {
                // Testing Key provided by convention for UI tests - Ideally this is fetched from backend too or passed via VITE_ENV
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_exampleKey",
                amount: backendOrder.amount,
                currency: backendOrder.currency,
                name: "PathFinder AI",
                description: "Upgrade to PRO Plan",
                order_id: backendOrder.order_id,
                handler: async function (response) {
                    try {
                        // 4. Verify Payment with our Backend securely
                        const verifyData = await api.post("/subscriptions/verify", {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        // Payment Success!
                        alert("Payment successful! Welcome to PRO.");
                        upgradePlan('PRO');
                        onClose();

                    } catch (error) {
                        alert("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: user?.name || "",
                    email: user?.email || ""
                },
                theme: {
                    color: "#6366f1" // Indigo-500
                }
            };

            // 5. Open Razorpay Checkou Form
            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                alert("Payment failed! Reason: " + response.error.description);
            });
            paymentObject.open();

        } catch (error) {
            console.error("Error upgrading:", error);
            alert("An error occurred during checkout setup.");
        } finally {
            setIsLoading(false);
        }
    };

    const plans = [
        {
            name: 'GO',
            price: '$0',
            description: 'Perfect for exploring and starting your journey.',
            features: ['1 Roadmap per month', 'Public roadmaps only', 'Standard community support'],
            current: user?.plan === 'GO' || !user?.plan,
            buttonText: 'Current Plan',
            isPro: false
        },
        {
            name: 'PRO',
            price: '$12',
            description: 'The ultimate tool for serious learners and professionals.',
            features: ['Unlimited Roadmap generation', 'Export to PDF & Markdown', 'Private roadmaps', 'Priority AI processing', 'Advanced analytics'],
            current: user?.plan === 'PRO',
            buttonText: 'Upgrade to PRO',
            isPro: true
        }
    ];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-4xl flex flex-col bg-[#151226] rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-fade-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-white/5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col md:flex-row flex-1">
                    {/* Visual Side */}
                    <div className="hidden md:flex flex-col justify-center md:w-5/12 bg-gradient-to-br from-indigo-600 to-cyan-500 p-8 text-white relative shrink-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black tracking-tight mb-3">Unlock Full Potential</h2>
                            <p className="text-white/80 text-xs mb-8 leading-relaxed font-bold">
                                Join our PRO community to get unlimited access to AI engineering tools and private career tracking.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-bold text-sm">10x Faster Generation</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                                        <Crown className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-bold text-sm">Industry Recognition</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Plans Side */}
                    <div className="md:w-7/12 p-6 lg:p-8 h-full flex flex-col justify-center bg-[#151226]">
                        <h3 className="text-xl font-black text-white mb-6">Choose Your Plan</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {plans.map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`p-5 rounded-2xl border transition-all ${plan.isPro
                                        ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.15)]'
                                        : 'border-white/5 bg-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xl font-black text-white">{plan.name}</span>
                                            {plan.isPro && (
                                                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500 text-white px-2 py-0.5 rounded-full shadow-lg">Popular</span>
                                            )}
                                        </div>
                                        <div className="text-xl font-black text-white">
                                            {plan.price}<span className="text-xs font-bold text-slate-500">/mo</span>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-bold mb-4">{plan.description}</p>
                                    <ul className="space-y-2 mb-5">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center text-xs font-bold text-slate-300">
                                                <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center mr-2 shrink-0">
                                                    <Check className="w-2.5 h-2.5 text-cyan-400" />
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        disabled={plan.current || (plan.isPro && isLoading)}
                                        onClick={() => {
                                            if (plan.isPro) {
                                                handleUpgrade();
                                            }
                                        }}
                                        className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${plan.current
                                            ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                                            : 'bg-white text-[#151226] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] shadow-lg'
                                            }`}
                                    >
                                        {plan.isPro && isLoading ? 'Setting up...' : plan.buttonText}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
