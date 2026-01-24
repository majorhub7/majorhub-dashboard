import { useState, useEffect, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { Database } from '../types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthState {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        profile: null,
        session: null,
        loading: true,
    });

    const isFetchingProfile = useRef<string | null>(null);

    const fetchProfile = useCallback(async (userId: string) => {
        if (!userId || isFetchingProfile.current === userId) return;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            setAuthState(prev => ({ ...prev, loading: false }));
        }, 6000);

        try {
            isFetchingProfile.current = userId;
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId);

            if (!error && data && data.length > 0) {
                setAuthState(prev => ({ ...prev, profile: data[0], loading: false }));
            } else {
                console.warn('Profile fetch completed but no profile found for:', userId);
                setAuthState(prev => ({ ...prev, profile: null, loading: false }));
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('Error fetching profile:', err);
            }
            setAuthState(prev => ({ ...prev, loading: false }));
        } finally {
            clearTimeout(timeoutId);
            isFetchingProfile.current = null;
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            if (session?.user) {
                setAuthState(prev => ({ ...prev, session, user: session.user }));
                fetchProfile(session.user.id);
            } else {
                setAuthState(prev => ({ ...prev, session: null, user: null, loading: false }));
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

                if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
                    if (session?.user) {
                        setAuthState(prev => ({ ...prev, session, user: session.user }));
                        fetchProfile(session.user.id);
                    }
                } else if (event === 'SIGNED_OUT') {
                    setAuthState({
                        session: null,
                        user: null,
                        profile: null,
                        loading: false
                    });
                    isFetchingProfile.current = null;
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!authState.user) {
            return { error: new Error('User not authenticated'), data: null };
        }

        const { data, error } = await (supabase
            .from('users') as any)
            .update(updates)
            .eq('id', authState.user.id)
            .select()
            .single();

        if (error) {
            return { error, data: null };
        }

        if (data) {
            setAuthState(prev => ({ ...prev, profile: data as UserProfile }));
        }

        return { error: null, data };
    };

    const completeOnboarding = async (updates: any) => {
        if (!authState.user) return { error: new Error('User not authenticated') };

        const { password, email, ...profileUpdates } = updates;

        // 1. Update Profile in public.users
        const { error: profileError } = await updateProfile({
            ...profileUpdates,
            is_onboarded: true,
            email: email || profileUpdates.email
        });

        if (profileError) return { error: profileError };

        // 2. Update Auth User (Email and Password)
        if (password || email) {
            const updateData: { password?: string, email?: string } = {};
            if (password) updateData.password = password;
            if (email) updateData.email = email;

            const { error: authError } = await (supabase.auth as any).updateUser(updateData);
            if (authError) return { error: authError };
        }

        return { error: null };
    };

    const createInvitation = async (clientId: string, role: string = 'CLIENT') => {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const { data, error } = await (supabase
            .from('invitations') as any)
            .insert({
                token,
                client_id: clientId,
                role,
                invited_by: authState.user?.id
            })
            .select()
            .single();

        return { data, error };
    };

    const validateToken = async (token: string) => {
        const { data, error } = await (supabase
            .from('invitations') as any)
            .select('*, client:clients(name)')
            .eq('token', token)
            .is('used_at', null)
            .gt('expires_at', new Date().toISOString())
            .single();

        return { data, error };
    };

    const signUpWithInvitation = async (data: any) => {
        const { token, email, password, name, whatsapp, avatar_url } = data;

        // 1. Validate Token again
        const { data: invite, error: inviteError } = await validateToken(token);
        if (inviteError || !invite) return { error: inviteError || new Error('Convite inválido ou expirado') };

        let authUser = authState.user;

        // 2. Auth Sign Up (only if not already logged in)
        if (!authUser) {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        avatar_url,
                        whatsapp,
                        client_id: invite.client_id,
                        access_level: invite.role,
                        role: invite.role === 'CLIENT' ? 'Cliente' : 'Gestor',
                        is_onboarded: true
                    }
                }
            });

            if (authError) {
                // If user already exists, tell them to log in
                if (authError.message.toLowerCase().includes('already registered')) {
                    return { error: new Error('Este e-mail já está cadastrado. Por favor, faça login antes de acessar o convite.') };
                }
                return { error: authError };
            }
            authUser = authData.user;

            // FORCE UPDATE PROFILE to ensure is_onboarded is true (Trigger might miss metadata)
            if (authUser) {
                await (supabase.from('users') as any).update({
                    name,
                    avatar_url,
                    whatsapp,
                    client_id: invite.client_id,
                    access_level: invite.role,
                    role: invite.role === 'CLIENT' ? 'Cliente' : 'Gestor',
                    is_onboarded: true
                }).eq('id', authUser.id);
            }
        } else {
            // Already logged in? Just update/create profile
            const { error: updateError } = await updateProfile({
                name,
                avatar_url,
                whatsapp,
                client_id: invite.client_id,
                access_level: invite.role as any,
                role: invite.role === 'CLIENT' ? 'Cliente' : 'Gestor',
                is_onboarded: true,
                email: authUser.email
            } as any);

            if (updateError) return { error: updateError };
        }

        if (!authUser) return { error: new Error('Usuário não autenticado') };

        // 3. Mark Invitation as used
        await (supabase
            .from('invitations') as any)
            .update({ used_at: new Date().toISOString() as any })
            .eq('id', (invite as any).id);

        return { data: { user: authUser }, error: null };
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setAuthState({ user: null, profile: null, session: null, loading: false });
    };

    return {
        ...authState,
        signIn,
        signOut,
        updateProfile,
        completeOnboarding,
        createInvitation,
        validateToken,
        signUpWithInvitation
    };
}
