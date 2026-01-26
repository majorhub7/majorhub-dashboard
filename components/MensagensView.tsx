
import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message, User } from '../types';
import { INITIAL_CONVERSATIONS, INITIAL_MESSAGES } from '../constants';

// Optimized sub-components
import ConversationList from './Mensagens/ConversationList';
import ChatInterface from './Mensagens/ChatInterface';
import NewChatModal from './Mensagens/NewChatModal';
import { useMessages } from '../hooks/useMessages';
import { geminiService } from '../services/gemini';

interface MensagensViewProps {
  currentUser: User;
}

const MensagensView: React.FC<MensagensViewProps> = ({ currentUser }) => {
  const {
    conversations,
    messages,
    loading,
    loadingMessages,
    fetchMessages,
    sendMessage,
    startPrivateChat,
    createGroupChat,
    addVirtualMessage
  } = useMessages(currentUser);

  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Seleciona a primeira conversa se nenhuma estiver selecionada
  useEffect(() => {
    if (!selectedConvId && conversations.length > 0) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, selectedConvId]);

  // Carrega mensagens quando a conversa muda
  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
    }
  }, [selectedConvId, fetchMessages]);

  const selectedConv = conversations.find(c => c.id === selectedConvId);
  const currentMessages = messages[selectedConvId] || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvId, currentMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvId) return;

    const result = await sendMessage(selectedConvId, newMessage) as any;

    if (result && result.ai) {
      setNewMessage('');
      setIsAITyping(true);

      try {
        const history = currentMessages.slice(0, -1).map(m => ({
          role: m.senderId === currentUser.id ? 'user' : 'model',
          content: m.text
        }));

        const response = await geminiService.chat(newMessage, history);

        if (response) {
          const aiMsg: Message = {
            id: Math.random().toString(36).substr(2, 9),
            senderId: 'ai-major',
            senderName: 'Major I.A',
            senderAvatar: 'ai-avatar',
            text: response,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          };

          // Use the new addVirtualMessage method
          addVirtualMessage('ai-major', aiMsg);
        } else {
          // Fallback if response is null (e.g. error in proxy)
          const errorMsg: Message = {
            id: Math.random().toString(36).substr(2, 9),
            senderId: 'ai-major',
            senderName: 'Major I.A',
            senderAvatar: 'ai-avatar',
            text: "Ops! Tive um pequeno problema ao processar sua mensagem. Vamos tentar novamente? 💫",
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          };
          addVirtualMessage('ai-major', errorMsg);
        }
      } catch (err) {
        console.error('Erro ao obter resposta da Major I.A:', err);
        // Adiciona mensagem de erro mesmo em caso de exception
        const errorMsg: Message = {
          id: Math.random().toString(36).substr(2, 9),
          senderId: 'ai-major',
          senderName: 'Major I.A',
          senderAvatar: 'ai-avatar',
          text: "Ops! Tive um pequeno problema ao processar sua mensagem. Vamos tentar novamente? 💫",
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        addVirtualMessage('ai-major', errorMsg);
      } finally {
        setIsAITyping(false);
      }
      return;
    }

    if (result && selectedConvId.startsWith('user_')) {
      setSelectedConvId(result.conversation_id);
    }
    setNewMessage('');
  };

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups = filteredConversations.filter(c => c.type === 'group');
  const privates = filteredConversations.filter(c => c.type === 'private');

  return (
    <div className="flex h-full bg-white dark:bg-slate-900 rounded-2xl md:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-fade-in">
      <ConversationList
        groups={groups}
        privates={privates}
        selectedConvId={selectedConvId}
        onSelectConv={(id) => { setSelectedConvId(id); setShowMobileChat(true); }}
        showMobileChat={showMobileChat}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewChat={() => setShowNewChatModal(true)}
        loading={loading}
      />

      <ChatInterface
        selectedConv={selectedConv || null}
        currentMessages={currentMessages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSendMessage={handleSendMessage}
        onBack={() => setShowMobileChat(false)}
        showMobileChat={showMobileChat}
        currentUser={currentUser}
        loadingMessages={loadingMessages}
        isAITyping={isAITyping}
      />

      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onSelectContact={(id) => {
            setSelectedConvId(id);
            setShowNewChatModal(false);
            setShowMobileChat(true);
          }}
          onCreateGroup={async (name, members) => {
            const newId = await createGroupChat(name, members);
            if (newId) setSelectedConvId(newId);
          }}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default MensagensView;
