import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-indigo-400" />,
};

const colors = {
    success: 'border-emerald-500/20 bg-emerald-500/5',
    error: 'border-red-500/20 bg-red-500/5',
    info: 'border-indigo-500/20 bg-indigo-500/5',
};

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
            className={`relative flex items-center space-x-4 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[320px] max-w-md ${colors[type]} overflow-hidden`}
        >
            <div className="shrink-0">
                {icons[type]}
            </div>
            <div className="flex-grow">
                <p className="text-sm font-bold text-white leading-tight">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="shrink-0 p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
            <motion.div
                className={`absolute bottom-0 left-0 h-0.5 ${type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-indigo-500'}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
            />
        </motion.div>
    );
}
