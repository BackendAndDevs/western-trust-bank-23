import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface USBank {
  id: string;
  name: string;
  routing_number: string;
  swift_code: string | null;
  state: string | null;
  city: string | null;
}

export interface ExternalTransfer {
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

  // Fallback banks list in case database fetch fails
  const fallbackBanks: USBank[] = [
    { id: '1', name: 'JPMorgan Chase Bank', routing_number: '021000021', swift_code: 'CHASUS33', state: 'NY', city: 'New York' },
    { id: '2', name: 'Bank of America', routing_number: '026009593', swift_code: 'BOFAUS3N', state: 'NC', city: 'Charlotte' },
    { id: '3', name: 'Wells Fargo Bank', routing_number: '121000248', swift_code: 'WFBIUS6S', state: 'CA', city: 'San Francisco' },
    { id: '4', name: 'Citibank', routing_number: '021000089', swift_code: 'CITIUS33', state: 'NY', city: 'New York' },
    { id: '5', name: 'U.S. Bank', routing_number: '091000022', swift_code: 'USBKUS44', state: 'MN', city: 'Minneapolis' },
    { id: '6', name: 'PNC Bank', routing_number: '043002900', swift_code: 'PNCCUS33', state: 'PA', city: 'Pittsburgh' },
    { id: '7', name: 'TD Bank', routing_number: '031201360', swift_code: 'NRTHUS33', state: 'NJ', city: 'Cherry Hill' },
    { id: '8', name: 'Capital One', routing_number: '051405515', swift_code: 'NFBKUS33', state: 'VA', city: 'McLean' },
    { id: '9', name: 'HSBC Bank USA', routing_number: '021001088', swift_code: 'MRMDUS33', state: 'NY', city: 'New York' },
    { id: '10', name: 'Fifth Third Bank', routing_number: '042000314', swift_code: 'FTBCUS3C', state: 'OH', city: 'Cincinnati' },
    { id: '11', name: 'Regions Bank', routing_number: '062000019', swift_code: 'REGGUS44', state: 'AL', city: 'Birmingham' },
    { id: '12', name: 'KeyBank', routing_number: '041001039', swift_code: 'KEYBUS33', state: 'OH', city: 'Cleveland' },
    { id: '13', name: 'Comerica Bank', routing_number: '072000326', swift_code: 'MNBDUS33', state: 'TX', city: 'Dallas' },
    { id: '14', name: 'M&T Bank', routing_number: '022000046', swift_code: 'MNTRUS3N', state: 'NY', city: 'Buffalo' },
    { id: '15', name: 'Santander Bank', routing_number: '231372691', swift_code: 'SVRNUS33', state: 'MA', city: 'Boston' },
    { id: '16', name: 'Ally Bank', routing_number: '124003116', swift_code: 'IOBKUS44', state: 'UT', city: 'Midvale' },
    { id: '17', name: 'Charles Schwab Bank', routing_number: '121202211', swift_code: 'SCHVUS33', state: 'CA', city: 'Westlake' },
    { id: '18', name: 'Discover Bank', routing_number: '011500120', swift_code: 'DISBUS33', state: 'DE', city: 'Greenwood' },
    { id: '19', name: 'USAA Federal Savings Bank', routing_number: '314074269', swift_code: 'USAAUS44', state: 'TX', city: 'San Antonio' },
    { id: '20', name: 'Navy Federal Credit Union', routing_number: '256074974', swift_code: 'NFCUUS33', state: 'VA', city: 'Vienna' }
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
        .from('us_banks')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Database error fetching banks:', error);
        // Use fallback banks if database fetch fails
        setBanks(fallbackBanks);
        return;
      }
      
      // If we got data from database, use it, otherwise use fallback
      setBanks(data && data.length > 0 ? data : fallbackBanks);
    } catch (error) {
      console.error('Error fetching banks:', error);
      // Use fallback banks on any error
      setBanks(fallbackBanks);
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