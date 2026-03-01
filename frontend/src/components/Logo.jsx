import React from 'react';

export default function Logo({ className = "w-8 h-8", ...props }) {
    return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
            <defs>
                <linearGradient id="logo-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="logo-arrow-left" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="logo-arrow-right" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
            </defs>

            <circle cx="50" cy="50" r="40" stroke="url(#logo-ring)" strokeWidth="3" opacity="0.8" />

            <circle cx="50" cy="10" r="6" fill="#a855f7" />
            <circle cx="90" cy="50" r="5" fill="#22d3ee" />
            <circle cx="50" cy="90" r="6" fill="#0ea5e9" />
            <circle cx="10" cy="50" r="5" fill="#8b5cf6" />

            <line x1="50" y1="20" x2="50" y2="28" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="50" y1="80" x2="50" y2="72" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="50" x2="28" y2="50" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="80" y1="50" x2="72" y2="50" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />

            <g transform="rotate(45 50 50)">
                <path d="M50 15 L25 75 L50 62 Z" fill="url(#logo-arrow-left)" />
                <path d="M50 15 L75 75 L50 62 Z" fill="url(#logo-arrow-right)" />
            </g>
        </svg>
    );
}
