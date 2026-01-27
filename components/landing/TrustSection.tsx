
import React from 'react';

const TrustSection = () => {
    // Placeholder for logos.
    const agencies = [
        { name: "Nebula Creative", opacity: "opacity-40" },
        { name: "Vertex Digitals", opacity: "opacity-30" },
        { name: "Flow Studio", opacity: "opacity-50" },
        { name: "Apex Marketing", opacity: "opacity-40" },
        { name: "Bold Vision", opacity: "opacity-30" },
    ];

    return (
        <section className="py-12 bg-slate-900 border-b border-slate-800">
            <div className="container mx-auto px-6 text-center">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">
                    Impulsionando o fluxo de agências modernas
                </p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
                    {agencies.map((agency, idx) => (
                        <h3 key={idx} className={`text-xl md:text-2xl font-black text-white selection:bg-transparent ${agency.opacity} hover:opacity-100 transition-opacity cursor-default`}>
                            {agency.name}
                        </h3>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustSection;
