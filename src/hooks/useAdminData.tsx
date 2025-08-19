import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminAccount {
  id: string;
  user_id: string;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  user_email: string;
  user_name: string;
}

export interface AdminTransaction {
  id: string;
  user_id: string;
  account_id: string;
  transaction_type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  recipient_account_id?: string;
  recipient_info?: any;
  user_email: string;
  user_name: string;
  account_number: string;
}

export interface AdminLoan {
  id: string;
  user_id: string;
  amount: number;
  purpose: string;
  loan_type: string;
  status: string;
  annual_income?: number;
  credit_score?: number;
  employment_status?: string;
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  admin_notes?: string;
  user_email: string;
  user_name: string;
}

export const useAdminData = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loans, setLoans] = useState<AdminLoan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      setAccounts([]);
      setTransactions([]);
      setLoans([]);
      setLoading(false);
    }
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchAccounts(),
        fetchTransactions(),
        fetchLoans()
      ]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('admin_get_all_accounts');
      
      if (error) {
        console.error('Error fetching admin accounts:', error);
      } else {
        setAccounts(data || []);
      }
    } catch (error) {
      console.error('Error calling admin_get_all_accounts:', error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('admin_get_all_transactions');
      
      if (error) {
        console.error('Error fetching admin transactions:', error);
      } else {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error('Error calling admin_get_all_transactions:', error);
    }
  };

  const fetchLoans = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('admin_get_all_loans');
      
      if (error) {
        console.error('Error fetching admin loans:', error);
      } else {
        setLoans(data || []);
      }
    } catch (error) {
      console.error('Error calling admin_get_all_loans:', error);
    }
  };

  const processTransaction = async (transactionId: string, status: 'approved' | 'rejected', notes?: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase.rpc('admin_process_transaction', {
        transaction_id: transactionId,
        new_status: status,
        admin_notes: notes
      });

      if (error) throw error;

      // Refresh data after processing
      await fetchAllData();
      return { error: null };
    } catch (error) {
      console.error('Error processing transaction:', error);
      return { error };
    }
  };

  const reviewLoan = async (loanId: string, status: 'approved' | 'rejected', notes?: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase.rpc('admin_review_loan', {
        loan_id: loanId,
        new_status: status,
        admin_notes: notes
      });

      if (error) throw error;

      // Refresh data after processing
      await fetchAllData();
      return { error: null };
    } catch (error) {
      console.error('Error reviewing loan:', error);
      return { error };
    }
  };

  const updateAccountBalance = async (accountId: string, newBalance: number, notes?: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase.rpc('admin_update_account_balance', {
        target_account_id: accountId,
        new_balance: newBalance,
        admin_notes: notes
      });

      if (error) throw error;

      // Refresh data after update
      await fetchAllData();
      return { error: null };
    } catch (error) {
      console.error('Error updating account balance:', error);
      return { error };
    }
  };

  // Computed values
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const pendingLoans = loans.filter(l => l.status === 'pending');
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const totalUsers = accounts.length;

  return {
    accounts,
    transactions,
    loans,
    pendingTransactions,
    pendingLoans,
    totalBalance,
    totalUsers,
    loading,
    processTransaction,
    reviewLoan,
    updateAccountBalance,
    refetchData: fetchAllData
  };
};