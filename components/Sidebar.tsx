
import React from 'react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  onLogout
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'space_dashboard' },
    { id: 'projetos', label: 'Meus Projetos', icon: 'auto_awesome_motion' },
    { id: 'biblioteca', label: 'Biblioteca', icon: 'collections' },
    { id: 'mensagens', label: 'Mensagens', icon: 'forum' },
  ];

  const prefItems = [
    { id: 'perfil', label: 'Perfil', icon: 'person' },
    { id: 'configurações', label: 'Configurações', icon: 'settings' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-surface-dark/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`
        fixed left-0 top-0 h-full w-72 
        bg-white dark:bg-surface-elevated-dark 
        border-r border-border-subtle dark:border-border-subtle-dark 
        flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'lg:-translate-x-full lg:opacity-0 lg:pointer-events-none' : 'lg:translate-x-0 lg:opacity-100'}
      `}>
        {/* Header / Logo */}
        <div className="p-8 pt-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-glow-sm">
              <span className="material-symbols-outlined !text-[22px]">palette</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Major<span className="text-primary">Hub</span>
            </h1>
          </div>
          <div className="flex items-center gap-1">
            {/* Desktop Collapse Button */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-md transition-all group"
              title="Esconder Menu"
            >
              <span className="material-symbols-outlined !text-[20px] group-hover:-translate-x-0.5 transition-transform">keyboard_double_arrow_left</span>
            </button>
            <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-primary rounded-md transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-5 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Menu</div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${activeTab === item.id
                ? 'bg-primary/8 text-primary font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
              {/* Active indicator */}
              {activeTab === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full animate-scale-up" />
              )}
              <span className={`material-symbols-outlined !text-[20px] transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-105'}`}>
                {item.icon}
              </span>
              <span className="text-[13px]">{item.label}</span>
            </button>
          ))}

          <div className="pt-6 px-4 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Preferências</div>

          {prefItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${activeTab === item.id
                ? 'bg-primary/8 text-primary font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
              {activeTab === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full animate-scale-up" />
              )}
              <span className={`material-symbols-outlined !text-[20px] transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-105'}`}>
                {item.icon}
              </span>
              <span className="text-[13px]">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Card */}
        <div className="p-5">
          <div className="bg-gradient-to-br from-primary/5 to-accent-magenta/5 dark:from-primary/10 dark:to-accent-magenta/10 p-4 rounded-xl border border-primary/10 dark:border-primary/20">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-lg bg-cover bg-center shadow-depth-sm overflow-hidden border-2 border-white dark:border-surface-dark ring-2 ring-primary/20">
                <img alt="Avatar" src={user.avatarUrl} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
                <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all text-xs font-bold uppercase tracking-widest group"
          >
            <span className="material-symbols-outlined !text-[18px] group-hover:scale-110 transition-transform">logout</span>
            {!isCollapsed && <span>Sair da Conta</span>}
          </button>
        </div>
      </aside >
    </>
  );
};

export default Sidebar;
