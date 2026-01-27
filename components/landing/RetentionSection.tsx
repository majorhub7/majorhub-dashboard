
import React, { useState, useEffect } from 'react';

const RetentionSection = () => {
    // Typing effect for the "logs"
    const [typedLogs, setTypedLogs] = useState<string[]>([]);

    // Simulate log typing
    useEffect(() => {
        const fullLogs = [
            " > [10:24:01] DECISÃO_REGISTRADA: CLIENTE_X APROVOU LAYOUT_V2.PDF",
            " > [10:24:05] SYSTEM: ARQUIVO MOVIDO PARA PASTA_FINAL >> PERMISSÃO_READONLY",
            " > [10:25:00] FEEDBACK_SAVE: COMENTÁRIO #42 VINCULADO AO ITEM #12",
            " > [WARNING] TENTATIVA DE ALTERAÇÃO NÃO AUTORIZADA BLOQUEADA",
            " > [SYSTEM] OPERAÇÃO SUSTENTADA PELO MAJORHUB CORE",
        ];

        let currentLogIndex = 0;

        const interval = setInterval(() => {
            if (currentLogIndex < fullLogs.length) {
                setTypedLogs(prev => [...prev, fullLogs[currentLogIndex]]);
                currentLogIndex++;
            } else {
                clearInterval(interval);
            }
        }, 1200);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-24 bg-[#010101] border-y border-void-border font-mono relative overflow-hidden">
            {/* Background Scanlines */}
            <div className="absolute inset-0 bg-[linear_gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear_gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10 opacity-20" />

            <div className="container mx-auto px-6 max-w-5xl relative z-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-sora font-bold text-white mb-6">
                        TUDO FICA REGISTRADO. <br /><span className="text-acid">TUDO FICA AQUI.</span>
                    </h2>
                    <div className="flex justify-center gap-8 text-xs text-slate-500 uppercase tracking-widest">
                        <span>Cada decisão deixa rastro.</span>
                        <span className="text-acid">•</span>
                        <span>Cada entrega tem histórico.</span>
                        <span className="text-acid">•</span>
                        <span>Nada se perde.</span>
                    </div>
                </div>

                <div className="bg-[#050a14] border border-void-border rounded-lg p-6 md:p-10 shadow-2xl relative overflow-hidden group">
                    {/* Header Bar */}
                    <div className="flex items-center gap-4 mb-6 border-b border-void-border pb-4">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-700" />
                            <div className="w-3 h-3 rounded-full bg-slate-700" />
                            <div className="w-3 h-3 rounded-full bg-slate-700" />
                        </div>
                        <div className="text-xs text-slate-600 font-bold uppercase tracking-widest flex-1 text-center font-mono">
                            majorhub_core.log --SYSTEM_LOCK_IN
                        </div>
                    </div>

                    {/* Terminal Window */}
                    <div className="space-y-4 font-mono text-xs md:text-sm text-acid/80 min-h-[200px]">
                        {typedLogs.map((log, index) => (
                            <div key={index} className="animate-fade-in transition-opacity duration-300">
                                <span className="opacity-50 mr-2">$</span>
                                {log}
                            </div>
                        ))}
                        <div className="animate-pulse w-2 h-4 bg-acid inline-block ml-2" />
                    </div>

                    {/* Bottom Line Animation */}
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-acid to-transparent animate-[shimmer_3s_linear_infinite]" />
                </div>

                <div className="text-center mt-12 opacity-50 text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
                    Trocar de agência passa a ter custo operacional real.
                </div>
            </div>
        </section>
    );
};

export default RetentionSection;
