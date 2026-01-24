
import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/gemini';
import { Project, ClientAccount, User } from '../types';

interface AICreateModalProps {
    onClose: () => void;
    currentUser: User;
    currentClient: ClientAccount;
    onCreateProject: (project: any, goals: any[]) => Promise<string>; // Returns project ID
    onViewProject: (id: string) => void;
    existingProjects?: Project[];
}

type Step = 'input' | 'loading' | 'success';

export const AICreateModal: React.FC<AICreateModalProps> = ({
    onClose,
    currentUser,
    currentClient,
    onCreateProject,
    onViewProject,
    existingProjects = []
}) => {
    const [step, setStep] = useState<Step>('input');
    const [activeTab, setActiveTab] = useState<'describe' | 'upload'>('describe');
    const [description, setDescription] = useState('');
    const [fileContent, setFileContent] = useState('');
    const [fileName, setFileName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [generatedProject, setGeneratedProject] = useState<any>(null);
    const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

    const loadingSteps = [
        { label: 'Analisando informações...', icon: 'analytics' },
        { label: 'Estruturando briefing...', icon: 'architecture' },
        { label: 'Gerando objetivos criativos...', icon: 'psychology' },
        { label: 'Finalizando projeto...', icon: 'task_alt' }
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedExtensions = ['.txt', '.docx', '.pdf', '.md'];
        const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

        if (!allowedExtensions.includes(extension)) {
            alert('Por favor, envie arquivos .txt, .docx, .pdf ou .md');
            return;
        }

        setFileName(file.name);

        // For now, only reading text-based files properly. 
        // PDF and DOCX would require a server-side or library-based extraction.
        const reader = new FileReader();
        reader.onload = (event) => {
            setFileContent(event.target?.result as string);
        };
        reader.readAsText(file);
    };

    const handleGenerate = async () => {
        if ((description.length < 50 && !fileContent) || isGenerating) return;

        setStep('loading');
        setIsGenerating(true);
        setLoadingStep(0);

        // Timeline para os passos de loading (2-3s cada)
        const stepInterval = setInterval(() => {
            setLoadingStep(prev => {
                if (prev < loadingSteps.length - 1) return prev + 1;
                return prev;
            });
        }, 2500);

        try {
            const combinedInput = description + (fileContent ? `\n\nCONTEÚDO DO ARQUIVO (${fileName}):\n${fileContent}` : '');
            const projectData = await geminiService.generateProjectStructure(combinedInput, existingProjects);

            if (!projectData) throw new Error('Falha ao gerar projeto');

            setGeneratedProject(projectData);

            // Criar projeto instantaneamente
            const projectId = await onCreateProject(projectData, projectData.goals);
            setCreatedProjectId(projectId);

            // Garantir que o loading dure o suficiente para os passos aparecerem
            setTimeout(() => {
                clearInterval(stepInterval);
                setStep('success');
                setIsGenerating(false);
            }, 10000); // 10s total para garantir a experiência linear

        } catch (error) {
            console.error('Erro na geração com IA:', error);
            alert('Ocorreu um erro ao gerar o projeto. Tente novamente.');
            setStep('input');
            setIsGenerating(false);
            clearInterval(stepInterval);
        }
    };

    const renderInputScreen = () => (
        <div className="flex flex-col h-full animate-fade-in">
            <header className="p-8 pb-4 shrink-0">
                <div className="flex items-center gap-2 mb-1">
                    <img src={currentClient.logoUrl} className="size-4 object-contain filter grayscale opacity-50" alt="" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentClient.name}</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Conte sobre o Projeto</h2>
            </header>

            <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar space-y-6">
                {/* Tabs */}
                <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => setActiveTab('describe')}
                        className={`pb-3 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'describe' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Descrever
                        {activeTab === 'describe' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-width-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`pb-3 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'upload' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Upload de Arquivo
                        {activeTab === 'upload' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-width-full" />}
                    </button>
                </div>

                {activeTab === 'describe' ? (
                    <div className="space-y-2">
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value.slice(0, 5000))}
                            placeholder="Explique os objetivos, público-alvo e o que você espera deste projeto. Quanto mais detalhes, melhor será a estruturação da IA..."
                            className="w-full h-48 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl p-6 text-sm font-medium focus:ring-4 focus:ring-primary/5 transition-all outline-none dark:text-white resize-none"
                        />
                        <div className="flex justify-end">
                            <span className={`text-[10px] font-bold ${description.length >= 5000 ? 'text-rose-500' : 'text-slate-400'}`}>
                                {description.length}/5000
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div
                            onClick={() => document.getElementById('ai-file-input')?.click()}
                            className="h-32 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3 cursor-pointer group hover:border-primary/50 transition-all px-6 text-center"
                        >
                            <span className="material-symbols-outlined !text-[32px] text-slate-300 group-hover:text-primary transition-colors">cloud_upload</span>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {fileName || 'Arraste ou clique para upload'}
                                </p>
                                <p className="text-[9px] text-slate-300 mt-1">.txt, .docx, .pdf, .md (max 10MB)</p>
                            </div>
                            <input id="ai-file-input" type="file" className="hidden" accept=".txt,.docx,.pdf,.md" onChange={handleFileUpload} />
                        </div>

                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Adicione observações complementares (opcional)..."
                            className="w-full h-24 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl p-6 text-sm font-medium focus:ring-4 focus:ring-primary/5 transition-all outline-none dark:text-white resize-none"
                        />
                    </div>
                )}
            </div>

            <footer className="p-8 pt-4 shrink-0 flex items-center justify-end gap-6 border-t border-slate-50 dark:border-slate-800">
                <button
                    onClick={onClose}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                    Descartar
                </button>
                <button
                    onClick={handleGenerate}
                    disabled={description.length < 50 && !fileContent}
                    className={`bg-primary text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 group ${description.length < 50 && !fileContent ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                >
                    <span className="material-symbols-outlined !text-[18px] group-hover:rotate-12 transition-transform">auto_awesome</span>
                    Gerar Projeto
                </button>
            </footer>
        </div>
    );

    const renderLoadingScreen = () => (
        <div className="flex flex-col items-center justify-center h-full p-12 text-center animate-fade-in">
            <div className="relative size-32 mb-12">
                {/* Animação CSS Central */}
                <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-4 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined !text-[40px] text-primary animate-pulse">psychology</span>
                </div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Criando seu projeto com IA...</h3>
            <p className="text-slate-400 text-sm mb-12 font-medium">Isso levará apenas alguns instantes.</p>

            <div className="w-full max-w-xs space-y-4">
                {loadingSteps.map((s, i) => (
                    <div
                        key={i}
                        className={`flex items-center gap-4 transition-all duration-500 ${i <= loadingStep ? 'opacity-100' : 'opacity-20 translate-y-2'}`}
                    >
                        <div className={`size-8 rounded-lg flex items-center justify-center ${i < loadingStep ? 'bg-emerald-500 text-white' : (i === loadingStep ? 'bg-primary text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400')}`}>
                            <span className="material-symbols-outlined !text-[18px]">
                                {i < loadingStep ? 'check' : s.icon}
                            </span>
                        </div>
                        <span className={`text-[11px] font-black uppercase tracking-widest ${i === loadingStep ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSuccessScreen = () => (
        <div className="flex flex-col h-full animate-fade-in relative overflow-hidden">
            {/* Confete Fake (pode ser melhorado com biblioteca) */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute size-2 rounded-full animate-float-up"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            backgroundColor: ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)],
                            animationDelay: `${Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-primary/5 to-transparent">
                <div className="size-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/20 animate-scale-up">
                    <span className="material-symbols-outlined !text-[48px]">check_circle</span>
                </div>

                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Projeto criado com sucesso!</h3>
                <p className="text-slate-400 text-sm font-medium mb-10 max-w-xs">Seu projeto está pronto para começar. Vamos lá?</p>

                {/* Card Resumo */}
                {generatedProject && (
                    <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-2 rounded-full bg-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{generatedProject.category}</span>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white mb-6 text-left leading-tight line-clamp-2">
                            {generatedProject.title}
                        </h4>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Objetivos Criativos</span>
                                <span>{generatedProject.goals?.length || 0} Metas</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-full opacity-20" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <footer className="p-8 pt-4 shrink-0 flex flex-col gap-4">
                <button
                    onClick={() => createdProjectId && onViewProject(createdProjectId)}
                    className="w-full bg-primary text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    Ver Projeto Agora
                    <span className="material-symbols-outlined !text-[20px]">arrow_forward</span>
                </button>
                <button
                    onClick={onClose}
                    className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors py-2"
                >
                    Voltar ao Dashboard
                </button>
            </footer>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-6 animate-fade-in pointer-events-auto">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />

            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-scale-up border border-white/10 h-[650px]">
                {step !== 'loading' && (
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 size-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:text-slate-600 transition-colors z-10"
                    >
                        <span className="material-symbols-outlined !text-[22px]">close</span>
                    </button>
                )}

                {step === 'input' && renderInputScreen()}
                {step === 'loading' && renderLoadingScreen()}
                {step === 'success' && renderSuccessScreen()}
            </div>
        </div>
    );
};

export default AICreateModal;
