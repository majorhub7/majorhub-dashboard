import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Database } from '../types/database';

type Client = Database['public']['Tables']['clients']['Row'];

/**
 * Hook para gerenciar clientes.
 * @param userId - ID do usuário autenticado. Só busca clientes quando definido.
 */
export function useClients(userId?: string | null) {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchClients = useCallback(async (silent = false) => {
        if (!userId) {
            setLoading(false);
            return;
        }

        if (!silent) setLoading(true);
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('name');

        if (!error && data) {
            setClients(data);
        }
        if (!silent) setLoading(false);
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchClients();
        } else {
            setClients([]);
            setLoading(false);
        }
    }, [userId, fetchClients]);




    const createClient = async (name: string, logoUrl?: string) => {
        if (!userId) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('clients')
            .insert({
                name,
                logo_url: logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=150`
            } as any)
            .select()
            .single();

        if (error) {
            console.error('Supabase error creating client:', error);
            throw error;
        }

        if (data) {
            // Force fetch SILENTLY to ensure sort order without flickering the list
            await fetchClients(true);
        }
        return data;
    };

    const deleteClient = async (id: string) => {
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase error deleting client:', error);
            throw error;
        }

        setClients(prev => prev.filter(c => c.id !== id));
    };

    return {
        clients,
        loading,
        createClient,
        deleteClient,
        refetch: fetchClients,
    };
}
