
import React from 'react';

const OnboardingSection = () => {
    return (
        <section className="py-24 bg-void font-body relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[#020408]" />
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-void-surface to-transparent opacity-30" />

            <div className="container mx-auto px-6 relative z-10 w-full max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-sora font-bold text-white mb-6 animate-fade-in-up">
                        VOCÊ ATIVA <span className="text-acid">EM MINUTOS</span>.
                    </h2>
                    <p className="text-slate-400 text-lg font-light tracking-wide animate-fade-in-up delay-[200ms]">
                        Sem curva de aprendizado. Sem setup técnico.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-4 relative group/pipeline">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[28px] left-[10%] w-[80%] h-[2px] bg-void-border -z-10 group-hover/pipeline:animate-[width-grow_1.5s_ease-out_forwards]" />
                    <div className="hidden lg:block absolute top-[28px] left-[10%] w-[80%] h-[2px] bg-gradient-to-r from-acid via-void to-acid opacity-0 group-hover/pipeline:opacity-100 group-hover/pipeline:translate-x-[100%] transition-transform duration-[3s] ease-in-out delay-[500ms]" />

                    {[
                        { step: "01", title: "Cria o Hub", desc: "Configure sua agência", icon: "add_business" },
                        { step: "02", title: "Personaliza", desc: "Upload da sua marca", icon: "palette" },
                        { step: "03", title: "Convida", desc: "Seu cliente entra", icon: "group_add" },
                        { step: "04", title: "Centraliza", desc: "O sistema assume", icon: "hub" },
                    ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center relative z-20 group/step">
                            <div className="w-14 h-14 rounded-full bg-void-surface border-2 border-void-border flex items-center justify-center mb-6 group-hover/step:border-acid group-hover/step:scale-110 group-hover/step:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all duration-300 relative">
                                <span className={`material-symbols-outlined text-slate-500 group-hover/step:text-acid transition-colors ${idx === 3 ? 'animate-pulse' : ''}`}>{item.icon}</span>
                                <span className="absolute -top-2 -right-2 bg-void text-xs font-mono text-slate-600 px-1 border border-void-border rounded-sm group-hover/step:text-acid group-hover/step:border-acid transition-colors">
                                    {item.step}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 group-hover/step:text-acid transition-colors">{item.title}</h3>
                            <p className="text-sm text-slate-500 max-w-[150px]">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12 animate-fade-in-up delay-[600ms]">
                    <span className="text-sm font-mono text-slate-500 uppercase tracking-[0.2em] border px-4 py-2 border-slate-800 rounded-full">
                        Em poucos minutos, o sistema vira padrão.
                    </span>
                </div>
            </div>
        </section>
    );
};

export default OnboardingSection;
