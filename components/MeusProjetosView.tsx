
import React, { useState, useRef, useMemo } from 'react';
import { Project, Delivery } from '../types';
import ProjectListRow from './ProjectListRow';

interface MeusProjetosViewProps {
  projects: Project[];
  upcomingDeliveries: Delivery[];
  onUpdateProject: (project: Project) => void;
  onSelectProject: (project: Project) => void;
  isLoading?: boolean;
}

const MeusProjetosView: React.FC<MeusProjetosViewProps> = ({
  projects,
  upcomingDeliveries,
  onUpdateProject,
  onSelectProject,
  isLoading = false
}) => {
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Project['status'] | null>(null);
  const [showGoalWarning, setShowGoalWarning] = useState(false);

  // 🚀 OPTIMISTIC STATE: Armazena mudanças de status temporárias para preview instantâneo
  const [optimisticStatusChanges, setOptimisticStatusChanges] = useState<Record<string, Project['status']>>({});

  const deliveriesCarouselRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProjectId(projectId);
    e.dataTransfer.setData('projectId', projectId);
    e.dataTransfer.effectAllowed = 'move';

    // Adiciona efeito visual de semi-transparência no elemento arrastado
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedProjectId(null);
    setDragOverStatus(null);

    // Remove efeito visual
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, status: Project['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (dragOverStatus !== status) {
      setDragOverStatus(status);
    }
  };

  const handleDrop = (e: React.DragEvent, newStatus: Project['status']) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('projectId') || draggedProjectId;
    setDragOverStatus(null);

    if (!projectId) return;

    const project = projects.find(p => p.id === projectId);
    if (project && project.status !== newStatus) {

      if (newStatus === 'Completed') {
        const hasOpenGoals = project.creativeGoals.some(g => !g.completed);
        if (hasOpenGoals) {
          setShowGoalWarning(true);
          setDraggedProjectId(null);
          return;
        }
      }

      // 🚀 OPTIMISTIC UPDATE: Atualiza UI INSTANTANEAMENTE antes do Supabase responder
      setOptimisticStatusChanges(prev => ({
        ...prev,
        [projectId]: newStatus
      }));

      const statusLabels = {
        'In Progress': 'Em andamento',
        'Revision': 'Revisão Necessária',
        'Completed': 'Concluído'
      };

      // Atualiza no Supabase em background
      onUpdateProject({
        ...project,
        status: newStatus,
        statusLabel: statusLabels[newStatus],
        progress: newStatus === 'Completed' ? 100 : project.progress,
      });

      // Remove o estado otimista após 3 segundos (tempo suficiente para o Supabase sincronizar)
      setTimeout(() => {
        setOptimisticStatusChanges(prev => {
          const updated = { ...prev };
          delete updated[projectId];
          return updated;
        });
      }, 3000);
    }
    setDraggedProjectId(null);
  };

  // 🚀 PROJETOS COM ESTADO OTIMISTA: Aplica mudanças temporárias para preview instantâneo
  const projectsWithOptimisticUpdates = useMemo(() => {
    return projects.map(project => {
      const optimisticStatus = optimisticStatusChanges[project.id];
      if (optimisticStatus) {
        return { ...project, status: optimisticStatus };
      }
      return project;
    });
  }, [projects, optimisticStatusChanges]);

  const groupedProjects = {
    'In Progress': projectsWithOptimisticUpdates.filter(p => p.status === 'In Progress'),
    'Revision': projectsWithOptimisticUpdates.filter(p => p.status === 'Revision'),
    'Completed': projectsWithOptimisticUpdates.filter(p => p.status === 'Completed'),
  };

  return (
    <div className="space-y-12 animate-fade-in relative pb-32">
      {/* Goal Warning Modal */}
      {showGoalWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-surface-dark/70 backdrop-blur-sm" onClick={() => setShowGoalWarning(false)} />
          <div className="relative bg-white dark:bg-surface-elevated-dark p-8 max-w-sm w-full shadow-depth-lg rounded-xl border border-accent-gold/30">
            <div className="size-14 bg-gradient-to-br from-accent-gold to-accent-coral text-white rounded-xl flex items-center justify-center mb-6 mx-auto shadow-glow-sm">
              <span className="material-symbols-outlined !text-[28px]">warning</span>
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-3">Fluxo Interrompido</h4>
            <p className="text-slate-500 dark:text-slate-400 text-center text-sm leading-relaxed mb-6">
              Existem objetivos críticos pendentes. Finalize o fluxo técnico antes da entrega final.
            </p>
            <button
              onClick={() => setShowGoalWarning(false)}
              className="w-full bg-primary text-white py-3.5 text-sm font-bold rounded-lg hover:bg-primary-dark transition-all active:scale-[0.98] btn-glow"
            >
              Ok, Entendi
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Deliveries Section */}
      <section className="bg-white dark:bg-surface-elevated-dark border border-border-subtle dark:border-border-subtle-dark p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-2 rounded-full bg-accent-mint glow-pulse" />
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Próximas Entregas</h3>
        </div>

        <div
          ref={deliveriesCarouselRef}
          className="flex overflow-x-auto gap-3 no-scrollbar scroll-smooth stagger-reveal"
        >
          {upcomingDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              onClick={() => onSelectProject(projects.find(p => p.id === delivery.projectId)!)}
              className={`flex-none w-[220px] px-4 py-3 rounded-lg border-l-4 transition-all cursor-pointer group hover-lift ${delivery.isLate
                ? 'border-l-accent-coral bg-accent-coral/5 dark:bg-accent-coral/10'
                : 'border-l-primary bg-slate-50 dark:bg-surface-dark'
                }`}
            >
              <div className="flex flex-col gap-1.5">
                <span className={`text-[9px] font-bold uppercase tracking-wider ${delivery.isLate ? 'text-accent-coral' : 'text-slate-400'}`}>
                  {delivery.date} {delivery.isLate && '• Atrasado'}
                </span>
                <h4 className="text-[13px] font-semibold text-slate-800 dark:text-white truncate group-hover:text-primary transition-colors">
                  {delivery.title}
                </h4>
              </div>
            </div>
          ))}
          {upcomingDeliveries.length === 0 && (
            <p className="text-xs text-slate-400 py-3">Nenhuma entrega no radar</p>
          )}
        </div>
      </section>

      {/* Project Lists by Status */}
      <div className="space-y-14">
        {(['In Progress', 'Revision', 'Completed'] as const).map((status, idx) => {
          const projectsInStatus = groupedProjects[status];
          const isTarget = dragOverStatus === status;

          return (
            <section
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDrop={(e) => handleDrop(e, status)}
              className={`transition-all duration-300 ${isTarget ? 'bg-primary/[0.02] ring-4 ring-primary/10 p-6 -mx-6 rounded-2xl' : ''}`}
            >
              <div className="flex items-center gap-4 mb-8 border-b border-slate-50 dark:border-slate-800/50 pb-4">
                <h3 className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-[0.4em]">
                  {status === 'In Progress' ? 'Em Produção' : (status === 'Revision' ? 'Revisão Necessária' : 'Concluídos')}
                </h3>
                <span className="text-[11px] font-black text-slate-300 dark:text-slate-700 ml-auto">
                  {projectsInStatus.length} Projetos
                </span>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 w-full bg-slate-50 dark:bg-slate-900 rounded-lg animate-pulse border border-slate-100 dark:border-slate-800" />
                  ))
                ) : projectsInStatus.map((project, pIdx) => (
                  <div
                    key={project.id}
                    className="animate-fade-in"
                    style={{
                      animationDelay: `${pIdx * 50}ms`,
                      animationDuration: '300ms',
                      animationFillMode: 'both'
                    }}
                  >
                    <ProjectListRow
                      project={project}
                      isDragging={draggedProjectId === project.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onClick={() => onSelectProject(project)}
                    />
                  </div>
                ))}

                {!isLoading && projectsInStatus.length === 0 && (
                  <div className="p-12 border-2 border-dashed border-slate-100 dark:border-slate-800/60 flex flex-col items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-widest gap-4 opacity-40" style={{ borderRadius: '8px' }}>
                    <span className="material-symbols-outlined !text-[32px]">inventory_2</span>
                    Fase Limpa
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default MeusProjetosView;
