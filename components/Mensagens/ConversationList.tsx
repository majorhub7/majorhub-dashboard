import React from 'react';
import { Conversation } from '../../types';

// Skeleton animado para conversas
const ConversationSkeleton = () => (
    <div className="p-4 rounded-[2rem] animate-pulse">
        <div className="flex items-center gap-4">
            <div className="size-14 rounded-xl bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
        </div>
    </div>
);

interface ConversationListProps {
    groups: Conversation[];
    privates: Conversation[];
    selectedConvId: string;
    onSelectConv: (id: string) => void;
    showMobileChat: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onOpenNewChat: () => void;
    loading?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = React.memo(({
    groups,
    privates,
    selectedConvId,
    onSelectConv,
    showMobileChat,
    searchQuery,
    setSearchQuery,
    onOpenNewChat,
    loading = false
}) => {
    return (
        <div className={`w-full lg:w-[380px] border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0 ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
            <div className="p-6 md:p-8 pb-4">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">Mensagens</h2>
                </div>
                <div className="relative mb-4 md:mb-6">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">search</span>
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none placeholder:text-slate-400 dark:text-white font-medium"
                        placeholder="Buscar conversas..."
                        type="text"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-6 space-y-6 md:space-y-8">
                {loading ? (
                    <div className="space-y-1.5 md:space-y-2">
                        {[1, 2, 3, 4].map(i => <ConversationSkeleton key={i} />)}
                    </div>
                ) : (
                    <>
                        {groups.length > 0 && (
                            <div>
                                <div className="px-2 mb-3 flex justify-between items-center">
                                    <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Grupos de Projeto</span>
                                    <button className="text-primary hover:bg-primary/5 p-1 rounded-lg transition-colors">
                                        <span className="material-symbols-outlined !text-[18px]">add</span>
                                    </button>
                                </div>
                                <div className="space-y-1.5 md:space-y-2">
                                    {groups.map(conv => (
                                        <div
                                            key={conv.id}
                                            onClick={() => onSelectConv(conv.id)}
                                            className={`p-3 md:p-4 rounded-xl md:rounded-[2rem] border transition-all cursor-pointer group ${selectedConvId === conv.id
                                                ? 'bg-primary/5 border-primary/20 shadow-sm'
                                                : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="size-12 md:size-14 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                                                    <img
                                                        src={conv.avatar}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name)}&background=8b5cf6&color=fff&size=150`;
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5 md:mb-1">
                                                        <h4 className={`text-[13px] md:text-sm font-bold truncate ${selectedConvId === conv.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>{conv.name}</h4>
                                                        <span className="text-[9px] md:text-[10px] text-slate-400 font-bold shrink-0 ml-2">{conv.lastTimestamp}</span>
                                                    </div>
                                                    <p className="text-[11px] md:text-xs text-slate-400 line-clamp-1 leading-relaxed">{conv.lastMessage}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {privates.length > 0 && (
                            <div>
                                <div className="px-2 mb-3 flex justify-between items-center">
                                    <span className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">Privadas</span>
                                </div>
                                <div className="space-y-1.5 md:space-y-2 pb-10">
                                    {privates.map(conv => (
                                        <div
                                            key={conv.id}
                                            onClick={() => onSelectConv(conv.id)}
                                            className={`p-3 md:p-4 rounded-xl md:rounded-[2rem] border transition-all cursor-pointer flex items-center gap-3 md:gap-4 ${selectedConvId === conv.id
                                                ? 'bg-primary/5 border-primary/20 shadow-sm'
                                                : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
                                                } ${conv.id === 'ai-major' ? 'bg-slate-900/5 dark:bg-white/5 border-primary/10' : ''}`}
                                        >
                                            <div className="relative shrink-0">
                                                {conv.avatar === 'ai-avatar' ? (
                                                    <div className="size-12 md:size-14 rounded-full bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white border-2 border-white dark:border-slate-800 shadow-sm">
                                                        <span className="material-symbols-outlined !text-[24px] md:!text-[28px]">psychology</span>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={conv.avatar || undefined}
                                                        alt=""
                                                        className="size-12 md:size-14 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name)}&background=8b5cf6&color=fff&size=150`;
                                                        }}
                                                    />
                                                )}
                                                {conv.online && <span className="absolute bottom-0.5 right-0.5 size-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></span>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5 md:mb-1">
                                                    <h4 className={`text-[13px] md:text-sm font-bold truncate ${selectedConvId === conv.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                                                        {conv.name}
                                                        {conv.id === 'ai-major' && <span className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase rounded tracking-tighter">I.A</span>}
                                                    </h4>
                                                    <span className="text-[9px] md:text-[10px] text-slate-400 font-bold shrink-0 ml-2">{conv.lastTimestamp}</span>
                                                </div>
                                                <p className="text-[11px] md:text-xs text-slate-400 line-clamp-1 leading-relaxed">{conv.lastMessage}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
});

export default ConversationList;
