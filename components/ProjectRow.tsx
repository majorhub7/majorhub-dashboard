
import React from 'react';
import { Project } from '../types';

interface ProjectRowProps {
  project: Project;
  onDragStart: (e: React.DragEvent, projectId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onClick: () => void;
  isDragging?: boolean;
}

const ProjectRow: React.FC<ProjectRowProps> = ({ project, onDragStart, onDragEnd, onClick, isDragging }) => {
  const getProgressBarColor = () => {
    if (project.status === 'Revision') return 'bg-amber-400';
    if (project.status === 'Completed') return 'bg-[#a3e635]';
    return 'bg-primary';
  };

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, project.id)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group flex flex-col md:flex-row items-center gap-6 p-5 bg-white dark:bg-slate-900 rounded-[2rem] border transition-all duration-300 cursor-grab active:cursor-grabbing hover:shadow-xl hover:shadow-primary/5 ${
        isDragging 
          ? 'opacity-40 border-primary border-dashed scale-[0.98]' 
          : 'border-slate-100 dark:border-slate-800/50 hover:-translate-y-1'
      }`}
    >
      <div className="flex items-center gap-4 flex-1 w-full">
        <div className="size-14 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-100 dark:border-slate-800 relative group/img">
          <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
        </div>
        <div className="overflow-hidden">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{project.title}</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{project.tags[0] || 'Geral'}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full md:w-64">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Progresso</span>
          <span>{project.progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${getProgressBarColor()}`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between w-full md:w-auto gap-8">
        <div className="flex -space-x-3">
          {project.team.slice(0, 3).map((avatar, idx) => (
            <img 
              key={idx} 
              src={avatar} 
              className="size-9 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-sm" 
              alt="Membro" 
            />
          ))}
          {project.team.length > 3 && (
            <div className="size-9 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-500">
              +{project.team.length - 3}
            </div>
          )}
        </div>
        <button className="p-2 text-slate-300 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectRow;
