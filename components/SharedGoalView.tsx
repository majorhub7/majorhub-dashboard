import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { marked } from 'marked';
import { CreativeGoal } from '../types';

interface SharedGoalViewProps {
    token?: string;
}

const SharedGoalView: React.FC<SharedGoalViewProps> = ({ token: propToken }) => {
    const { token: paramToken } = useParams<{ token: string }>();
    const token = propToken || paramToken;

    // Safety check: if token is somehow undefined (shouldn't happen with correct routing), stop loading
    if (!token && loading) {
        setLoading(false);
        setError('Link inválido.');
    }
    const [goal, setGoal] = useState<CreativeGoal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGoal = async () => {
            if (!token) return;
            setLoading(true);
            try {
                // Fetch goal by share_token
                const { data, error } = await supabase
                    .from('creative_goals')
                    .select('*')
                    .eq('share_token', token)
                    .single();

                if (error) throw error;
                setGoal(data);
            } catch (err: any) {
                console.error('Error fetching shared goal:', err);
                setError('Objetivo não encontrado ou link inválido.');
            } finally {
                setLoading(false);
            }
        };

        fetchGoal();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Carregando conteúdo...</p>
                </div>
            </div>
        );
    }

    if (error || !goal) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
                    <span className="material-symbols-outlined !text-[48px] text-gray-300">link_off</span>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">Conteúdo Indisponível</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{error || 'O link pode ter expirado ou foi removido.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9FBFD] dark:bg-slate-950 flex flex-col items-center py-10 px-4 sm:px-6">
            <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden animate-fade-in border border-slate-100 dark:border-slate-800">
                {/* Header */}
                <header className="px-8 py-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <span className="material-symbols-outlined !text-[20px]">description</span>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrição Pública</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                        {goal.text}
                    </h1>
                </header>

                {/* Content */}
                <div className="p-8 md:p-12 min-h-[400px]">
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-gray-300 leading-relaxed custom-content"
                        dangerouslySetInnerHTML={{ __html: marked.parse(goal.description || '*Sem descrição definida.*', { async: false }) as string }}
                    />
                </div>

                {/* Footer */}
                <footer className="bg-slate-50 dark:bg-slate-950/50 p-6 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                    <a href="https://majorhub.com.br" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                        <img src="https://majorhub.com.br/logo-major.svg" alt="Major Hub" className="h-6 w-auto grayscale" />
                    </a>
                </footer>
            </div>
        </div>
    );
};

export default SharedGoalView;
