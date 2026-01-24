
import React, { useState, useMemo } from 'react';
import { Project, Document } from '../types';
import FolderExplorerModal from './FolderExplorerModal';
import ImageLightbox from './ImageLightbox';

interface BibliotecaViewProps {
  projects: Project[];
}

type FileFilter = 'Todos' | 'Imagens' | 'Documentos' | 'Vídeos' | 'Áudio';
type ViewMode = 'grid' | 'list';

const BibliotecaView: React.FC<BibliotecaViewProps> = ({ projects }) => {
  const [activeFilter, setActiveFilter] = useState<FileFilter>('Todos');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [explorerProject, setExplorerProject] = useState<Project | null>(null);
  const [lightboxFile, setLightboxFile] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filters: FileFilter[] = ['Todos', 'Imagens', 'Documentos', 'Vídeos', 'Áudio'];

  const folderColors = [
    'bg-blue-50 border-blue-100 text-blue-500',
    'bg-rose-50 border-rose-100 text-rose-500',
    'bg-emerald-50 border-emerald-100 text-emerald-500',
    'bg-amber-50 border-amber-100 text-amber-500',
  ];

  const allFiles = useMemo(() => {
    const files: (Document & { projectName: string; projectId: string })[] = [];
    projects.forEach(project => {
      // Arquivos do projeto
      const projectDocs = project.documents || [];
      projectDocs.forEach(doc => {
        files.push({ ...doc, projectName: project.title, projectId: project.id });
      });

      // Arquivos das metas do projeto
      project.creativeGoals.forEach(goal => {
        const goalDocs = goal.documents || [];
        goalDocs.forEach(doc => {
          files.push({ ...doc, projectName: project.title, projectId: project.id });
        });
      });
    });
    return files;
  }, [projects]);

  const filteredFiles = useMemo(() => {
    let list = allFiles;

    if (selectedProjectId) {
      list = list.filter(f => f.projectId === selectedProjectId);
    }

    if (activeFilter !== 'Todos') {
      const typeMap: Record<string, string[]> = {
        'Imagens': ['image'],
        'Documentos': ['pdf', 'figma'],
        'Vídeos': ['video'],
        'Áudio': ['audio']
      };
      list = list.filter(f => typeMap[activeFilter]?.includes(f.type));
    }

    return list;
  }, [allFiles, activeFilter, selectedProjectId]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return 'image';
      case 'pdf': return 'description';
      case 'video': return 'movie';
      case 'figma': return 'design_services';
      default: return 'insert_drive_file';
    }
  };

  const handleFolderClick = (project: Project) => {
    setExplorerProject(project);
  };

  const handleFileClick = (file: Document) => {
    if (file.type === 'image') {
      setLightboxFile(file);
    }
  };

  const ViewToggles = () => (
    <div className="flex items-center gap-2 shrink-0 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
      <button
        onClick={() => setViewMode('grid')}
        className={`p-2 rounded-lg transition-all active:scale-95 flex items-center justify-center ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined !text-[20px]">grid_view</span>
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={`p-2 rounded-lg transition-all active:scale-95 flex items-center justify-center ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400'}`}
      >
        <span className="material-symbols-outlined !text-[20px]">format_list_bulleted</span>
      </button>
    </div>
  );

  const CategoryFilters = () => (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
      {filters.map(filter => (
        <button
          key={filter}
          onClick={() => setActiveFilter(filter)}
          className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border whitespace-nowrap active:scale-95 ${activeFilter === filter
              ? 'bg-primary text-white border-primary shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-primary/30'
            }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );

  return (
    <div className="animate-fade-in space-y-12 pb-20">
      <header className="flex flex-col gap-4">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Biblioteca de Ativos
        </h2>
      </header>

      {/* Seção de Pastas */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Pastas Recentes</h3>
          {selectedProjectId && (
            <button
              onClick={() => setSelectedProjectId(null)}
              className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
            >
              Ver todas as pastas
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((project, idx) => {
            const projectFiles = allFiles.filter(f => f.projectId === project.id);
            const projectFileCount = projectFiles.length;

            return (
              <div
                key={project.id}
                onClick={() => handleFolderClick(project)}
                className={`group p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all duration-500 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:border-primary/20 hover:-translate-y-2`}
              >
                <div className={`size-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-8 shadow-sm text-primary`}>
                  <span className="material-symbols-outlined !text-[28px] group-hover:scale-110 transition-transform">folder</span>
                </div>
                <h4 className={`text-lg font-bold mb-1 truncate text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors`}>
                  {project.title}
                </h4>
                <p className="text-xs font-medium text-slate-400">
                  {projectFileCount} arquivos • {project.filesCount > 0 ? `${(project.filesCount * 1.2).toFixed(1)} MB` : '0 MB'}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Seção de Arquivos */}
      <section>
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 lg:gap-8 overflow-hidden">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Todos os Arquivos</h3>
              <div className="hidden md:block">
                <CategoryFilters />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ViewToggles />
            </div>
          </div>
          <div className="md:hidden">
            <CategoryFilters />
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {filteredFiles.map((file) => (
              <div key={file.id} className="group cursor-pointer" onClick={() => handleFileClick(file)}>
                <div className="aspect-square bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-4 relative flex items-center justify-center transition-all group-hover:shadow-xl group-hover:border-primary/20">
                  {file.type === 'image' ? (
                    <>
                      <img src={file.url === '#' ? 'https://placehold.co/300' : file.url} alt={file.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined !text-[32px] text-white opacity-0 group-hover:opacity-100 transition-opacity">zoom_in</span>
                      </div>
                    </>
                  ) : file.type === 'video' ? (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                      <img src="https://placehold.co/300/1e293b/white?text=Video" className="w-full h-full object-cover opacity-50" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                          <span className="material-symbols-outlined !text-[24px] fill-1">play_arrow</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="size-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        <span className={`material-symbols-outlined !text-[32px] ${file.type === 'pdf' ? 'text-rose-500' : 'text-blue-500'}`}>
                          {getFileIcon(file.type)}
                        </span>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${file.type === 'pdf' ? 'text-rose-500' : 'text-blue-500'}`}>
                        {file.type.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-start justify-between gap-2 px-1">
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary transition-colors">{file.name}</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{file.size} • {file.type.toUpperCase()}</p>
                  </div>
                  <button className="text-slate-300 hover:text-slate-500 transition-colors shrink-0 p-1">
                    <span className="material-symbols-outlined !text-[18px]">more_vert</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ativo</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Projeto</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Criação</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tamanho / Tipo</th>
                    <th className="p-6 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {filteredFiles.map((file) => (
                    <tr
                      key={file.id}
                      onClick={() => handleFileClick(file)}
                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                            {file.type === 'image' ? (
                              <img src={file.url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <span className={`material-symbols-outlined !text-[20px] ${file.type === 'pdf' ? 'text-rose-500' : 'text-blue-500'}`}>
                                {getFileIcon(file.type)}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">{file.name}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined !text-[16px] text-slate-300">folder_open</span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{file.projectName}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="text-xs font-medium text-slate-400">
                          {file.createdAt ? new Date(file.createdAt).toLocaleDateString('pt-BR') : 'Hoje'}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{file.size}</span>
                          <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">{file.type}</span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <button className="text-slate-300 hover:text-slate-500 transition-colors">
                          <span className="material-symbols-outlined !text-[20px]">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredFiles.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4">
            <span className="material-symbols-outlined !text-[48px] opacity-20">inventory_2</span>
            <p className="text-sm font-medium italic">Nenhum arquivo encontrado nesta categoria.</p>
          </div>
        )}
      </section>

      {/* Explorer Modal */}
      {explorerProject && (
        <FolderExplorerModal
          project={explorerProject}
          files={allFiles.filter(f => f.projectId === explorerProject.id)}
          onClose={() => setExplorerProject(null)}
        />
      )}

      {/* Lightbox para imagens */}
      {lightboxFile && (
        <ImageLightbox
          file={lightboxFile}
          onClose={() => setLightboxFile(null)}
        />
      )}
    </div>
  );
};

export default BibliotecaView;
