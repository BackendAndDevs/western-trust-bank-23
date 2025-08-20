import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BankAccount {
  id: string;
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
  is_primary: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  status: string;
  created_at: string;
  account_id: string;
}

export interface LoanRequest {
  id: string;
  amount: number;
  purpose: string;
  loan_type: string;
  status: string;
  created_at: string;
  annual_income?: number;
  credit_score?: number;
  employment_status?: string;
}

export const useBankingData = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setAccounts([]);
      setTransactions([]);
      setLoanRequests([]);
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // First ensure user has an account
      await ensureUserAccount();
      
      await Promise.all([
        fetchAccounts(),
        fetchTransactions(),
        fetchLoanRequests()
      ]);
    } catch (error) {
      console.error('Error fetching banking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const ensureUserAccount = async () => {
    if (!user) return;
    
    try {
      const { data: existingAccounts, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error checking accounts:', error);
        return;
      }
      
      // If user has no accounts, create one
      if (!existingAccounts || existingAccounts.length === 0) {
        // Create profile first if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            account_type: 'personal',
            account_status: 'active'
          }, { onConflict: 'user_id' });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        // Generate account number using database function
        const { data: accountNumber, error: accountNumberError } = await supabase
          .rpc('generate_account_number');

        if (accountNumberError) {
          console.error('Error generating account number:', accountNumberError);
          return;
        }

        const { error: insertError } = await supabase
          .from('accounts')
          .insert({
            user_id: user.id,
            account_number: accountNumber,
            account_type: 'checking',
            balance: 1000.00, // Initial balance
            is_primary: true,
            currency: 'USD'
          });
        
        if (insertError) {
          console.error('Error creating account:', insertError);
        }
      }
    } catch (error) {
      console.error('Error ensuring user account:', error);
    }
  };

  const fetchAccounts = async () => {
    if (!user) return;
    
    console.log('Fetching accounts for user:', user.id); // Debug log
    
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching accounts:', error);
    } else {
      console.log('Fetched accounts:', data); // Debug log
      setAccounts(data || []);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      setTransactions(data || []);
    }
  };

  const fetchLoanRequests = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('loan_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching loan requests:', error);
    } else {
      setLoanRequests(data || []);
    }
  };

  const deposit = async (amount: number, accountId?: string) => {
    if (!user || !accounts.length) return { error: 'No account found' };
    
    const account = accountId ? accounts.find(a => a.id === accountId) : accounts.find(a => a.is_primary) || accounts[0];
    if (!account) return { error: 'No account found' };

    try {
      // Create pending transaction record (don't update balance yet)
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: account.id,
          transaction_type: 'deposit',
          amount,
          description: `Deposit of $${amount}`,
          status: 'pending'
        });

      if (transactionError) throw transactionError;

      // Refresh data
      await fetchData();
      return { error: null };
    } catch (error) {
      console.error('Error making deposit:', error);
      return { error };
    }
  };

  const withdraw = async (amount: number, accountId?: string) => {
    if (!user || !accounts.length) return { error: 'No account found' };
    
    const account = accountId ? accounts.find(a => a.id === accountId) : accounts.find(a => a.is_primary) || accounts[0];
    if (!account) return { error: 'No account found' };
    if (account.balance < amount) return { error: 'Insufficient funds' };

    try {
      // Create pending transaction record (don't update balance yet)
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: account.id,
          transaction_type: 'withdraw',
          amount,
          description: `Withdrawal of $${amount}`,
          status: 'pending'
        });

      if (transactionError) throw transactionError;

      // Refresh data
      await fetchData();
      return { error: null };
    } catch (error) {
      console.error('Error making withdrawal:', error);
      return { error };
    }
  };

  const transfer = async (recipientAccountNumber: string, amount: number, memo?: string) => {
    if (!user || !accounts.length) return { error: 'No account found' };
    
    const senderAccount = accounts.find(a => a.is_primary) || accounts[0];
    if (!senderAccount) return { error: 'No sender account found' };
    if (senderAccount.balance < amount) return { error: 'Insufficient funds' };

    try {
      // Find recipient account
      const { data: recipientAccount, error: recipientError } = await supabase
        .from('accounts')
        .select('*')
        .eq('account_number', recipientAccountNumber)
        .single();

      if (recipientError || !recipientAccount) {
        return { error: 'Recipient account not found' };
      }

      if (recipientAccount.user_id === user.id) {
        return { error: 'Cannot transfer to your own account' };
      }

      // Create pending sender transaction (don't update balances yet)
      const { error: senderTransactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: senderAccount.id,
          transaction_type: 'transfer_sent',
          amount,
          description: memo || `Transfer to ${recipientAccountNumber}`,
          status: 'pending',
          recipient_account_id: recipientAccount.id
        });

      if (senderTransactionError) throw senderTransactionError;

      // Refresh data
      await fetchData();
      return { error: null };
    } catch (error) {
      console.error('Error making transfer:', error);
      return { error };
    }
  };

  const requestLoan = async (loanData: {
    amount: number;
    purpose: string;
    loanType: string;
    annualIncome?: number;
    creditScore?: number;
    employmentStatus?: string;
  }) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('loan_requests')
        .insert({
          user_id: user.id,
          amount: loanData.amount,
          purpose: loanData.purpose,
          loan_type: loanData.loanType,
          annual_income: loanData.annualIncome,
          credit_score: loanData.creditScore,
          employment_status: loanData.employmentStatus,
          status: 'pending'
        });

      if (error) throw error;

      // Refresh data
      await fetchLoanRequests();
      return { error: null };
    } catch (error) {
      console.error('Error requesting loan:', error);
      return { error };
    }
  };

  const primaryAccount = accounts.find(a => a.is_primary) || accounts[0];

  console.log('Current user:', user?.id); // Debug log
  console.log('Accounts:', accounts); // Debug log  
  console.log('Primary account:', primaryAccount); // Debug log

  return {
    accounts,
    transactions,
    loanRequests,
    primaryAccount,
    loading,
    deposit,
    withdraw,
    transfer,
    requestLoan,
    refetchData: fetchData
  };
};