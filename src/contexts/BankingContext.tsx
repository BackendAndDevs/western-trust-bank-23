import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  balance: number;
  isAdmin: boolean;
  profileImage?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'transfer_sent' | 'transfer_received';
  amount: number;
  description: string;
  timestamp: Date;
  recipientId?: string;
  recipientUsername?: string;
}

export interface LoanRequest {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
  username: string;
}

interface BankingContextType {
  currentUser: User | null;
  users: User[];
  transactions: Transaction[];
  loanRequests: LoanRequest[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  createAccount: (userData: { username: string; email: string; name: string; password: string }) => boolean;
  deposit: (amount: number) => void;
  withdraw: (amount: number) => boolean;
  transfer: (recipientUsername: string, amount: number) => boolean;
  requestLoan: (amount: number, purpose: string) => void;
  updateLoanStatus: (loanId: string, status: 'approved' | 'rejected') => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

export const useBanking = () => {
  const context = useContext(BankingContext);
  if (!context) {
    throw new Error('useBanking must be used within a BankingProvider');
  }
  return context;
};

const initialUsers: User[] = [
  {
    id: '1',
    username: 'zero4321',
    email: 'admin@bank.com',
    name: 'Bank Administrator',
    balance: 100000,
    isAdmin: true,
    profileImage: '/placeholder.svg?height=100&width=100',
  },
  {
    id: '2',
    username: 'alex_rodriguez',
    email: 'alex@example.com',
    name: 'Alex Rodriguez',
    balance: 2500,
    isAdmin: false,
    profileImage: '/placeholder.svg?height=100&width=100',
  },
  {
    id: '3',
    username: 'sarah_chen',
    email: 'sarah@example.com',
    name: 'Sarah Chen',
    balance: 4750,
    isAdmin: false,
    profileImage: '/placeholder.svg?height=100&width=100',
  },
  {
    id: '4',
    username: 'donnie_wahlberg',
    email: 'Realdonniewahlberg112@gmail.com',
    name: 'Donnie Wahlberg',
    balance: 2500000,
    isAdmin: false,
    profileImage: 'https://images.unsplash.com/photo-1501286353178-1ec881214838',
  },
];

const initialTransactions: Transaction[] = [
  {
    id: '1',
    userId: '2',
    type: 'deposit',
    amount: 1000,
    description: 'Initial deposit',
    timestamp: new Date('2024-01-15'),
  },
  {
    id: '2',
    userId: '3',
    type: 'deposit',
    amount: 2000,
    description: 'Salary deposit',
    timestamp: new Date('2024-01-16'),
  },
  {
    id: '3',
    userId: '2',
    type: 'transfer_sent',
    amount: 200,
    description: 'Transfer to Sarah Chen',
    timestamp: new Date('2024-01-17'),
    recipientId: '3',
    recipientUsername: 'sarah_chen',
  },
  {
    id: '4',
    userId: '3',
    type: 'transfer_received',
    amount: 200,
    description: 'Transfer from Alex Rodriguez',
    timestamp: new Date('2024-01-17'),
  },
];

const initialLoanRequests: LoanRequest[] = [
  {
    id: '1',
    userId: '2',
    username: 'alex_rodriguez',
    amount: 10000,
    purpose: 'Home renovation',
    status: 'pending',
    timestamp: new Date('2024-01-18'),
  },
];

export const BankingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [isDataInitialized, setIsDataInitialized] = useState(false);

  // Initialize data from Supabase or create initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if profiles exist
        const { data: profiles } = await supabase.from('profiles').select('*');
        
        if (!profiles || profiles.length === 0) {
          // Create initial users if none exist
          const profilesData = initialUsers.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.name,
            is_admin: user.isAdmin,
            profile_image: user.profileImage
          }));

          await supabase.from('profiles').insert(profilesData);

          // Create accounts for initial users
          const accountsData = initialUsers.map(user => ({
            user_id: user.id,
            balance: user.balance,
            account_type: 'checking'
          }));

          await supabase.from('accounts').insert(accountsData);

          // Create initial transactions
          const transactionsData = initialTransactions.map(tx => ({
            id: tx.id,
            user_id: tx.userId,
            transaction_type: tx.type,
            amount: tx.amount,
            description: tx.description,
            created_at: tx.timestamp.toISOString(),
            recipient_id: tx.recipientId,
            recipient_username: tx.recipientUsername
          }));

          await supabase.from('transactions').insert(transactionsData);

          // Create initial loan requests
          const loanRequestsData = initialLoanRequests.map(loan => ({
            id: loan.id,
            user_id: loan.userId,
            amount: loan.amount,
            purpose: loan.purpose,
            status: loan.status,
            created_at: loan.timestamp.toISOString()
          }));

          await supabase.from('loan_requests').insert(loanRequestsData);
        }

        // Fetch all data
        await Promise.all([
          fetchUsers(),
          fetchTransactions(),
          fetchLoanRequests()
        ]);

        setIsDataInitialized(true);
      } catch (error) {
        console.error('Error initializing data:', error);
        // Fall back to local data if Supabase fails
        setUsers(initialUsers);
        setTransactions(initialTransactions);
        setLoanRequests(initialLoanRequests);
        setIsDataInitialized(true);
      }
    };

    initializeData();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          *,
          accounts (balance)
        `);

      if (profiles) {
        const usersData = profiles.map(profile => ({
          id: profile.id,
          username: profile.username,
          email: profile.email,
          name: profile.full_name || profile.username,
          balance: profile.accounts?.[0]?.balance || 0,
          isAdmin: profile.is_admin || false,
          profileImage: profile.profile_image
        }));
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        const transactionsData = data.map(tx => ({
          id: tx.id,
          userId: tx.user_id,
          type: tx.transaction_type as 'deposit' | 'withdraw' | 'transfer_sent' | 'transfer_received',
          amount: tx.amount,
          description: tx.description,
          timestamp: new Date(tx.created_at),
          recipientId: tx.recipient_id,
          recipientUsername: tx.recipient_username
        }));
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchLoanRequests = async () => {
    try {
      const { data } = await supabase
        .from('loan_requests')
        .select(`
          *,
          profiles (username)
        `)
        .order('created_at', { ascending: false });

      if (data) {
        const loanRequestsData = data.map(loan => ({
          id: loan.id,
          userId: loan.user_id,
          amount: loan.amount,
          purpose: loan.purpose,
          status: loan.status as 'pending' | 'approved' | 'rejected',
          timestamp: new Date(loan.created_at),
          username: loan.profiles?.username || 'Unknown'
        }));
        setLoanRequests(loanRequestsData);
      }
    } catch (error) {
      console.error('Error fetching loan requests:', error);
    }
  };

  const login = (username: string, password: string): boolean => {
    // Simple password validation for prototype
    const user = users.find(u => u.username === username);
    if (user) {
      if (username === 'zero4321' && password === 'zero4321') {
        setCurrentUser(user);
        return true;
      }
      if (username === 'donnie_wahlberg' && password === 'Donnie@2020') {
        setCurrentUser(user);
        return true;
      }
      if (password === username) {
        setCurrentUser(user);
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const createAccount = (userData: { username: string; email: string; name: string; password: string }): boolean => {
    const existingUser = users.find(u => u.username === userData.username || u.email === userData.email);
    if (existingUser) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      name: userData.name,
      balance: 100, // Starting balance
      isAdmin: false,
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const deposit = async (amount: number) => {
    if (!currentUser) return;

    try {
      // Update account balance
      const { error: accountError } = await supabase
        .from('accounts')
        .update({ balance: currentUser.balance + amount })
        .eq('user_id', currentUser.id);

      if (accountError) throw accountError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: currentUser.id,
          transaction_type: 'deposit',
          amount,
          description: `Deposit of $${amount}`
        });

      if (transactionError) throw transactionError;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === currentUser.id 
          ? { ...user, balance: user.balance + amount }
          : user
      ));

      setCurrentUser(prev => prev ? { ...prev, balance: prev.balance + amount } : null);

      // Refresh transactions
      await fetchTransactions();
    } catch (error) {
      console.error('Error making deposit:', error);
    }
  };

  const withdraw = async (amount: number): Promise<boolean> => {
    if (!currentUser || currentUser.balance < amount) return false;

    try {
      // Update account balance
      const { error: accountError } = await supabase
        .from('accounts')
        .update({ balance: currentUser.balance - amount })
        .eq('user_id', currentUser.id);

      if (accountError) throw accountError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: currentUser.id,
          transaction_type: 'withdraw',
          amount,
          description: `Withdrawal of $${amount}`
        });

      if (transactionError) throw transactionError;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === currentUser.id 
          ? { ...user, balance: user.balance - amount }
          : user
      ));

      setCurrentUser(prev => prev ? { ...prev, balance: prev.balance - amount } : null);

      // Refresh transactions
      await fetchTransactions();
      return true;
    } catch (error) {
      console.error('Error making withdrawal:', error);
      return false;
    }
  };

  const transfer = (recipientUsername: string, amount: number): boolean => {
    if (!currentUser || currentUser.balance < amount) return false;

    const recipient = users.find(u => u.username === recipientUsername || u.email === recipientUsername);
    if (!recipient || recipient.id === currentUser.id) return false;

    // Update sender balance
    setUsers(prev => prev.map(user => {
      if (user.id === currentUser.id) {
        return { ...user, balance: user.balance - amount };
      }
      if (user.id === recipient.id) {
        return { ...user, balance: user.balance + amount };
      }
      return user;
    }));

    setCurrentUser(prev => prev ? { ...prev, balance: prev.balance - amount } : null);

    // Create transactions for both users
    const sendTransaction: Transaction = {
      id: Date.now().toString(),
      userId: currentUser.id,
      type: 'transfer_sent',
      amount,
      description: `Transfer to ${recipient.username}`,
      timestamp: new Date(),
      recipientId: recipient.id,
      recipientUsername: recipient.username,
    };

    const receiveTransaction: Transaction = {
      id: (Date.now() + 1).toString(),
      userId: recipient.id,
      type: 'transfer_received',
      amount,
      description: `Transfer from ${currentUser.username}`,
      timestamp: new Date(),
    };

    setTransactions(prev => [sendTransaction, receiveTransaction, ...prev]);
    return true;
  };

  const requestLoan = (amount: number, purpose: string) => {
    if (!currentUser) return;

    const newLoanRequest: LoanRequest = {
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      amount,
      purpose,
      status: 'pending',
      timestamp: new Date(),
    };

    setLoanRequests(prev => [newLoanRequest, ...prev]);
  };

  const updateLoanStatus = (loanId: string, status: 'approved' | 'rejected') => {
    setLoanRequests(prev => prev.map(loan => 
      loan.id === loanId ? { ...loan, status } : loan
    ));

    // If approved, add money to user's account
    if (status === 'approved') {
      const loan = loanRequests.find(l => l.id === loanId);
      if (loan) {
        setUsers(prev => prev.map(user => 
          user.id === loan.userId 
            ? { ...user, balance: user.balance + loan.amount }
            : user
        ));

        // Add transaction
        const loanTransaction: Transaction = {
          id: Date.now().toString(),
          userId: loan.userId,
          type: 'deposit',
          amount: loan.amount,
          description: `Loan approved: ${loan.purpose}`,
          timestamp: new Date(),
        };

        setTransactions(prev => [loanTransaction, ...prev]);
      }
    }
  };

  const removeUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    setTransactions(prev => prev.filter(transaction => transaction.userId !== userId));
    setLoanRequests(prev => prev.filter(loan => loan.userId !== userId));
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
    
    // Update current user if it's the one being updated
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  return (
    <BankingContext.Provider value={{
      currentUser,
      users,
      transactions,
      loanRequests,
      login,
      logout,
      createAccount,
      deposit,
      withdraw,
      transfer,
      requestLoan,
      updateLoanStatus,
      removeUser,
      updateUser,
    }}>
      {children}
    </BankingContext.Provider>
  );
};