
import React, { useState } from 'react';
import { ClientAccount } from '../types';

interface NewClientModalProps {
  onClose: () => void;
  onSuccess: (client: ClientAccount) => void;
  createClient: (name: string, logoUrl?: string) => Promise<any>;
  createInvitation: (clientId: string, role?: string) => Promise<any>;
}

const NewClientModal: React.FC<NewClientModalProps> = ({ onClose, onSuccess, createClient, createInvitation }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      // 1. Create Client
      const newClient = await createClient(name);

      if (!newClient) throw new Error("Falha ao criar cliente");

      // 2. Create Invite
      const { data: invite, error } = await createInvitation(newClient.id, 'CLIENT');
      if (error) throw error;

      // 3. Generate Link
      const link = `${window.location.origin}?invite=${invite.token}`;
      setInviteLink(link);
      setStep('success');

      // Notify parent to refresh list, but keep modal open
      onSuccess(newClient);

    } catch (err) {
      console.error(err);
      alert("Erro ao criar cliente. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => step === 'success' ? onClose() : null} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col animate-scale-up border border-white/10">

        <header className="p-8 md:p-12 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {step === 'form' ? 'Nova Conta' : 'Conta Criada!'}
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {step === 'form' ? 'Crie uma nova área de cliente.' : 'Envie o link de acesso para o cliente.'}
            </p>
          </div>
          <button onClick={onClose} className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-8 md:p-12 pt-4 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nome da Empresa</label>
              <input
                type="text"
                required
                disabled={loading}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Coca-Cola Brasil"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none dark:text-white disabled:opacity-50"
                autoFocus
              />
            </div>

            <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end gap-6">
              <button
                type="button"
                onClick={onClose}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="bg-primary text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:grayscale"
              >
                {loading && <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {loading ? 'Criando...' : 'Criar Conta'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 md:p-12 pt-4 space-y-8">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 p-6 rounded-3xl flex items-start gap-4">
              <div className="size-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">check</span>
              </div>
              <div>
                <h3 className="font-bold text-emerald-900 dark:text-emerald-300">Cliente Criado com Sucesso</h3>
                <p className="text-sm text-emerald-800/70 dark:text-emerald-400/70 mt-1">
                  A área do cliente <strong>{name}</strong> já está ativa.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Link de Convite</label>
              <div className="relative group">
                <div className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-6 pr-32 text-sm font-mono text-slate-600 dark:text-slate-300 break-all">
                  {inviteLink}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute right-2 top-2 bottom-2 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-xl px-4 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {copied ? 'Copiado' : 'Copiar'}
                  </span>
                </button>
              </div>
              <p className="text-xs text-slate-400 px-2 leading-relaxed">
                Envie este link para o cliente. Ele poderá criar seu próprio login e senha de forma segura.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end">
              <button
                onClick={onClose}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 active:scale-95 transition-all"
              >
                Concluído
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewClientModal;
