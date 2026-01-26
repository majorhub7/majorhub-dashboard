
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { User, Project, TeamMember, CreativeGoal, ProjectActivity, Document } from '../types';
import { TEAM_MEMBERS } from '../constants';
import GoalDetailsModal from './GoalDetailsModal';
import { useProjectDetails } from '../hooks/useProjectDetails';
import { useProjectInvites } from '../hooks/useProjectInvites';
import RichTextEditor from './RichTextEditor';
import { marked } from 'marked';

// Optimized sub-components
import ProjectTimeline from './ProjectDetails/Timeline';
import CreativeGoals from './ProjectDetails/CreativeGoals';
import AssetsSection from './ProjectDetails/Assets';
import AIChatPanel from './AIChatPanel';
import { geminiService } from '../services/gemini';

interface ProjectDetailsModalProps {
  project: Project;
  onClose: () => void;
  onUpdate: (project: Project) => void;
  onDelete?: (projectId: string) => Promise<void>;
  currentUser: User;
  onAddGoal?: (projectId: string, goal: any) => Promise<void>;
  onUpdateGoal?: (goalId: string, updates: any) => Promise<void>;
  onDeleteGoal?: (goalId: string, projectId: string) => Promise<void>;
  onAddActivity?: (projectId: string, activity: any) => Promise<void>;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  onClose,
  onUpdate,
  onDelete,
  currentUser,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAddActivity
}) => {
  const [newGoalText, setNewGoalText] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [showGoalWarning, setShowGoalWarning] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<CreativeGoal | null>(null);

  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<'timeline' | 'ai'>('timeline');
  const [showInviteCopied, setShowInviteCopied] = useState(false);

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isSavingDesc, setIsSavingDesc] = useState(false);
  const [isAnalyzingBriefing, setIsAnalyzingBriefing] = useState(false);
  const [tempDesc, setTempDesc] = useState(project.description);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(project.title);

  // Lazy Load Activities (Performance Logic)
  const { activities: fetchedActivities, loading: activitiesLoading, addLocalActivity } = useProjectDetails(project.id);
  const { inviteCodes, createInviteCode } = useProjectInvites(project.clientId);

  const activities = useMemo(() => {
    // Map DbActivity to ProjectActivity
    return fetchedActivities.map(a => ({
      id: a.id,
      userName: a.user_name,
      userAvatar: a.user_avatar || undefined,
      type: a.type as 'comment' | 'system',
      content: a.content,
      timestamp: a.timestamp,
      systemIcon: a.system_icon || undefined
    }));
  }, [fetchedActivities]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activities]); // Scroll when fetched activities change

  // Lógica de deduplicação e processamento das atividades

  const logActivity = async (type: 'comment' | 'system', content: string, systemIcon?: string) => {
    if (onAddActivity) {
      await onAddActivity(project.id, {
        userName: currentUser.name,
        userAvatar: currentUser.avatarUrl,
        type,
        content,
        systemIcon
      });
      // Optimistic upate via local hook state
      // (Actually onAddActivity in useProjects updates the global cache which might not propagate here if we decoupled?)
      // Wait, useProjectDetails refetches? No, we should manually add locally for instant feedback.
      // addLocalActivity needs a DbActivity structure.
      addLocalActivity({
        id: Date.now().toString(),
        project_id: project.id,
        user_name: currentUser.name,
        user_avatar: currentUser.avatarUrl,
        type,
        content,
        timestamp: new Date().toISOString(),
        system_icon: systemIcon
      } as any);

    } else {
      // Fallback for mocked mode
      const activity: ProjectActivity = {
        id: Date.now().toString(),
        userName: currentUser.name,
        userAvatar: type === 'comment' ? currentUser.avatarUrl : undefined,
        type,
        content,
        timestamp: new Date().toISOString(),
        systemIcon
      };
      // We don't have a way to update remote here without prop, so update local project prop?
      // Actually onUpdate updates the parent state.
      onUpdate({
        ...project,
        activities: [...project.activities, activity], // This prop might be stale or empty now.
        commentsCount: type === 'comment' ? project.commentsCount + 1 : project.commentsCount
      });
    }
  };

  const handleSaveDescription = async () => {
    if (tempDesc === project.description) {
      setIsEditingDesc(false);
      return;
    }
    setIsSavingDesc(true);
    try {
      logActivity('system', 'atualizou o briefing do projeto', 'edit_note');
      await onUpdate({ ...project, description: tempDesc });
      setIsEditingDesc(false);
    } catch (err) {
      console.error('Erro ao salvar descrição:', err);
    } finally {
      setIsSavingDesc(false);
    }
  };

  const handleUpdateTitle = async () => {
    if (tempTitle.trim() && tempTitle !== project.title) {
      setIsSavingDesc(true);
      try {
        await onUpdate({ ...project, title: tempTitle });
        logActivity('system', `renomeou o projeto para "${tempTitle}"`, 'edit');
      } catch (err) {
        console.error('Erro ao atualizar título:', err);
      } finally {
        setIsSavingDesc(false);
      }
    }
    setIsEditingTitle(false);
  };

  const handleAnalyzeBriefing = async () => {
    if (!project.description || isAnalyzingBriefing) return;
    setIsAnalyzingBriefing(true);
    try {
      const suggestion = await geminiService.analyzeBriefing(project.description);
      if (suggestion) {
        // Log AI recommendation as a system comment
        await logActivity('system', `A IA sugeriu melhorias no briefing: ${suggestion}`, 'smart_toy');
        setShowChatPanel(true);
        setActiveSidePanel('ai');
      }
    } catch (err) {
      console.error('Erro ao analisar briefing:', err);
    } finally {
      setIsAnalyzingBriefing(false);
    }
  };


  const handleUpdateCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      onUpdate({ ...project, imageUrl: base64 });
      logActivity('system', 'alterou a foto de capa do projeto', 'image');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = () => {
    onUpdate({ ...project, imageUrl: '' });
    logActivity('system', 'removeu a foto de capa do projeto', 'hide_image');
  };


  const handleSendComment = () => {
    if (!newComment.trim()) return;
    logActivity('comment', newComment);
    setNewComment('');
  };

  const toggleGoal = async (goalId: string) => {
    const goal = project.creativeGoals.find(g => g.id === goalId);
    if (!goal) return;

    if (onUpdateGoal) {
      await onUpdateGoal(goalId, {
        completed: !goal.completed,
        status: !goal.completed ? 'Concluído' : 'Pendente'
      });
      logActivity('system', `${!goal.completed ? 'concluiu' : 'desmarcou'} a entrega: ${goal.text}`, 'task_alt');
    } else {
      const updatedGoals = project.creativeGoals.map(g =>
        g.id === goalId ? {
          ...g,
          completed: !g.completed,
          status: !g.completed ? 'Concluído' : 'Pendente'
        } : g
      );
      const completedCount = updatedGoals.filter(g => g.completed).length;
      const newProgress = Math.round((completedCount / updatedGoals.length) * 100);
      logActivity('system', `${!goal.completed ? 'concluiu' : 'desmarcou'} a entrega: ${goal.text}`, 'task_alt');
      onUpdate({ ...project, creativeGoals: updatedGoals as CreativeGoal[], progress: newProgress });
    }
  };

  const updateGoalDetails = async (updatedGoal: CreativeGoal) => {
    if (onUpdateGoal) {
      await onUpdateGoal(updatedGoal.id, {
        text: updatedGoal.text,
        description: updatedGoal.description,
        status: updatedGoal.status,
        type: updatedGoal.type,
        due_date: updatedGoal.dueDate,
        responsible_id: updatedGoal.responsibleId,
        internal_checklist: updatedGoal.internalChecklist
      });
      setSelectedGoal(updatedGoal);
    } else {
      const updatedGoals = project.creativeGoals.map(g => g.id === updatedGoal.id ? updatedGoal : g);
      const completedCount = updatedGoals.filter(g => g.completed).length;
      const newProgress = Math.round((completedCount / updatedGoals.length) * 100);
      onUpdate({ ...project, creativeGoals: updatedGoals as CreativeGoal[], progress: newProgress });
      setSelectedGoal(updatedGoal);
    }
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newDoc: Document = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type.includes('image') ? 'image' : (file.type.includes('pdf') ? 'pdf' : 'image'),
      url: '#',
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    };
    onUpdate({
      ...project,
      documents: [...(project.documents || []), newDoc],
      filesCount: (project.filesCount || 0) + 1
    });
    logActivity('system', `subiu o arquivo: ${file.name}`, 'upload_file');
  };

  const addGoal = async () => {
    if (!newGoalText.trim()) return;

    if (onAddGoal) {
      await onAddGoal(project.id, {
        text: newGoalText,
        completed: false,
        status: 'Pendente',
        type: 'design',
        responsible_id: currentUser.id
      });
      logActivity('system', `adicionou uma nova sub-entrega: ${newGoalText}`, 'add_task');
      setNewGoalText('');
      setIsAddingGoal(false);
    } else {
      const newGoal: CreativeGoal = {
        id: Date.now().toString(),
        text: newGoalText,
        completed: false,
        status: 'Pendente',
        type: 'design',
        dueDate: undefined,
        responsibleId: currentUser.id
      };
      const updatedGoals = [...project.creativeGoals, newGoal];
      logActivity('system', `adicionou uma nova sub-entrega: ${newGoalText}`, 'add_task');
      onUpdate({
        ...project,
        creativeGoals: updatedGoals as CreativeGoal[],
        progress: Math.round((updatedGoals.filter(g => g.completed).length / updatedGoals.length) * 100)
      });
      setNewGoalText('');
      setIsAddingGoal(false);
    }
  };

  const updateStatus = (newStatus: Project['status']) => {
    if (newStatus === 'Completed') {
      const hasOpenGoals = project.creativeGoals.some(g => !g.completed);
      if (hasOpenGoals) {
        setShowGoalWarning(true);
        return;
      }
    }

    const statusLabels = {
      'In Progress': 'Em andamento',
      'Revision': 'Revisão Necessária',
      'Completed': 'Concluído'
    };
    logActivity('system', `alterou o status do projeto para ${statusLabels[newStatus]}`, 'sync');
    onUpdate({ ...project, status: newStatus, statusLabel: statusLabels[newStatus] });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getResponsible = (id?: string) => TEAM_MEMBERS.find(m => m.id === id);

  const getTitleFontSize = (text: string) => {
    if (text.length > 30) return 'text-2xl md:text-3xl';
    if (text.length > 20) return 'text-3xl md:text-4xl';
    return 'text-4xl md:text-6xl';
  };

  // Swipe to close logic
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartY.current;

    // Only allow dragging down
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 150) { // Threshold to close
      onClose();
    } else {
      setDragY(0); // Reset position
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />

      <div
        ref={modalRef}
        style={{ transform: `translateY(${dragY}px)`, transition: isDragging ? 'none' : 'transform 0.3s ease-out' }}
        className={`relative w-full ${showChatPanel ? 'max-w-[1200px]' : 'max-w-[800px]'} h-[95vh] md:h-[90vh] bg-white dark:bg-slate-950 rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row animate-slide-up border border-slate-200 dark:border-slate-800 touch-none`}
      >

        {/* Indicador para Abaixar (Mobile Handle) */}
        <div
          className="md:hidden flex justify-center pt-4 pb-2 shrink-0 bg-white dark:bg-slate-950 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>

        {/* Lado Esquerdo: Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950 flex flex-col">
          {/* Banner Superior */}
          <div className="relative h-48 md:h-72 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0 group border-b border-slate-100 dark:border-slate-800 shadow-sm">
            {project.imageUrl ? (
              <>
                <img src={project.imageUrl} alt="Capa" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />

                {/* Banner Actions (Moved to Top-Left to avoid conflict) */}
                <div className="absolute top-6 left-8 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0 z-30">
                  <label className="flex items-center gap-2 bg-white/95 hover:bg-white text-slate-900 px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.15em] cursor-pointer shadow-2xl transition-all active:scale-95 backdrop-blur-md border border-white/20">
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpdateCover} />
                    <span>Alterar Capa</span>
                  </label>
                  <button onClick={handleRemoveCover} className="flex items-center gap-2 bg-rose-500/90 hover:bg-rose-500 text-white px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.15em] shadow-2xl transition-all active:scale-95 backdrop-blur-md border border-rose-400/20">
                    <span className="material-symbols-outlined !text-[18px]">delete</span>
                    <span>Remover</span>
                  </button>
                </div>

                <div className="absolute bottom-6 left-8 flex items-center z-10 transition-all duration-500 group-hover:translate-x-1">
                  <div className="flex items-center -space-x-3 bg-white/10 backdrop-blur-xl p-1.5 pr-4 rounded-full border border-white/20 shadow-2xl ring-1 ring-white/10">
                    {project.team.slice(0, 4).map((avatar, i) => (
                      <img key={i} src={avatar} className="size-11 rounded-full border-2 border-white object-cover shadow-lg transition-transform hover:scale-110 hover:z-20 cursor-pointer" alt="Membro" />
                    ))}
                    <button className="size-11 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-90 z-10 hover:shadow-primary/40 group/addbtn">
                      <span className="material-symbols-outlined !text-[20px] font-bold group-hover/addbtn:rotate-90 transition-transform">add</span>
                    </button>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </>
            ) : (
              <label className="absolute inset-0 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group/add">
                <input type="file" className="hidden" accept="image/*" onChange={handleUpdateCover} />
                <div className="size-16 rounded-[2rem] bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-300 group-hover/add:text-primary group-hover/add:scale-110 transition-all duration-500">
                  <span className="material-symbols-outlined !text-[36px]">add_a_photo</span>
                </div>
                <div className="text-center">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] group-hover/add:text-primary transition-colors">Definir Foto de Capa</span>
                </div>
              </label>
            )}

            {/* Floating Chat Button in Banner (Top-Right) */}
            {!showChatPanel && (
              <div className="absolute top-6 right-8 z-50 transition-all duration-300">
                <button
                  onClick={() => { setShowChatPanel(true); setActiveSidePanel('timeline'); }}
                  className="size-11 rounded-2xl bg-white/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-primary shadow-2xl transition-all hover:scale-110 active:scale-95"
                >
                  <span className="material-symbols-outlined !text-[24px]">forum</span>
                </button>
                <button
                  onClick={() => { setShowChatPanel(true); setActiveSidePanel('ai'); }}
                  className="size-11 rounded-2xl bg-white/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-primary shadow-2xl transition-all hover:scale-110 active:scale-95"
                >
                  <span className="material-symbols-outlined !text-[24px]">smart_toy</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-6 md:p-12">
            <header className="mb-14">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-5">
                <span>Painel de Controle do Projeto</span>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10">
                <div className="flex-1 min-w-0">
                  {isEditingTitle ? (
                    <div className="mb-8">
                      <input
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onBlur={handleUpdateTitle}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        autoFocus
                        className={`${getTitleFontSize(tempTitle)} font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] transition-all duration-300 break-words bg-transparent border-b-2 border-primary focus:outline-none w-full`}
                      />
                    </div>
                  ) : (
                    <h2
                      onClick={() => { setIsEditingTitle(true); setTempTitle(project.title); }}
                      className={`${getTitleFontSize(project.title)} font-black text-slate-900 dark:text-white tracking-tighter leading-[1.1] mb-8 transition-all duration-300 break-words cursor-pointer hover:text-primary group`}
                    >
                      {project.title}
                      <span className="ml-3 text-base text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
                    </h2>
                  )}

                  <div className="flex flex-wrap items-center gap-8">
                    <button onClick={() => updateStatus('In Progress')} className="group flex items-center gap-3 transition-all">
                      <span className={`size-2.5 rounded-full transition-all duration-500 ${project.status === 'In Progress' ? 'bg-primary ring-[6px] ring-primary/10' : 'bg-slate-200 dark:bg-slate-700'}`} />
                      <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${project.status === 'In Progress' ? 'text-primary' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}>Em andamento</span>
                    </button>
                    <button onClick={() => updateStatus('Revision')} className="group flex items-center gap-3 transition-all">
                      <span className={`size-2.5 rounded-full transition-all duration-500 ${project.status === 'Revision' ? 'bg-amber-400 ring-[6px] ring-amber-400/10' : 'bg-slate-200 dark:bg-slate-700'}`} />
                      <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${project.status === 'Revision' ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}>Em Revisão</span>
                    </button>
                    <button onClick={() => updateStatus('Completed')} className="group flex items-center gap-3 transition-all">
                      <span className={`size-2.5 rounded-full transition-all duration-500 ${project.status === 'Completed' ? 'bg-[#a3e635] ring-[6px] ring-[#a3e635]/10' : 'bg-slate-200 dark:bg-slate-700'}`} />
                      <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${project.status === 'Completed' ? 'text-[#a3e635]' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}>Concluir</span>
                    </button>

                    {currentUser.accessLevel === 'MANAGER' && (
                      <div className="flex items-center gap-4 ml-auto">
                        <button
                          onClick={async () => {
                            let variable = inviteCodes.find(c => c.project_id === project.id);

                            if (!variable) {
                              // Auto-create a contributor variable if none exists
                              const prefix = project.title.substring(0, 4).replace(/\s/g, '').toUpperCase() || 'PROJ';
                              const random = Math.floor(1000 + Math.random() * 9000);
                              const autoCode = `${prefix}_CONTRIB_${random}`;

                              try {
                                variable = await createInviteCode({
                                  client_id: project.clientId,
                                  project_id: project.id,
                                  variable_code: autoCode,
                                  role: 'CONTRIBUTOR'
                                });
                              } catch (err) {
                                console.error('Failed to auto-create invite variable:', err);
                                alert('Erro ao gerar link de convite. Crie uma variável em Configurações primeiro.');
                                return;
                              }
                            }

                            if (variable) {
                              const inviteLink = `${window.location.origin}/?client_invite=${project.clientId}&variable=${variable.variable_code}`;
                              navigator.clipboard.writeText(inviteLink);
                              setShowInviteCopied(true);
                              setTimeout(() => setShowInviteCopied(false), 2000);
                              logActivity('system', 'copiou o link de convite do projeto', 'link');
                            }
                          }}
                          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group/link"
                        >
                          <span className="material-symbols-outlined !text-[18px]">link</span>
                          <span className="text-[10px] font-black uppercase tracking-widest group-hover/link:underline">
                            {showInviteCopied ? 'Link Copiado!' : 'Copiar Convite'}
                          </span>
                        </button>

                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-2 text-rose-500/40 hover:text-rose-500 transition-colors group/del"
                        >
                          <span className="material-symbols-outlined !text-[18px]">delete</span>
                          <span className="text-[10px] font-black uppercase tracking-widest group-hover/del:underline">Excluir Projeto</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-16 max-w-5xl">
              <section className="animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Briefing Criativo</h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleAnalyzeBriefing}
                      disabled={isAnalyzingBriefing}
                      className="text-[10px] font-bold text-amber-500 uppercase tracking-widest hover:underline transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                      {isAnalyzingBriefing ? 'Analisando...' : (
                        <>
                          <span className="material-symbols-outlined !text-[14px]">auto_awesome</span>
                          Analise com IA
                        </>
                      )}
                    </button>
                    {!isEditingDesc ? (
                      <button onClick={() => { setIsEditingDesc(true); setTempDesc(project.description); }} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline transition-all">
                        Editar Conteúdo
                      </button>
                    ) : (
                      <div className="flex items-center gap-6">
                        <button
                          onClick={handleSaveDescription}
                          disabled={isSavingDesc}
                          className="bg-primary/80 hover:bg-primary text-white px-7 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {isSavingDesc && <div className="size-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                          {isSavingDesc ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                        <button
                          onClick={() => setIsEditingDesc(false)}
                          disabled={isSavingDesc}
                          className="text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-30"
                        >
                          Descartar
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`relative rounded-[2rem] border transition-all duration-300 ${isEditingDesc ? 'border-primary/30 ring-4 ring-primary/5 shadow-2xl bg-white dark:bg-slate-900' : 'border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40 shadow-sm'}`}>
                  <div className="p-6 md:p-8">
                    {isEditingDesc ? (
                      <RichTextEditor
                        value={tempDesc}
                        onChange={setTempDesc}
                        placeholder="Descreva o briefing detalhado do projeto..."
                        minHeight="200px"
                      />
                    ) : (
                      <div className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px] font-medium prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(project.description || "Nenhuma descrição definida.") as string }} />
                    )}
                  </div>
                </div>
              </section>

              <CreativeGoals
                goals={project.creativeGoals}
                progress={project.progress}
                currentUser={currentUser}
                onToggleGoal={toggleGoal}
                onSelectGoal={setSelectedGoal}
                onAddGoal={addGoal}
                isAddingGoal={isAddingGoal}
                setIsAddingGoal={setIsAddingGoal}
                newGoalText={newGoalText}
                setNewGoalText={setNewGoalText}
                getResponsible={getResponsible}
              />

              <AssetsSection
                documents={project.documents || []}
                onUploadFile={handleUploadFile}
              />
            </div>
          </div>
        </div>

        {/* Lado Direito: Colaboração & Timeline */}
        <div className={`hidden md:flex bg-slate-50 dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 flex-col relative overflow-hidden transition-all duration-500 ease-in-out ${showChatPanel ? 'w-[350px] opacity-100' : 'w-0 opacity-0'}`}>
          <div className="p-8 pb-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveSidePanel('timeline')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeSidePanel === 'timeline' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Histórico
              </button>
              <button
                onClick={() => setActiveSidePanel('ai')}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeSidePanel === 'ai' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Assistente IA
              </button>
            </div>
            <button onClick={() => setShowChatPanel(false)} className="size-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-300 hover:text-slate-600 transition-all shadow-sm active:scale-90">
              <span className="material-symbols-outlined !text-[20px]">close</span>
            </button>
          </div>

          {showChatPanel && (
            activeSidePanel === 'timeline' ? (
              <>
                <ProjectTimeline
                  activities={activities}
                  currentUser={currentUser}
                  formatTime={formatTime}
                  loading={activitiesLoading}
                />

                <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                  <div className="relative flex items-center gap-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[1.75rem] p-2.5 shadow-inner group focus-within:border-primary/30 transition-all">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                      placeholder="Escreva um comentário ou atualização..."
                      className="flex-1 bg-transparent border-none py-2 px-4 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-0 placeholder:text-slate-300"
                    />
                    <button
                      onClick={handleSendComment}
                      disabled={!newComment.trim()}
                      className={`size-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${newComment.trim()
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-200 dark:text-slate-700 cursor-not-allowed'
                        }`}
                    >
                      <span className="material-symbols-outlined !text-[20px]">send</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <AIChatPanel
                project={project}
                currentUser={currentUser}
                onClose={() => setShowChatPanel(false)}
              />
            )
          )}
        </div>

        {/* Botão para fechar modal (moved outside chat panel) */}
        <button onClick={onClose} className="absolute top-6 right-6 md:hidden size-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all shadow-sm active:scale-90 z-30">
          <span className="material-symbols-outlined !text-[20px]">close</span>
        </button>
      </div>

      {/* Modal de Detalhes do Objetivo Criativo */}
      {
        selectedGoal && (
          <GoalDetailsModal
            project={project}
            goal={selectedGoal}
            onClose={() => setSelectedGoal(null)}
            onUpdateGoal={updateGoalDetails}
          />
        )
      }

      {/* Popup de Aviso para Objetivos Abertos */}
      {
        showGoalWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowGoalWarning(false)} />
            <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] p-8 md:p-10 max-w-sm w-full shadow-2xl animate-scale-up border border-slate-100 dark:border-slate-800">
              <div className="size-16 rounded-3xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 mb-6 mx-auto">
                <span className="material-symbols-outlined !text-[32px]">warning</span>
              </div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white text-center mb-3">Objetivos Pendentes</h4>
              <p className="text-slate-500 dark:text-slate-400 text-center text-sm leading-relaxed mb-8">
                Você não pode concluir este projeto enquanto houver <span className="text-slate-900 dark:text-slate-200 font-bold">objetivos criativos em aberto</span>. Finalize todas as sub-entregas primeiro.
              </p>
              <button
                onClick={() => setShowGoalWarning(false)}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all active:scale-95"
              >
                Entendido
              </button>
            </div>
          </div>
        )
      }

      {/* Modal de Confirmação de Exclusão de Projeto */}
      {
        showDeleteConfirm && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => !isDeletingProject && setShowDeleteConfirm(false)} />
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-rose-100 dark:border-rose-900/30 animate-scale-up">
              <div className="size-20 rounded-3xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500 mb-8 mx-auto shadow-inner">
                <span className="material-symbols-outlined !text-[40px]">delete_forever</span>
              </div>

              <h4 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-4 text-balance">Deseja realmente apagar este projeto?</h4>
              <p className="text-slate-500 dark:text-slate-400 text-center text-sm leading-relaxed mb-8">
                Esta ação removerá permanentemente o projeto <span className="text-slate-900 dark:text-white font-black">"{project.title}"</span>, todas as suas sub-entregas, arquivos e histórico.
              </p>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirme digitando o nome do projeto:</label>
                  <input
                    type="text"
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder={project.title}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-200 transition-all dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={async () => {
                      if (confirmName !== project.title || !onDelete) return;
                      setIsDeletingProject(true);
                      try {
                        await onDelete(project.id);
                        onClose(); // Fecha o modal de detalhes após a exclusão
                      } catch (err) {
                        console.error(err);
                        alert('Erro ao excluir projeto');
                      } finally {
                        setIsDeletingProject(false);
                      }
                    }}
                    disabled={confirmName !== project.title || isDeletingProject}
                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${confirmName === project.title && !isDeletingProject
                      ? 'bg-rose-500 text-white shadow-rose-500/20 hover:scale-[1.02] active:scale-95'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed shadow-none'
                      }`}
                  >
                    {isDeletingProject ? 'Excluindo...' : 'Confirmar Exclusão'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setConfirmName('');
                    }}
                    disabled={isDeletingProject}
                    className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default ProjectDetailsModal;
