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

    useEffect(() => {
        if (isOpen) {
            setContent(initialContent);
        }
    }, [isOpen, initialContent]);

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Darkened dimmer with slight blur */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container - Full Screen for Google Docs feel */}
            <div className="relative w-full h-full bg-[#F9FBFD] flex flex-col animate-in zoom-in-95 duration-300 ease-out">

                {/* Header - Technical/Sharp */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
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

                {/* Body - Maximize work area */}
                <div className="flex-1 overflow-hidden bg-[#F9FBFD] relative">
                    <RichTextEditor
                        value={content}
                        onChange={setContent}
                        minHeight="100%"
                        maxHeight="100%"
                        className="h-full border-0 rounded-none bg-transparent"
                    />
                </div>

                {/* Footer - Command Bar feel */}
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-white shrink-0">
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
