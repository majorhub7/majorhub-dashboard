import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { useActivities } from '../hooks/useActivities';
import { supabase } from '../services/supabase';

interface PerfilViewProps {
  user: User;
  onUpdateUser: (user: Partial<User>) => Promise<any>;
}

// Componente de Toast para feedback
const Toast: React.FC<{
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-50 animate-slide-in-right flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${type === 'success'
      ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
      : 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
      }`}>
      <span className="material-symbols-outlined !text-[20px]">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      <p className="text-sm font-bold">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined !text-[16px]">close</span>
      </button>
    </div>
  );
};

const PerfilView: React.FC<PerfilViewProps> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User>(user);
  const [newSkill, setNewSkill] = useState('');
  const [newActivityText, setNewActivityText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { activities, addActivity, loading: loadingActivities } = useActivities(user.id);

  // Sincronizar editedUser quando user mudar (ex: após save)
  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const stats = [
    { label: 'Habilidades', value: user.skills?.length || '0', icon: 'auto_awesome', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/50' },
    { label: 'Atividades', value: activities.length.toString(), icon: 'history', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
    { label: 'Local', value: user.location || 'N/A', icon: 'location_on', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/50' },
    { label: 'Papel', value: user.accessLevel, icon: 'shield_person', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/50' },
  ];

  // Upload de imagem para Supabase Storage
  const uploadImage = async (file: File, type: 'avatar' | 'cover'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${type}_${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
        // Fallback para base64 se o storage não estiver configurado
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      console.error('Erro no upload:', err);
      // Fallback para base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await onUpdateUser({
        name: editedUser.name,
        role: editedUser.role,
        bio: editedUser.bio,
        avatarUrl: editedUser.avatarUrl,
        coverUrl: editedUser.coverUrl,
        skills: editedUser.skills,
        location: editedUser.location,
        website: editedUser.website,
      });

      if (result?.error) {
        throw result.error;
      }

      // Registrar atividade de atualização de perfil
      await addActivity({
        description: 'Atualizou as informações do perfil',
        icon: 'person_edit',
        target: 'Perfil'
      });

      setIsEditing(false);
      showToast('Perfil atualizado com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      showToast('Erro ao salvar perfil. Tente novamente.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isAvatar = type === 'avatar';
    if (isAvatar) setIsUploadingAvatar(true);
    else setIsUploadingCover(true);

    try {
      const imageUrl = await uploadImage(file, type);
      if (imageUrl) {
        setEditedUser(prev => ({
          ...prev,
          [type === 'avatar' ? 'avatarUrl' : 'coverUrl']: imageUrl
        }));
        showToast(`${isAvatar ? 'Foto' : 'Capa'} atualizada!`, 'success');
      }
    } catch (err) {
      showToast(`Erro ao fazer upload da ${isAvatar ? 'foto' : 'capa'}`, 'error');
    } finally {
      if (isAvatar) setIsUploadingAvatar(false);
      else setIsUploadingCover(false);
    }
  };

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (editedUser.skills?.includes(newSkill.trim())) {
      showToast('Essa habilidade já foi adicionada', 'error');
      return;
    }
    setEditedUser(prev => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill.trim()]
    }));
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    setEditedUser(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => s !== skillToRemove)
    }));
  };

  const handleAddManualActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityText.trim()) return;

    const { error } = await addActivity({
      description: newActivityText.trim(),
      icon: 'edit_note',
      target: 'Manual'
    });

    if (!error) {
      setNewActivityText('');
      showToast('Atividade registrada!', 'success');
    }
  };

  const formatActivityTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Agora mesmo';
    if (diffHours < 24) return `Há ${diffHours} horas`;
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      {/* Toast de Feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header do Perfil */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
        {/* Capa */}
        <div className="h-36 md:h-52 relative group overflow-hidden">
          {/* Gradiente de fundo */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-violet-500/20 to-fuchsia-500/20" />

          {editedUser.coverUrl && editedUser.coverUrl.trim() !== '' ? (
            <img
              src={editedUser.coverUrl}
              className="w-full h-full object-cover absolute inset-0"
              alt="Cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
          )}

          {/* Overlay de edição */}
          {isEditing && (
            <div
              onClick={() => coverInputRef.current?.click()}
              className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-all ${isUploadingCover ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                }`}
            >
              {isUploadingCover ? (
                <div className="flex items-center gap-3 bg-white/90 px-5 py-3 rounded-2xl shadow-xl">
                  <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-slate-900">Enviando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-white/90 px-5 py-3 rounded-2xl text-xs font-bold text-slate-900 shadow-xl hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined !text-[18px]">photo_camera</span>
                  Alterar Capa
                </div>
              )}
            </div>
          )}
          <input
            ref={coverInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'cover')}
          />
        </div>

        {/* Conteúdo do Header */}
        <div className="px-6 md:px-10 pb-8 flex flex-col md:flex-row md:items-end gap-5 -mt-16 relative z-10">
          {/* Avatar */}
          <div className="size-28 md:size-36 rounded-[2rem] border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden bg-white dark:bg-slate-800 relative group shrink-0">
            <img
              src={editedUser.avatarUrl && editedUser.avatarUrl.trim() !== ''
                ? editedUser.avatarUrl
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=8b5cf6&color=fff&size=150`}
              alt={editedUser.name || 'User'}
              className="w-full h-full object-cover"
            />
            {isEditing && (
              <div
                onClick={() => avatarInputRef.current?.click()}
                className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer transition-all ${isUploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
              >
                {isUploadingAvatar ? (
                  <div className="size-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined !text-[24px] text-white">add_a_photo</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest mt-1 text-white/90">Trocar</span>
                  </>
                )}
              </div>
            )}
            <input
              ref={avatarInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'avatar')}
            />
          </div>

          {/* Informações Principais */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3 max-w-lg">
                <input
                  value={editedUser.name}
                  onChange={e => setEditedUser({ ...editedUser, name: e.target.value })}
                  className="w-full text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none py-1 transition-colors"
                  placeholder="Seu Nome"
                />
                <input
                  value={editedUser.role || ''}
                  onChange={e => setEditedUser({ ...editedUser, role: e.target.value })}
                  className="w-full text-primary font-bold text-sm uppercase tracking-widest bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none py-1 transition-colors"
                  placeholder="Seu Cargo / Função"
                />
                <input
                  value={editedUser.location || ''}
                  onChange={e => setEditedUser({ ...editedUser, location: e.target.value })}
                  className="w-full text-slate-500 dark:text-slate-400 text-sm bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-primary outline-none py-1 transition-colors"
                  placeholder="Localização (ex: São Paulo, SP)"
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {user.name}
                </h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-primary font-bold text-sm uppercase tracking-widest">
                    {user.role || 'Sem cargo definido'}
                  </span>
                  {user.location && (
                    <>
                      <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <span className="text-slate-400 font-medium text-sm flex items-center gap-1">
                        <span className="material-symbols-outlined !text-[14px]">location_on</span>
                        {user.location}
                      </span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-primary text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-xl"
                >
                  {isSaving ? (
                    <>
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined !text-[18px]">check</span>
                      Salvar
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 hover:opacity-90 flex items-center gap-2"
              >
                <span className="material-symbols-outlined !text-[18px]">edit</span>
                Editar Perfil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 text-center group hover:border-primary/20 hover:shadow-lg transition-all"
          >
            <div className={`size-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Grid de Informações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna da Esquerda: Bio e Habilidades */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio */}
          <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined !text-[16px] text-primary">person</span>
                Sobre Mim
              </h3>
            </div>
            {isEditing ? (
              <textarea
                value={editedUser.bio || ''}
                onChange={e => setEditedUser({ ...editedUser, bio: e.target.value })}
                className="w-full text-slate-600 dark:text-slate-300 text-base leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[120px] resize-none transition-all outline-none"
                placeholder="Conte um pouco sobre você, sua experiência e interesses..."
              />
            ) : (
              <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                {user.bio || (
                  <span className="text-slate-400 italic">
                    Nenhuma bio definida. Clique em "Editar Perfil" para adicionar.
                  </span>
                )}
              </p>
            )}
          </section>

          {/* Habilidades */}
          <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined !text-[16px] text-primary">auto_awesome</span>
                Habilidades & Especialidades
              </h3>
              {!isEditing && (editedUser.skills?.length || 0) > 0 && (
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                  {editedUser.skills?.length || 0} habilidades
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(editedUser.skills || []).map(skill => (
                <div key={skill} className="group relative">
                  <span className={`px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold border border-slate-100 dark:border-slate-600 flex items-center gap-2 transition-all ${isEditing ? 'hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50' : ''
                    }`}>
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <span className="material-symbols-outlined !text-[14px]">close</span>
                      </button>
                    )}
                  </span>
                </div>
              ))}
              {isEditing && (
                <form onSubmit={addSkill} className="flex items-center gap-2">
                  <input
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-slate-900 border-2 border-dashed border-primary/30 hover:border-primary/50 focus:border-primary rounded-full text-xs font-bold outline-none text-slate-600 dark:text-slate-300 min-w-[140px] transition-colors"
                    placeholder="Nova habilidade..."
                  />
                  <button
                    type="submit"
                    className="size-9 rounded-full bg-primary text-white flex items-center justify-center shadow-lg active:scale-90 transition-all shrink-0 hover:shadow-xl hover:bg-primary/90"
                  >
                    <span className="material-symbols-outlined !text-[18px]">add</span>
                  </button>
                </form>
              )}
              {!isEditing && (editedUser.skills?.length || 0) === 0 && (
                <p className="text-slate-400 text-sm italic">
                  Nenhuma habilidade adicionada. Clique em "Editar Perfil" para adicionar.
                </p>
              )}
            </div>
          </section>

          {/* Website */}
          <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined !text-[16px] text-primary">public</span>
                Links & Contato
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="size-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 shadow-sm">
                  <span className="material-symbols-outlined !text-[20px]">mail</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate">{user.email || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="size-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 shadow-sm">
                  <span className="material-symbols-outlined !text-[20px]">language</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Website</p>
                  {isEditing ? (
                    <input
                      value={editedUser.website || ''}
                      onChange={e => setEditedUser({ ...editedUser, website: e.target.value })}
                      className="text-sm font-bold text-slate-600 dark:text-slate-300 bg-transparent border-b border-primary/30 outline-none w-full focus:border-primary transition-colors"
                      placeholder="https://seu-website.com"
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate">
                      {user.website ? (
                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {user.website}
                        </a>
                      ) : (
                        <span className="text-slate-400 italic font-normal">Não informado</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Coluna da Direita: Atividades */}
        <div className="space-y-8">
          {/* Registrar Atividade */}
          <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
              <span className="material-symbols-outlined !text-[16px] text-primary">add_circle</span>
              Registrar Atividade
            </h3>
            <form onSubmit={handleAddManualActivity} className="space-y-4">
              <textarea
                value={newActivityText}
                onChange={e => setNewActivityText(e.target.value)}
                placeholder="O que você está fazendo agora?"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none h-20 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!newActivityText.trim()}
                className="w-full bg-primary text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined !text-[16px]">add</span>
                Registrar
              </button>
            </form>
          </section>

          {/* Histórico de Atividades */}
          <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined !text-[16px] text-primary">history</span>
                Atividade Recente
              </h3>
              {activities.length > 0 && (
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                  {activities.length}
                </span>
              )}
            </div>
            <div className="space-y-4 relative max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
              {activities.length > 0 && (
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/30 via-slate-100 to-transparent dark:via-slate-800" />
              )}

              {loadingActivities ? (
                <div className="flex justify-center p-6">
                  <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : activities.length > 0 ? (
                activities.map((activity, idx) => (
                  <div
                    key={activity.id}
                    className="relative pl-7 animate-fade-in"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="absolute left-0 top-1 size-3.5 rounded-full bg-primary ring-4 ring-primary/10 shadow-sm" />
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                      <div className="flex items-start gap-2">
                        {activity.icon && (
                          <span className="material-symbols-outlined !text-[14px] text-primary mt-0.5">{activity.icon}</span>
                        )}
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex-1">
                          {activity.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {activity.target && (
                          <span className="text-[9px] text-primary/70 font-bold uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full">
                            {activity.target}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">{formatActivityTime(activity.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined !text-[32px] text-slate-200 dark:text-slate-700 mb-2">inbox</span>
                  <p className="text-xs text-slate-400 italic">Nenhuma atividade registrada.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Estilos de animação */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PerfilView;
