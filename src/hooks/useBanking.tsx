import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface USBank {
  id: string;
  name: string;
  routing_number: string;
  swift_code: string | null;
  state: string | null;
  city: string | null;
}

interface ExternalTransfer {
  id: string;
  user_id: string;
  from_account_id: string;
  to_bank_id: string;
  to_account_number: string;
  to_account_holder_name: string;
  amount: number;
  transfer_type: string;
  description: string | null;
  status: string;
  reference_number: string;
  fee_amount: number;
  processing_time_hours: number;
  created_at: string;
  processed_at: string | null;
  completed_at: string | null;
}

export const useBanking = () => {
  const { user } = useAuth();
  const [banks, setBanks] = useState<USBank[]>([]);
  const [externalTransfers, setExternalTransfers] = useState<ExternalTransfer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBanks();
      fetchExternalTransfers();
    }
  }, [user]);

  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('us_banks')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setBanks(data || []);
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };

  const fetchExternalTransfers = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('external_transfers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExternalTransfers(data || []);
    } catch (error) {
      console.error('Error fetching external transfers:', error);
    }
  };

  const processExternalTransfer = async (
    fromAccountId: string,
    toBankId: string,
    toAccountNumber: string,
    toAccountHolderName: string,
    amount: number,
    transferType: 'deposit' | 'withdrawal' | 'transfer',
    description?: string
  ) => {
    if (!user) return { error: 'User not authenticated' };

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('process_external_transfer', {
        p_user_id: user.id,
        p_from_account_id: fromAccountId,
        p_to_bank_id: toBankId,
        p_to_account_number: toAccountNumber,
        p_to_account_holder_name: toAccountHolderName,
        p_amount: amount,
        p_transfer_type: transferType,
        p_description: description
      });

      if (error) throw error;

      // Refresh external transfers
      await fetchExternalTransfers();
      
      return { data };
    } catch (error: any) {
      console.error('Error processing external transfer:', error);
      return { error: error.message || 'Failed to process external transfer' };
    } finally {
      setLoading(false);
    }
  };

  const getBankById = (bankId: string) => {
    return banks.find(bank => bank.id === bankId);
  };

  const refetchData = async () => {
    await Promise.all([
      fetchBanks(),
      fetchExternalTransfers()
    ]);
  };

  return {
    banks,
    externalTransfers,
    loading,
    processExternalTransfer,
    getBankById,
    refetchData
  };
};