import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Bill {
  id: string;
  user_id: string;
  biller_name: string;
  account_number: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  category: 'utilities' | 'phone' | 'internet' | 'rent' | 'insurance' | 'credit_card' | 'other';
  auto_pay: boolean;
  created_at: string;
  updated_at: string;
}

export const useBills = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bills' as any)
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;

      setBills((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const addBill = async (billData: Omit<Bill, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bills' as any)
        .insert([{ ...billData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setBills(prev => [...prev, data as any]);
      toast.success('Bill added successfully');
      return data;
    } catch (error: any) {
      console.error('Error adding bill:', error);
      toast.error('Failed to add bill');
      throw error;
    }
  };

  const payBill = async (billId: string, accountId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('pay_bill' as any, {
        p_bill_id: billId,
        p_account_id: accountId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (!result.success) {
        throw new Error(result.error || 'Failed to pay bill');
      }

      await fetchBills();
      toast.success('Bill paid successfully');
      return result;
    } catch (error: any) {
      console.error('Error paying bill:', error);
      toast.error(error.message || 'Failed to pay bill');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBill = async (billId: string) => {
    try {
      const { error } = await supabase
        .from('bills' as any)
        .delete()
        .eq('id', billId);

      if (error) throw error;

      setBills(prev => prev.filter(b => b.id !== billId));
      toast.success('Bill deleted successfully');
    } catch (error: any) {
      console.error('Error deleting bill:', error);
      toast.error('Failed to delete bill');
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchBills();
    }
  }, [user]);

  return {
    bills,
    loading,
    addBill,
    payBill,
    deleteBill,
    refetch: fetchBills
  };
};
