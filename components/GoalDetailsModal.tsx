import React, { useState, useEffect, useRef } from 'react';
import { Project, CreativeGoal, TeamMember, Document, ChecklistItem } from '../types';
import { TEAM_MEMBERS } from '../constants';
import RichTextEditor from './RichTextEditor';
import TextEditorModal from './TextEditorModal';
import { marked } from 'marked';
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface GoalDetailsModalProps {
  project: Project;
  goal: CreativeGoal;
  onClose: () => void;
  onUpdateGoal: (updatedGoal: CreativeGoal) => Promise<void> | void;
}

const GoalDetailsModal: React.FC<GoalDetailsModalProps> = ({
  project,
  goal,
  onClose,
  onUpdateGoal
}) => {
  const [openSections, setOpenSections] = useState<string[]>(['checklist', 'desc']);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempDesc, setTempDesc] = useState(goal.description || '');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [date, setDate] = useState<Date | undefined>(goal.dueDate ? new Date(goal.dueDate) : undefined);
  const [copied, setCopied] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(goal.text);
  const [showTextModal, setShowTextModal] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setEditingField(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const responsible = TEAM_MEMBERS.find(m => m.id === goal.responsibleId);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído': return 'bg-emerald-500 text-white';
      case 'Em Revisão': return 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 ring-4 ring-amber-500/10';
      case 'Em Andamento': return 'bg-primary text-white';
      case 'Pendente': return 'bg-slate-400 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const handleMetadataUpdate = async (updates: Partial<CreativeGoal>) => {
    setIsSaving(true);
    try {
      await onUpdateGoal({ ...goal, ...updates });
      setEditingField(null);
    } catch (err) {
      console.error('Erro ao atualizar objetivo:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    setIsCalendarOpen(false);
    if (newDate) {
      handleMetadataUpdate({ dueDate: newDate.toISOString() });
    } else {
      handleMetadataUpdate({ dueDate: undefined });
    }
  };

  const toggleChecklistItem = (itemId: string) => {
    const updatedChecklist = (goal.internalChecklist || []).map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdateGoal({ ...goal, internalChecklist: updatedChecklist });
  };

  const addChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newChecklistItem,
      completed: false
    };
    onUpdateGoal({
      ...goal,
      internalChecklist: [...(goal.internalChecklist || []), newItem]
    });
    setNewChecklistItem('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newDoc: Document = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type.includes('pdf') ? 'pdf' : 'image',
      url: '#',
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
    };
    onUpdateGoal({
      ...goal,
      documents: [...(goal.documents || []), newDoc]
    });
  };

  const completedCount = (goal.internalChecklist || []).filter(i => i.completed).length;
  const totalCount = (goal.internalChecklist || []).length;

  const handleCopy = async () => {
    try {
      // Limpa o markdown para manter apenas Títulos, Negrito e Listas
      const cleanText = (goal.description || '')
        .replace(/<span style="color: [^"]*">(.*?)<\/span>/gi, '$1') // Remove cores
        .replace(/<u>(.*?)<\/u>/gi, '$1') // Remove sublinhado
        .replace(/_([^_]+)_/g, '$1') // Remove itálico
        .trim();

      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center animate-fade-in p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[650px] h-screen sm:h-auto sm:max-h-[90vh] bg-white dark:bg-slate-900 sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-scale-up border border-slate-100 dark:border-slate-800">

        {/* Header Section */}
        <header className="shrink-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-gray-800 px-8 pt-8 pb-7">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span className="truncate max-w-[120px]">{project.title}</span>
              <span className="material-symbols-outlined !text-[14px]">chevron_right</span>
              <span className="text-primary">CONTEÚDO</span>
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors">
              <span className="material-symbols-outlined !text-[20px]">close</span>
            </button>
          </div>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={async () => {
                  if (tempTitle.trim() && tempTitle !== goal.text) {
                    setIsSaving(true);
                    try {
                      await onUpdateGoal({ ...goal, text: tempTitle });
                    } catch (err) {
                      console.error('Erro ao atualizar título:', err);
                    } finally {
                      setIsSaving(false);
                    }
                  }
                  setIsEditingTitle(false);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                autoFocus
                className="flex-1 text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight bg-transparent border-b-2 border-primary focus:outline-none px-2 py-1"
              />
            </div>
          ) : (
            <h1
              onClick={() => { setIsEditingTitle(true); setTempTitle(goal.text); }}
              className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight cursor-pointer hover:text-primary transition-colors group"
            >
              {goal.text}
              <span className="ml-2 text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
            </h1>
          )}
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">

          {/* Metadata Grid */}
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Status Section */}
            <div className="relative">
              <div
                onClick={() => setEditingField(editingField === 'status' ? null : 'status')}
                className="h-full flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(goal.status).replace('text-white', 'bg-opacity-10 text-current')}`}>
                    <span className="material-symbols-outlined !text-[18px]">
                      {goal.status === 'Concluído' ? 'check_circle' :
                        goal.status === 'Em Andamento' ? 'pending' :
                          goal.status === 'Em Revisão' ? 'rate_review' : 'schedule'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Status Atual</span>
                    <span className={`text-xs font-bold ${goal.status === 'Concluído' ? 'text-emerald-500' :
                      goal.status === 'Em Andamento' ? 'text-primary' :
                        goal.status === 'Em Revisão' ? 'text-amber-500' : 'text-slate-500'
                      }`}>
                      {goal.status}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-gray-300">expand_more</span>
              </div>

              {editingField === 'status' && (
                <div ref={popoverRef} className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 p-2 animate-scale-up">
                  {['Pendente', 'Em Andamento', 'Em Revisão', 'Concluído'].map(s => (
                    <button
                      key={s}
                      onClick={() => handleMetadataUpdate({ status: s as any })}
                      className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-between group"
                    >
                      <span>{s}</span>
                      {goal.status === s && <span className="material-symbols-outlined !text-[16px] text-primary">check</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Prazo Card with DatePicker */}
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <div className="relative group h-full">
                <PopoverTrigger asChild>
                  <div
                    className="h-full flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-white dark:hover:bg-gray-800 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 w-full group/date"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover/date:scale-110 transition-transform duration-300">
                        <span className="material-symbols-outlined !text-[18px]">calendar_month</span>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1 group-hover/date:text-primary transition-colors">Prazo Final</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
                          {date ? format(date, "d 'de' MMMM", { locale: ptBR }) : "Definir Prazo"}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 group-hover/date:text-primary transition-colors">edit_calendar</span>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[90] bg-transparent border-none shadow-none" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                  />
                </PopoverContent>
              </div>
            </Popover>
          </div>

          {/* Collapsible Sections */}
          <div className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">

            {/* Descrição */}
            <div className="group border-b border-gray-100 dark:border-gray-800">
              <div
                onClick={() => toggleSection('desc')}
                className="flex items-center justify-between p-8 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">subject</span>
                  <div className="flex flex-col text-left">
                    <h3 className="text-slate-900 dark:text-white text-sm font-bold">Descrição</h3>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy();
                    }}
                    className={`text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-1.5 ${copied ? 'text-emerald-500' : 'text-slate-400 hover:text-primary'}`}
                  >
                    <span className="material-symbols-outlined !text-[14px]">{copied ? 'check_circle' : 'content_copy'}</span>
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                  {!isEditingDesc && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTextModal(true);
                      }}
                      className="text-[10px] font-black text-primary uppercase tracking-[0.15em] hover:underline transition-all"
                    >
                      Editar
                    </button>
                  )}

                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2" />


                  <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${openSections.includes('desc') ? 'rotate-180' : ''}`}>expand_more</span>
                </div>
              </div>
              {openSections.includes('desc') && (
                <div className="px-8 pb-8 animate-fade-in">
                  {isEditingDesc ? (
                    <div className="space-y-4 pt-4">
                      <RichTextEditor
                        value={tempDesc}
                        onChange={setTempDesc}
                        placeholder="Descreva os detalhes deste objetivo..."
                        minHeight="150px"
                        maxHeight="350px"
                      />
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => setIsEditingDesc(false)}
                          disabled={isSaving}
                          className="px-6 py-2.5 text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest transition-colors disabled:opacity-30"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={async () => {
                            setIsSaving(true);
                            try {
                              await onUpdateGoal({ ...goal, description: tempDesc });
                              setIsEditingDesc(false);
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                          disabled={isSaving}
                          className="bg-primary text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {isSaving && <div className="size-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                          {isSaving ? 'Salvando...' : 'Salvar Conteúdo'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative text-slate-600 dark:text-gray-400 text-sm leading-relaxed pt-4 pb-4">
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none max-h-[250px] overflow-hidden relative"
                        dangerouslySetInnerHTML={{ __html: marked.parse(goal.description || 'Nenhuma descrição fornecida.', { async: false }) as string }}
                      />
                      {/* Gradient Fade Out with Styled Button */}
                      {(goal.description?.length || 0) > 200 && (
                        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 flex items-end justify-center pb-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowTextModal(true);
                            }}
                            className="group relative flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-slate-800 rounded-full shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all duration-300 z-10"
                          >
                            <span className="absolute inset-0 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="material-symbols-outlined !text-[18px] text-primary group-hover:rotate-45 transition-transform duration-300">open_in_full</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">
                              Ler Tudo
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Checklist Interno */}
            <div className="group border-b border-gray-100 dark:border-gray-800">
              <div
                onClick={() => toggleSection('checklist')}
                className="flex items-center justify-between p-8 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">checklist</span>
                  <div className="flex flex-col text-left">
                    <h3 className="text-slate-900 dark:text-white text-sm font-bold">Checklist Interno</h3>
                    <span className="text-[10px] text-primary font-bold">{completedCount}/{totalCount} concluídos</span>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${openSections.includes('checklist') ? 'rotate-180' : ''}`}>expand_more</span>
              </div>
              {openSections.includes('checklist') && (
                <div className="px-8 pb-8 space-y-2 animate-fade-in pt-2">
                  <form onSubmit={addChecklistItem} className="mb-4 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Adicionar nova tarefa..."
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-lg p-3 text-xs font-medium focus:ring-1 focus:ring-primary/30"
                    />
                    <button type="submit" className="bg-primary text-white p-3 rounded-lg hover:scale-105 active:scale-95 transition-all shadow-sm">
                      <span className="material-symbols-outlined !text-[20px]">add</span>
                    </button>
                  </form>

                  <div className="space-y-2">
                    {(goal.internalChecklist || []).map(item => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-3 p-4 rounded-2xl border text-sm transition-all cursor-pointer ${item.completed
                          ? 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10 opacity-75'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:border-primary/30'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleChecklistItem(item.id)}
                          className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary cursor-pointer"
                        />
                        <span className={`font-medium flex-1 ${item.completed ? 'text-gray-400 line-through' : 'text-slate-700 dark:text-gray-200'}`}>
                          {item.text}
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onUpdateGoal({
                              ...goal,
                              internalChecklist: (goal.internalChecklist || []).filter(i => i.id !== item.id)
                            });
                          }}
                          className="text-gray-300 hover:text-rose-500 transition-colors p-1"
                        >
                          <span className="material-symbols-outlined !text-[16px]">delete</span>
                        </button>
                      </label>
                    ))}
                    {totalCount === 0 && (
                      <div className="text-center py-6 text-xs text-gray-400 italic">Sem tarefas pendentes.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Entrega Final */}
            <div className="group">
              <div
                onClick={() => toggleSection('entrega')}
                className="flex items-center justify-between p-8 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gray-400">cloud_done</span>
                  <div className="flex flex-col text-left">
                    <h3 className="text-slate-900 dark:text-white text-sm font-bold">Entrega Final</h3>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium italic">{(goal.documents || []).length} arquivos anexados</span>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${openSections.includes('entrega') ? 'rotate-180' : ''}`}>expand_more</span>
              </div>
              {openSections.includes('entrega') && (
                <div className="px-8 pb-8 space-y-3 animate-fade-in pt-2">
                  {(goal.documents || []).map(doc => (
                    <div key={doc.id} className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-slate-50/50 dark:bg-gray-800/20 group/file hover:bg-white dark:hover:bg-gray-800 transition-all">
                      <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-800 shrink-0 text-primary shadow-sm">
                        <span className="material-symbols-outlined !text-[24px]">{doc.type === 'pdf' ? 'description' : 'image'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{doc.name}</p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">{doc.size}</p>
                      </div>
                      <button className="text-primary p-2 hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined !text-[22px]">download</span>
                      </button>
                    </div>
                  ))}
                  <label className="flex items-center justify-center gap-3 w-full py-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-800 hover:border-primary/30 transition-all text-gray-400">
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                    <span className="material-symbols-outlined !text-[20px]">add</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enviar Novo Arquivo</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="shrink-0 p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-slate-900">
          <p className="text-[10px] text-gray-400 italic text-center uppercase tracking-wider font-medium">
            Última atualização por {responsible?.name || 'Sistema'} há 45 min
          </p>
        </footer>
      </div>

      <TextEditorModal
        isOpen={showTextModal}
        onClose={() => setShowTextModal(false)}
        title="Editar Descrição do Objetivo"
        initialContent={goal.description || ''}
        onSave={async (content) => {
          await onUpdateGoal({ ...goal, description: content });
        }}
      />
    </div>
  );
};

export default GoalDetailsModal;