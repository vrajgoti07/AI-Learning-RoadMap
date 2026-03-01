import React from 'react';

export default function GradientButton({ children, onClick, className = '', type = 'button' }) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`glow-button group px-6 py-3 flex items-center justify-center space-x-2 ${className}`}
        >
            <div className="absolute inset-0 bg-white/20 group-hover:bg-white/0 transition-colors duration-300"></div>
            <span className="relative z-10 flex items-center justify-center space-x-2 w-full">
                {children}
            </span>
        </button>
    );
}
