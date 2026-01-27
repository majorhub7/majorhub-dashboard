
import React, { useRef, useEffect } from 'react';

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    children: React.ReactNode;
}

/**
 * GlowButton Component - "Electric Technical" V2
 * 
 * Replaces the soft "blob" glow with a high-performance "Cyber Shimmer" effect.
 * Uses CSS masking and gradients for a sharp, premium look.
 */
const GlowButton: React.FC<GlowButtonProps> = ({
    variant = 'primary',
    className = '',
    children,
    ...props
}) => {
    return (
        <button
            className={`
        relative group overflow-hidden rounded-full
        px-8 py-4 font-bold text-white tracking-wider uppercase text-sm
        transition-all duration-300 transform hover:scale-105 active:scale-95
        ${className}
      `}
            {...props}
        >
            {/* 1. Base Gradient Background (Dark) */}
            <div className="absolute inset-0 bg-void-surface border border-void-border rounded-full z-0 transition-colors group-hover:bg-void-border/50" />

            {/* 2. Electric Border Gradient */}
            <div className="absolute inset-0 rounded-full p-[1px] bg-gradient-to-r from-transparent via-acid to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                style={{ maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)', maskComposite: 'exclude', WebkitMaskComposite: 'xor' }} />

            {/* 3. The "Shimmer" Sweep Effect */}
            <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden rounded-full">
                <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-acid/30 to-transparent skew-x-[-30deg] animate-[shimmer_2s_infinite]" />
            </div>

            {/* 4. Inner Glow (Subtle) */}
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,242,254,0.1)] group-hover:shadow-[inset_0_0_30px_rgba(0,242,254,0.3)] transition-shadow duration-300" />

            {/* Content */}
            <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                {children}
                <span className="material-symbols-outlined !text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </span>
        </button>
    );
};

export default GlowButton;
