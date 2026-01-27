
import React from 'react';

const QualificationSection = () => {
    return (
        <section className="py-24 bg-void relative overflow-hidden font-body">
            {/* Background Chaos/Order Split */}
            <div className="absolute inset-0 z-0 bg-void-surface" />

            <div className="container mx-auto px-6 relative z-10 w-full max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-sora font-bold text-white mb-6 animate-fade-in-up">
                        NEM TODA AGÊNCIA <span className="underline decoration-acid decoration-4 underline-offset-8">PRECISA</span> DE UM SISTEMA.
                    </h2>
                    <p className="text-slate-400 text-lg font-light tracking-wide animate-fade-in-up delay-[200ms]">
                        Mas toda agência que quer <span className="font-bold text-white">escalar</span>, sim.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">

                    {/* LEFT: COMPATIVEL (Check) */}
                    <div className="border border-acid bg-void-surface p-10 rounded-sm relative group hover:shadow-[0_0_40px_rgba(0,242,254,0.1)] transition-all duration-500 hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="material-symbols-outlined text-4xl text-acid animate-pulse-glow">check_circle</span>
                        </div>
                        <div className="text-xs font-mono text-acid bg-acid/10 w-fit px-3 py-1 rounded-sm mb-6 uppercase tracking-widest border border-acid/20">
                            COMPATÍVEL
                        </div>

                        <ul className="space-y-6">
                            {[
                                "Agências com múltiplos clientes",
                                "Times que querem escalar sem caos",
                                "Fundadores que valorizam controle",
                                "Operações que trabalham com retainer"
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-4 text-white font-medium group-hover:text-acid transition-colors">
                                    <span className="w-1.5 h-1.5 bg-acid rounded-full mt-2" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 pt-4 border-t border-acid/10 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-mono text-acid/50 uppercase tracking-widest">Escala Habilitada</span>
                        </div>
                    </div>

                    {/* RIGHT: INCOMPATIVEL (Block) */}
                    <div className="border border-slate-800 bg-[#08080c] p-10 rounded-sm relative group hover:border-slate-700 transition-all duration-500 opacity-60 hover:opacity-100">
                        <div className="absolute top-0 right-0 p-4">
                            <span className="material-symbols-outlined text-4xl text-slate-700 group-hover:text-red-900 transition-colors">block</span>
                        </div>
                        <div className="text-xs font-mono text-slate-500 bg-slate-900 w-fit px-3 py-1 rounded-sm mb-6 uppercase tracking-widest border border-slate-800">
                            INCOMPATÍVEL
                        </div>

                        <ul className="space-y-6">
                            {[
                                "Freelancers desorganizados",
                                "Projetos pontuais 'one-off'",
                                "Quem resolve tudo por áudio no Zap",
                                "Quem confunde proximidade com bagunça"
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-4 text-slate-600 font-medium group-hover:text-slate-400 transition-colors">
                                    <span className="w-1.5 h-1.5 bg-slate-700 rounded-full mt-2" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 pt-4 border-t border-slate-800 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-mono text-red-900/40 uppercase tracking-widest">Escala Bloqueada</span>
                        </div>
                    </div>

                </div>

                <div className="text-center mt-12 animate-fade-in-up delay-[600ms]">
                    <span className="text-sm font-mono text-slate-500 uppercase tracking-[0.2em] border px-4 py-2 border-slate-800 rounded-full">
                        Organização é uma escolha estratégica.
                    </span>
                </div>
            </div>
        </section>
    );
};

export default QualificationSection;
