import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from './NotificationItem';

interface NotificationPanelProps {
    onClose: () => void;
    onNavigate?: (linkType: string, linkId: string) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose, onNavigate }) => {
    const { user } = useAuth();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        loading
    } = useNotifications(user?.id);

    const handleNavigate = (linkType: string, linkId: string) => {
        onClose(); // Fechar painel antes de navegar
        if (onNavigate) {
            onNavigate(linkType, linkId);
        }
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined !text-[20px]">notifications</span>
                        Notificações
                    </h3>
                    {unreadCount > 0 && (
                        <p className="text-xs text-slate-400 mt-0.5">
                            {unreadCount} {unreadCount === 1 ? 'não lida' : 'não lidas'}
                        </p>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-primary hover:underline transition-all"
                    >
                        Marcar todas como lidas
                    </button>
                )}
            </div>

            {/* Lista de Notificações */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-slate-400 font-medium">Carregando notificações...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined !text-[48px] opacity-20">notifications_off</span>
                        <p className="mt-3 text-sm font-medium">Nenhuma notificação</p>
                        <p className="mt-1 text-xs">Você está em dia! 🎉</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkAsRead={markAsRead}
                            onNavigate={handleNavigate}
                        />
                    ))
                )}
            </div>

            {/* Footer com link para configurações */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <button
                    className="text-xs font-bold text-primary hover:underline transition-all flex items-center gap-2"
                    onClick={() => {
                        // TODO: Implementar modal de configurações
                        alert('Configurações de notificações em breve!');
                    }}
                >
                    <span className="material-symbols-outlined !text-[16px]">settings</span>
                    Configurar notificações
                </button>
            </div>
        </div>
    );
};

export default NotificationPanel;
