import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import TurndownService from 'turndown';

// Inicializa o conversor de HTML para Markdown
const turndownService = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    strongDelimiter: '**',
    emDelimiter: '_'
});

// Regra para preservar negrito e itálico de forma consistente (incluindo tags e estilos CSS)
turndownService.addRule('bold', {
    filter: (node) => {
        if (node.nodeType !== 1) return false;
        const el = node as HTMLElement;
        return ['STRONG', 'B'].includes(node.nodeName) ||
            (el.style && (el.style.fontWeight === 'bold' || parseInt(el.style.fontWeight) >= 700));
    },
    replacement: (content) => `**${content}**`
});
turndownService.addRule('italic', {
    filter: (node) => {
        if (node.nodeType !== 1) return false;
        const el = node as HTMLElement;
        return ['EM', 'I'].includes(node.nodeName) ||
            (el.style && el.style.fontStyle === 'italic');
    },
    replacement: (content) => `_${content}_`
});

// Regra para preservar sublinhado
turndownService.addRule('underline', {
    filter: ['u', 'ins'],
    replacement: (content) => `<u>${content}</u>`
});

// Regra para preservar cores
turndownService.addRule('preserveColors', {
    filter: (node) => {
        if (node.nodeType !== 1) return false;
        const el = node as HTMLElement;
        return (node.nodeName === 'SPAN' || node.nodeName === 'FONT') && (!!el.style.color || !!el.getAttribute('color'));
    },
    replacement: (content, node) => {
        const el = node as HTMLElement;
        const color = el.style.color || el.getAttribute('color');
        return `<span style="color: ${color}">${content}</span>`;
    }
});

// Configurar marked para ser consistente com turndown e permitir HTML
marked.setOptions({
    breaks: true,
    gfm: true
});

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
    maxHeight?: string;
    className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Escreva aqui...',
    minHeight = '120px',
    maxHeight = '400px',
    className = ''
}) => {
    const [showMarkdown, setShowMarkdown] = useState<boolean>(false);
    const [activeColor, setActiveColor] = useState<string>('#1f2937');
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const richEditorRef = useRef<HTMLDivElement>(null);
    const colorPickerRef = useRef<HTMLDivElement>(null);
    const lastChangeSourceRef = useRef<'code' | 'visual' | 'external'>('external');
    const isInternalChangeRef = useRef<boolean>(false);

    const availableColors = [
        { name: 'Preto', hex: '#1f2937' },
        { name: 'Vermelho', hex: '#ef4444' },
        { name: 'Verde', hex: '#22c55e' },
        { name: 'Azul', hex: '#3b82f6' },
        { name: 'Amarelo', hex: '#f59e0b' },
        { name: 'Roxo', hex: '#8b5cf6' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setShowColorPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // MutationObserver para capturar mudanças que onInput pode perder (ex: execCommand)
    useEffect(() => {
        if (!showMarkdown && richEditorRef.current) {
            const observer = new MutationObserver(() => {
                if (lastChangeSourceRef.current !== 'external') {
                    updateContentFromRich();
                }
            });

            observer.observe(richEditorRef.current, {
                childList: true,
                characterData: true,
                subtree: true
            });

            return () => observer.disconnect();
        }
    }, [showMarkdown]);

    useEffect(() => {
        if (!showMarkdown && richEditorRef.current) {
            richEditorRef.current.focus();
            document.execCommand('styleWithCSS', false, 'true');
        }
    }, [showMarkdown]);

    useEffect(() => {
        if (!showMarkdown && richEditorRef.current) {
            const currentHtml = richEditorRef.current.innerHTML;
            // Forçar parse síncrono para evitar [object Promise]
            const newHtml = marked.parse((value || ''), { async: false }) as string;

            // Só atualiza se o conteúdo convertido for realmente diferente
            // para evitar perda de foco/seleção desnecessária
            if (currentHtml !== newHtml && lastChangeSourceRef.current !== 'visual') {
                richEditorRef.current.innerHTML = newHtml;
            }
        }
    }, [value, showMarkdown]);

    const updateContentFromRich = () => {
        if (richEditorRef.current) {
            lastChangeSourceRef.current = 'visual';
            const html = richEditorRef.current.innerHTML;
            const markdown = turndownService.turndown(html);
            onChange(markdown);
        }
    };

    const applyColor = (hex: string) => {
        setActiveColor(hex);
        setShowColorPicker(false);

        if (showMarkdown && textareaRef.current) {
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            const selectedText = value.substring(start, end);
            const beforeText = value.substring(0, start);
            const afterText = value.substring(end);

            const prefix = `<span style="color: ${hex}">`;
            const suffix = `</span>`;
            const newContent = `${beforeText}${prefix}${selectedText}${suffix}${afterText}`;

            lastChangeSourceRef.current = 'code';
            onChange(newContent);

            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    const newPos = start + prefix.length + selectedText.length + suffix.length;
                    textareaRef.current.setSelectionRange(newPos, newPos);
                }
            }, 0);
        } else if (!showMarkdown && richEditorRef.current) {
            // Garante que o editor tenha foco e a seleção seja mantida
            richEditorRef.current.focus();
            document.execCommand('foreColor', false, hex);
            updateContentFromRich();
        }
    };

    const applyListFormat = () => {
        if (showMarkdown && textareaRef.current) {
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            const selectedText = value.substring(start, end);
            const beforeText = value.substring(0, start);
            const afterText = value.substring(end);

            if (selectedText.trim().length > 0) {
                const lines = selectedText.split('\n');
                const formattedLines = lines.map(line => line.trim().startsWith('- ') ? line : `- ${line}`);
                const newText = formattedLines.join('\n');
                const newContent = `${beforeText}${newText}${afterText}`;
                lastChangeSourceRef.current = 'code';
                onChange(newContent);
                setTimeout(() => {
                    if (textareaRef.current) {
                        textareaRef.current.focus();
                        textareaRef.current.setSelectionRange(start, start + newText.length);
                    }
                }, 0);
            } else {
                applyFormat('- ', '');
            }
        } else if (!showMarkdown) {
            richEditorRef.current?.focus();
            document.execCommand('insertUnorderedList', false);
            updateContentFromRich();
        }
    };

    const applyFormat = (prefix: string, suffix: string = '', command?: string, commandArg?: string) => {
        if (showMarkdown && textareaRef.current) {
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            const selectedText = value.substring(start, end);
            const beforeText = value.substring(0, start);
            const afterText = value.substring(end);

            let newText = '';
            if (prefix === '# ' || prefix === '## ') {
                const needsNewLine = beforeText.length > 0 && !beforeText.endsWith('\n');
                const finalPrefix = needsNewLine ? `\n${prefix}` : prefix;
                newText = `${finalPrefix}${selectedText}${suffix}`;
            } else {
                newText = `${prefix}${selectedText}${suffix}`;
            }

            const newContent = `${beforeText}${newText}${afterText}`;
            lastChangeSourceRef.current = 'code';
            onChange(newContent);

            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    const newPos = start + (newText.length - selectedText.length) + selectedText.length;
                    textareaRef.current.setSelectionRange(newPos, newPos);
                }
            }, 0);
        } else if (!showMarkdown && command) {
            richEditorRef.current?.focus();
            document.execCommand(command, false, commandArg);
            updateContentFromRich();
        }
    };

    return (
        <div
            className={`flex flex-col rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden ${className}`}
            style={{ maxHeight }}
        >
            {/* Toolbar */}
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1">
                    <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); applyFormat('**', '**', 'bold'); }}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-all hover:text-primary active:scale-90 shrink-0"
                        title="Negrito"
                    >
                        <span className="font-bold text-sm">B</span>
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); applyFormat('_', '_', 'italic'); }}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-all hover:text-primary active:scale-90 shrink-0"
                        title="Itálico"
                    >
                        <span className="italic text-sm">I</span>
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); applyFormat('<u>', '</u>', 'underline'); }}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-all hover:text-primary active:scale-90 shrink-0"
                        title="Sublinhado"
                    >
                        <span className="underline text-sm">U</span>
                    </button>

                    <div className="size-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

                    <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); applyFormat('# ', '', 'formatBlock', 'H1'); }}
                        className="size-9 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-all hover:text-primary active:scale-90 shrink-0"
                        title="Título 1"
                    >
                        <span className="text-[10px] font-black">H1</span>
                    </button>
                    <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); applyFormat('## ', '', 'formatBlock', 'H2'); }}
                        className="size-9 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-all hover:text-primary active:scale-90 shrink-0"
                        title="Título 2"
                    >
                        <span className="text-[10px] font-black">H2</span>
                    </button>

                    <div className="size-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />

                    <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); applyListFormat(); }}
                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-all hover:text-primary active:scale-90 shrink-0"
                        title="Lista"
                    >
                        <span className="material-symbols-outlined !text-[20px]">list</span>
                    </button>
                </div>

                <div className="flex items-center gap-3 ml-3 shrink-0">
                    <div className="relative" ref={colorPickerRef}>
                        <button
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setShowColorPicker(!showColorPicker);
                            }}
                            className={`size-9 flex items-center justify-center rounded-xl transition-all relative border ${showColorPicker ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                            title="Cor do texto"
                        >
                            <span className="material-symbols-outlined !text-[20px]">palette</span>
                            <div className="absolute bottom-1.5 right-1.5 size-2 rounded-full border border-white dark:border-slate-800 shadow-sm transition-colors" style={{ backgroundColor: activeColor }} />
                        </button>
                        {showColorPicker && (
                            <div className="absolute top-full right-0 mt-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex gap-2 z-[100] animate-scale-up">
                                {availableColors.map((color) => (
                                    <button
                                        key={color.hex}
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            applyColor(color.hex);
                                        }}
                                        className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-125 active:scale-90 ${activeColor === color.hex ? 'border-primary ring-2 ring-primary/20 scale-110 shadow-sm' : 'border-transparent'}`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

                    <button
                        type="button"
                        onClick={() => {
                            lastChangeSourceRef.current = 'external';
                            setShowMarkdown(!showMarkdown);
                            setShowColorPicker(false);
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${showMarkdown ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                    >
                        <span className="material-symbols-outlined !text-[16px]">{showMarkdown ? 'visibility' : 'code'}</span>
                        {showMarkdown ? 'Visual' : 'Código'}
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="relative flex-1 overflow-y-auto custom-scrollbar" style={{ minHeight }}>
                {showMarkdown ? (
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => {
                            lastChangeSourceRef.current = 'code';
                            onChange(e.target.value);
                        }}
                        placeholder={placeholder}
                        className="w-full h-full p-6 text-sm leading-relaxed font-mono focus:outline-none resize-none bg-transparent text-slate-700 dark:text-slate-300 placeholder:text-slate-200 dark:placeholder:text-slate-800"
                        style={{ minHeight: '100%' }}
                        spellCheck={false}
                    />
                ) : (
                    <div
                        ref={richEditorRef}
                        contentEditable
                        onInput={() => updateContentFromRich()}
                        className="w-full h-full p-6 text-sm leading-relaxed focus:outline-none prose prose-sm dark:prose-invert max-w-none bg-transparent text-slate-700 dark:text-slate-300 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-200 dark:empty:before:text-slate-800"
                        style={{ minHeight: '100%' }}
                        data-placeholder={placeholder}
                        spellCheck={false}
                    />
                )}
            </div>

            <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div>
    );
};

export default RichTextEditor;
