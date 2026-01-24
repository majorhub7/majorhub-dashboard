import React from 'react';
import { Project } from '../types';

interface ProjectGridCardProps {
    project: Project;
    isDragging?: boolean;
    onDragStart: (e: React.DragEvent, projectId: string) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onClick: () => void;
}

const ProjectGridCard: React.FC<ProjectGridCardProps> = React.memo(({
    project,
    isDragging,
    onDragStart,
    onDragEnd,
    onClick
}) => {
    const getStatusColor = () => {
        if (project.status === 'Revision') return 'text-amber-400';
        if (project.status === 'Completed') return 'text-acid-green';
        return 'text-primary';
    };

    const getStatusBg = () => {
        if (project.status === 'Revision') return 'bg-amber-400/10';
        if (project.status === 'Completed') return 'bg-acid-green/10';
        return 'bg-primary/10';
    };

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, project.id)}
            onDragEnd={onDragEnd}
            onClick={onClick}
            className={`group relative flex flex-col bg-white dark:bg-slate-900 border-2 transition-all duration-500 cursor-grab active:cursor-grabbing overflow-hidden shadow-2xl hover:shadow-primary/10 animate-fade-in ${isDragging
                    ? 'opacity-40 border-primary border-dashed scale-95'
                    : 'border-slate-100 dark:border-slate-800/80 hover:border-primary/50 hover:-translate-y-2'
                }`}
            style={{ borderRadius: '2px' }}
        >
            {/* Visual Header */}
            <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
                <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

                {/* Progress Overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] font-black text-white uppercase tracking-[0.2em]">
                        <span>Progresso</span>
                        <span>{project.progress}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/20 backdrop-blur-md overflow-hidden" style={{ borderRadius: '1px' }}>
                        <div
                            className={`h-full transition-all duration-1000 ease-out ${project.status === 'Completed' ? 'bg-acid-green' : 'bg-primary'}`}
                            style={{ width: `${project.progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1">
                            {project.tags[0] || 'Criação Digital'}
                        </p>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight truncate group-hover:text-primary transition-colors">
                            {project.title}
                        </h4>
                    </div>
                    <div className={`px-3 py-1.5 ${getStatusBg()} ${getStatusColor()} text-[9px] font-black uppercase tracking-widest`} style={{ borderRadius: '2px' }}>
                        {project.statusLabel || project.status}
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                    <div className="flex -space-x-3">
                        {project.team.slice(0, 3).map((avatar, idx) => (
                            <div key={idx} className="size-9 border-2 border-white dark:border-slate-900 overflow-hidden shadow-lg transform transition-transform group-hover:scale-110" style={{ borderRadius: '2px', transitionDelay: `${idx * 50}ms` }}>
                                <img src={avatar} className="w-full h-full object-cover grayscale group-hover:grayscale-0" alt="Team" />
                            </div>
                        ))}
                        {project.team.length > 3 && (
                            <div className="size-9 bg-slate-50 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-black text-slate-400" style={{ borderRadius: '2px' }}>
                                +{project.team.length - 3}
                            </div>
                        )}
                    </div>

                    <button className="size-10 flex items-center justify-center text-slate-300 hover:text-primary transition-all hover:rotate-90">
                        <span className="material-symbols-outlined !text-[20px]">add_circle</span>
                    </button>
                </div>
            </div>

            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center">
                <div className="absolute top-2 right-2 size-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
        </div>
    );
});

export default ProjectGridCard;
