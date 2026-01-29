import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { Database, DbProjectWithRelations } from '../types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

export function useProjects(clientId: string | null) {
    const [projects, setProjects] = useState<DbProjectWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        if (!clientId) return;

        setLoading(true);
        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                creative_goals(*),
                documents(*)
            `)
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) {
            setError(error.message);
        } else {
            setProjects(data || []);
        }
        setLoading(false);
    }, [clientId]);

    useEffect(() => {
        if (!clientId) {
            setProjects([]);
            setLoading(false);
            return;
        }

        fetchProjects();
    }, [clientId, fetchProjects]);

    const createProject = useCallback(async (project: any) => {
        // Generate a random invite code if not provided
        const inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 6);

        // Explicitly map fields to match the database schema
        const projectData: ProjectInsert = {
            client_id: project.clientId || project.client_id,
            title: project.title,
            description: project.description,
            image_url: project.imageUrl || project.image_url,
            status: project.status || 'In Progress',
            due_date: (project.dueDate && project.dueDate !== 'A definir') ? project.dueDate : null,
            progress: project.progress || 0,
            priority: project.priority || false
        };

        const { data, error } = await supabase
            .from('projects')
            .insert({ ...projectData, invite_code: inviteCode } as any)
            .select()
            .single();

        if (error) throw error;
        if (data) {
            const newProject = {
                ...(data as any),
                creative_goals: [],
                documents: [],
                project_activities: []
            };
            setProjects(prev => [newProject, ...prev]);
        }
        return data;
    }, []);

    const updateProject = useCallback(async (id: string, updates: Partial<ProjectInsert>) => {
        const { data, error } = await supabase
            .from('projects')
            .update(updates as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        if (data) {
            setProjects(prev => prev.map(p => p.id === id ? { ...p, ...(data as any) } : p));
        }
        return data;
    }, []);

    const deleteProject = useCallback(async (id: string) => {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;
        setProjects(prev => prev.filter(p => p.id !== id));
    }, []);

    const addGoal = useCallback(async (projectId: string, goal: any) => {
        const { id, ...goalData } = goal;
        const payload = { ...goalData, project_id: projectId };

        const { data, error } = await supabase
            .from('creative_goals')
            .insert(payload as any)
            .select()
            .single();

        if (error) throw error;

        if (data) {
            setProjects(prev => prev.map(p => {
                if (p.id === projectId) {
                    return { ...p, creative_goals: [...(p.creative_goals || []), data] };
                }
                return p;
            }));
        }
        return data;
    }, []);

    const updateGoal = useCallback(async (goalId: string, updates: any) => {
        const { data, error } = await supabase
            .from('creative_goals')
            .update(updates as any)
            .eq('id', goalId)
            .select()
            .single();

        if (error) throw error;

        if (data) {
            setProjects(prev => prev.map(p => {
                const goals = p.creative_goals || [];
                if (goals.some((g: any) => g.id === goalId)) {
                    return {
                        ...p,
                        creative_goals: goals.map((g: any) => g.id === goalId ? data : g)
                    };
                }
                return p;
            }));
        }
    }, []);

    const deleteGoal = useCallback(async (goalId: string, projectId: string) => {
        const { error } = await supabase.from('creative_goals').delete().eq('id', goalId);
        if (error) throw error;

        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                return { ...p, creative_goals: (p.creative_goals || []).filter((g: any) => g.id !== goalId) };
            }
            return p;
        }));
    }, []);

    const addActivity = useCallback(async (projectId: string, activity: any) => {
        const payload = {
            project_id: projectId,
            user_name: activity.userName,
            user_avatar: activity.userAvatar,
            type: activity.type,
            content: activity.content,
            system_icon: activity.systemIcon,
            timestamp: activity.timestamp || new Date().toISOString()
        };

        const { data, error } = await supabase.from('project_activities').insert(payload as any).select().single();
        if (error) throw error;

        if (data) {
            setProjects(prev => prev.map(p => {
                if (p.id === projectId) {
                    return { ...p, project_activities: [...(p.project_activities || []), data] };
                }
                return p;
            }));
        }
    }, []);

    const reorderGoals = useCallback(async (projectId: string, goals: { id: string; position: number }[]) => {
        // Optimistic update
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                const currentGoals = p.creative_goals || [];
                const updatedGoals = currentGoals.map((g: any) => {
                    const match = goals.find(u => u.id === g.id);
                    return match ? { ...g, position: match.position } : g;
                });
                return { ...p, creative_goals: updatedGoals };
            }
            return p;
        }));

        // Batch update using Promise.all
        const updates = goals.map(g =>
            supabase.from('creative_goals').update({ position: g.position } as any).eq('id', g.id)
        );

        await Promise.all(updates);
    }, []);

    return useMemo(() => ({
        projects,
        loading,
        error,
        createProject,
        updateProject,
        deleteProject,
        refetch: fetchProjects,
        addGoal,
        updateGoal,
        deleteGoal,
        addActivity,
        reorderGoals
    }), [projects, loading, error, createProject, updateProject, deleteProject, fetchProjects, addGoal, updateGoal, deleteGoal, addActivity, reorderGoals]);
}
