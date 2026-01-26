import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Database } from '../types';

// Use any for tables that aren't in the generated types yet
type ProjectInviteCode = any;
type ProjectInviteCodeInsert = any;

export function useProjectInvites(clientId: string | null) {
    const [inviteCodes, setInviteCodes] = useState<ProjectInviteCode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInviteCodes = useCallback(async () => {
        if (!clientId) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('project_invite_codes')
            .select('*')
            .eq('client_id', clientId);

        if (error) {
            setError(error.message);
        } else {
            setInviteCodes(data || []);
        }
        setLoading(false);
    }, [clientId]);

    useEffect(() => {
        fetchInviteCodes();
    }, [fetchInviteCodes]);

    const createInviteCode = async (data: ProjectInviteCodeInsert) => {
        const { data: result, error } = await supabase
            .from('project_invite_codes')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        if (result) {
            setInviteCodes(prev => [result, ...prev]);
        }
        return result;
    };

    const deleteInviteCode = async (id: string) => {
        const { error } = await supabase
            .from('project_invite_codes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        setInviteCodes(prev => prev.filter(i => i.id !== id));
    };

    return {
        inviteCodes,
        loading,
        error,
        createInviteCode,
        deleteInviteCode,
        refetch: fetchInviteCodes
    };
}
