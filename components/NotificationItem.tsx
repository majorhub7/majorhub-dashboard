import React from 'react';
import type { Notification } from '../types';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onNavigate?: (linkType: string, linkId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onMarkAsRead,
    onNavigate
}) => {
    const isUnread = !notification.readAt;

    // Mapeamento de ícones por tipo de notificação
    const iconMap: Record<string, string> = {
        deadline: 'schedule',
        mention: 'alternate_email',
        project_created: 'celebration',
        status_changed: 'sync',
        goal_completed: 'check_circle'
    };

    const handleClick = () => {
        // Marcar como lida se não lida
        if (isUnread) {
            onMarkAsRead(notification.id);
        }

        // Navegação (se tiver link)
        if (notification.linkType && notification.linkId && onNavigate) {
            onNavigate(notification.linkType, notification.linkId);
        }
    };

    // Formatação de data/hora amigável
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Agora';
        if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;

        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div
            onClick={handleClick}
            className={`px-6 py-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer transition-all duration-200 ${isUnread ? 'bg-primary/5 dark:bg-primary/5' : ''
                }`}
        >
            <div className="flex gap-4">
                {/* Ícone */}
                <div className={`size-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isUnread
                        ? 'bg-primary/10 dark:bg-primary/20'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                    <span className={`material-symbols-outlined !text-[20px] ${isUnread ? 'text-primary' : 'text-slate-400'
                        }`}>
                        {iconMap[notification.type] || 'notifications'}
                    </span>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isUnread
                            ? 'text-slate-800 dark:text-white'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}>
                        {notification.title}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {notification.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                        {formatDate(notification.createdAt)}
                    </p>
                </div>

                {/* Badge não lida */}
                {isUnread && (
                    <div className="size-2 bg-primary rounded-full shrink-0 mt-2 animate-pulse" />
                )}
            </div>
        </div>
    );
};

export default NotificationItem;
