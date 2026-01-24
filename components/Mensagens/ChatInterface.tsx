import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Conversation, Message, User } from '../../types';

// Skeleton animado para mensagens
const MessageSkeleton = ({ isOwn = false }: { isOwn?: boolean }) => (
    <div className={`flex items-start gap-5 max-w-[80%] animate-pulse ${isOwn ? 'flex-row-reverse ml-auto' : ''}`}>
        {!isOwn && <div className="size-11 rounded-full bg-slate-200 dark:bg-slate-700" />}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2" />
            <div className={`p-6 rounded-[2.5rem] w-48 md:w-64 ${isOwn ? 'bg-primary/20 rounded-tr-none' : 'bg-slate-200 dark:bg-slate-700 rounded-tl-none'}`}>
                <div className="h-4 bg-slate-300/50 dark:bg-slate-600/50 rounded w-full mb-2" />
                <div className="h-4 bg-slate-300/50 dark:bg-slate-600/50 rounded w-3/4" />
            </div>
        </div>
    </div>
);

interface ChatInterfaceProps {
    selectedConv: Conversation | null;
    currentMessages: Message[];
    newMessage: string;
    setNewMessage: (val: string) => void;
    onSendMessage: (e: React.FormEvent) => void;
    onBack: () => void;
    showMobileChat: boolean;
    currentUser: User;
    loadingMessages?: boolean;
    isAITyping?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = React.memo(({
    selectedConv,
    currentMessages,
    newMessage,
    setNewMessage,
    onSendMessage,
    onBack,
    showMobileChat,
    currentUser,
    loadingMessages = false,
    isAITyping = false
}) => {
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages, isAITyping]);

    if (!selectedConv) {
        return (
            <div className={`flex-1 flex flex-col items-center justify-center text-slate-300 gap-6 opacity-40 relative ${!showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
                <div className="size-20 md:size-24 rounded-[2rem] md:rounded-[2.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                    <span className="material-symbols-outlined !text-[40px] md:!text-[48px]">forum</span>
                </div>
                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-center px-4">Selecione uma conversa para<br />começar a colaborar</p>
            </div>
        );
    }

    return (
        <div className={`flex-1 flex flex-col bg-slate-50/20 dark:bg-slate-950/40 relative ${!showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
            <header className="h-20 md:h-24 px-6 md:px-10 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 md:gap-5">
                    <button onClick={onBack} className="lg:hidden p-2 text-slate-400 hover:text-slate-900">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>

                    {selectedConv.id === 'ai-major' ? (
                        <div className="size-10 md:size-14 rounded-xl md:rounded-2xl bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white shrink-0 shadow-sm border border-slate-100 dark:border-slate-800">
                            <span className="material-symbols-outlined !text-[24px] md:!text-[28px]">psychology</span>
                        </div>
                    ) : (
                        <div className={`size-10 md:size-14 rounded-xl md:rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 ${selectedConv.type === 'private' ? 'rounded-full' : ''}`}>
                            <img
                                src={selectedConv.avatar}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConv.name)}&background=8b5cf6&color=fff&size=150`;
                                }}
                            />
                        </div>
                    )}

                    <div>
                        <h3 className="text-base md:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                            {selectedConv?.name || 'Conversa'}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`size-2 rounded-full ${selectedConv?.online || selectedConv?.type === 'group' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                            <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                {selectedConv?.online || selectedConv?.type === 'group'
                                    ? (selectedConv?.type === 'group' ? `${selectedConv?.participantsCount || 4} Membros Ativos` : 'Online Agora')
                                    : 'Visto recentemente'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2">
                    <button className="size-11 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined !text-[24px]">videocam</span>
                    </button>
                    <button className="size-11 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined !text-[24px]">search</span>
                    </button>
                    <div className="w-px h-8 bg-slate-100 dark:bg-slate-800 mx-1"></div>
                    <button className="size-11 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined !text-[24px]">more_horiz</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 space-y-6 md:space-y-8">
                <div className="flex justify-center">
                    <span className="px-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 text-[9px] font-black uppercase tracking-[0.15em] rounded-full shadow-sm">Hoje</span>
                </div>

                {loadingMessages ? (
                    <>
                        <MessageSkeleton />
                        <MessageSkeleton isOwn />
                        <MessageSkeleton />
                    </>
                ) : currentMessages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-start gap-3 md:gap-5 max-w-[95%] md:max-w-[80%] animate-fade-in ${msg.senderId === currentUser.id ? 'flex-row-reverse ml-auto' : ''}`}
                    >
                        {msg.senderId !== currentUser.id && (
                            <div className={`size-8 md:size-11 rounded-full flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden ${msg.senderId === 'ai-major' ? 'bg-slate-900 dark:bg-slate-800 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                {msg.senderId === 'ai-major' || msg.senderAvatar === 'ai-avatar' ? (
                                    <span className="material-symbols-outlined !text-[18px] md:!text-[22px]">psychology</span>
                                ) : msg.senderAvatar ? (
                                    <img
                                        src={msg.senderAvatar}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=8b5cf6&color=fff&size=150`;
                                        }}
                                    />
                                ) : (
                                    <span className="text-[10px] md:text-xs font-black">{msg.senderName.charAt(0)}</span>
                                )}
                            </div>
                        )}
                        <div className={`flex flex-col ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-3 mb-1.5 px-1">
                                <span className="text-[10px] md:text-[11px] font-black text-slate-900 dark:text-slate-100">{msg.senderName}</span>
                                <span className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase">{msg.timestamp}</span>
                            </div>
                            <div className={`p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-sm text-sm md:text-base leading-relaxed ${msg.senderId === currentUser.id
                                ? 'bg-primary text-white rounded-tr-none'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-50 dark:border-slate-700 rounded-tl-none'
                                }`}>
                                {msg.senderId === 'ai-major' ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:text-primary">
                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                    </div>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {isAITyping && (
                    <div className="flex items-start gap-3 md:gap-5 max-w-[95%] md:max-w-[80%] animate-fade-in">
                        <div className="size-8 md:size-11 rounded-full bg-slate-900 dark:bg-slate-800 flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-800 shadow-sm text-white">
                            <span className="material-symbols-outlined !text-[18px] md:!text-[22px]">psychology</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <div className="flex items-center gap-3 mb-1.5 px-1">
                                <span className="text-[10px] md:text-[11px] font-black text-slate-900 dark:text-slate-100">Major I.A</span>
                                <span className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase italic">Digitando...</span>
                            </div>
                            <div className="p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] bg-white dark:bg-slate-800 border border-slate-50 dark:border-slate-700 rounded-tl-none shadow-sm">
                                <div className="flex gap-1.5">
                                    <span className="size-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="size-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="size-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="p-4 md:p-8">
                <form
                    onSubmit={onSendMessage}
                    className="max-w-6xl mx-auto bg-white dark:bg-slate-900 p-2.5 rounded-[1.5rem] md:rounded-[3rem] border border-slate-100 dark:border-slate-700 focus-within:ring-8 focus-within:ring-primary/5 transition-all shadow-2xl"
                >
                    <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4">
                        <button type="button" className="size-10 md:size-12 rounded-xl md:rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-all flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined !text-[22px] md:!text-[24px]">mic</span>
                        </button>

                        <input
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base py-3 md:py-4 placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-white font-medium"
                            placeholder="Escreva algo..."
                            type="text"
                        />

                        <button type="button" className="size-10 md:size-12 rounded-xl md:rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-all flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined !text-[22px] md:!text-[24px]">add_circle</span>
                        </button>

                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className={`size-10 md:size-12 rounded-xl md:rounded-2xl shadow-lg transition-all flex items-center justify-center shrink-0 active:scale-90 ${newMessage.trim() ? 'bg-primary text-white shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                                }`}
                        >
                            <span className="material-symbols-outlined !fill-1 !text-white !text-[22px] md:!text-[24px]">send</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default ChatInterface;
