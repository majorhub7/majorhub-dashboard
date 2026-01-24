import React, { useState, useRef, useEffect } from 'react';
import { User, Project } from '../types';
import { geminiService } from '../services/gemini';
import { marked } from 'marked';

interface AIChatPanelProps {
    project: Project;
    currentUser: User;
    onClose: () => void;
}

interface Message {
    role: 'user' | 'ai';
    content: string;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ project, currentUser, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: `Olá ${currentUser.name}! Sou seu assistente criativo. Como posso ajudar com o projeto **${project.title}** hoje?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await geminiService.chat(userMessage, messages.map(m => ({
                role: m.role === 'ai' ? 'model' : 'user',
                content: m.content
            })));

            if (response) {
                setMessages(prev => [...prev, { role: 'ai', content: response }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: "Desculpe, tive um problema ao processar sua solicitação. Verifique se a API Key está configurada corretamente." }]);
            }
        } catch (error) {
            console.error('Error in AI Chat:', error);
            setMessages(prev => [...prev, { role: 'ai', content: "Erro de conexão com o assistente." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
            <div className="p-8 pb-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
                <div>
                    <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.25em] flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined !text-[20px]">smart_toy</span>
                        Assistente Criativo IA
                    </h3>
                    <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Powered by Gemini 1.5 Flash</p>
                </div>
                <button onClick={onClose} className="size-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-300 hover:text-slate-600 transition-all shadow-sm active:scale-90">
                    <span className="material-symbols-outlined !text-[20px]">close</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${msg.role === 'user'
                                ? 'bg-primary text-white shadow-lg shadow-primary/10'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700 shadow-sm'
                            }`}>
                            {msg.role === 'ai' ? (
                                <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) as string }} />
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-400 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                            <div className="size-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="size-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="size-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            <span className="ml-2">Pensando...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="relative flex items-center gap-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[1.75rem] p-2.5 shadow-inner group focus-within:border-primary/30 transition-all">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Pergunte algo ao assistente..."
                        className="flex-1 bg-transparent border-none py-2 px-4 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-0 placeholder:text-slate-300"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={`size-11 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${input.trim() && !isLoading
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-200 dark:text-slate-700 cursor-not-allowed'
                            }`}
                    >
                        <span className="material-symbols-outlined !text-[20px]">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChatPanel;
