import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';

interface TextEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: React.ReactNode;
    initialContent: string;
    onSave: (content: string) => Promise<void> | void;
    onShare?: () => void;
    isSharing?: boolean;
}

const TextEditorModal: React.FC<TextEditorModalProps> = ({
    isOpen,
    onClose,
    title,
    initialContent,
    onSave,
    onShare,
    isSharing = false
}) => {
    const [content, setContent] = useState(initialContent);
    const [isSaving, setIsSaving] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setContent(initialContent);
        }
    }, [isOpen, initialContent]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        // Initial check
        checkMobile();

        // Listen for resize
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(content);
            onClose();
        } catch (error) {
            console.error('Error saving content:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center ${isMobile ? 'bg-white' : 'bg-slate-900/60 backdrop-blur-[2px]'} animate-in fade-in duration-300`}>
            {/* Desktop Backdrop Click to Close */}
            {!isMobile && (
                <div
                    className="absolute inset-0"
                    onClick={onClose}
                />
            )}

            {/* Main Container - Responsive Behavior */}
            <div className={`
                ${isMobile
                    ? 'w-full h-full flex flex-col bg-white'
                    : 'relative w-full h-full flex flex-col bg-[#F9FBFD] animate-in zoom-in-95 duration-300 ease-out'
                }
            `}>
                {/* =========================================================================
                    Mobile Header (Immersive)
                   ========================================================================= */}
                <div className={`${isMobile ? 'flex' : 'hidden'} px-6 py-5 border-b border-gray-100 items-center justify-between shrink-0 bg-white sticky top-0 z-30`}>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-1 bg-blue-600 rounded-full"></div>
                        <div className="flex flex-col">
                            <div className="text-sm font-black text-slate-900 uppercase tracking-widest leading-tight">
                                {title}
                            </div>
                            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-tight mt-0.5">
                                Criar Copy da Página
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {onShare && (
                            <button
                                onClick={onShare}
                                disabled={isSharing}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined !text-[16px]">share</span>
                                {isSharing ? 'Gerando...' : 'Compartilhar'}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="size-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                    </div>
                </div>

                {/* =========================================================================
                    Desktop Header (Google Docs Style)
                   ========================================================================= */}
                <div className={`${!isMobile ? 'flex' : 'hidden'} px-6 py-4 border-b border-slate-200 items-center justify-between shrink-0 bg-white`}>
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 bg-blue-600 rounded-none"></div>
                        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                            {title}
                        </h3>
                    </div>

                    <div className="flex items-center gap-4">
                        {onShare && (
                            <button
                                onClick={onShare}
                                disabled={isSharing}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-100 transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined !text-[16px]">share</span>
                                {isSharing ? 'Gerando...' : 'Compartilhar'}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="size-8 rounded-sm hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-200"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                </div>


                {/* =========================================================================
                    Editor Body (Shared but responsive variation)
                   ========================================================================= */}
                <div className="flex-1 overflow-hidden relative">
                    <RichTextEditor
                        value={content}
                        onChange={setContent}
                        minHeight="100%"
                        maxHeight="100%"
                        className={`h-full ${isMobile ? 'border-0 rounded-none' : 'bg-transparent'}`}
                        variant={isMobile ? 'immersive' : 'default'}
                    />
                </div>

                {/* =========================================================================
                    Mobile Footer
                   ========================================================================= */}
                <div className={`${isMobile ? 'flex' : 'hidden'} px-6 py-5 border-t border-gray-100 items-center justify-between bg-white shrink-0 sticky bottom-0 z-30 pb- safe-area-bottom`}>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving && <div className="size-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>

                {/* =========================================================================
                    Desktop Footer
                   ========================================================================= */}
                <div className={`${!isMobile ? 'flex' : 'hidden'} px-6 py-4 border-t border-slate-200 items-center justify-end gap-3 bg-white shrink-0`}>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500"
                    >
                        {isSaving && <div className="size-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {isSaving ? 'PROCESSANDO...' : 'SALVAR ALTERAÇÕES'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default TextEditorModal;
