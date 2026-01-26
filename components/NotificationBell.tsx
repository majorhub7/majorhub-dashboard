import React, { useState, useRef, useEffect } from 'react';
import NotificationPanel from './NotificationPanel';

interface NotificationBellProps {
    unreadCount: number;
    onClick?: () => void;
    onNavigate?: (linkType: string, linkId: string) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
    unreadCount,
    onClick,
    onNavigate
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const bellRef = useRef<HTMLDivElement>(null);

    // Fechar ao clicar fora
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleBellClick = () => {
        setIsOpen(!isOpen);
        onClick?.();
    };

    return (
        <div ref={bellRef} className="relative">
            <button
                onClick={handleBellClick}
                className="relative text-slate-500 hover:text-primary transition-colors p-2.5 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 rounded-full md:rounded-2xl group"
                aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ''}`}
            >
                <span className={`material-symbols-outlined !text-[20px] md:!text-[22px] transition-transform ${isOpen ? 'rotate-12' : ''
                    }`}>
                    {unreadCount > 0 ? 'notifications_active' : 'notifications'}
                </span>

                {/* Badge de contador */}
                {unreadCount > 0 && (
                    <>
                        {/* Bolinha pulsante */}
                        <span className="absolute top-2.5 right-2.5 size-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />

                        {/* Número de notificações */}
                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow-lg animate-fade-in">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </>
                )}
            </button>

            {/* Painel de Notificações */}
            {isOpen && (
                <NotificationPanel
                    onClose={() => setIsOpen(false)}
                    onNavigate={onNavigate}
                />
            )}
        </div>
    );
};

export default NotificationBell;
