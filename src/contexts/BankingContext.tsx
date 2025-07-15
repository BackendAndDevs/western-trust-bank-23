import React, { createContext, useContext, useState, ReactNode } from 'react';

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
    username: 'john_doe',
    email: 'john@example.com',
    name: 'John Doe',
    balance: 2500,
    isAdmin: false,
    profileImage: '/placeholder.svg?height=100&width=100',
  },
  {
    id: '3',
    username: 'jane_smith',
    email: 'jane@example.com',
    name: 'Jane Smith',
    balance: 4750,
    isAdmin: false,
    profileImage: '/placeholder.svg?height=100&width=100',
  },
  {
    id: '4',
    username: 'donnie_wahlberg',
    email: 'donnie@example.com',
    name: 'Donnie Wahlberg',
    balance: 350000,
    isAdmin: false,
    profileImage: '/placeholder.svg?height=100&width=100',
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
    description: 'Transfer to Jane Smith',
    timestamp: new Date('2024-01-17'),
    recipientId: '3',
    recipientUsername: 'jane_smith',
  },
  {
    id: '4',
    userId: '3',
    type: 'transfer_received',
    amount: 200,
    description: 'Transfer from John Doe',
    timestamp: new Date('2024-01-17'),
  },
];

const initialLoanRequests: LoanRequest[] = [
  {
    id: '1',
    userId: '2',
    username: 'john_doe',
    amount: 10000,
    purpose: 'Home renovation',
    status: 'pending',
    timestamp: new Date('2024-01-18'),
  },
];

export const BankingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>(initialLoanRequests);

  const login = (username: string, password: string): boolean => {
    // Simple password validation for prototype
    const user = users.find(u => u.username === username);
    if (user && (password === username || (username === 'zero4321' && password === 'zero4321'))) {
      setCurrentUser(user);
      return true;
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

  const deposit = (amount: number) => {
    if (!currentUser) return;

    setUsers(prev => prev.map(user => 
      user.id === currentUser.id 
        ? { ...user, balance: user.balance + amount }
        : user
    ));

    setCurrentUser(prev => prev ? { ...prev, balance: prev.balance + amount } : null);

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      userId: currentUser.id,
      type: 'deposit',
      amount,
      description: `Deposit of $${amount}`,
      timestamp: new Date(),
    };

    setTransactions(prev => [newTransaction, ...prev]);
  };

  const withdraw = (amount: number): boolean => {
    if (!currentUser || currentUser.balance < amount) return false;

    setUsers(prev => prev.map(user => 
      user.id === currentUser.id 
        ? { ...user, balance: user.balance - amount }
        : user
    ));

    setCurrentUser(prev => prev ? { ...prev, balance: prev.balance - amount } : null);

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      userId: currentUser.id,
      type: 'withdraw',
      amount,
      description: `Withdrawal of $${amount}`,
      timestamp: new Date(),
    };

    setTransactions(prev => [newTransaction, ...prev]);
    return true;
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