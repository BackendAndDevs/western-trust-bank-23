import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Card {
  id: string;
  account_id: string;
  user_id: string;
  card_number: string;
  card_type: 'debit' | 'credit';
  cvv: string;
  expiry_date: string;
  card_status: 'active' | 'frozen' | 'deactivated';
  credit_limit?: number;
  created_at: string;
  updated_at: string;
}

export const useCards = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCards(data || []);
    } catch (error: any) {
      console.error('Error fetching cards:', error);
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const updateCardStatus = async (cardId: string, status: 'active' | 'frozen' | 'deactivated') => {
    try {
      const { data, error } = await supabase.rpc('update_card_status', {
        p_card_id: cardId,
        p_status: status
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; status?: string };

      if (!result.success) {
        throw new Error(result.error || 'Failed to update card status');
      }

      await fetchCards();
      toast.success(`Card ${status === 'active' ? 'activated' : status === 'frozen' ? 'frozen' : 'deactivated'} successfully`);
      return result;
    } catch (error: any) {
      console.error('Error updating card status:', error);
      toast.error(error.message || 'Failed to update card status');
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchCards();
    }
  }, [user]);

  return {
    cards,
    loading,
    updateCardStatus,
    refetch: fetchCards
  };
};
