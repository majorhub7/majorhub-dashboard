
import React, { useState } from 'react';
import { ClientAccount, User } from '../types';
import NewClientModal from './NewClientModal';

interface ClientListViewProps {
  clients: ClientAccount[];
  isLoading?: boolean;
  onSelect: (client: ClientAccount) => void;
  onAddClient: (newClient: ClientAccount) => void; // Changed signature
  createClient: (name: string, logoUrl?: string) => Promise<any>; // New prop
  createInvitation: (clientId: string, role?: string) => Promise<any>; // New prop
}

/** Skeleton Card for loading state - matches real card dimensions */
const ClientCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] animate-pulse">
    {/* Logo Skeleton */}
    <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-3xl mb-8 shimmer" />

    {/* Name Skeleton */}
    <div className="h-7 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 shimmer" />

    {/* Stats Grid Skeleton */}
    <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-slate-50 dark:border-slate-800">
      <div>
        <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded mb-2 shimmer" />
        <div className="h-5 w-8 bg-slate-100 dark:bg-slate-800 rounded shimmer" />
      </div>
      <div>
        <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded mb-2 shimmer" />
        <div className="h-5 w-8 bg-slate-100 dark:bg-slate-800 rounded shimmer" />
      </div>
    </div>

    {/* Footer Skeleton */}
    <div className="flex items-center justify-between">
      <div className="h-2 w-24 bg-slate-100 dark:bg-slate-800 rounded shimmer" />
      <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 shimmer" />
    </div>
  </div>
);

const ClientListView: React.FC<ClientListViewProps> = ({
  clients,
  isLoading = false,
  onSelect,
  onAddClient,
  createClient,
  createInvitation
}) => {
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-fade-in">
      <header className="mb-16 text-center md:text-left">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Seus Clientes</h2>
        <p className="text-slate-400 text-sm md:text-lg font-medium mt-2">Selecione uma conta para gerenciar os projetos e entregas.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Loading State: Show skeleton cards */}
        {isLoading && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <ClientCardSkeleton key={`skeleton-${i}`} />
            ))}
          </>
        )}

        {/* Loaded State: Show real client cards */}
        {!isLoading && clients.map((client) => (
          <div
            key={client.id}
            onClick={() => onSelect(client)}
            className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500"
          >
            <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-3xl p-4 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner">
              <img
                src={client.logoUrl}
                alt={client.name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loop if fallback fails
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=8b5cf6&color=fff&size=150`;
                }}
                className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 group-hover:text-primary transition-colors">{client.name}</h3>

            <div className="grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-slate-50 dark:border-slate-800">
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Projetos</p>
                <p className="text-lg font-black text-slate-700 dark:text-slate-300">{client.projectsCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Pendentes</p>
                <p className="text-lg font-black text-primary">{client.activeDeliveries}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atividade: {client.lastActivity}</span>
              <div className="size-10 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined !text-[20px]">arrow_forward</span>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State: Show when no clients and not loading */}
        {!isLoading && clients.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="size-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined !text-[48px] text-slate-300">folder_open</span>
            </div>
            <h3 className="text-xl font-black text-slate-600 dark:text-slate-300 mb-2">Nenhum cliente encontrado</h3>
            <p className="text-slate-400 text-sm mb-6">Crie seu primeiro cliente para começar</p>
          </div>
        )}

        {/* Card Adicionar Novo Cliente - always visible when not loading */}
        {!isLoading && (
          <div
            onClick={() => setIsNewClientModalOpen(true)}
            className="group border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/30 hover:bg-primary/[0.02] transition-all min-h-[320px]"
          >
            <div className="size-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-primary transition-all mb-4">
              <span className="material-symbols-outlined !text-[32px]">add</span>
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nova Conta de Cliente</p>
          </div>
        )}
      </div>

      {isNewClientModalOpen && (
        <NewClientModal
          onClose={() => setIsNewClientModalOpen(false)}
          onSuccess={(newClient) => {
            onAddClient(newClient);
            // Keep modal open, user will close it
          }}
          createClient={createClient}
          createInvitation={createInvitation}
        />
      )}

      {/* Shimmer animation styles */}
      <style>{`
        @keyframes shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        .shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ClientListView;
