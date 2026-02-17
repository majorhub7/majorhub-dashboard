
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Conversation, Message, User } from '../types';

export function useMessages(currentUser: User | null) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const fetchConversations = useCallback(async () => {
        if (!currentUser) return;

        setLoading(true);

        let membersData: any[] = [];
        if (currentUser.accessLevel === 'MANAGER') {
            const query = (supabase as any)
                .from('users')
                .select('id, name, avatar_url, client_id');

            if (currentUser.clientId) {
                query.eq('client_id', currentUser.clientId);
            } else {
                query.is('client_id', null);
            }

            const { data } = await query.neq('id', currentUser.id);
            membersData = data || [];
        } else {
            const { data } = await ((supabase as any)
                .rpc('get_eligible_contacts', { user_id: currentUser.id }));
            membersData = data || [];
        }

        const { data: participations, error: partError } = await ((supabase as any)
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', currentUser.id));

        if (partError) {
            console.error('Error fetching participations:', partError);
            setLoading(false);
            return;
        }

        const convIds = (participations as any[] || []).map(p => p.conversation_id);

        let convData: any[] = [];
        if (convIds.length > 0) {
            const { data, error: convError } = await ((supabase as any)
                .from('conversations')
                .select(`
                    id, name, type, avatar, last_message_at,
                    conversation_participants(
                        user_id,
                        users(id, name, avatar_url)
                    )
                `)
                .in('id', convIds)
                .order('last_message_at', { ascending: false }));

            if (convError) {
                console.error('Error fetching conversations:', convError);
            } else {
                convData = data || [];
            }
        }

        const mappedConversations: Conversation[] = convData.map(c => {
            let name = c.name;
            let avatar = c.avatar || '';

            if (c.type === 'private') {
                const otherParticipant = c.conversation_participants.find((p: any) => p.user_id !== currentUser.id);
                if (otherParticipant && otherParticipant.users) {
                    name = otherParticipant.users.name || 'Membro';
                    avatar = otherParticipant.users.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=150`;
                } else {
                    name = 'Membro Desconhecido';
                    avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8b5cf6&color=fff&size=150`;
                }
            } else {
                name = c.name || 'Grupo sem nome';
                // For groups, if there's no avatar, use a default group avatar or initials
                if (!avatar) {
                    avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=150`;
                }
            }

            const lastTimestamp = c.last_message_at
                ? new Date(c.last_message_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                : '';

            return {
                id: c.id,
                name: name,
                type: c.type,
                avatar: avatar,
                lastMessage: '',
                lastTimestamp: lastTimestamp,
                participantsCount: (c.conversation_participants || []).length,
                online: false
            };
        });

        if (membersData) {
            (membersData as any[]).forEach((member: any) => {
                const existingConv = mappedConversations.find(c =>
                    c.type === 'private' &&
                    convData.find(cd => cd.id === c.id)?.conversation_participants.some((p: any) => p.user_id === member.id)
                );

                if (!existingConv) {
                    mappedConversations.push({
                        id: `user_${member.id}`,
                        name: member.name,
                        type: 'private',
                        avatar: member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=8b5cf6&color=fff&size=150`,
                        lastMessage: 'Sem histórico',
                        lastTimestamp: '',
                        participantsCount: 2
                    });
                }
            });
        }

        // Adicionar Major I.A como primeira opção
        const aiConversation: Conversation = {
            id: 'ai-major',
            name: 'Major I.A',
            type: 'private',
            avatar: 'ai-avatar', // Special tag for UI
            lastMessage: 'Olá! Sou a Major I.A. Como posso ajudar?',
            lastTimestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            participantsCount: 2,
            online: true
        };

        setConversations([aiConversation, ...mappedConversations]);
        setLoading(false);
    }, [currentUser]);

    const fetchMessages = useCallback(async (conversationId: string, forceRefresh = false) => {
        if (!conversationId || conversationId.startsWith('user_') || conversationId === 'ai-major') return;

        // Skip fetch if already have cached messages (unless force refresh)
        if (!forceRefresh && messages[conversationId]?.length > 0) return;

        setLoadingMessages(true);

        const { data, error } = await ((supabase as any)
            .from('messages')
            .select('*, users:sender_id(name, avatar_url)')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(50));

        // Revert order for UI (since we want oldest first at top, but we fetched newest first)
        // Note: The original code ordered by ascending, which means it fetched the OLDEST messages first. 
        // If we limit 50 with ascending, we get the first 50 messages ever sent. We want the LAST 50.
        // So we change fetch order to descending, limit 50, then reverse the array.

        if (error) {
            console.error('Error fetching messages:', error);
            return;
        }

        const mappedMessages: Message[] = (data as any[] || []).reverse().map(m => {
            const senderName = m.sender_id === currentUser?.id ? 'Você' : (m.users?.name || 'Membro');
            const senderAvatar = m.users?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=8b5cf6&color=fff&size=150`;

            return {
                id: m.id,
                senderId: m.sender_id,
                senderName,
                senderAvatar,
                text: m.text,
                timestamp: new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            };
        });

        setMessages(prev => ({
            ...prev,
            [conversationId]: mappedMessages
        }));
        setLoadingMessages(false);
    }, [currentUser, messages]);

    const startPrivateChat = async (targetUserId: string) => {
        if (!currentUser) return;

        const { data: existing, error: existError } = await ((supabase as any)
            .rpc('get_private_conversation', {
                user_a: currentUser.id,
                user_b: targetUserId
            }));

        if (!existError && existing && (existing as any[]).length > 0) {
            return (existing as any[])[0].id;
        }

        const { data: newConv, error: newConvError } = await ((supabase as any)
            .from('conversations')
            .insert({
                name: 'Chat Particular',
                type: 'private'
            })
            .select()
            .single());

        if (newConvError) throw newConvError;

        await ((supabase as any).from('conversation_participants').insert([
            { conversation_id: (newConv as any).id, user_id: currentUser.id },
            { conversation_id: (newConv as any).id, user_id: targetUserId }
        ]));

        await fetchConversations();
        return (newConv as any).id;
    };

    const createGroupChat = async (name: string, participantIds: string[]) => {
        if (!currentUser) return;

        const { data: newConv, error: newConvError } = await ((supabase as any)
            .from('conversations')
            .insert({
                name: name,
                type: 'group'
            })
            .select()
            .single());

        if (newConvError) throw newConvError;

        const participants = [
            { conversation_id: (newConv as any).id, user_id: currentUser.id },
            ...participantIds.map(id => ({ conversation_id: (newConv as any).id, user_id: id }))
        ];

        await ((supabase as any).from('conversation_participants').insert(participants));

        await fetchConversations();
        return (newConv as any).id;
    };

    const sendMessage = async (conversationId: string, text: string) => {
        if (!currentUser || !text.trim()) return;

        if (conversationId === 'ai-major') {
            // Lógica especial para IA
            const userMsg: Message = {
                id: Math.random().toString(36).substr(2, 9),
                senderId: currentUser.id,
                senderName: 'Você',
                senderAvatar: currentUser.avatarUrl || '',
                text,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => ({
                ...prev,
                ['ai-major']: [...(prev['ai-major'] || []), userMsg]
            }));

            return { success: true, ai: true };
        }

        let actualConvId = conversationId;

        if (conversationId.startsWith('user_')) {
            const userId = conversationId.replace('user_', '');
            try {
                const newId = await startPrivateChat(userId);
                if (newId) {
                    actualConvId = newId;
                } else {
                    return;
                }
            } catch (err) {
                console.error('Error starting virtual chat:', err);
                return;
            }
        }

        const { data, error } = await ((supabase as any)
            .from('messages')
            .insert({
                conversation_id: actualConvId,
                sender_id: currentUser.id,
                text: text
            })
            .select()
            .single());

        if (error) {
            console.error('Error sending message:', error);
            return;
        }

        await ((supabase as any)
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', actualConvId));

        return data;
    };

    const addVirtualMessage = useCallback((conversationId: string, message: Message) => {
        setMessages(prev => ({
            ...prev,
            [conversationId]: [...(prev[conversationId] || []), message]
        }));
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchConversations();

            const channel = supabase
                .channel('public:messages')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                }, async (payload: any) => {
                    const newMsg = payload.new as any;

                    // Fetch sender info for new message if not current user
                    let senderName = 'Membro';
                    let senderAvatar = '';

                    if (newMsg.sender_id === currentUser.id) {
                        senderName = 'Você';
                        senderAvatar = currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=8b5cf6&color=fff&size=150`;
                    } else {
                        const { data: userData } = await supabase
                            .from('users')
                            .select('name, avatar_url')
                            .eq('id', newMsg.sender_id)
                            .single();

                        if (userData && (userData as any).name) {
                            senderName = (userData as any).name;
                            senderAvatar = (userData as any).avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=8b5cf6&color=fff&size=150`;
                        } else {
                            senderName = 'Membro';
                            senderAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=8b5cf6&color=fff&size=150`;
                        }
                    }

                    setMessages(prev => {
                        const convMsgs = prev[newMsg.conversation_id] || [];
                        if (convMsgs.some(m => m.id === newMsg.id)) return prev;

                        const mappedMsg: Message = {
                            id: newMsg.id,
                            senderId: newMsg.sender_id,
                            senderName: senderName,
                            senderAvatar: senderAvatar,
                            text: newMsg.text,
                            timestamp: new Date(newMsg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        };

                        return {
                            ...prev,
                            [newMsg.conversation_id]: [...convMsgs, mappedMsg]
                        };
                    });

                    fetchConversations();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [currentUser, fetchConversations]);

    return {
        conversations,
        messages,
        loading,
        loadingMessages,
        fetchMessages,
        sendMessage,
        startPrivateChat,
        createGroupChat,
        addVirtualMessage,
        refetchConversations: fetchConversations
    };
}
