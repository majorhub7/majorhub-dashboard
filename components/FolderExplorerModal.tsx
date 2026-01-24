
import React, { useState } from 'react';
import { Project, Document } from '../types';
import ImageLightbox from './ImageLightbox';

interface FolderExplorerModalProps {
  project: Project;
  files: Document[];
  onClose: () => void;
}

const FolderExplorerModal: React.FC<FolderExplorerModalProps> = ({ project, files, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<Document | null>(null);
  const [lightboxFile, setLightboxFile] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return 'image';
      case 'pdf': return 'description';
      case 'video': return 'movie';
      case 'figma': return 'design_services';
      default: return 'insert_drive_file';
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-6 animate-fade-in font-display">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-7xl h-full md:h-[85vh] bg-white dark:bg-slate-900 md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row animate-scale-up border border-white/10 transition-all duration-500`}>
        
        {/* Coluna de Arquivos */}
        <div className={`flex flex-col bg-white dark:bg-slate-900 transition-all duration-500 ease-in-out border-r border-slate-100 dark:border-slate-800 shrink-0 ${
          selectedFile ? 'w-full md:w-[480px] h-[40vh] md:h-full' : 'w-full h-full'
        }`}>
          
          <header className="p-8 md:p-10 flex flex-col gap-6 sticky top-0 bg-white dark:bg-slate-900 z-10">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-4 cursor-pointer group" 
                onClick={() => setSelectedFile(null)}
              >
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined !text-[24px]">folder</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white truncate tracking-tight">{project.title}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">{files.length} Ativos na pasta</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`size-8 rounded-lg flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}
                  >
                    <span className="material-symbols-outlined !text-[18px]">grid_view</span>
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`size-8 rounded-lg flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}
                  >
                    <span className="material-symbols-outlined !text-[18px]">list</span>
                  </button>
                </div>
                {!selectedFile && (
                  <button onClick={onClose} className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:text-slate-600 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 !text-[20px]">search</span>
              <input 
                type="text"
                placeholder="Buscar nesta pasta..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-400 dark:text-white"
              />
            </div>
          </header>

          <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-0 ${
            viewMode === 'grid' && !selectedFile ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6' : 'flex flex-col gap-2'
          }`}>
            {filteredFiles.map((file) => (
              <div 
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`group transition-all duration-300 cursor-pointer ${
                  viewMode === 'grid' && !selectedFile 
                    ? 'flex flex-col gap-4' 
                    : `flex items-center gap-4 p-4 rounded-2xl border ${
                        selectedFile?.id === file.id 
                          ? 'bg-primary/5 border-primary/20 shadow-sm ring-1 ring-primary/5' 
                          : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`
                }`}
              >
                {viewMode === 'grid' && !selectedFile ? (
                  <>
                    <div className="aspect-square bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-center cursor-pointer group-hover:shadow-xl group-hover:border-primary/20 group-hover:-translate-y-1 transition-all overflow-hidden relative">
                      {file.type === 'image' ? (
                        <img src={file.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                      ) : (
                        <span className="material-symbols-outlined !text-[40px] text-slate-300 group-hover:text-primary transition-colors">{getFileIcon(file.type)}</span>
                      )}
                    </div>
                    <div className="px-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary transition-colors">{file.name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{file.size} • {file.type.toUpperCase()}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedFile?.id === file.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <span className="material-symbols-outlined !text-[20px]">{getFileIcon(file.type)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${selectedFile?.id === file.id ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>
                        {file.name}
                      </p>
                    </div>
                    <div className="hidden md:flex flex-col items-end shrink-0 gap-1 pr-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{file.size}</span>
                      <span className="text-[8px] font-bold text-primary/60 uppercase tracking-tighter">{file.type.toUpperCase()}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Coluna Direita: Preview Detalhado */}
        {selectedFile && (
          <div className="flex-1 flex flex-col bg-slate-50/20 dark:bg-slate-900/40 h-full relative overflow-hidden animate-fade-in items-center justify-center p-6 md:p-12">
            
            <header className="absolute top-0 left-0 right-0 p-8 flex items-center justify-end z-20 pointer-events-none">
               <button 
                onClick={() => setSelectedFile(null)}
                className="size-12 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 text-rose-500 flex items-center justify-center hover:scale-110 active:scale-90 transition-all pointer-events-auto"
               >
                 <span className="material-symbols-outlined !text-[24px]">close</span>
               </button>
            </header>

            <div className="w-full h-full max-w-[680px] max-h-[500px] flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden relative flex items-center justify-center p-6 group shadow-2xl transition-all duration-700">
                {selectedFile.type === 'image' ? (
                  <div 
                    onClick={() => setLightboxFile(selectedFile)}
                    className="w-full h-full relative overflow-hidden rounded-[2rem] cursor-zoom-in group/img shadow-sm"
                  >
                    <img 
                      src={selectedFile.url} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105" 
                      alt="" 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center">
                       <span className="material-symbols-outlined !text-[32px] text-white opacity-0 group-hover/img:opacity-100 transition-opacity">zoom_in</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 text-center animate-scale-up">
                    <div className="size-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800 shadow-xl flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined !text-[48px]">{getFileIcon(selectedFile.type)}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1">{selectedFile.name}</h4>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ativo sem pré-visualização direta</p>
                    </div>
                  </div>
                )}
                
                {/* Botão de Download na Preview */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-slate-900 dark:bg-white px-6 py-3 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <button className="flex items-center gap-3 text-white dark:text-slate-900 hover:scale-105 active:scale-95 transition-all">
                    <span className="material-symbols-outlined !text-[20px]">download</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">Download</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
               <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[400px] mb-1">{selectedFile.name}</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedFile.size} • {selectedFile.type.toUpperCase()}</p>
            </div>
          </div>
        )}
      </div>

      {/* NOVO: Lightbox Imersivo Externo */}
      {lightboxFile && (
        <ImageLightbox 
          file={lightboxFile} 
          onClose={() => setLightboxFile(null)} 
        />
      )}
    </div>
  );
};

export default FolderExplorerModal;
