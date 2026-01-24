
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
}

const Sidebar: React.FC<SidebarProps> = ({ 
  user, 
  activeTab, 
  setActiveTab, 
  isOpen, 
  onClose,
  isCollapsed = false,
  onToggleCollapse
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
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <aside className={`
        fixed left-0 top-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 
        flex flex-col z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:-translate-x-full lg:opacity-0' : 'lg:translate-x-0 lg:opacity-100'}
      `}>
        <div className="p-8 pt-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-gradient-to-br from-violet-400 to-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined !text-[24px]">palette</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
              Major Hub
            </h1>
          </div>
          <div className="flex items-center gap-1">
            {/* Desktop Collapse Button */}
            <button 
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
              title="Esconder Menu"
            >
              <span className="material-symbols-outlined !text-[20px]">keyboard_double_arrow_left</span>
            </button>
            <button onClick={onClose} className="lg:hidden text-slate-400">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Menu</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                activeTab === item.id
                  ? 'bg-primary/5 text-primary font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}

          <div className="pt-8 px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Preferências</div>
          {prefItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                activeTab === item.id
                  ? 'bg-primary/5 text-primary font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-accent-lavender dark:bg-violet-900/10 p-4 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-cover bg-center shadow-inner overflow-hidden border-2 border-white dark:border-slate-800">
                <img alt="Avatar" src={user.avatarUrl} className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-[10px] text-primary font-medium uppercase tracking-wider">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
