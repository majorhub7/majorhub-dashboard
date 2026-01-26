
import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  isHighlighted?: boolean;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isHighlighted = false, onClick }) => {
  const getProgressBarColor = () => {
    if (project.status === 'Revision') return 'bg-accent-gold';
    if (project.status === 'Completed') return 'bg-accent-mint';
    return 'progress-animated';
  };

  const getStatusBadgeStyle = () => {
    if (project.status === 'Revision') return 'bg-accent-gold/20 text-amber-700 dark:text-accent-gold';
    if (project.status === 'Completed') return 'bg-accent-mint/20 text-emerald-700 dark:text-accent-mint';
    return 'bg-primary/15 text-primary';
  };

  return (
    <div
      id={`project-${project.id}`}
      onClick={onClick}
      className={`group relative bg-white dark:bg-surface-elevated-dark rounded-lg overflow-hidden cursor-pointer transition-all duration-500 hover-lift ${isHighlighted
          ? 'ring-2 ring-primary shadow-glow-lg scale-[1.02]'
          : 'border border-border-subtle dark:border-border-subtle-dark shadow-depth-sm hover:shadow-depth'
        }`}
    >
      {/* Image Area with Overlays */}
      <div className="aspect-[1.5/1] overflow-hidden relative">
        <img
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          src={project.imageUrl}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface-dark/50 via-surface-dark/20 to-transparent"></div>

        {/* Status Badge - Top Left */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] rounded-sharp ${getStatusBadgeStyle()}`}>
            {project.statusLabel}
          </span>
        </div>

        {/* Title on Image */}
        <div className="absolute top-12 left-4 right-4 z-10">
          <h4 className="text-xl font-bold text-white leading-tight drop-shadow-lg">{project.title}</h4>
        </div>

        {/* Team Avatars - Bottom Right */}
        <div className="absolute bottom-4 right-4 flex items-center -space-x-2 z-10 group-hover:translate-y-0 transition-transform duration-500">
          {project.team.slice(0, 3).map((avatar, i) => (
            <img
              key={i}
              alt="Team"
              className="size-8 rounded-md border-2 border-white/90 dark:border-surface-dark object-cover shadow-depth-sm transition-transform hover:-translate-y-1 hover:scale-110"
              src={avatar}
            />
          ))}
          {project.team.length > 3 && (
            <div className="size-8 rounded-md bg-surface-dark/80 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white text-[10px] font-bold shadow-depth-sm">
              +{project.team.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-5 py-4 flex items-center justify-between bg-white dark:bg-surface-elevated-dark border-t border-border-subtle/50 dark:border-border-subtle-dark/50">
        <div className="flex items-center gap-4">
          {/* Attachments */}
          <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
            <span className="material-symbols-outlined !text-[16px]">attachment</span>
            <span className="text-xs font-semibold">{project.filesCount}</span>
          </div>

          {/* Priority or Comments */}
          {project.priority ? (
            <div className="flex items-center gap-1.5 text-accent-coral">
              <span className="material-symbols-outlined !text-[16px] animate-pulse">priority_high</span>
              <span className="text-[9px] font-black uppercase tracking-widest">Urgente</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              <span className="material-symbols-outlined !text-[16px]">chat_bubble</span>
              <span className="text-xs font-semibold">{project.commentsCount}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-20 h-1.5 bg-slate-100 dark:bg-surface-dark rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${getProgressBarColor()}`}
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-lg ring-1 ring-primary/20"></div>
    </div>
  );
};

export default ProjectCard;
