import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../services/supabase';
import type { Inspiration, InspirationTag } from '../types';

// NOTE: Type assertions (as any) are used because these tables are new
// and not yet in the generated database types. After running the migration
// and regenerating types, these can be removed.

interface InspirationFilters {
    tagIds?: string[];
    projectId?: string;
    searchQuery?: string;
}

interface InspirationInput {
    instagramUrl: string;
    embedHtml?: string;
    thumbnailUrl?: string;
    likes?: number;
    views?: number;
    notes?: string;
    tagIds?: string[];
    projectIds?: string[];
}

export function useInspirations(userId: string | null) {
    const [inspirations, setInspirations] = useState<Inspiration[]>([]);
    const [tags, setTags] = useState<InspirationTag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<InspirationFilters>({});

    // Fetch all tags (system + user's custom)
    const fetchTags = useCallback(async () => {
        if (!userId) return;

        const { data, error } = await supabase
            .from('inspiration_tags')
            .select('*')
            .or(`is_system.eq.true,user_id.eq.${userId}`)
            .order('is_system', { ascending: false })
            .order('name');

        if (error) {
            console.error('Error fetching tags:', error);
            return;
        }

        setTags(
            (data || []).map((t: any) => ({
                id: t.id,
                name: t.name,
                color: t.color,
                isSystem: t.is_system,
                userId: t.user_id,
            }))
        );
    }, [userId]);

    // Fetch inspirations with relations
    const fetchInspirations = useCallback(async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            // Build query
            let query = supabase
                .from('inspirations')
                .select(`
          *,
          inspiration_tag_links(tag_id),
          inspiration_projects(project_id)
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            // Apply project filter
            if (filters.projectId) {
                query = query.eq('inspiration_projects.project_id', filters.projectId);
            }

            // Apply search filter
            if (filters.searchQuery) {
                query = query.or(`notes.ilike.%${filters.searchQuery}%,instagram_url.ilike.%${filters.searchQuery}%`);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) {
                setError(fetchError.message);
                return;
            }

            // Map to frontend type
            let mapped: Inspiration[] = (data || []).map((item: any) => ({
                id: item.id,
                userId: item.user_id,
                instagramUrl: item.instagram_url,
                embedHtml: item.embed_html,
                thumbnailUrl: item.thumbnail_url,
                likes: item.likes || 0,
                views: item.views || 0,
                notes: item.notes,
                tags: [], // Will be populated below
                projectIds: (item.inspiration_projects || []).map((p: any) => p.project_id),
                createdAt: item.created_at,
                updatedAt: item.updated_at,
            }));

            // Populate tags
            const tagIds = new Set<string>();
            (data || []).forEach((item: any) => {
                (item.inspiration_tag_links || []).forEach((link: any) => {
                    tagIds.add(link.tag_id);
                });
            });

            // Fetch tag details if needed
            if (tagIds.size > 0) {
                const { data: tagData } = await supabase
                    .from('inspiration_tags')
                    .select('*')
                    .in('id', Array.from(tagIds));

                const tagMap = new Map(
                    (tagData || []).map((t: any) => [
                        t.id,
                        { id: t.id, name: t.name, color: t.color, isSystem: t.is_system, userId: t.user_id },
                    ])
                );

                mapped = mapped.map((insp) => {
                    const item = (data || []).find((d: any) => d.id === insp.id);
                    const inspTagIds = (item?.inspiration_tag_links || []).map((l: any) => l.tag_id);
                    return {
                        ...insp,
                        tags: inspTagIds.map((id: string) => tagMap.get(id)).filter(Boolean) as InspirationTag[],
                    };
                });
            }

            // Apply tag filter client-side (after fetching)
            if (filters.tagIds && filters.tagIds.length > 0) {
                mapped = mapped.filter((insp) =>
                    filters.tagIds!.some((tagId) => insp.tags.some((t) => t.id === tagId))
                );
            }

            setInspirations(mapped);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar inspirações');
        } finally {
            setLoading(false);
        }
    }, [userId, filters]);

    useEffect(() => {
        if (!userId) {
            setInspirations([]);
            setTags([]);
            setLoading(false);
            return;
        }

        fetchTags();
        fetchInspirations();
    }, [userId, fetchTags, fetchInspirations]);

    // Add new inspiration
    const addInspiration = useCallback(
        async (input: InspirationInput) => {
            if (!userId) throw new Error('User not authenticated');

            // Insert inspiration
            const { data, error } = await supabase
                .from('inspirations' as any)
                .insert({
                    user_id: userId,
                    instagram_url: input.instagramUrl,
                    embed_html: input.embedHtml || null,
                    thumbnail_url: input.thumbnailUrl || null,
                    likes: input.likes || 0,
                    views: input.views || 0,
                    notes: input.notes || null,
                } as any)
                .select()
                .single();

            if (error) throw error;

            const newId = (data as any).id;

            // Add tag links
            if (input.tagIds && input.tagIds.length > 0) {
                await (supabase.from('inspiration_tag_links' as any) as any).insert(
                    input.tagIds.map((tagId) => ({
                        inspiration_id: newId,
                        tag_id: tagId,
                    }))
                );
            }

            // Add project links
            if (input.projectIds && input.projectIds.length > 0) {
                await (supabase.from('inspiration_projects' as any) as any).insert(
                    input.projectIds.map((projectId) => ({
                        inspiration_id: newId,
                        project_id: projectId,
                    }))
                );
            }

            // Refetch to get complete data
            await fetchInspirations();
            return data;
        },
        [userId, fetchInspirations]
    );

    // Update inspiration
    const updateInspiration = useCallback(
        async (id: string, input: Partial<InspirationInput>) => {
            const updates: any = {};
            if (input.instagramUrl !== undefined) updates.instagram_url = input.instagramUrl;
            if (input.embedHtml !== undefined) updates.embed_html = input.embedHtml;
            if (input.thumbnailUrl !== undefined) updates.thumbnail_url = input.thumbnailUrl;
            if (input.likes !== undefined) updates.likes = input.likes;
            if (input.views !== undefined) updates.views = input.views;
            if (input.notes !== undefined) updates.notes = input.notes;

            if (Object.keys(updates).length > 0) {
                const { error } = await (supabase.from('inspirations' as any) as any).update(updates).eq('id', id);
                if (error) throw error;
            }

            // Update tags if provided
            if (input.tagIds !== undefined) {
                await (supabase.from('inspiration_tag_links' as any) as any).delete().eq('inspiration_id', id);
                if (input.tagIds.length > 0) {
                    await (supabase.from('inspiration_tag_links' as any) as any).insert(
                        input.tagIds.map((tagId) => ({
                            inspiration_id: id,
                            tag_id: tagId,
                        }))
                    );
                }
            }

            // Update projects if provided
            if (input.projectIds !== undefined) {
                await (supabase.from('inspiration_projects' as any) as any).delete().eq('inspiration_id', id);
                if (input.projectIds.length > 0) {
                    await (supabase.from('inspiration_projects' as any) as any).insert(
                        input.projectIds.map((projectId) => ({
                            inspiration_id: id,
                            project_id: projectId,
                        }))
                    );
                }
            }

            await fetchInspirations();
        },
        [fetchInspirations]
    );

    // Delete inspiration
    const deleteInspiration = useCallback(
        async (id: string) => {
            const { error } = await supabase.from('inspirations').delete().eq('id', id);
            if (error) throw error;
            setInspirations((prev) => prev.filter((i) => i.id !== id));
        },
        []
    );

    // Create custom tag
    const createTag = useCallback(
        async (name: string, color: string = '#6366f1') => {
            if (!userId) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('inspiration_tags' as any)
                .insert({
                    name,
                    color,
                    is_system: false,
                    user_id: userId,
                } as any)
                .select()
                .single();

            if (error) throw error;

            const newTag: InspirationTag = {
                id: (data as any).id,
                name: (data as any).name,
                color: (data as any).color,
                isSystem: false,
                userId,
            };

            setTags((prev) => [...prev, newTag]);
            return newTag;
        },
        [userId]
    );

    // Delete custom tag
    const deleteTag = useCallback(async (tagId: string) => {
        const { error } = await supabase.from('inspiration_tags').delete().eq('id', tagId);
        if (error) throw error;
        setTags((prev) => prev.filter((t) => t.id !== tagId));
    }, []);

    // Filter methods
    const filterByTags = useCallback((tagIds: string[]) => {
        setFilters((prev) => ({ ...prev, tagIds }));
    }, []);

    const filterByProject = useCallback((projectId: string | undefined) => {
        setFilters((prev) => ({ ...prev, projectId }));
    }, []);

    const searchInspirations = useCallback((query: string) => {
        setFilters((prev) => ({ ...prev, searchQuery: query || undefined }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({});
    }, []);

    return useMemo(
        () => ({
            inspirations,
            tags,
            loading,
            error,
            filters,
            addInspiration,
            updateInspiration,
            deleteInspiration,
            createTag,
            deleteTag,
            filterByTags,
            filterByProject,
            searchInspirations,
            clearFilters,
            refetch: fetchInspirations,
        }),
        [
            inspirations,
            tags,
            loading,
            error,
            filters,
            addInspiration,
            updateInspiration,
            deleteInspiration,
            createTag,
            deleteTag,
            filterByTags,
            filterByProject,
            searchInspirations,
            clearFilters,
            fetchInspirations,
        ]
    );
}
