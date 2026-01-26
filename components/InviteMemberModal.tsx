import React, { useState } from 'react';
import { Role } from '../types';

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: string;
    createInvitation: (clientId: string, role: string) => Promise<{ data: any; error: any }>;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
    isOpen,
    onClose,
    clientId,
    createInvitation
}) => {
    const [role, setRole] = useState<Role>('CLIENT');
    const [loading, setLoading] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleGenerateLink = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await createInvitation(clientId, role);
            if (error) throw error;

            if (data) {
                const origin = window.location.origin;
                const link = `${origin}/register?token=${data.token}`;
                setInviteLink(link);
            }
        } catch (err: any) {
            console.error('Error creating invitation:', err);
            setError(err.message || 'Erro ao gerar convite');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const reset = () => {
        setInviteLink('');
        setRole('CLIENT');
        setError(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={reset} />
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-up">

                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Convidar Membro</h3>
                    <button onClick={reset} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {!inviteLink ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Nível de Acesso</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setRole('CLIENT')}
                                    className={`p-4 rounded-2xl border-2 transition-all text-center ${role === 'CLIENT'
                                            ? 'border-primary bg-primary/5 text-primary'
                                            : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                                        }`}
                                >
                                    <p className="font-black text-sm">Colaborador</p>
                                    <p className="text-[10px] mt-1 opacity-70">Acesso padrão</p>
                                </button>
                                <button
                                    onClick={() => setRole('MANAGER')}
                                    className={`p-4 rounded-2xl border-2 transition-all text-center ${role === 'MANAGER'
                                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-500'
                                            : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200'
                                        }`}
                                >
                                    <p className="font-black text-sm">Gestor</p>
                                    <p className="text-[10px] mt-1 opacity-70">Acesso total</p>
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-50 text-rose-500 text-xs font-bold rounded-xl flex items-center gap-2">
                                <span className="material-symbols-outlined !text-sm">error</span>
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleGenerateLink}
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-slate-900/10 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                        >
                            {loading ? 'Gerando...' : 'Gerar Link de Convite'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="size-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined !text-3xl">link</span>
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Link gerado com sucesso!</p>
                            <p className="text-xs text-slate-400 mt-1">Este link é válido por 24 horas.</p>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl break-all text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                            {inviteLink}
                        </div>

                        <button
                            onClick={copyToClipboard}
                            className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${copied
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 active:scale-95'
                                }`}
                        >
                            {copied ? 'Copiado!' : 'Copiar Link'}
                        </button>

                        <button
                            onClick={() => setInviteLink('')}
                            className="w-full py-2 text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors"
                        >
                            Gerar outro convite
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default InviteMemberModal;
