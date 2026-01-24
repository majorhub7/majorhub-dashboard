
import React, { useState } from 'react';
import { User } from '../types';

interface OnboardingViewProps {
    user: User;
    onComplete: (data: {
        name: string;
        email: string;
        whatsapp: string;
        password?: string;
        avatarUrl?: string;
    }) => Promise<void>;
    onLogout: () => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ user, onComplete, onLogout }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        whatsapp: '',
        password: '',
        confirmPassword: '',
        avatarUrl: user.avatarUrl || ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
        if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
        if (!formData.whatsapp.trim()) newErrors.whatsapp = 'WhatsApp é obrigatório';
        if (!formData.password) newErrors.password = 'Nova senha é obrigatória';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'As senhas não coincidem';
        }
        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleComplete = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            await onComplete({
                name: formData.name,
                email: formData.email,
                whatsapp: formData.whatsapp,
                password: formData.password,
                avatarUrl: formData.avatarUrl
            });
            setStep(3);
        } catch (error) {
            console.error('Error completing onboarding:', error);
            alert('Ocorreu um erro ao salvar seus dados. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-body translate-y-0">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 flex">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`flex-1 transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800'}`}
                        />
                    ))}
                </div>

                {/* Step 1: Welcome */}
                {step === 1 && (
                    <div className="p-12 md:p-16 flex flex-col items-center text-center animate-fade-in">
                        <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-8 animate-bounce-subtle">
                            <span className="material-symbols-outlined !text-[40px]">celebration</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">
                            Bem-vindo à MajorHub
                        </h1>

                        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-10">
                            Sua conta foi criada e o acesso ao seu projeto já está liberado.<br /><br />
                            Antes de entrar no dashboard, precisamos finalizar seu perfil para organizar a comunicação e garantir segurança no acesso.
                        </p>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-5 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 text-lg"
                        >
                            Continuar
                        </button>

                        <button
                            onClick={onLogout}
                            className="mt-6 text-slate-400 hover:text-rose-500 text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            Sair da conta
                        </button>
                    </div>
                )}

                {/* Step 2: Profile Setup */}
                {step === 2 && (
                    <div className="p-8 md:p-12 animate-fade-in">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Criar Perfil</h2>
                            <p className="text-slate-400 text-sm font-medium">Preencha seus dados reais para acesso definitivo.</p>
                        </div>

                        <div className="space-y-6">
                            {/* Avatar Upload Placeholder */}
                            <div className="flex justify-center mb-8">
                                <div className="relative group">
                                    <div className="size-24 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                                        {formData.avatarUrl ? (
                                            <img src={formData.avatarUrl} className="size-full object-cover rounded-[2rem]" alt="Avatar" />
                                        ) : (
                                            <span className="material-symbols-outlined text-slate-400 !text-3xl">add_a_photo</span>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="URL da Foto"
                                        className="absolute -bottom-2 -right-2 scale-0 group-hover:scale-100 transition-transform bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg px-2 py-1 text-[10px] w-24 shadow-sm"
                                        value={formData.avatarUrl}
                                        onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Completo*</label>
                                    <input
                                        type="text"
                                        className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.name ? 'border-rose-500' : 'border-slate-100 dark:border-slate-800'} rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white font-bold placeholder:text-slate-300`}
                                        placeholder="Seu nome"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Verdadeiro*</label>
                                    <input
                                        type="email"
                                        className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.email ? 'border-rose-500' : 'border-slate-100 dark:border-slate-800'} rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white font-bold placeholder:text-slate-300`}
                                        placeholder="ex@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp*</label>
                                    <input
                                        type="tel"
                                        className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.whatsapp ? 'border-rose-500' : 'border-slate-100 dark:border-slate-800'} rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white font-bold placeholder:text-slate-300`}
                                        placeholder="(00) 00000-0000"
                                        value={formData.whatsapp}
                                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nova Senha*</label>
                                        <input
                                            type="password"
                                            className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.password ? 'border-rose-500' : 'border-slate-100 dark:border-slate-800'} rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white font-bold placeholder:text-slate-300`}
                                            placeholder="******"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirmar Senha*</label>
                                        <input
                                            type="password"
                                            className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.confirmPassword ? 'border-rose-500' : 'border-slate-100 dark:border-slate-800'} rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white font-bold placeholder:text-slate-300`}
                                            placeholder="******"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {Object.keys(errors).length > 0 && (
                                <p className="text-rose-500 text-[10px] font-bold text-center">Preencha todos os campos obrigatórios corretamente.</p>
                            )}

                            <div className="pt-4 flex gap-4">
                                <button
                                    disabled={loading}
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all"
                                >
                                    Voltar
                                </button>
                                <button
                                    disabled={loading}
                                    onClick={handleComplete}
                                    className="flex-[2] py-4 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Concluir <span className="material-symbols-outlined !text-[18px]">arrow_forward</span></>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <div className="p-12 md:p-16 flex flex-col items-center text-center animate-fade-in">
                        <div className="size-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-8 animate-success-scale">
                            <span className="material-symbols-outlined !text-[48px]">check_circle</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">
                            Tudo pronto
                        </h1>

                        <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-10">
                            Seu perfil foi concluído com sucesso.<br /><br />
                            Agora você já pode acessar o dashboard e acompanhar seu projeto, entregas e atualizações.
                        </p>

                        <button
                            onClick={() => window.location.reload()} // Reload to enter dashboard
                            className="w-full py-5 bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 text-lg flex items-center justify-center gap-3"
                        >
                            Entrar no dashboard
                            <span className="material-symbols-outlined">dashboard</span>
                        </button>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes success-scale {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-subtle { animation: bounce-subtle 3s infinite ease-in-out; }
        .animate-success-scale { animation: success-scale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default OnboardingView;
