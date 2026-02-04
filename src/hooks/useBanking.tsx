import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface USBank {
  id: string;
  bank_name: string;
  routing_number: string;
  swift_code: string | null;
  created_at: string;
}

export interface ExternalTransfer {
  id: string;
  user_id: string;
  from_account_id: string;
  bank_id: string;
  recipient_name: string;
  recipient_account_number: string;
  amount: number;
  memo: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useBanking = () => {
  const { user } = useAuth();
  const [banks, setBanks] = useState<USBank[]>([]);
  const [externalTransfers, setExternalTransfers] = useState<ExternalTransfer[]>([]);
  const [loading, setLoading] = useState(false);

  // Fallback banks list in case database fetch fails
  const fallbackBanks: USBank[] = [
    { id: '1', bank_name: 'JPMorgan Chase Bank', routing_number: '021000021', swift_code: 'CHASUS33', created_at: new Date().toISOString() },
    { id: '2', bank_name: 'Bank of America', routing_number: '026009593', swift_code: 'BOFAUS3N', created_at: new Date().toISOString() },
    { id: '3', bank_name: 'Wells Fargo Bank', routing_number: '121000248', swift_code: 'WFBIUS6S', created_at: new Date().toISOString() },
    { id: '4', bank_name: 'Citibank', routing_number: '021000089', swift_code: 'CITIUS33', created_at: new Date().toISOString() },
    { id: '5', bank_name: 'U.S. Bank', routing_number: '091000022', swift_code: 'USBKUS44', created_at: new Date().toISOString() },
    { id: '6', bank_name: 'PNC Bank', routing_number: '043002900', swift_code: 'PNCCUS33', created_at: new Date().toISOString() },
    { id: '7', bank_name: 'TD Bank', routing_number: '031201360', swift_code: 'NRTHUS33', created_at: new Date().toISOString() },
    { id: '8', bank_name: 'Capital One', routing_number: '051405515', swift_code: 'NFBKUS33', created_at: new Date().toISOString() },
    { id: '9', bank_name: 'HSBC Bank USA', routing_number: '021001088', swift_code: 'MRMDUS33', created_at: new Date().toISOString() },
    { id: '10', bank_name: 'Fifth Third Bank', routing_number: '042000314', swift_code: 'FTBCUS3C', created_at: new Date().toISOString() },
  ];

  useEffect(() => {
    if (user) {
      fetchBanks();
      fetchExternalTransfers();
    }
  }, [user]);

  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('us_banks' as any)
        .select('*')
        .order('bank_name');

      if (error) {
        console.error('Database error fetching banks:', error);
        setBanks(fallbackBanks);
        return;
      }
      
      setBanks((data as any) && (data as any).length > 0 ? (data as any) : fallbackBanks);
    } catch (error) {
      console.error('Error fetching banks:', error);
      setBanks(fallbackBanks);
    }
  };

  const fetchExternalTransfers = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('external_transfers' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExternalTransfers((data as any) || []);
    } catch (error) {
      console.error('Error fetching external transfers:', error);
    }
  };

  const processExternalTransfer = async (
    fromAccountId: string,
    toBankId: string,
    recipientAccountNumber: string,
    recipientName: string,
    amount: number,
    memo?: string
  ) => {
    if (!user) return { error: 'User not authenticated' };

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('process_external_transfer' as any, {
        p_from_account_id: fromAccountId,
        p_bank_id: toBankId,
        p_recipient_name: recipientName,
        p_recipient_account_number: recipientAccountNumber,
        p_amount: amount,
        p_memo: memo
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; transfer_id?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process transfer');
      }

      // Refresh external transfers
      await fetchExternalTransfers();
      
      return { data: result };
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
