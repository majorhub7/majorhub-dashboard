
import React, { useState } from 'react';
import { Role, User, Project, ClientAccount } from '../types';

interface ConfiguracoesViewProps {
  currentUser: User;
  projects: Project[];
  onDeleteProject: (projectId: string) => Promise<void>;
  selectedClient?: ClientAccount | null;
  onDeleteClient?: (clientId: string) => Promise<void>;
  members?: User[];
  onDeleteMember?: (userId: string) => Promise<void>;
}

const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = ({
  currentUser,
  projects,
  onDeleteProject,
  selectedClient,
  onDeleteClient,
  members = [],
  onDeleteMember
}) => {
  const [notifSystem, setNotifSystem] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [notifProject, setNotifProject] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  // Estados para exclusão
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientAccount | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);





  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${active ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <div className={`absolute top-1 left-1 size-4 bg-white rounded-full shadow-md transition-transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="animate-fade-in space-y-12 pb-20 max-w-6xl mx-auto">
      <header>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Configurações</h2>
        <p className="text-slate-400 dark:text-slate-500 text-sm md:text-lg font-medium mt-2">Gerencie sua conta e as funções da equipe.</p>
      </header>

      {/* Gestão de Membros */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-primary shadow-inner">
              <span className="material-symbols-outlined">group</span>
            </div>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Membros & Acessos</h3>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              onClick={() => setSelectedProfile(member)}
              className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all group hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
            >
              <div className="flex items-center gap-5">
                <div className="size-14 rounded-full overflow-hidden border-2 border-slate-50 dark:border-slate-800 shadow-sm transition-transform group-hover:scale-105">
                  <img src={member.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white">{member.name}</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{member.role}</p>
                    <span className="size-1 rounded-full bg-slate-200"></span>
                    <p className={`text-[9px] font-black uppercase tracking-tighter ${member.accessLevel === 'MANAGER' ? 'text-violet-500' : 'text-slate-400'}`}>{member.accessLevel}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {currentUser.accessLevel === 'MANAGER' && member.id !== currentUser.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMemberToDelete(member);
                    }}
                    className="size-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined !text-[20px]">person_remove</span>
                  </button>
                )}
                <div className="p-2 text-slate-300 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">visibility</span>
                </div>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="col-span-full py-12 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Nenhum membro encontrado</p>
            </div>
          )}
        </div>
      </section>

      {/* MODAL DE PERFIL SIMPLES */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[115] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedProfile(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-up">
            <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
            <div className="px-8 pb-10 -mt-12 text-center">
              <div className="size-24 rounded-[2.5rem] border-4 border-white dark:border-slate-900 overflow-hidden mx-auto shadow-xl mb-6">
                <img src={selectedProfile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedProfile.name)}&background=random`} alt={selectedProfile.name} className="w-full h-full object-cover" />
              </div>

              <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">{selectedProfile.name}</h4>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full mb-8">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{selectedProfile.role}</span>
                <span className="size-1 rounded-full bg-primary/30"></span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{selectedProfile.accessLevel}</span>
              </div>

              <div className="space-y-4 text-left">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-4 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                  <span className="material-symbols-outlined text-slate-400 !text-[20px]">mail</span>
                  <div className="overflow-hidden">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">E-mail</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{selectedProfile.email}</p>
                  </div>
                </div>

                {selectedProfile.whatsapp && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-4 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                    <span className="material-symbols-outlined text-slate-400 !text-[20px]">chat</span>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{selectedProfile.whatsapp}</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedProfile(null)}
                className="w-full mt-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
              >
                Fechar Perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outras Seções: Segurança e Notificações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Segurança */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="size-10 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 shadow-inner">
              <span className="material-symbols-outlined">security</span>
            </div>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Segurança</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 space-y-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
            <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between first:border-t-0 first:pt-0">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">2FA</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Autenticação em dois fatores</p>
              </div>
              <Toggle active={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} />
            </div>
            {selectedClient && currentUser.accessLevel === 'MANAGER' && (
              <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest">Excluir Conta do Cliente</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Apagar todos os dados de {selectedClient.name}</p>
                </div>
                <button
                  onClick={() => {
                    setClientToDelete(selectedClient);
                    setConfirmName('');
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Notificações */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="size-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 shadow-inner">
              <span className="material-symbols-outlined">notifications</span>
            </div>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Notificações</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-violet-50 dark:bg-violet-900/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined !text-[20px]">terminal</span>
                </div>
                <div><p className="text-sm font-black text-slate-800 dark:text-slate-200">Alertas do Sistema</p></div>
              </div>
              <Toggle active={notifSystem} onToggle={() => setNotifSystem(!notifSystem)} />
            </div>
            <div className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-rose-50 dark:bg-rose-900/10 flex items-center justify-center text-rose-500">
                  <span className="material-symbols-outlined !text-[20px]">mail</span>
                </div>
                <div><p className="text-sm font-black text-slate-800 dark:text-slate-200">Resumo por E-mail</p></div>
              </div>
              <Toggle active={notifEmail} onToggle={() => setNotifEmail(!notifEmail)} />
            </div>
          </div>
        </section>
      </div>

      {/* Zona de Perigo */}
      {currentUser.accessLevel === 'MANAGER' && projects.length > 0 && (
        <section className="space-y-6 pt-12 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2">
            <div className="size-10 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center text-rose-500 shadow-inner">
              <span className="material-symbols-outlined">running_with_errors</span>
            </div>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Zona de Perigo</h3>
          </div>
          <div className="bg-rose-50/30 dark:bg-rose-950/10 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/20 p-8 md:p-10">
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">Excluir Projetos</h4>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">Uma vez excluído, todos os dados de um projeto serão apagados permanentemente.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => (
                <div key={p.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-rose-200 transition-all">
                  <div>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 block truncate max-w-[200px]">{p.title}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.statusLabel}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setProjectToDelete(p); }}
                    className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-black uppercase transition-all hover:bg-rose-100"
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}



      {/* MODAL DE EXCLUSÃO DE MEMBRO */}
      {memberToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => !isDeleting && setMemberToDelete(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-rose-100 animate-scale-up">
            <div className="size-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-8 mx-auto"><span className="material-symbols-outlined !text-[40px]">person_remove</span></div>
            <h4 className="text-xl font-black text-center mb-2">Remover "{memberToDelete.name}"?</h4>
            <p className="text-center text-xs font-medium text-slate-500 mb-6 px-4">
              Esta ação removerá o acesso desta pessoa ao dashboard. Ela não poderá mais ver projetos ou tarefas. O histórico será mantido.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  setIsDeleting(true);
                  try { if (onDeleteMember) await onDeleteMember(memberToDelete.id); setMemberToDelete(null); }
                  catch (e) { alert('Erro'); } finally { setIsDeleting(false); }
                }}
                className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl shadow-rose-500/20"
              >
                {isDeleting ? 'Removendo...' : 'Remover'}
              </button>
              <button onClick={() => setMemberToDelete(null)} className="w-full py-4 text-slate-400 font-black uppercase text-[10px]">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EXCLUSÃO DE PROJETO/CLIENTE */}
      {(projectToDelete || clientToDelete) && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => !isDeleting && (setProjectToDelete(null), setClientToDelete(null))} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl animate-scale-up border border-rose-100">
            <h4 className="text-xl font-black text-center mb-6">Confirmar Exclusão</h4>
            <div className="space-y-6">
              <p className="text-sm text-slate-500 text-center px-4">Digite o nome exato para confirmar a exclusão permanente de "{projectToDelete?.title || clientToDelete?.name}".</p>
              <input type="text" value={confirmName} onChange={e => setConfirmName(e.target.value)} placeholder={projectToDelete?.title || clientToDelete?.name} className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-6 text-sm outline-none border-2 border-transparent focus:border-rose-200" />
              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      if (projectToDelete) await onDeleteProject(projectToDelete.id);
                      else if (clientToDelete && onDeleteClient) await onDeleteClient(clientToDelete.id);
                      setProjectToDelete(null); setClientToDelete(null); setConfirmName('');
                    } finally { setIsDeleting(false); }
                  }}
                  disabled={confirmName !== (projectToDelete?.title || clientToDelete?.name) || isDeleting}
                  className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-[10px] disabled:opacity-30"
                >
                  {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                </button>
                <button onClick={() => { setProjectToDelete(null); setClientToDelete(null); setConfirmName(''); }} className="w-full py-4 text-slate-400 font-black uppercase text-[10px]">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracoesView;
