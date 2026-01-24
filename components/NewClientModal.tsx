
import React, { useState } from 'react';
import { ClientAccount, User } from '../types';

interface NewClientModalProps {
  onClose: () => void;
  onCreate: (client: ClientAccount, user: User) => void;
}

const NewClientModal: React.FC<NewClientModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    const clientId = `c-${Date.now()}`;

    const newClient: ClientAccount = {
      id: clientId,
      name: name,
      logoUrl: logoUrl,
      projectsCount: 0,
      activeDeliveries: 0,
      lastActivity: 'Acabou de entrar'
    };

    const clientUser: User = {
      id: `u-${Date.now()}`,
      name: `Admin ${name}`,
      role: 'Product Manager',
      accessLevel: 'CLIENT',
      clientId: clientId,
      email: email,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=150`,
      isOnboarded: false
    };

    onCreate(newClient, clientUser);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col animate-scale-up border border-white/10">

        <header className="p-8 md:p-12 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Nova Conta</h2>
            <p className="text-slate-400 text-sm font-medium mt-1">Configure o acesso do novo cliente.</p>
          </div>
          <button onClick={onClose} className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 pt-4 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Nome da Empresa</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Coca-Cola Brasil"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">E-mail de Login</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="cliente@empresa.com"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Senha Provisória</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none dark:text-white"
            />
          </div>

          <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end gap-6">
            <button
              type="button"
              onClick={onClose}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-primary text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
            >
              Criar Conta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClientModal;
