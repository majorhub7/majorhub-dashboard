
import React, { useState, useMemo } from 'react';
import { User, Conversation } from '../../types';
import { supabase } from '../../services/supabase';

interface NewChatModalProps {
    onClose: () => void;
    onSelectContact: (id: string) => void;
    onCreateGroup: (name: string, members: string[]) => Promise<void>;
    currentUser: User;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ onClose, onSelectContact, onCreateGroup, currentUser }) => {
    const [tab, setTab] = useState<'private' | 'group'>('private');
    const [contacts, setContacts] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    React.useEffect(() => {
        const fetchContacts = async () => {
            setLoading(true);
            const { data } = await ((supabase as any).rpc('get_eligible_contacts', { user_id: currentUser.id }));
            if (data) {
                setContacts(data);
            }
            setLoading(false);
        };
        fetchContacts();
    }, [currentUser.id]);

    const filteredContacts = useMemo(() => {
        return (contacts || []).filter(c => (c.name || '').toLowerCase().includes(search.toLowerCase()));
    }, [contacts, search]);

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedMembers.length === 0) return;
        setIsCreating(true);
        try {
            await onCreateGroup(groupName, selectedMembers);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const toggleMember = (id: string) => {
        setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-scale-up border border-slate-100 dark:border-slate-800">
                <header className="p-8 pb-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Novo Chat</h2>
                        <button onClick={onClose} className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:text-slate-600 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl mb-6">
                        <button
                            onClick={() => setTab('private')}
                            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === 'private' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Conversa Direta
                        </button>
                        <button
                            onClick={() => setTab('group')}
                            className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === 'group' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Criar Grupo
                        </button>
                    </div>

                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">search</span>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar membros..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all outline-none dark:text-white"
                        />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar px-6 max-h-[400px]">
                    {tab === 'group' && (
                        <div className="mb-6 px-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nome do Grupo</label>
                            <input
                                value={groupName}
                                onChange={e => setGroupName(e.target.value)}
                                placeholder="Ex: Time Criativo"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3.5 px-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
                            />
                        </div>
                    )}

                    <div className="space-y-1 mb-10">
                        {loading ? (
                            <div className="py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Carregando membros...</div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Nenhum membro encontrado</div>
                        ) : filteredContacts.map(contact => {
                            const displayName = contact.name || 'Membro';
                            const displayAvatar = contact.avatarUrl || (contact as any).avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8b5cf6&color=fff&size=150`;

                            return (
                                <div
                                    key={contact.id}
                                    onClick={() => tab === 'private' ? (onSelectContact(`user_${contact.id}`), onClose()) : toggleMember(contact.id)}
                                    className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border ${selectedMembers.includes(contact.id) ? 'bg-primary/5 border-primary/20' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                >
                                    <div className="relative">
                                        <img
                                            src={displayAvatar}
                                            className="size-11 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                                            alt=""
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8b5cf6&color=fff&size=150`;
                                            }}
                                        />
                                        {tab === 'group' && selectedMembers.includes(contact.id) && (
                                            <div className="absolute -top-1 -right-1 size-5 bg-primary text-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-900 scale-110">
                                                <span className="material-symbols-outlined !text-[12px] font-bold">check</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{displayName}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{contact.role || 'Membro'}</p>
                                    </div>
                                    {tab === 'private' && (
                                        <span className="material-symbols-outlined text-slate-200">chevron_right</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {tab === 'group' && (
                    <div className="p-8 pt-0 mt-auto">
                        <button
                            disabled={!groupName.trim() || selectedMembers.length === 0 || isCreating}
                            onClick={handleCreateGroup}
                            className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${!groupName.trim() || selectedMembers.length === 0 || isCreating ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed shadow-none' : 'bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-95'}`}
                        >
                            {isCreating ? 'Criando Grupo...' : 'Criar Grupo de Chat'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewChatModal;
