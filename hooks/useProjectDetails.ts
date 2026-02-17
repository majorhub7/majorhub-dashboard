import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Database } from '../types';

type DbActivity = Database['public']['Tables']['project_activities']['Row'];

export function useProjectDetails(projectId: string | null) {
    const [activities, setActivities] = useState<DbActivity[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDetails = useCallback(async () => {
        if (!projectId) return;

        setLoading(true);
        try {
            // Fetch Activities (Chat/History) - The heavy part
            const { data: activitiesData, error: actError } = await supabase
                .from('project_activities')
                .select('*')
                .eq('project_id', projectId)
                .order('timestamp', { ascending: false })
                .limit(50);

            // Revert to ascending for UI consistency (Oldest -> Newest)
            if (activitiesData) {
                activitiesData.reverse();
            }

            if (actError) {
                console.error('Error fetching project activities:', actError);
                throw actError;
            }

            setActivities(activitiesData || []);
        } catch (err: any) {
            console.error('Hook useProjectDetails error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchDetails();

        if (!projectId) return;

        // Subscribe to changes
        const channel = supabase
            .channel(`project_activities:${projectId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'project_activities',
                filter: `project_id=eq.${projectId}`
            }, (payload) => {
                setActivities(prev => [...prev, payload.new as DbActivity]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [projectId, fetchDetails]);

    // Function to manually add an activity to the local state (optimistic)
    const addLocalActivity = useCallback((activity: DbActivity) => {
        setActivities(prev => {
            if (prev.some(a => a.id === activity.id)) return prev;
            return [...prev, activity];
        });
    }, []);

    return {
        activities,
        loading,
        error,
        refetch: fetchDetails,
        addLocalActivity
    };
}
