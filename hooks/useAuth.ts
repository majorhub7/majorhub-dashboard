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
        console.log('🔍 [DEBUG] fetchProfile called with userId:', userId);
        if (!userId || isFetchingProfile.current === userId) {
            console.log('🔍 [DEBUG] Skipping fetch - userId:', userId, 'isFetching:', isFetchingProfile.current);
            return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.error('⏰ [DEBUG] TIMEOUT! Profile fetch took longer than 3 seconds');
            controller.abort();
            setAuthState(prev => ({ ...prev, loading: false }));
        }, 3000); // Reduced to 3s for faster feedback

        try {
            isFetchingProfile.current = userId;
            console.log('🔍 [DEBUG] Fetching profile from Supabase...');

            // Try .single() instead of array to avoid RLS issues
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single(); // Use .single() instead of relying on array

            console.log('🔍 [DEBUG] Supabase response:', { data, error });

            if (error) {
                console.error('❌ [DEBUG] Supabase error:', error);
                // Check if error is RLS related
                if (error.message?.includes('RLS') || error.message?.includes('policy') || error.code === 'PGRST116') {
                    console.error('🚨 [DEBUG] RLS Policy blocking! Check Supabase RLS settings.');
                }
                setAuthState(prev => ({ ...prev, profile: null, loading: false }));
                return;
            }

            if (data) {
                console.log('✅ [DEBUG] Profile found:', data);
                setAuthState(prev => ({ ...prev, profile: data, loading: false }));
            } else {
                console.warn('⚠️ [DEBUG] Profile fetch completed but no profile found for:', userId);
                setAuthState(prev => ({ ...prev, profile: null, loading: false }));
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('❌ [DEBUG] Critical error fetching profile:', err);
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
                invited_by: authState.user?.id,
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
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
        console.log('🔐 [DEBUG] Sign In attempt for:', email);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            console.log('🔐 [DEBUG] Sign In response:', { data: data?.user?.id, error });

            if (error) {
                console.error('❌ [DEBUG] Sign In error:', error);
            } else {
                console.log('✅ [DEBUG] Sign In successful! User ID:', data?.user?.id);
            }

            return { error };
        } catch (err) {
            console.error('❌ [DEBUG] Sign In exception:', err);
            return { error: err as Error };
        }
    };

    const signOut = async () => {
        console.log('🚪 [DEBUG] Sign Out called');
        await supabase.auth.signOut();
        setAuthState({ user: null, profile: null, session: null, loading: false });
    };

    const signUp = async (email: string, password: string, name?: string) => {
        console.log('📝 [DEBUG] Sign Up attempt for:', email);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name || email.split('@')[0],
                        access_level: 'MANAGER',
                        role: 'Gestor',
                        is_onboarded: false
                    }
                }
            });

            if (error) {
                console.error('❌ [DEBUG] Sign Up error:', error);
                return { error };
            }

            console.log('✅ [DEBUG] Sign Up successful! User ID:', data?.user?.id);
            return { data, error: null };
        } catch (err) {
            console.error('❌ [DEBUG] Sign Up exception:', err);
            return { error: err as Error };
        }
    };

    return {
        ...authState,
        signIn,
        signUp,
        signOut,
        updateProfile,
        completeOnboarding,
        createInvitation,
        validateToken,
        signUpWithInvitation
    };
}
