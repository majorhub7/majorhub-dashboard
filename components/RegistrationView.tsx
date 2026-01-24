
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';

interface RegistrationViewProps {
    token: string;
    onValidateToken: (token: string) => Promise<{ data: any; error: any }>;
    onSignUp: (data: any) => Promise<{ error: any }>;
    onCancel: () => void;
}

const RegistrationView: React.FC<RegistrationViewProps> = ({ token, onValidateToken, onSignUp, onCancel }) => {
    const { user: authUser } = useAuth();
    const [screen, setScreen] = useState<'loading' | 'welcome' | 'form' | 'success' | 'invalid'>('loading');
    const [inviteData, setInviteData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        validate();
    }, [token]);

    useEffect(() => {
        if (authUser?.email) {
            setFormData(prev => ({ ...prev, email: authUser.email || '' }));
        }
    }, [authUser]);

    const validate = async () => {
        setScreen('loading');
        const { data, error } = await onValidateToken(token);
        if (error || !data) {
            setScreen('invalid');
        } else {
            setInviteData(data);
            setScreen('welcome');
        }
    };

    const formatWhatsApp = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 11) {
            let f = numbers;
            if (numbers.length > 2) f = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
            if (numbers.length > 7) f = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
            return f;
        }
        return value.slice(0, 15);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Nome é obrigatório';
        if (!formData.email) newErrors.email = 'Email é obrigatório';
        if (!formData.whatsapp) newErrors.whatsapp = 'WhatsApp é obrigatório';

        if (!authUser) {
            if (formData.password.length < 8) newErrors.password = 'A senha deve ter pelo menos 8 dígitos';
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        let finalAvatarUrl = '';

        try {
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                finalAvatarUrl = publicUrl;
            }

            const { error } = await onSignUp({
                ...formData,
                token,
                avatar_url: finalAvatarUrl
            });

            if (error) throw error;
            setScreen('success');
        } catch (error: any) {
            alert(error.message || 'Erro ao realizar cadastro');
            setLoading(false);
        }
    };

    if (screen === 'loading') {
        return (
            <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="animate-spin size-12 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (screen === 'invalid') {
        return (
            <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-12 text-center shadow-2xl border border-slate-100 dark:border-slate-800 animate-scale-up">
                    <div className="size-20 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-8">
                        <span className="material-symbols-outlined !text-[40px]">error</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Convite Inválido</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Este link de convite expirou ou já foi utilizado para criar uma conta.</p>
                    <button onClick={onCancel} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-2xl uppercase tracking-widest text-[10px]">Voltar ao Login</button>
                </div>
            </div>
        );
    }

    // TELA 1 - Saudações
    if (screen === 'welcome') {
        return (
            <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-body">
                <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-12 md:p-16 animate-scale-up text-center">
                    <div className="size-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mx-auto mb-10">
                        <span className="material-symbols-outlined !text-[40px]">waving_hand</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Bem-vindo à MajorHub</h1>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-10">
                        Sua conta foi criada e o acesso ao seu projeto já está liberado.<br /><br />
                        Antes de entrar no dashboard, precisamos finalizar seu perfil para organizar a comunicação e garantir segurança no acesso.
                    </p>
                    <button
                        onClick={() => setScreen('form')}
                        className="w-full bg-primary text-white py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Continuar
                    </button>
                </div>
            </div>
        );
    }

    // TELA 3 - Seja bem-vindo (Sucesso)
    if (screen === 'success') {
        return (
            <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-body">
                <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-12 md:p-16 animate-scale-up text-center">
                    <div className="size-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2.5rem] flex items-center justify-center text-emerald-500 mx-auto mb-10">
                        <span className="material-symbols-outlined !text-[48px]">task_alt</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Tudo pronto</h1>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-10">
                        Seu perfil foi concluído com sucesso.<br /><br />
                        Agora você já pode acessar o dashboard e acompanhar seu projeto, entregas e atualizações.
                    </p>
                    <button
                        onClick={() => {
                            // Limpar token da URL para evitar erro de "Convite Inválido" ao recarregar
                            const url = new URL(window.location.href);
                            url.searchParams.delete('token');
                            window.history.replaceState({}, '', url.toString());
                            window.location.href = '/';
                        }}
                        className="w-full bg-primary text-white py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Entrar no dashboard
                    </button>
                </div>
            </div>
        );
    }

    // TELA 2 - Criar Perfil
    return (
        <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 overflow-y-auto font-body">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 my-8 animate-scale-up">
                <div className="p-10 md:p-16">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                        <div>
                            <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                                <span className="material-symbols-outlined !text-[32px]">edit_square</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Crie seu Perfil</h1>
                            <p className="text-slate-400 font-medium mt-1">Prencha os dados obrigatórios para finalizar.</p>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="group relative size-24 rounded-full overflow-hidden bg-slate-50 dark:bg-slate-800/50 border-4 border-slate-100 dark:border-slate-800 shadow-xl transition-all hover:scale-105"
                            >
                                {avatarPreview ? (
                                    <img src={avatarPreview} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <span className="material-symbols-outlined !text-[32px]">add_a_photo</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined !text-[20px]">edit</span>
                                </div>
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Foto de Perfil</span>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* NOME */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nome Completo *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Seu nome"
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-4 focus:ring-primary/5 transition-all outline-none dark:text-white"
                                />
                            </div>

                            {/* EMAIL */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email *</label>
                                <input
                                    type="email"
                                    required
                                    readOnly={!!authUser}
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="seu@email.com"
                                    className={`w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-4 focus:ring-primary/5 transition-all outline-none dark:text-white ${authUser ? 'opacity-60 cursor-not-allowed' : ''}`}
                                />
                            </div>

                            {/* WHATSAPP */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">WhatsApp *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.whatsapp}
                                    onChange={e => setFormData({ ...formData, whatsapp: formatWhatsApp(e.target.value) })}
                                    placeholder="(00) 00000-0000"
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-4 focus:ring-primary/5 transition-all outline-none dark:text-white font-mono"
                                />
                            </div>

                            {/* PASSWORD FIELDS (Only if not logged in) */}
                            {!authUser && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Senha Definitiva * (Mín. 8 dígitos)</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-4 focus:ring-primary/5 transition-all outline-none dark:text-white"
                                        />
                                        {errors.password && <p className="text-rose-500 text-[10px] font-bold ml-2">{errors.password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Confirme a Senha *</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-4 px-6 text-sm focus:ring-4 focus:ring-primary/5 transition-all outline-none dark:text-white"
                                        />
                                        {errors.confirmPassword && <p className="text-rose-500 text-[10px] font-bold ml-2">{errors.confirmPassword}</p>}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pt-8 flex flex-col sm:flex-row gap-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all uppercase tracking-widest text-[10px]"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] bg-primary text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="animate-spin size-4 border-2 border-white/30 border-t-white rounded-full" />
                                ) : (
                                    <>Concluir Perfil <span className="material-symbols-outlined !text-[16px]">arrow_forward</span></>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegistrationView;
