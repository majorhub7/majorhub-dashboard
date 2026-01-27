
import React, { useRef, useEffect } from 'react';

const FeatureGrid = () => {
    const containerRef = useRef<HTMLElement>(null);

    // Mouse tracking for dot pattern effect
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

    const features = [
        {
            title: "TRANSPARÊNCIA_TIMELINE",
            description: "Seus clientes veem exatamente onde o projeto está. Sem perguntas, sem cobranças.",
            icon: "calendar_month",
            colSpan: "col-span-12 md:col-span-8",
            bg: "bg-void-surface",
            border: "border-void-border"
        },
        {
            title: "COFRE_DIGITAL",
            description: "Biblioteca centralizada. Redundância zero.",
            icon: "folder_open",
            colSpan: "col-span-12 md:col-span-4",
            bg: "bg-[#050a14]",
            border: "border-void-border"
        },
        {
            title: "APROVAÇÃO_INSTANTÂNEA",
            description: "Protocolo de assinatura em um clique.",
            icon: "check_circle",
            colSpan: "col-span-12 md:col-span-4",
            bg: "bg-[#050a14]",
            border: "border-void-border"
        },
        {
            title: "SINCRONIA_REAL_TIME",
            description: "Atualizações de status automatizadas.",
            icon: "notifications",
            colSpan: "col-span-12 md:col-span-8",
            bg: "bg-void-surface",
            border: "border-void-border"
        }
    ];

    return (
        <section
            ref={containerRef}
            className="py-24 bg-void relative overflow-hidden group/section"
        >
            {/* 1. LAYER: TECHNICAL GRID (Static Base) */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]"
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
                className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover/section:opacity-100 transition-opacity duration-500"
                style={{
                    backgroundImage: 'radial-gradient(circle, #00F2FE 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    maskImage: 'radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(300px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)',
                }}
            />

            {/* Decorative Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-void-border to-transparent z-20" />

            <div className="container mx-auto px-6 relative z-20">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-sm font-mono text-acid mb-4 tracking-widest uppercase flex items-center gap-2">
                            <span className="w-4 h-[1px] bg-acid" />
                            CAPACIDADES_DO_SISTEMA
                        </h2>
                        <h3 className="text-4xl md:text-5xl font-sora font-bold text-white tracking-tight leading-none">
                            DO CAOS AO <span className="text-transparent bg-clip-text bg-gradient-to-r from-acid to-acid-dark">CONTROLE</span>
                        </h3>
                    </div>
                    <div className="text-slate-500 font-mono text-xs max-w-xs text-right hidden md:block border-r-2 border-void-border pr-4">
                        SISTEMA_OPERACIONAL_V2.0<br />
                        STATUS: ATIVO<br />
                        LATÊNCIA: 12ms
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className={`
                group relative
                ${feature.colSpan}
                p-8 md:p-10
                rounded-sm
                border ${feature.border}
                ${feature.bg}
                hover:border-acid
                transition-all duration-300
                overflow-hidden
                hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]
              `}
                        >
                            {/* Hover Glow Effect */}
                            <div className="absolute -inset-1 bg-acid/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Technical Corner Markers */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-transparent group-hover:border-acid transition-colors duration-300" />
                            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-transparent group-hover:border-acid transition-colors duration-300" />
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-transparent group-hover:border-acid transition-colors duration-300" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-transparent group-hover:border-acid transition-colors duration-300" />

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-12 h-12 flex items-center justify-center bg-void border border-void-border group-hover:border-acid/50 transition-colors rounded-sm">
                                        <span className="material-symbols-outlined text-slate-500 group-hover:text-acid relative z-10 !text-[24px] transition-colors">
                                            {feature.icon}
                                        </span>
                                    </div>
                                    <span className="text-void-border group-hover:text-acid/40 font-mono text-xs transition-colors">
                                        0{idx + 1}
                                    </span>
                                </div>

                                <h4 className="text-lg font-bold text-white mb-2 font-inter tracking-wide group-hover:text-acid transition-colors uppercase">
                                    {feature.title}
                                </h4>
                                <p className="text-slate-400 font-light text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureGrid;
