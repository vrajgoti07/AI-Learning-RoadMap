import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthInput({ label, type, value, onChange, placeholder, icon: Icon, required }) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="mb-5 group">
            <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
            <div className="relative">
                <input
                    type={isPassword && showPassword ? 'text' : type}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all text-sm group-hover:border-white/20"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                {isPassword && (
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                )}
            </div>
        </div>
    );
}
