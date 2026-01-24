
import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  isHighlighted?: boolean;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isHighlighted = false, onClick }) => {
  const getProgressBarColor = () => {
    if (project.status === 'Revision') return 'bg-amber-400';
    if (project.status === 'Completed') return 'bg-[#a3e635]';
    return 'bg-primary';
  };

  return (
    <div 
      id={`project-${project.id}`}
      onClick={onClick}
      className={`group relative bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border cursor-pointer transition-all duration-500 ${
        isHighlighted 
          ? 'border-primary ring-4 ring-primary/20 shadow-[0_32px_64px_-16px_rgba(139,92,246,0.3)] scale-[1.02]' 
          : 'border-slate-100 dark:border-slate-800 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)] shadow-[0_8px_30px_rgba(0,0,0,0.04)]'
      }`}
    >
      {/* Área da Imagem com Overlays */}
      <div className="aspect-[1.4/1] overflow-hidden relative">
        <img
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          src={project.imageUrl}
        />
        
        {/* Overlay Gradiente para legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-transparent"></div>
        
        {/* Badge de Status no Topo Esquerdo */}
        <div className="absolute top-6 left-6 z-10">
          <span className="px-3 py-1 bg-black/10 backdrop-blur-md text-[9px] font-bold text-white/90 uppercase tracking-[0.15em] rounded-md">
            {project.statusLabel}
          </span>
        </div>

        {/* Título sobre a imagem */}
        <div className="absolute top-14 left-6 z-10 pr-6">
          <h4 className="text-2xl font-bold text-white leading-tight">{project.title}</h4>
        </div>

        {/* Equipe no Rodapé da Imagem */}
        <div className="absolute bottom-6 right-6 flex items-center -space-x-2.5 z-10 group-hover:translate-y-0.5 transition-transform duration-500">
          {project.team.slice(0, 3).map((avatar, i) => (
            <img
              key={i}
              alt="Team"
              className="size-9 rounded-full border-2 border-white/90 dark:border-slate-900 object-cover shadow-xl transition-transform hover:-translate-y-1.5"
              src={avatar}
            />
          ))}
          {project.team.length > 3 && (
            <div className="size-9 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white text-[10px] font-black shadow-xl">
              +{project.team.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Rodapé de Informações */}
      <div className="px-7 py-6 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-5">
          {/* Anexos */}
          <div className="flex items-center gap-2 text-slate-400">
            <span className="material-symbols-outlined !text-[18px]">attachment</span>
            <span className="text-xs font-bold leading-none">{project.filesCount}</span>
          </div>

          {/* Comentários ou Urgente */}
          {project.priority ? (
            <div className="flex items-center gap-2 text-rose-500">
              <span className="material-symbols-outlined !text-[18px] font-black">priority_high</span>
              <span className="text-[10px] font-black uppercase tracking-widest">URGENTE</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <span className="material-symbols-outlined !text-[18px]">chat_bubble</span>
              <span className="text-xs font-bold leading-none">{project.commentsCount}</span>
            </div>
          )}
        </div>

        {/* Barra de Progresso à Direita */}
        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${getProgressBarColor()}`}
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
