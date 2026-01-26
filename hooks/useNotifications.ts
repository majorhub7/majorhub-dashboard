import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { Notification, NotificationPreferences } from '../types';

interface UseNotificationsReturn {
    notifications: Notification[];
    unreadCount: number;
    preferences: NotificationPreferences | null;
    loading: boolean;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    updatePreferences: (newPrefs: Partial<NotificationPreferences>) => Promise<void>;
    refetch: () => Promise<void>;
}

export function useNotifications(userId: string | undefined): UseNotificationsReturn {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch inicial de notificações
    const fetchNotifications = useCallback(async () => {
        if (!userId) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (!error && data) {
            const mappedNotifications = (data as any[]).map(n => ({
                id: n.id,
                userId: n.user_id,
                clientId: n.client_id || undefined,
                type: n.type as any,
                title: n.title,
                message: n.message,
                linkType: n.link_type as any,
                linkId: n.link_id || undefined,
                readAt: n.read_at || undefined,
                createdAt: n.created_at,
                metadata: n.metadata || {}
            }));

            setNotifications(mappedNotifications);
            setUnreadCount(mappedNotifications.filter(n => !n.readAt).length);
        }
        setLoading(false);
    }, [userId]);

    // Fetch preferências
    const fetchPreferences = useCallback(async () => {
        if (!userId) return;

        const { data, error } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!error && data) {
            setPreferences({
                userId: (data as any).user_id,
                inAppEnabled: (data as any).in_app_enabled,
                notifyDeadlines: (data as any).notify_deadlines,
                notifyMentions: (data as any).notify_mentions,
                notifyProjectUpdates: (data as any).notify_project_updates,
                notifyGoalCompleted: (data as any).notify_goal_completed,
                updatedAt: (data as any).updated_at
            });
        } else if (error && error.code === 'PGRST116') {
            // Não encontrado, criar preferências padrão
            const { data: newPrefs, error: insertError } = await supabase
                .from('notification_preferences')
                .insert({ user_id: userId } as any)
                .select()
                .single();

            if (!insertError && newPrefs) {
                setPreferences({
                    userId: (newPrefs as any).user_id,
                    inAppEnabled: true,
                    notifyDeadlines: true,
                    notifyMentions: true,
                    notifyProjectUpdates: true,
                    notifyGoalCompleted: true,
                    updatedAt: (newPrefs as any).updated_at
                });
            }
        }
    }, [userId]);

    // Setup inicial e Realtime subscription
    useEffect(() => {
        if (!userId) {
            setNotifications([]);
            setPreferences(null);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        fetchNotifications();
        fetchPreferences();

        // Supabase Realtime: escutar novas notificações
        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    const newNotification = payload.new as any;
                    const mapped: Notification = {
                        id: newNotification.id,
                        userId: newNotification.user_id,
                        clientId: newNotification.client_id,
                        type: newNotification.type,
                        title: newNotification.title,
                        message: newNotification.message,
                        linkType: newNotification.link_type,
                        linkId: newNotification.link_id,
                        readAt: newNotification.read_at,
                        createdAt: newNotification.created_at,
                        metadata: newNotification.metadata || {}
                    };

                    setNotifications(prev => [mapped, ...prev]);
                    setUnreadCount(prev => prev + 1);

                    // Som de notificação (opcional)
                    // new Audio('/notification.mp3').play().catch(() => {});
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchNotifications, fetchPreferences]);

    // Marcar uma notificação como lida
    const markAsRead = useCallback(async (notificationId: string) => {
        const now = new Date().toISOString();
        const { error } = await supabase
            .from('notifications')
            .update({ read_at: now } as any)
            .eq('id', notificationId);

        if (!error) {
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, readAt: now } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    }, []);

    // Marcar todas como lidas
    const markAllAsRead = useCallback(async () => {
        if (!userId) return;

        const now = new Date().toISOString();
        const { error } = await supabase
            .from('notifications')
            .update({ read_at: now } as any)
            .eq('user_id', userId)
            .is('read_at', null);

        if (!error) {
            setNotifications(prev =>
                prev.map(n => ({ ...n, readAt: n.readAt || now }))
            );
            setUnreadCount(0);
        }
    }, [userId]);

    // Atualizar preferências
    const updatePreferences = useCallback(async (newPrefs: Partial<NotificationPreferences>) => {
        if (!userId) return;

        const updates: any = {};
        if (newPrefs.notifyDeadlines !== undefined) updates.notify_deadlines = newPrefs.notifyDeadlines;
        if (newPrefs.notifyMentions !== undefined) updates.notify_mentions = newPrefs.notifyMentions;
        if (newPrefs.notifyProjectUpdates !== undefined) updates.notify_project_updates = newPrefs.notifyProjectUpdates;
        if (newPrefs.notifyGoalCompleted !== undefined) updates.notify_goal_completed = newPrefs.notifyGoalCompleted;
        if (newPrefs.inAppEnabled !== undefined) updates.in_app_enabled = newPrefs.inAppEnabled;

        const { error } = await supabase
            .from('notification_preferences')
            .update(updates as any)
            .eq('user_id', userId);

        if (!error) {
            setPreferences(prev => prev ? { ...prev, ...newPrefs } : null);
        }
    }, [userId]);

    return useMemo(() => ({
        notifications,
        unreadCount,
        preferences,
        loading,
        markAsRead,
        markAllAsRead,
        updatePreferences,
        refetch: fetchNotifications
    }), [
        notifications,
        unreadCount,
        preferences,
        loading,
        markAsRead,
        markAllAsRead,
        updatePreferences,
        fetchNotifications
    ]);
}
