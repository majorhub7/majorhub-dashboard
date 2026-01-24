import React from 'react';
import { Project } from '../types';

interface ProjectListRowProps {
    project: Project;
    isDragging?: boolean;
    onDragStart: (e: React.DragEvent, projectId: string) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onClick: () => void;
}

const ProjectListRow: React.FC<ProjectListRowProps> = React.memo(({
    project,
    isDragging,
    onDragStart,
    onDragEnd,
    onClick
}) => {
    const getProgressBarColor = () => {
        if (project.status === 'Revision') return 'bg-amber-400';
        if (project.status === 'Completed') return 'bg-acid-green';
        return 'bg-primary';
    };

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, project.id)}
            onDragEnd={onDragEnd}
            onClick={onClick}
            className={`group flex flex-col md:flex-row items-center gap-6 p-4 bg-white dark:bg-slate-900 border-2 transition-all duration-300 cursor-grab active:cursor-grabbing hover:shadow-xl hover:shadow-primary/5 animate-fade-in ${isDragging
                ? 'opacity-40 border-primary border-dashed scale-[0.98]'
                : 'border-slate-100 dark:border-slate-800/80 hover:border-primary/50 hover:-translate-y-1'
                }`}
            style={{ borderRadius: '8px' }}
        >
            {/* Thumbnail + Title Group */}
            <div className="flex items-center gap-5 flex-1 w-full">
                <div className="size-12 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 relative group/img" style={{ borderRadius: '4px' }}>
                    <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover grayscale transition-all duration-500 group-hover/img:scale-110 group-hover/img:grayscale-0"
                    />
                </div>
                <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-0.5">
                        {project.tags[0] || 'Geral'}
                    </p>
                    <h4 className="text-[15px] font-black text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                        {project.title}
                    </h4>
                </div>
            </div>

            {/* Progress Group */}
            <div className="flex flex-col gap-2.5 w-full md:w-64">
                <div className="flex items-center justify-between text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                    <span>Fluxo Técnico</span>
                    <span>{project.progress}%</span>
                </div>
                <div className="h-1 w-full bg-slate-50 dark:bg-slate-950 overflow-hidden" style={{ borderRadius: '4px' }}>
                    <div
                        className={`h-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.1)] ${getProgressBarColor()}`}
                        style={{ width: `${project.progress}%` }}
                    />
                </div>
            </div>

            {/* Team + Metadata Group */}
            <div className="flex items-center justify-between w-full md:w-auto gap-10">
                <div className="flex -space-x-3">
                    {project.team.slice(0, 3).map((avatar, idx) => (
                        <div
                            key={idx}
                            className="size-9 border-2 border-white dark:border-slate-900 overflow-hidden shadow-sm transition-transform group-hover:scale-105"
                            style={{ borderRadius: '4px', transitionDelay: `${idx * 40}ms` }}
                        >
                            <img src={avatar} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt="Membro" />
                        </div>
                    ))}
                    {project.team.length > 3 && (
                        <div className="size-9 bg-slate-50 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-black text-slate-400" style={{ borderRadius: '2px' }}>
                            +{project.team.length - 3}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <div className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${project.status === 'Completed' ? 'bg-acid-green/10 text-acid-green' : (project.status === 'Revision' ? 'bg-amber-400/10 text-amber-400' : 'bg-primary/10 text-primary')
                        }`} style={{ borderRadius: '4px' }}>
                        {project.statusLabel || project.status}
                    </div>
                    <button className="p-2 text-slate-200 hover:text-primary transition-all hover:rotate-90">
                        <span className="material-symbols-outlined !text-[20px]">more_vert</span>
                    </button>
                </div>
            </div>

        </div>
    );
});

export default ProjectListRow;
