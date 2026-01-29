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

// Regra para preservar negrito e itálico de forma consistente
turndownService.addRule('bold', {
    filter: (node, options) => {
        if (node.nodeType !== 1) return false;
        const el = node as HTMLElement;
        return (
            ['STRONG', 'B'].includes(node.nodeName) ||
            (el.style && (el.style.fontWeight === 'bold' || parseInt(el.style.fontWeight || '0') >= 700))
        );
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
    filter: (node, options) => {
        if (node.nodeType !== 1) return false;
        const el = node as HTMLElement;
        return (
            ['U', 'INS'].includes(node.nodeName) ||
            (el.style && el.style.textDecoration?.includes('underline'))
        );
    },
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

// Regra para preservar alinhamento (Markdown não suporta nativamente, usamos HTML)
turndownService.addRule('align', {
    filter: (node, options) => {
        if (node.nodeType !== 1) return false;
        const el = node as HTMLElement;
        return (
            ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(node.nodeName) &&
            !!el.style.textAlign
        );
    },
    replacement: (content, node) => {
        const el = node as HTMLElement;
        const align = el.style.textAlign;
        const tag = node.nodeName.toLowerCase();
        return `<${tag} style="text-align: ${align}">${content}</${tag}>\n\n`;
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
    const [currentFontSize, setCurrentFontSize] = useState<number>(3); // Default to 3 (approx 16px/12pt)
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const richEditorRef = useRef<HTMLDivElement>(null);
    const colorPickerRef = useRef<HTMLDivElement>(null);
    const lastChangeSourceRef = useRef<'code' | 'visual' | 'external'>('external');

    // Font Sizes mapping (HTML font size 1-7 to approx px)
    const fontSizesMap: Record<number, string> = {
        1: '10',
        2: '13',
        3: '16',
        4: '18',
        5: '24',
        6: '32',
        7: '48'
    };

    const availableColors = [
        { name: 'Preto', hex: '#1f2937' },
        { name: 'Cinza', hex: '#64748b' },
        { name: 'Vermelho', hex: '#ef4444' },
        { name: 'Laranja', hex: '#f97316' },
        { name: 'Amarelo', hex: '#eab308' },
        { name: 'Verde', hex: '#22c55e' },
        { name: 'Azul', hex: '#3b82f6' },
        { name: 'Roxo', hex: '#a855f7' },
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

    // Extract headings for sidebar
    const updateHeadings = () => {
        if (richEditorRef.current) {
            const elements = richEditorRef.current.querySelectorAll('h1, h2, h3');
            const newHeadings: { id: string; text: string; level: number }[] = [];

            elements.forEach((el, index) => {
                if (!el.id) el.id = `heading-${index}`;
                newHeadings.push({
                    id: el.id,
                    text: el.textContent || '',
                    level: parseInt(el.tagName.substring(1))
                });
            });
            setHeadings(newHeadings);
        }
    };

    // Detect current font size at cursor
    const updateToolbarState = () => {
        if (document.queryCommandSupported('fontSize')) {
            const size = document.queryCommandValue('fontSize');
            if (size) {
                const numericSize = parseInt(size);
                if (!isNaN(numericSize) && numericSize >= 1 && numericSize <= 7) {
                    setCurrentFontSize(numericSize);
                }
            }
        }
    };

    // MutationObserver to sync content and headings
    useEffect(() => {
        if (!showMarkdown && richEditorRef.current) {
            const observer = new MutationObserver(() => {
                if (lastChangeSourceRef.current !== 'external') {
                    updateContentFromRich();
                    updateHeadings();
                    // Also update toolbar state on regular typing/clicking
                }
            });

            observer.observe(richEditorRef.current, {
                childList: true,
                characterData: true,
                subtree: true
            });

            // Listen for selection changes to update font size display
            const handleSelectionChange = () => {
                updateToolbarState();
            };
            document.addEventListener('selectionchange', handleSelectionChange);

            // Initial heading update
            updateHeadings();

            return () => {
                observer.disconnect();
                document.removeEventListener('selectionchange', handleSelectionChange);
            };
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
            const newHtml = marked.parse((value || ''), { async: false }) as string;

            if (currentHtml !== newHtml && lastChangeSourceRef.current !== 'visual') {
                richEditorRef.current.innerHTML = newHtml;
                updateHeadings();
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
        richEditorRef.current?.focus();
        document.execCommand('foreColor', false, hex);
        updateContentFromRich();
    };

    const changeFontSize = (delta: number) => {
        let newSize = currentFontSize + delta;
        if (newSize < 1) newSize = 1;
        if (newSize > 7) newSize = 7;

        setCurrentFontSize(newSize);
        richEditorRef.current?.focus();
        document.execCommand('fontSize', false, newSize.toString());
        updateContentFromRich();
    };

    const applyListFormat = (ordered: boolean = false) => {
        richEditorRef.current?.focus();
        document.execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList', false);
        updateContentFromRich();
    };

    const applyLink = () => {
        const url = window.prompt('Digite a URL do link:');
        if (url) {
            richEditorRef.current?.focus();
            document.execCommand('createLink', false, url);
            updateContentFromRich();
        }
    };

    const applyAlignment = (align: 'justifyLeft' | 'justifyCenter' | 'justifyRight' | 'justifyFull') => {
        richEditorRef.current?.focus();
        document.execCommand(align, false);
        updateContentFromRich();
    };

    const performAction = (command: string, arg?: string) => {
        richEditorRef.current?.focus();
        document.execCommand(command, false, arg);
        updateContentFromRich();
    };

    const applyFormat = (command: string, commandArg?: string) => {
        richEditorRef.current?.focus();
        document.execCommand(command, false, commandArg);
        updateContentFromRich();
    };

    const scrollToHeading = (id: string) => {
        const element = richEditorRef.current?.querySelector(`#${id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <div className={`flex flex-col rounded-sm border-0 border-slate-200 bg-[#F9FBFD] h-full overflow-hidden ${className}`}>
            {/* Toolbar - Google Docs Style */}
            <div className="bg-[#EDF2FA] border-b border-slate-300 flex items-center justify-between px-4 py-2 shrink-0 rounded-t-[24px] mx-4 mt-4 shadow-sm z-10">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 flex-1">

                    {/* Undo/Redo */}
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); performAction('undo'); }} className="size-8 flex items-center justify-center hover:bg-[#D3E3FD] rounded-sm text-slate-700 hover:text-slate-900 transition-all active:scale-95 shrink-0" title="Desfazer">
                        <span className="material-symbols-outlined !text-[20px]">undo</span>
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); performAction('redo'); }} className="size-8 flex items-center justify-center hover:bg-[#D3E3FD] rounded-sm text-slate-700 hover:text-slate-900 transition-all active:scale-95 shrink-0" title="Refazer">
                        <span className="material-symbols-outlined !text-[20px]">redo</span>
                    </button>

                    <div className="w-px h-5 bg-slate-300 mx-2 shrink-0" />

                    {/* Text Style */}
                    <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-md p-0.5 mx-2">
                        <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); changeFontSize(-1); }}
                            className="size-7 flex items-center justify-center hover:bg-white rounded-sm text-slate-600 hover:text-slate-900 transition-all font-medium text-lg active:scale-95 disabled:opacity-30"
                            disabled={currentFontSize <= 1}
                            title="Diminuir fonte"
                        >
                            −
                        </button>
                        <div className="w-8 flex items-center justify-center font-bold text-slate-700 text-sm select-none">
                            {fontSizesMap[currentFontSize]}
                        </div>
                        <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); changeFontSize(1); }}
                            className="size-7 flex items-center justify-center hover:bg-white rounded-sm text-slate-600 hover:text-slate-900 transition-all font-medium text-lg active:scale-95 disabled:opacity-30"
                            disabled={currentFontSize >= 7}
                            title="Aumentar fonte"
                        >
                            +
                        </button>
                    </div>

                    <div className="w-px h-5 bg-slate-300 mx-2 shrink-0" />

                    <button type="button" onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }} className="size-8 flex items-center justify-center hover:bg-[#D3E3FD] rounded-sm text-slate-700 hover:text-slate-900 transition-all active:scale-95 shrink-0" title="Negrito">
                        <span className="font-bold text-lg">B</span>
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }} className="size-8 flex items-center justify-center hover:bg-[#D3E3FD] rounded-sm text-slate-700 hover:text-slate-900 transition-all active:scale-95 shrink-0" title="Itálico">
                        <span className="italic text-lg font-serif">I</span>
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); applyFormat('underline'); }} className="size-8 flex items-center justify-center hover:bg-[#D3E3FD] rounded-sm text-slate-700 hover:text-slate-900 transition-all active:scale-95 shrink-0" title="Sublinhado">
                        <span className="underline text-lg">U</span>
                    </button>
                    <div className="relative" ref={colorPickerRef}>
                        <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(!showColorPicker); }}
                            className="size-8 flex items-center justify-center hover:bg-[#D3E3FD] rounded-sm text-slate-700 group"
                            title="Cor do texto"
                        >
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-sm leading-none">A</span>
                                <div className="h-1 w-4 mt-0.5" style={{ backgroundColor: activeColor }}></div>
                            </div>
                        </button>
                        {showColorPicker && (
                            <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-slate-200 rounded-sm shadow-xl flex gap-1 z-[100] w-36 flex-wrap">
                                {availableColors.map((color) => (
                                    <button
                                        key={color.hex}
                                        type="button"
                                        onMouseDown={(e) => { e.preventDefault(); applyColor(color.hex); }}
                                        className={`size-6 rounded-full border transition-all hover:scale-110 ${activeColor === color.hex ? 'border-blue-500 ring-1 ring-blue-200' : 'border-slate-200'}`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="w-px h-5 bg-slate-300 mx-2 shrink-0" />

                    {/* Heads */}
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); applyFormat('formatBlock', 'H1'); }} className="size-8 flex items-center justify-center hover:bg-[#D3E3FD] rounded-sm text-slate-700 hover:text-slate-900 transition-all active:scale-95 shrink-0" title="Título 1">
                        <span className="text-xs font-black">H1</span>
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); applyFormat('formatBlock', 'H2'); }} className="size-8 flex items-center justify-center hover:bg-[#D3E3FD] rounded-sm text-slate-700 hover:text-slate-900 transition-all active:scale-95 shrink-0" title="Título 2">
                        <span className="text-xs font-black">H2</span>
                    </button>

                    <div className="w-px h-5 bg-slate-300 mx-2 shrink-0" />


                    {/* Alignments */}
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); applyAlignment('justifyLeft'); }} className="size-8 flex items-center justify-center hover:bg-[#D3E3FD] rounded-sm text-slate-700 hover:text-slate-900 transition-all active:scale-95 shrink-0" title="Esquerda">
                        <span className="material-symbols-outlined !text-[20px]">format_align_left</span>
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); applyAlignment('justifyCenter'); }} className="size-8 flex items-center justify-center hover:bg-[#D3E3FD] rounded-sm text-slate-700 hover:text-slate-900 transition-all active:scale-95 shrink-0" title="Centro">
                        <span className="material-symbols-outlined !text-[20px]">format_align_center</span>
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); applyAlignment('justifyRight'); }} className="size-8 flex items-center justify-center hover:bg-[#D3E3FD] rounded-sm text-slate-700 hover:text-slate-900 transition-all active:scale-95 shrink-0" title="Direita">
                        <span className="material-symbols-outlined !text-[20px]">format_align_right</span>
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); applyAlignment('justifyFull'); }} className="size-8 flex items-center justify-center hover:bg-[#D3E3FD] rounded-sm text-slate-700 hover:text-slate-900 transition-all active:scale-95 shrink-0" title="Justificado">
                        <span className="material-symbols-outlined !text-[20px]">format_align_justify</span>
                    </button>

                    <div className="w-px h-5 bg-slate-300 mx-2 shrink-0" />

                    {/* Lists & Links */}
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); applyListFormat(false); }} className="size-8 flex items-center justify-center hover:bg-[#D3E3FD] rounded-sm text-slate-700 hover:text-slate-900 transition-all active:scale-95 shrink-0" title="Lista">
                        <span className="material-symbols-outlined !text-[20px]">format_list_bulleted</span>
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); applyListFormat(true); }} className="size-8 flex items-center justify-center hover:bg-[#D3E3FD] rounded-sm text-slate-700 hover:text-slate-900 transition-all active:scale-95 shrink-0" title="Lista Numérica">
                        <span className="material-symbols-outlined !text-[20px]">format_list_numbered</span>
                    </button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); applyLink(); }} className="size-8 flex items-center justify-center hover:bg-[#D3E3FD] rounded-sm text-slate-700 hover:text-slate-900 transition-all active:scale-95 shrink-0" title="Link">
                        <span className="material-symbols-outlined !text-[20px]">link</span>
                    </button>

                </div>

                <div className="flex items-center gap-3 ml-3 shrink-0">
                    <button
                        type="button"
                        onClick={() => {
                            lastChangeSourceRef.current = 'external';
                            setShowMarkdown(!showMarkdown);
                            setShowColorPicker(false);
                        }}
                        className={`h-8 px-3 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 border ${showMarkdown ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-600'}`}
                    >
                        <span className="material-symbols-outlined !text-[16px]">{showMarkdown ? 'visibility' : 'code'}</span>
                    </button>
                </div>
            </div>

            {/* Workspace Area: Sidebar + Page */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* Left Sidebar - Structure */}
                <div className="w-64 hidden md:flex flex-col border-r border-slate-200/60 bg-white/50 backdrop-blur-sm pt-6 px-4 pb-4 overflow-y-auto">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">toc</span>
                        Estrutura
                    </h3>
                    {headings.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Adicione títulos (H1, H2, H3) para ver a estrutura.</p>
                    ) : (
                        <div className="flex flex-col gap-1">
                            {headings.map((heading, i) => (
                                <button
                                    key={i}
                                    onClick={() => scrollToHeading(heading.id)}
                                    className={`text-left text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-sm py-1.5 px-2 transition-colors truncate ${heading.level === 1 ? 'font-bold' : heading.level === 2 ? 'pl-4' : 'pl-8 text-xs'}`}
                                >
                                    {heading.text}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Center - Page Canvas */}
                <div className="flex-1 overflow-y-auto bg-[#F9FBFD] p-8 flex justify-center custom-scrollbar" id="editor-canvas">
                    {showMarkdown ? (
                        <div className="w-full max-w-[850px] bg-white shadow-sm border border-slate-200 min-h-[1100px] p-12">
                            <textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => {
                                    lastChangeSourceRef.current = 'code';
                                    onChange(e.target.value);
                                }}
                                placeholder={placeholder}
                                className="w-full h-full text-sm leading-relaxed font-mono focus:outline-none resize-none bg-transparent text-slate-800 placeholder:text-slate-300"
                                style={{ minHeight: '1000px' }}
                                spellCheck={false}
                            />
                        </div>
                    ) : (
                        <div className="w-full max-w-[850px] mb-20">
                            {/* Page Representation */}
                            <div
                                className="bg-white shadow-md border border-slate-200 min-h-[1100px] p-[96px] outline-none"
                                onClick={() => richEditorRef.current?.focus()}
                            >
                                <div
                                    ref={richEditorRef}
                                    contentEditable
                                    onInput={() => updateContentFromRich()}
                                    className="w-full h-full text-[11pt] leading-[1.15] focus:outline-none prose prose-slate max-w-none text-slate-900 empty:before:content-[attr(data-placeholder)] empty:before:text-slate-300 empty:before:italic selection:bg-blue-100 selection:text-blue-900"
                                    style={{ fontFamily: 'Arial, sans-serif' }}
                                    data-placeholder={placeholder}
                                    spellCheck={false}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Spacing / Tools (Future) */}
                <div className="w-64 hidden xl:block border-l border-slate-200/60 bg-white/50 backdrop-blur-sm p-4">
                    {/* Placeholder for comments or additional tools */}
                </div>

            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
