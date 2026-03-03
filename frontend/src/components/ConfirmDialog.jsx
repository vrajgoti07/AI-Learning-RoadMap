import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ isOpen, message, onConfirm, onCancel, title = "Are you sure?" }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence mode="wait">
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-[#151226] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none" />

                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                            <AlertTriangle className="w-8 h-8 text-amber-500" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white tracking-tight leading-tight">{title}</h3>
                            <p className="text-sm font-bold text-slate-400 leading-relaxed px-4">
                                {message}
                            </p>
                        </div>

                        <div className="flex w-full space-x-3 pt-2">
                            <button
                                onClick={onCancel}
                                className="flex-1 px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest transition-all border border-white/5"
                            >
                                No, Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-500/20"
                            >
                                Yes, Proceed
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={onCancel}
                        className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
