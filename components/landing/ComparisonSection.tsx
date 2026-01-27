
import React from 'react';

const ComparisonSection = () => {
    return (
        <section className="py-24 bg-void relative overflow-hidden font-body">
            {/* Background Chaos/Order Split */}
            <div className="absolute inset-0 z-0">
                <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-br from-[#1a0505] to-void opacity-20" />
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-bl from-[#05141a] to-void opacity-20" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-sora font-bold text-white mb-4 tracking-tight">
                        DO IMPROVISO AO <span className="text-transparent bg-clip-text bg-gradient-to-r from-acid to-acid-dark">CONTROLE OPERACIONAL</span>.
                    </h2>
                    <p className="text-slate-400 text-sm font-mono uppercase tracking-widest">
                        Comparação direta: Agência Reativa vs Agência Estruturada
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch group/container">

                    {/* LEFT: CHAOS (Before) */}
                    <div className="relative p-8 rounded-sm bg-[#080202] border border-red-900/20 md:transform md:-rotate-1 md:translate-y-4 md:hover:rotate-0 md:hover:translate-y-0 transition-all duration-500 hover:border-red-500/30 group/chaos">
                        <div className="flex items-center gap-3 mb-8 border-b border-red-900/20 pb-4">
                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                            <span className="font-mono text-xs text-red-500 tracking-widest uppercase">MODO_REATIVO</span>
                        </div>

                        <ul className="space-y-6">
                            {[
                                "Cliente pergunta status no WhatsApp",
                                "Aprovação por áudio (sem registro)",
                                "Arquivos duplicados no Drive/WeTransfer",
                                "Você vira o gargalo da operação",
                                "Tudo depende da sua memória"
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-4 text-slate-500 group-hover/chaos:text-red-400/60 transition-colors">
                                    <span className="material-symbols-outlined text-[20px] opacity-50 shrink-0">close</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 pt-4 border-t border-red-900/10 text-center">
                            <span className="text-xs font-mono text-red-900/50 uppercase tracking-widest">Operação baseada em interrupção</span>
                        </div>
                    </div>

                    {/* RIGHT: ORDER (MajorHub) */}
                    <div className="relative p-8 rounded-sm bg-void-surface border border-acid/20 md:transform md:scale-105 shadow-2xl shadow-acid/5 md:hover:scale-[1.07] transition-all duration-500 hover:border-acid hover:shadow-[0_0_30px_rgba(0,242,254,0.15)] group/order">
                        {/* Glow Line Animation */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-acid to-transparent opacity-0 group-hover/order:opacity-100 group-hover/order:animate-[shimmer_2s_linear_infinite]" />

                        <div className="flex items-center gap-3 mb-8 border-b border-acid/10 pb-4">
                            <span className="w-2 h-2 rounded-full bg-acid shadow-[0_0_10px_#00F2FE]" />
                            <span className="font-mono text-xs text-acid tracking-widest uppercase">MODO_SISTEMA</span>
                        </div>

                        <ul className="space-y-6">
                            {[
                                "Cliente acompanha status sozinho",
                                "Aprovação registrada com timestamp",
                                "Arquivos centralizados e versionados",
                                "Fluxo previsível e automático",
                                "O sistema sustenta a operação"
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-4 text-slate-300 group-hover/order:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[20px] text-acid shrink-0">check_circle</span>
                                    <span className="font-semibold">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 pt-4 border-t border-acid/10 text-center">
                            <span className="text-xs font-mono text-acid/50 uppercase tracking-widest">Operação baseada em processo</span>
                        </div>
                    </div>

                </div>

                <div className="text-center mt-20 opacity-0 animate-fade-in-up delay-[800ms] fill-mode-forwards" style={{ animationFillMode: 'forwards' }}>
                    <p className="text-lg md:text-xl font-sora font-medium text-slate-300">
                        Quando tudo passa pelo sistema, <span className="text-white border-b-2 border-acid">nada depende do improviso</span>.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ComparisonSection;
