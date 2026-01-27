
import React, { useRef, useEffect } from 'react';
import GlowButton from './GlowButton';

interface HeroSectionProps {
    onLoginClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onLoginClick }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Mouse tracking logic for the subtle gradient follow
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handlePointerMove = (e: PointerEvent) => {
            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            container.style.setProperty('--mouse-x', `${x}%`);
            container.style.setProperty('--mouse-y', `${y}%`);
        };

        container.addEventListener('pointermove', handlePointerMove);
        return () => container.removeEventListener('pointermove', handlePointerMove);
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden bg-void group"
        >
            {/* 1. LAYER: TECHNICAL GRID (Static Base) */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.08]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, #1a1f2e 1px, transparent 1px),
            linear-gradient(to bottom, #1a1f2e 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px',
                }}
            />

            {/* 2. LAYER: DOT MATRIX (Interactive Reveal) */}
            <div
                className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    backgroundImage: 'radial-gradient(circle, #00F2FE 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    maskImage: 'radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)',
                }}
            />

            <div className="container mx-auto px-6 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* LEFT: MASSIVE TYPOGRAPHY (The HUD) */}
                    <div className="lg:col-span-7 flex flex-col items-start text-left">
                        {/* Status Pill */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-void-border bg-void-surface mb-8 group hover:border-acid/50 transition-colors cursor-help">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-acid animate-pulse shadow-[0_0_8px_rgba(0,242,254,0.8)]"></span>
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-acid tracking-[0.2em] uppercase font-inter transition-colors">Sistema Operacional v2.0</span>
                        </div>

                        <h1 className="font-sora font-black text-5xl md:text-7xl xl:text-8xl text-white leading-[0.9] tracking-tighter mb-8">
                            <span className="block text-slate-500 text-3xl md:text-4xl font-bold mb-2 tracking-normal">CONTROLE DE</span>
                            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                                AGÊNCIA
                            </span>
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-acid to-acid-dark animate-pulse-slow">
                                MAJORITÁRIO
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-400 font-inter font-light max-w-xl leading-relaxed mb-10 border-l-2 border-void-border pl-6">
                            Chega de feedback espalhado, aprovações travadas e cliente cobrando no WhatsApp.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
                            <div onClick={onLoginClick} className="w-full sm:w-auto">
                                <GlowButton>
                                    CRIAR MEU HUB
                                </GlowButton>
                            </div>

                            <button
                                onClick={onLoginClick}
                                className="
                  px-8 py-4 w-full sm:w-auto 
                  rounded-full border border-void-border 
                  text-slate-400 hover:text-acid hover:border-acid 
                  transition-all duration-300 
                  font-bold text-xs tracking-widest uppercase 
                  hover:shadow-[0_0_15px_rgba(0,242,254,0.1)]
                  flex items-center justify-center gap-2 group
                "
                            >
                                <span className="material-symbols-outlined !text-[18px] group-hover:rotate-90 transition-transform">play_circle</span>
                                Ver Demonstração
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: THE ARTIFACT (Technical Visual) */}
                    <div className="lg:col-span-5 relative perspective-1000 group/mockup mt-12 lg:mt-0">
                        {/* Decorative Elements */}
                        <div className="absolute -top-10 -right-10 w-64 h-64 bg-acid blur-[120px] opacity-20 pointer-events-none" />

                        <div className="relative rounded-sm bg-void-surface border border-void-border p-2 shadow-2xl transform rotate-y-[-12deg] rotate-x-[5deg] group-hover/mockup:rotate-0 transition-all duration-700 ease-out">
                            {/* Glass Reflection */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent z-20 pointer-events-none" />

                            {/* Fake UI Content */}
                            <div className="bg-[#03060a] rounded-sm overflow-hidden aspect-[4/3] relative">
                                {/* Header */}
                                <div className="h-10 border-b border-void-border flex items-center px-4 gap-2 bg-[#050a14]">
                                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                    <div className="flex-1" />
                                    <div className="text-[9px] text-acid font-mono animate-pulse">STATUS: ONLINE</div>
                                </div>

                                {/* Body */}
                                <div className="p-6 grid grid-cols-2 gap-4">
                                    {/* Timeline Mock */}
                                    <div className="col-span-2 h-20 bg-void-border/30 rounded-sm relative overflow-hidden group/item">
                                        <div className="absolute top-2 left-2 w-20 h-2 bg-void-border rounded-full" />
                                        <div className="absolute bottom-0 left-0 w-[70%] h-1 bg-gradient-to-r from-acid to-transparent" />
                                    </div>

                                    {/* Card Mock */}
                                    <div className="h-32 bg-void-border/20 rounded-sm border border-void-border/50 relative overflow-hidden group/card hover:border-acid/50 transition-colors">
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-acid shadow-[0_0_10px_#00F2FE]" />
                                        <div className="absolute bottom-4 left-4 right-4 h-2 bg-void-border/50 rounded-full" />
                                        <div className="absolute bottom-8 left-4 w-12 h-2 bg-void-border/50 rounded-full" />
                                    </div>

                                    {/* List Mock */}
                                    <div className="h-32 bg-void-border/20 rounded-sm p-4 space-y-2">
                                        <div className="w-full h-2 bg-void-border/40 rounded-full" />
                                        <div className="w-[80%] h-2 bg-void-border/40 rounded-full" />
                                        <div className="w-[60%] h-2 bg-void-border/40 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Label */}
                        <div className="absolute -bottom-6 -left-6 bg-void-surface border border-acid/30 px-4 py-2 rounded-sm shadow-xl animate-bounce-subtle backdrop-blur-md">
                            <div className="text-[10px] text-acid font-mono font-bold tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-acid rounded-full animate-ping" />
                                DADOS_EM_TEMPO_REAL
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HeroSection;
