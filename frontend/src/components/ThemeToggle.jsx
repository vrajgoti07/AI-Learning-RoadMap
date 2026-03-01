import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-cyan-400 transition-all duration-300"
            aria-label="Toggle Theme"
        >
            {isDark ? (
                <Sun className="w-5 h-5 animate-fade-in" />
            ) : (
                <Moon className="w-5 h-5 animate-fade-in" />
            )}
        </button>
    );
}
