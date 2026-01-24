
import React from 'react';
import { Document } from '../types';

interface ImageLightboxProps {
  file: Document;
  onClose: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ file, onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md" onClick={onClose} />
      
      {/* Header */}
      <header className="relative z-10 p-6 md:p-10 flex items-center justify-between">
        <div className="flex flex-col">
          <h4 className="text-white text-lg font-black tracking-tight">{file.name}</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{file.size} • Alta Resolução</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
            <span className="material-symbols-outlined !text-[20px]">download</span>
            Download
          </button>
          <button 
            onClick={onClose}
            className="size-12 rounded-2xl bg-white/10 text-white flex items-center justify-center hover:bg-rose-500 transition-all border border-white/10 active:scale-90"
          >
            <span className="material-symbols-outlined !text-[24px]">close</span>
          </button>
        </div>
      </header>

      {/* Image Stage */}
      <div className="flex-1 relative z-10 flex items-center justify-center p-6 md:p-20 overflow-hidden">
        <img 
          src={file.url} 
          className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-scale-up" 
          alt={file.name} 
        />
      </div>

      {/* Footer Info */}
      <footer className="relative z-10 p-10 flex justify-center">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-full">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Modo de Visualização Imersiva</p>
        </div>
      </footer>
    </div>
  );
};

export default ImageLightbox;
