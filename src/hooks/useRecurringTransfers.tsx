import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RecurringTransfer {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_number: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  next_execution_date: string;
  active: boolean;
  memo?: string;
  created_at: string;
  updated_at: string;
}

export const useRecurringTransfers = () => {
  const { user } = useAuth();
  const [recurringTransfers, setRecurringTransfers] = useState<RecurringTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecurringTransfers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('recurring_transfers' as any)
        .select('*')
        .order('next_execution_date', { ascending: true });

      if (error) throw error;

      setRecurringTransfers((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching recurring transfers:', error);
      toast.error('Failed to load recurring transfers');
    } finally {
      setLoading(false);
    }
  };

  const setupRecurringTransfer = async (
    fromAccountId: string,
    toAccountNumber: string,
    amount: number,
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly',
    memo?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc('setup_recurring_transfer' as any, {
        p_from_account_id: fromAccountId,
        p_to_account_number: toAccountNumber,
        p_amount: amount,
        p_frequency: frequency,
        p_memo: memo
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; recurring_id?: string };

      if (!result.success) {
        throw new Error(result.error || 'Failed to setup recurring transfer');
      }

      await fetchRecurringTransfers();
      toast.success('Recurring transfer setup successfully');
      return result;
    } catch (error: any) {
      console.error('Error setting up recurring transfer:', error);
      toast.error(error.message || 'Failed to setup recurring transfer');
      throw error;
    }
  };

  const toggleRecurringTransfer = async (transferId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('recurring_transfers' as any)
        .update({ active })
        .eq('id', transferId);

      if (error) throw error;

      setRecurringTransfers(prev =>
        prev.map(t => (t.id === transferId ? { ...t, active } : t))
      );
      toast.success(`Recurring transfer ${active ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      console.error('Error toggling recurring transfer:', error);
      toast.error('Failed to update recurring transfer');
      throw error;
    }
  };

  const deleteRecurringTransfer = async (transferId: string) => {
    try {
      const { error } = await supabase
        .from('recurring_transfers' as any)
        .delete()
        .eq('id', transferId);

      if (error) throw error;

      setRecurringTransfers(prev => prev.filter(t => t.id !== transferId));
      toast.success('Recurring transfer deleted');
    } catch (error: any) {
      console.error('Error deleting recurring transfer:', error);
      toast.error('Failed to delete recurring transfer');
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecurringTransfers();
    }
  }, [user]);

  return {
    recurringTransfers,
    loading,
    setupRecurringTransfer,
    toggleRecurringTransfer,
    deleteRecurringTransfer,
    refetch: fetchRecurringTransfers
  };
};
