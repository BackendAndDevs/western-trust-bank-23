import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  closed_at: string | null;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

export const useSupport = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  // Realtime chat subscription
  useEffect(() => {
    if (!activeChat) return;
    const channel = supabase
      .channel(`chat-${activeChat.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${activeChat.id}`,
      }, (payload) => {
        setChatMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeChat?.id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTickets(), fetchActiveChat()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    if (data) setTickets(data);
  };

  const fetchActiveChat = async () => {
    const { data } = await supabase.from('chat_sessions').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(1);
    if (data && data.length > 0) {
      setActiveChat(data[0]);
      await fetchChatMessages(data[0].id);
    }
  };

  const fetchChatMessages = async (sessionId: string) => {
    const { data } = await supabase.from('chat_messages').select('*').eq('session_id', sessionId).order('created_at');
    if (data) setChatMessages(data);
  };

  const createTicket = async (subject: string, category: string, priority: string, message: string) => {
    if (!user) return { error: 'Not authenticated' };
    const { data: ticket, error } = await supabase.from('support_tickets')
      .insert({ user_id: user.id, subject, category, priority })
      .select().single();
    if (error) return { error };
    await supabase.from('ticket_messages')
      .insert({ ticket_id: ticket.id, sender_id: user.id, sender_type: 'user', message });
    await fetchTickets();
    return { data: ticket };
  };

  const getTicketMessages = async (ticketId: string) => {
    const { data } = await supabase.from('ticket_messages').select('*').eq('ticket_id', ticketId).order('created_at');
    return data || [];
  };

  const sendTicketMessage = async (ticketId: string, message: string) => {
    if (!user) return;
    await supabase.from('ticket_messages')
      .insert({ ticket_id: ticketId, sender_id: user.id, sender_type: 'user', message });
  };

  const startChat = async () => {
    if (!user) return;
    // Close existing active sessions
    if (activeChat) {
      await supabase.from('chat_sessions').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', activeChat.id);
    }
    const { data } = await supabase.from('chat_sessions')
      .insert({ user_id: user.id, status: 'active' })
      .select().single();
    if (data) {
      setActiveChat(data);
      setChatMessages([]);
    }
  };

  const sendChatMessage = async (message: string) => {
    if (!user || !activeChat) return;
    await supabase.from('chat_messages')
      .insert({ session_id: activeChat.id, sender_id: user.id, sender_type: 'user', message });
  };

  const closeChat = async () => {
    if (!activeChat) return;
    await supabase.from('chat_sessions').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', activeChat.id);
    setActiveChat(null);
    setChatMessages([]);
  };

  return {
    tickets, activeChat, chatMessages, loading,
    createTicket, getTicketMessages, sendTicketMessage,
    startChat, sendChatMessage, closeChat, refetch: fetchAll,
  };
};
