import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Database } from '../types/database';

type UserActivity = Database['public']['Tables']['user_activities']['Row'];
type UserActivityInsert = Database['public']['Tables']['user_activities']['Insert'];

export function useActivities(userId: string | null) {
    const [activities, setActivities] = useState<UserActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchActivities();
        }
    }, [userId]);

    const fetchActivities = async () => {
        if (!userId) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('user_activities')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (!error && data) {
            setActivities(data);
        }
        setLoading(false);
    };

    const addActivity = async (activity: Omit<UserActivityInsert, 'user_id'>) => {
        if (!userId) return { error: new Error('User ID is required') };

        const { data, error } = await (supabase
            .from('user_activities') as any)
            .insert({ ...activity, user_id: userId })
            .select()
            .single();

        if (!error && data) {
            setActivities(prev => [data, ...prev]);
        }
        return { data, error };
    };

    return {
        activities,
        loading,
        addActivity,
        refetch: fetchActivities,
    };
}
