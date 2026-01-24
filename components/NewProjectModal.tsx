
import React, { useState, useRef } from 'react';
import { User, ClientAccount, Project } from '../types';
import RichTextEditor from './RichTextEditor';

interface NewProjectModalProps {
  onClose: () => void;
  onCreate: (project: Project) => void;
  currentUser: User;
  currentClient: ClientAccount;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({
  onClose,
  onCreate,
  currentUser,
  currentClient
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>(['CAMPANHA']);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newProject: Project = {
      id: Date.now().toString(),
      clientId: currentClient.id,
      title: title,
      description: description || 'Nenhuma descrição fornecida.',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop',
      status: 'In Progress',
      statusLabel: 'Em andamento',
      tags: tags,
      dueDate: dueDate || 'A definir',
      dueDateLabel: 'Prazo pendente',
      progress: 0,
      commentsCount: 0,
      filesCount: 0,
      team: [currentUser.avatarUrl],
      creativeGoals: [],
      activities: [
        {
          id: 'act-1',
          userName: currentUser.name,
          type: 'system',
          content: `criou o projeto para ${currentClient.name}`,
          timestamp: new Date().toISOString(),
          systemIcon: 'rocket_launch'
        }
      ]
    };

    onCreate(newProject);
  };

  const availableTags = ['CAMPANHA', 'BRANDING', 'VÍDEO', 'DESIGN', 'SOCIAL MEDIA', 'UI/UX'];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 md:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-scale-up border border-white/10 max-h-[90vh]">

        <header className="p-6 md:p-10 pb-4 flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <img src={currentClient.logoUrl} className="size-3.5 md:size-4 object-contain filter grayscale opacity-50" alt="" />
              <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{currentClient.name}</span>
            </div>
            <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">Novo Projeto</h2>
          </div>
          <button onClick={onClose} className="size-9 md:size-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:text-slate-600 transition-colors shrink-0">
            <span className="material-symbols-outlined !text-[18px] md:!text-[22px]">close</span>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 pt-2 space-y-6 md:space-y-8">

          {/* Capa do Projeto */}
          <div className="space-y-3">
            <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Identidade Visual</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative h-32 md:h-40 rounded-2xl md:rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer group hover:border-primary/50 transition-all"
            >
              {imageUrl ? (
                <img src={imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Capa" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-2 md:gap-3">
                  <span className="material-symbols-outlined !text-[28px] md:!text-[32px]">add_a_photo</span>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Upload da Capa</span>
                </div>
              )}
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Título do Projeto</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Campanha de Lançamento"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl md:rounded-2xl py-3.5 md:py-4 px-5 md:px-6 text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none dark:text-white"
            />
          </div>

          {/* Descrição / Briefing */}
          <div className="space-y-2">
            <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Briefing Inicial</label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Objetivos principais deste projeto..."
              minHeight="100px"
            />
          </div>

          {/* Tags / Categorias */}
          <div className="space-y-3">
            <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Categorias</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3.5 md:px-4 py-1.5 md:py-2 rounded-full text-[8px] md:text-[9px] font-black tracking-widest transition-all ${tags.includes(tag)
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 md:pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end gap-4 md:gap-6 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Descartar
            </button>
            <button
              type="submit"
              className="bg-primary text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
            >
              Lançar Projeto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectModal;
