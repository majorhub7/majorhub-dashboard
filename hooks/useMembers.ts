
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { User, mapUserFromDb } from '../types';

export function useMembers(clientId: string | null) {
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMembers();
    }, [clientId]);

    const fetchMembers = async () => {
        setLoading(true);
        let query = supabase.from('users').select('*');

        if (clientId) {
            query = query.eq('client_id', clientId);
        } else {
            // If no clientId but is MANAGER, we might want all users or just managers
            // For now, let's fetch based on the RLS which should handle access
        }

        const { data, error } = await query.order('name');

        if (!error && data) {
            setMembers(data.map(mapUserFromDb));
        }
        setLoading(false);
    };

    const deleteMember = async (userId: string) => {
        // Soft delete (unlink) to preserve history/references but revoke access
        const { error } = await supabase
            .from('users')
            .update({ client_id: null })
            .eq('id', userId);

        if (error) {
            console.error('Error removing member:', error);
            throw error;
        }

        setMembers(prev => prev.filter(m => m.id !== userId));
    };

    return {
        members,
        loading,
        deleteMember,
        refetch: fetchMembers
    };
}
