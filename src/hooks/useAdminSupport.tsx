import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminTicket {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_email: string;
  user_name: string;
  message_count: number;
}

export interface AdminChatSession {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  closed_at: string | null;
  user_email: string;
  user_name: string;
  message_count: number;
}

export interface AdminMessage {
  id: string;
  sender_id: string;
  sender_type: string;
  message: string;
  created_at: string;
  sender_name: string;
}

export const useAdminSupport = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [chatSessions, setChatSessions] = useState<AdminChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchTickets(), fetchChatSessions()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    const { data, error } = await supabase.rpc('admin_get_all_tickets');
    if (!error && data) setTickets(data as AdminTicket[]);
  };

  const fetchChatSessions = async () => {
    const { data, error } = await supabase.rpc('admin_get_all_chat_sessions');
    if (!error && data) setChatSessions(data as AdminChatSession[]);
  };

  const getTicketMessages = async (ticketId: string): Promise<AdminMessage[]> => {
    const { data } = await supabase.rpc('admin_get_ticket_messages', { p_ticket_id: ticketId });
    return (data as AdminMessage[]) || [];
  };

  const getChatMessages = async (sessionId: string): Promise<AdminMessage[]> => {
    const { data } = await supabase.rpc('admin_get_chat_messages', { p_session_id: sessionId });
    return (data as AdminMessage[]) || [];
  };

  const sendTicketReply = async (ticketId: string, message: string) => {
    const { data, error } = await supabase.rpc('admin_send_ticket_message', { p_ticket_id: ticketId, p_message: message });
    if (!error) await fetchTickets();
    return { data, error };
  };

  const sendChatReply = async (sessionId: string, message: string) => {
    const { data, error } = await supabase.rpc('admin_send_chat_message', { p_session_id: sessionId, p_message: message });
    return { data, error };
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    const { data, error } = await supabase.rpc('admin_update_ticket_status', { p_ticket_id: ticketId, p_status: status });
    if (!error) await fetchTickets();
    return { data, error };
  };

  const pendingTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const activeChatSessions = chatSessions.filter(s => s.status === 'active');

  return {
    tickets, chatSessions, loading,
    pendingTickets, activeChatSessions,
    getTicketMessages, getChatMessages,
    sendTicketReply, sendChatReply,
    updateTicketStatus, refetch: fetchAll,
  };
};
