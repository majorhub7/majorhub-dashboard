import React from 'react';
import { Document } from '../../types';

interface AssetsSectionProps {
    documents: Document[];
    onUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AssetsSection: React.FC<AssetsSectionProps> = React.memo(({ documents, onUploadFile }) => {
    return (
        <section className="bg-slate-50/20 dark:bg-slate-900/5 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-800/40">
            <div className="flex items-center gap-4 mb-8 md:mb-10">
                <div className="size-10 md:size-12 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-primary shadow-inner shrink-0">
                    <span className="material-symbols-outlined !text-[24px] md:!text-[28px]">inventory_2</span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">Arquivos & Ativos</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
                {documents.map(doc => (
                    <div key={doc.id} className="flex flex-col p-4 md:p-5 bg-white dark:bg-slate-900 rounded-2xl md:rounded-[2rem] border border-slate-100 dark:border-slate-800/50 group hover:border-primary/40 transition-all shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shrink-0">
                                <span className="material-symbols-outlined !text-[22px] md:!text-[26px]">{doc.type === 'pdf' ? 'description' : 'image'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm font-black text-slate-700 dark:text-slate-200 truncate">{doc.name}</p>
                            </div>
                        </div>
                        <button className="w-full py-2 md:py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all">Visualizar</button>
                    </div>
                ))}
            </div>
            <label className="flex items-center justify-center gap-4 w-full py-6 md:py-8 border-2 border-dashed border-primary/20 bg-primary/[0.02] hover:bg-primary/[0.04] rounded-[2rem] md:rounded-[3rem] cursor-pointer transition-all group">
                <input type="file" className="hidden" onChange={onUploadFile} />
                <span className="block text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Upload de Ativos</span>
            </label>
        </section>
    );
});

export default AssetsSection;
