import { useState, useEffect, useRef } from "react";
import PageLayout from "@/components/PageLayout";
import AdminCustomization from "@/components/AdminCustomization";
import { useAdminData, AdminUser } from '@/hooks/useAdminData';
import { useEnhancedAdminData } from '@/hooks/useEnhancedAdminData';
import { useAdminSupport, AdminMessage } from '@/hooks/useAdminSupport';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit,
  UserPlus,
  Trash2,
  TrendingUp,
  AlertCircle,
  Shield,
  LogOut,
  Check,
   X,
   Building2,
   CreditCard,
   Send,
   FileCheck,
   UserCheck,
   RefreshCw,
   MessageSquare,
   Headphones
} from 'lucide-react';
import Logo from "@/components/Logo";
import { Link } from "react-router-dom";

const EnhancedAdminDashboard = () => {
  const { signOut } = useAuth();
  const { 
    accounts, 
    transactions, 
    loans, 
    users,
    pendingTransactions, 
    pendingLoans,
    totalBalance,
    totalUsers,
    loading,
    processTransaction,
    reviewLoan,
    updateAccountBalance,
    createUser,
    deleteUser,
    refetchData
  } = useAdminData();

   const {
     stats,
     externalTransfers,
     wireTransfers,
     checkDeposits,
     cards,
     beneficiaries,
     pendingExternalTransfers,
     pendingWireTransfers,
     pendingCheckDeposits,
     pendingBeneficiaries,
     loading: enhancedLoading,
     processExternalTransfer,
     processWireTransfer,
     processCheckDeposit,
     updateCardStatus,
     verifyBeneficiary,
     refetchData: refetchEnhancedData
   } = useEnhancedAdminData();

  const {
    tickets: adminTickets,
    chatSessions: adminChatSessions,
    pendingTickets,
    activeChatSessions,
    getTicketMessages: adminGetTicketMessages,
    getChatMessages: adminGetChatMessages,
    sendTicketReply,
    sendChatReply,
    updateTicketStatus,
    loading: supportLoading,
    refetch: refetchSupport,
  } = useAdminSupport();

  const { toast } = useToast();

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editForm, setEditForm] = useState({
    accountId: '',
    newBalance: '',
    notes: ''
  });
  const [createUserForm, setCreateUserForm] = useState({
    email: '',
    password: '',
    fullName: '',
    initialBalance: 1000,
    role: 'user'
  });
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketMsgs, setTicketMsgs] = useState<AdminMessage[]>([]);
  const [ticketReply, setTicketReply] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatMsgs, setChatMsgs] = useState<AdminMessage[]>([]);
  const [chatReply, setChatReply] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "Admin session ended successfully.",
    });
  };

  const handleProcessTransaction = async (transactionId: string, status: 'approved' | 'rejected') => {
    const result = await processTransaction(transactionId, status);
    if (result?.error) {
      toast({
        title: "Error",
        description: "Failed to process transaction.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Transaction ${status} successfully.`,
      });
    }
  };

  const handleReviewLoan = async (loanId: string, status: 'approved' | 'rejected', notes?: string) => {
    const result = await reviewLoan(loanId, status, notes);
    if (result?.error) {
      toast({
        title: "Error",
        description: "Failed to process loan request.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Loan ${status} successfully.`,
      });
    }
  };

  const handleUpdateBalance = async () => {
    if (!editForm.accountId || !editForm.newBalance) return;

    const result = await updateAccountBalance(
      editForm.accountId, 
      parseFloat(editForm.newBalance),
      editForm.notes
    );

    if (result?.error) {
      toast({
        title: "Error",
        description: "Failed to update account balance.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Account balance updated successfully.",
      });
      setSelectedAccount(null);
      setEditForm({ accountId: '', newBalance: '', notes: '' });
    }
  };

  const handleCreateUser = async () => {
    if (!createUserForm.email || !createUserForm.password || !createUserForm.fullName) return;

    const result = await createUser(
      createUserForm.email,
      createUserForm.password,
      createUserForm.fullName,
      createUserForm.initialBalance,
      createUserForm.role
    );

    if (result?.error) {
      toast({
        title: "Error",
        description: "Failed to create user: " + result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `User ${createUserForm.fullName} created successfully!`,
      });
      setCreateUserForm({
        email: '',
        password: '',
        fullName: '',
        initialBalance: 1000,
        role: 'user'
      });
      setShowCreateUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await deleteUser(userId);

    if (result?.error) {
      toast({
        title: "Error",
        description: "Failed to delete user: " + result.error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "User deleted successfully!",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

   const handleProcessExternalTransfer = async (transferId: string, status: 'approved' | 'rejected') => {
     const result = await processExternalTransfer(transferId, status);
     if (result?.error) {
       toast({ title: "Error", description: "Failed to process external transfer.", variant: "destructive" });
     } else {
       toast({ title: "Success", description: `External transfer ${status} successfully.` });
     }
   };

   const handleProcessWireTransfer = async (transferId: string, status: 'approved' | 'rejected') => {
     const result = await processWireTransfer(transferId, status);
     if (result?.error) {
       toast({ title: "Error", description: "Failed to process wire transfer.", variant: "destructive" });
     } else {
       toast({ title: "Success", description: `Wire transfer ${status} successfully.` });
     }
   };

   const handleProcessCheckDeposit = async (depositId: string, status: 'approved' | 'rejected' | 'cleared') => {
     const result = await processCheckDeposit(depositId, status);
     if (result?.error) {
       toast({ title: "Error", description: "Failed to process check deposit.", variant: "destructive" });
     } else {
       toast({ title: "Success", description: `Check deposit ${status} successfully.` });
     }
   };

   const handleUpdateCardStatus = async (cardId: string, status: string) => {
     const result = await updateCardStatus(cardId, status);
     if (result?.error) {
       toast({ title: "Error", description: "Failed to update card status.", variant: "destructive" });
     } else {
       toast({ title: "Success", description: `Card status updated to ${status}.` });
     }
   };

   const handleVerifyBeneficiary = async (beneficiaryId: string, status: 'active' | 'suspended') => {
     const result = await verifyBeneficiary(beneficiaryId, status);
     if (result?.error) {
       toast({ title: "Error", description: "Failed to verify beneficiary.", variant: "destructive" });
     } else {
       toast({ title: "Success", description: `Beneficiary ${status === 'active' ? 'verified' : 'suspended'} successfully.` });
     }
   };

   const handleRefreshAll = async () => {
     await Promise.all([refetchData(), refetchEnhancedData(), refetchSupport()]);
     toast({ title: "Refreshed", description: "All data has been refreshed." });
   };

   const handleViewTicket = async (ticketId: string) => {
     setSelectedTicketId(ticketId);
     const msgs = await adminGetTicketMessages(ticketId);
     setTicketMsgs(msgs);
   };

   const handleSendTicketReply = async () => {
     if (!selectedTicketId || !ticketReply) return;
     const result = await sendTicketReply(selectedTicketId, ticketReply);
     if (result.error) {
       toast({ title: "Error", description: "Failed to send reply.", variant: "destructive" });
     } else {
       setTicketReply("");
       const msgs = await adminGetTicketMessages(selectedTicketId);
       setTicketMsgs(msgs);
     }
   };

   const handleViewChat = async (sessionId: string) => {
     setSelectedChatId(sessionId);
     const msgs = await adminGetChatMessages(sessionId);
     setChatMsgs(msgs);
   };

   const handleSendChatReply = async () => {
     if (!selectedChatId || !chatReply) return;
     const result = await sendChatReply(selectedChatId, chatReply);
     if (result.error) {
       toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
     } else {
       setChatReply("");
       const msgs = await adminGetChatMessages(selectedChatId);
       setChatMsgs(msgs);
     }
   };

   const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
     const result = await updateTicketStatus(ticketId, status);
     if (result.error) {
       toast({ title: "Error", description: "Failed to update ticket.", variant: "destructive" });
     } else {
       toast({ title: "Success", description: `Ticket ${status}.` });
     }
   };

   if (loading || enhancedLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <Badge variant="outline" className="border-destructive text-destructive">Admin Panel</Badge>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefreshAll}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowCreateUser(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">External Transfers</CardTitle>
               <Building2 className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-warning">{pendingExternalTransfers.length}</div>
               <p className="text-xs text-muted-foreground">Pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Wire Transfers</CardTitle>
               <Send className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-warning">{pendingWireTransfers.length}</div>
               <p className="text-xs text-muted-foreground">Pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingTransactions.length}</div>
              <p className="text-xs text-muted-foreground">Require approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Check Deposits</CardTitle>
               <FileCheck className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-warning">{pendingCheckDeposits.length}</div>
               <p className="text-xs text-muted-foreground">Pending review</p>
            </CardContent>
          </Card>
        </div>

         {/* Secondary Stats Row */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Users</CardTitle>
               <Users className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-xl font-bold">{totalUsers}</div>
             </CardContent>
           </Card>
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
               <DollarSign className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-xl font-bold">{formatCurrency(totalBalance)}</div>
             </CardContent>
           </Card>
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Pending Loans</CardTitle>
               <TrendingUp className="h-4 w-4 text-warning" />
             </CardHeader>
             <CardContent>
               <div className="text-xl font-bold text-warning">{pendingLoans.length}</div>
             </CardContent>
           </Card>
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
               <CreditCard className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-xl font-bold">{cards.length}</div>
             </CardContent>
           </Card>
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Beneficiaries</CardTitle>
               <UserCheck className="h-4 w-4 text-warning" />
             </CardHeader>
             <CardContent>
               <div className="text-xl font-bold text-warning">{pendingBeneficiaries.length}</div>
             </CardContent>
           </Card>
         </div>

        {/* Alert for pending items */}
         {(pendingTransactions.length > 0 || pendingLoans.length > 0 || pendingExternalTransfers.length > 0 || pendingWireTransfers.length > 0 || pendingCheckDeposits.length > 0) && (
          <Alert className="mb-6">
            <Clock className="h-4 w-4" />
            <AlertDescription>
               You have {pendingTransactions.length} transactions, {pendingLoans.length} loans, {pendingExternalTransfers.length} external transfers, {pendingWireTransfers.length} wire transfers, and {pendingCheckDeposits.length} check deposits pending review.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
             <TabsList className="flex flex-wrap w-full gap-1">
              <TabsTrigger value="users">Users</TabsTrigger>
               <TabsTrigger value="pending-transactions">Transactions</TabsTrigger>
               <TabsTrigger value="pending-loans">Loans</TabsTrigger>
               <TabsTrigger value="external-transfers">External</TabsTrigger>
               <TabsTrigger value="wire-transfers">Wires</TabsTrigger>
               <TabsTrigger value="check-deposits">Checks</TabsTrigger>
               <TabsTrigger value="cards">Cards</TabsTrigger>
               <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="all-transactions">All Txns</TabsTrigger>
              <TabsTrigger value="support-tickets">Tickets</TabsTrigger>
              <TabsTrigger value="live-chats">Chats</TabsTrigger>
              <TabsTrigger value="customization">Customize</TabsTrigger>
            </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage all users in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total Balance</TableHead>
                      <TableHead>Accounts</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>
                          <Badge variant={user.account_status === 'active' ? 'default' : 'secondary'}>
                            {user.account_status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(user.total_balance)}</TableCell>
                        <TableCell>{user.account_count}</TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the user
                                  and all associated accounts, transactions, and data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.user_id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending-transactions">
            <Card>
              <CardHeader>
                <CardTitle>Pending Transactions</CardTitle>
                <CardDescription>Transactions awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {pendingTransactions.map((transaction) => (
                      <div key={transaction.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.user_name} ({transaction.user_email})
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatCurrency(transaction.amount)}</p>
                            <Badge variant="secondary">{transaction.transaction_type}</Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleProcessTransaction(transaction.id, 'approved')}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleProcessTransaction(transaction.id, 'rejected')}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending transactions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending-loans">
            <Card>
              <CardHeader>
                <CardTitle>Pending Loan Requests</CardTitle>
                <CardDescription>Loan applications awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingLoans.length > 0 ? (
                  <div className="space-y-4">
                    {pendingLoans.map((loan) => (
                      <div key={loan.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-medium">{loan.purpose}</p>
                            <p className="text-sm text-muted-foreground">
                              {loan.user_name} ({loan.user_email})
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Type: {loan.loan_type} | {formatDate(loan.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{formatCurrency(loan.amount)}</p>
                            <Badge variant="secondary">Pending</Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleReviewLoan(loan.id, 'approved')}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleReviewLoan(loan.id, 'rejected')}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending loan requests</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

           <TabsContent value="external-transfers">
             <Card>
               <CardHeader>
                 <CardTitle>External Transfers</CardTitle>
                 <CardDescription>Transfers to external banks pending approval</CardDescription>
               </CardHeader>
               <CardContent>
                 {pendingExternalTransfers.length > 0 ? (
                   <div className="space-y-4">
                     {pendingExternalTransfers.map((transfer) => (
                       <div key={transfer.id} className="p-4 border rounded-lg">
                         <div className="flex items-center justify-between mb-4">
                           <div>
                             <p className="font-medium">To: {transfer.recipient_name}</p>
                             <p className="text-sm text-muted-foreground">
                               Bank: {transfer.bank_name} | Account: {transfer.recipient_account_number}
                             </p>
                             <p className="text-sm text-muted-foreground">
                               From: {transfer.user_name} ({transfer.user_email})
                             </p>
                             <p className="text-xs text-muted-foreground">
                               {formatDate(transfer.created_at)} {transfer.memo && `| Memo: ${transfer.memo}`}
                             </p>
                           </div>
                           <div className="text-right">
                             <p className="text-lg font-bold">{formatCurrency(transfer.amount)}</p>
                             <Badge variant="secondary">Pending</Badge>
                           </div>
                         </div>
                         <div className="flex space-x-2">
                           <Button size="sm" onClick={() => handleProcessExternalTransfer(transfer.id, 'approved')}>
                             <Check className="w-4 h-4 mr-2" />Approve
                           </Button>
                           <Button size="sm" variant="destructive" onClick={() => handleProcessExternalTransfer(transfer.id, 'rejected')}>
                             <X className="w-4 h-4 mr-2" />Reject
                           </Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8">
                     <p className="text-muted-foreground">No pending external transfers</p>
                   </div>
                 )}
               </CardContent>
             </Card>
           </TabsContent>

           <TabsContent value="wire-transfers">
             <Card>
               <CardHeader>
                 <CardTitle>Wire Transfers</CardTitle>
                 <CardDescription>Domestic and international wire transfers</CardDescription>
               </CardHeader>
               <CardContent>
                 {pendingWireTransfers.length > 0 ? (
                   <div className="space-y-4">
                     {pendingWireTransfers.map((wire) => (
                       <div key={wire.id} className="p-4 border rounded-lg">
                         <div className="flex items-center justify-between mb-4">
                           <div>
                             <p className="font-medium">To: {wire.recipient_name}</p>
                             <p className="text-sm text-muted-foreground">
                               Bank: {wire.recipient_bank} | Type: {wire.wire_type.toUpperCase()}
                             </p>
                             <p className="text-sm text-muted-foreground">
                               From: {wire.user_name} ({wire.user_email})
                             </p>
                             <p className="text-xs text-muted-foreground">
                               {formatDate(wire.created_at)} {wire.purpose && `| Purpose: ${wire.purpose}`}
                             </p>
                           </div>
                           <div className="text-right">
                             <p className="text-lg font-bold">{formatCurrency(wire.amount)}</p>
                             <p className="text-xs text-muted-foreground">Fee: {formatCurrency(wire.fee_amount)}</p>
                             <Badge variant="secondary">Pending</Badge>
                           </div>
                         </div>
                         <div className="flex space-x-2">
                           <Button size="sm" onClick={() => handleProcessWireTransfer(wire.id, 'approved')}>
                             <Check className="w-4 h-4 mr-2" />Approve
                           </Button>
                           <Button size="sm" variant="destructive" onClick={() => handleProcessWireTransfer(wire.id, 'rejected')}>
                             <X className="w-4 h-4 mr-2" />Reject
                           </Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8">
                     <p className="text-muted-foreground">No pending wire transfers</p>
                   </div>
                 )}
               </CardContent>
             </Card>
           </TabsContent>

           <TabsContent value="check-deposits">
             <Card>
               <CardHeader>
                 <CardTitle>Check Deposits</CardTitle>
                 <CardDescription>Mobile check deposits requiring verification</CardDescription>
               </CardHeader>
               <CardContent>
                 {pendingCheckDeposits.length > 0 ? (
                   <div className="space-y-4">
                     {pendingCheckDeposits.map((deposit) => (
                       <div key={deposit.id} className="p-4 border rounded-lg">
                         <div className="flex items-center justify-between mb-4">
                           <div>
                             <p className="font-medium">Check #{deposit.check_number}</p>
                             <p className="text-sm text-muted-foreground">
                               From: {deposit.payer_name}
                             </p>
                             <p className="text-sm text-muted-foreground">
                               User: {deposit.user_name} ({deposit.user_email})
                             </p>
                             <p className="text-xs text-muted-foreground">
                               {formatDate(deposit.created_at)} | Hold: {deposit.hold_days} days
                             </p>
                           </div>
                           <div className="text-right">
                             <p className="text-lg font-bold">{formatCurrency(deposit.check_amount)}</p>
                             <Badge variant="secondary">Pending</Badge>
                           </div>
                         </div>
                         <div className="flex space-x-2">
                           <Button size="sm" onClick={() => handleProcessCheckDeposit(deposit.id, 'approved')}>
                             <Check className="w-4 h-4 mr-2" />Approve
                           </Button>
                           <Button size="sm" variant="outline" onClick={() => handleProcessCheckDeposit(deposit.id, 'cleared')}>
                             <CheckCircle className="w-4 h-4 mr-2" />Clear Now
                           </Button>
                           <Button size="sm" variant="destructive" onClick={() => handleProcessCheckDeposit(deposit.id, 'rejected')}>
                             <X className="w-4 h-4 mr-2" />Reject
                           </Button>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8">
                     <p className="text-muted-foreground">No pending check deposits</p>
                   </div>
                 )}
               </CardContent>
             </Card>
           </TabsContent>

           <TabsContent value="cards">
             <Card>
               <CardHeader>
                 <CardTitle>Card Management</CardTitle>
                 <CardDescription>View and manage all user cards</CardDescription>
               </CardHeader>
               <CardContent>
                 {cards.length > 0 ? (
                   <div className="space-y-4">
                     {cards.map((card) => (
                       <div key={card.id} className="p-4 border rounded-lg">
                         <div className="flex items-center justify-between">
                           <div>
                             <p className="font-medium">
                               {card.card_type.toUpperCase()} •••• {card.card_number.slice(-4)}
                             </p>
                             <p className="text-sm text-muted-foreground">
                               {card.user_name} ({card.user_email})
                             </p>
                             <p className="text-xs text-muted-foreground">
                               Expires: {card.expiry_date} | Limit: {formatCurrency(card.daily_limit)}
                             </p>
                           </div>
                           <div className="flex items-center space-x-2">
                             <Badge variant={
                               card.card_status === 'active' ? 'default' :
                               card.card_status === 'frozen' ? 'secondary' : 'destructive'
                             }>
                               {card.card_status}
                             </Badge>
                             <Select value={card.card_status} onValueChange={(value) => handleUpdateCardStatus(card.id, value)}>
                               <SelectTrigger className="w-32">
                                 <SelectValue />
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="active">Active</SelectItem>
                                 <SelectItem value="frozen">Frozen</SelectItem>
                                 <SelectItem value="deactivated">Deactivated</SelectItem>
                               </SelectContent>
                             </Select>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8">
                     <p className="text-muted-foreground">No cards found</p>
                   </div>
                 )}
               </CardContent>
             </Card>
           </TabsContent>

           <TabsContent value="beneficiaries">
             <Card>
               <CardHeader>
                 <CardTitle>Beneficiary Verification</CardTitle>
                 <CardDescription>Verify saved payment recipients</CardDescription>
               </CardHeader>
               <CardContent>
                 {beneficiaries.length > 0 ? (
                   <div className="space-y-4">
                     {beneficiaries.map((beneficiary) => (
                       <div key={beneficiary.id} className="p-4 border rounded-lg">
                         <div className="flex items-center justify-between">
                           <div>
                             <p className="font-medium">{beneficiary.nickname}</p>
                             <p className="text-sm text-muted-foreground">
                               Account: {beneficiary.account_number} | Bank: {beneficiary.bank_name || 'Internal'}
                             </p>
                             <p className="text-sm text-muted-foreground">
                               Added by: {beneficiary.user_name} ({beneficiary.user_email})
                             </p>
                             <p className="text-xs text-muted-foreground">
                               Type: {beneficiary.beneficiary_type} | {formatDate(beneficiary.created_at)}
                             </p>
                           </div>
                           <div className="flex items-center space-x-2">
                             <Badge variant={
                               beneficiary.status === 'active' ? 'default' :
                               beneficiary.status === 'pending' ? 'secondary' : 'destructive'
                             }>
                               {beneficiary.is_verified ? '✓ Verified' : beneficiary.status}
                             </Badge>
                             {beneficiary.status === 'pending' && (
                               <div className="flex space-x-2">
                                 <Button size="sm" onClick={() => handleVerifyBeneficiary(beneficiary.id, 'active')}>
                                   <Check className="w-4 h-4 mr-2" />Verify
                                 </Button>
                                 <Button size="sm" variant="destructive" onClick={() => handleVerifyBeneficiary(beneficiary.id, 'suspended')}>
                                   <X className="w-4 h-4 mr-2" />Suspend
                                 </Button>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8">
                     <p className="text-muted-foreground">No beneficiaries found</p>
                   </div>
                 )}
               </CardContent>
             </Card>
           </TabsContent>

          <TabsContent value="accounts">
            <Card>
              <CardHeader>
                <CardTitle>User Accounts</CardTitle>
                <CardDescription>Manage user account balances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{account.user_name}</p>
                          <p className="text-sm text-muted-foreground">{account.user_email}</p>
                          <p className="text-xs text-muted-foreground">Account: {account.account_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(account.balance)}</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setSelectedAccount(account);
                              setEditForm({
                                accountId: account.id,
                                newBalance: account.balance.toString(),
                                notes: ''
                              });
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Balance
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all-transactions">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>Complete transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.user_name} ({transaction.user_email})
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(transaction.amount)}</p>
                          <Badge variant={
                            transaction.status === 'completed' ? 'default' :
                            transaction.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="support-tickets">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Headphones className="w-5 h-5" /> Support Tickets ({pendingTickets.length} pending)</CardTitle>
                <CardDescription>Manage customer support tickets</CardDescription>
              </CardHeader>
              <CardContent>
                {adminTickets.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">No tickets yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Messages</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminTickets.map(t => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.subject}</TableCell>
                          <TableCell>{t.user_name || t.user_email}</TableCell>
                          <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                          <TableCell><Badge variant={t.priority === 'urgent' ? 'destructive' : t.priority === 'high' ? 'default' : 'outline'}>{t.priority}</Badge></TableCell>
                          <TableCell><Badge variant="outline">{t.status}</Badge></TableCell>
                          <TableCell>{t.message_count}</TableCell>
                          <TableCell className="text-sm">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => handleViewTicket(t.id)}>
                              <MessageSquare className="w-3 h-3 mr-1" />Reply
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Chats Tab */}
          <TabsContent value="live-chats">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Live Chat Sessions ({activeChatSessions.length} active)</CardTitle>
                <CardDescription>Respond to live customer chats</CardDescription>
              </CardHeader>
              <CardContent>
                {adminChatSessions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-6">No chat sessions yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Messages</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminChatSessions.map(s => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.user_name || s.user_email}</TableCell>
                          <TableCell><Badge variant={s.status === 'active' ? 'default' : 'outline'}>{s.status}</Badge></TableCell>
                          <TableCell>{s.message_count}</TableCell>
                          <TableCell className="text-sm">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => handleViewChat(s.id)}>
                              <MessageSquare className="w-3 h-3 mr-1" />Open
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customization Tab */}
          <TabsContent value="customization">
            <AdminCustomization />
          </TabsContent>
        </Tabs>

        {/* Edit Balance Dialog */}
        <Dialog open={selectedAccount !== null} onOpenChange={() => setSelectedAccount(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Account Balance</DialogTitle>
            </DialogHeader>
            {selectedAccount && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="balance">New Balance</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={editForm.newBalance}
                    onChange={(e) => setEditForm({...editForm, newBalance: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Admin Notes</Label>
                  <Textarea
                    id="notes"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                    placeholder="Reason for balance adjustment..."
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedAccount(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateBalance}>
                Update Balance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create User Dialog */}
        <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Create a new user account with initial balance and role.
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm({...createUserForm, password: e.target.value})}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={createUserForm.fullName}
                  onChange={(e) => setCreateUserForm({...createUserForm, fullName: e.target.value})}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="initialBalance">Initial Balance ($)</Label>
                <Input
                  id="initialBalance"
                  type="number"
                  value={createUserForm.initialBalance}
                  onChange={(e) => setCreateUserForm({...createUserForm, initialBalance: parseFloat(e.target.value) || 0})}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={createUserForm.role} 
                  onValueChange={(value) => setCreateUserForm({...createUserForm, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>
                <UserPlus className="w-4 h-4 mr-2" />
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ticket View Dialog */}
        <Dialog open={!!selectedTicketId} onOpenChange={(open) => { if (!open) setSelectedTicketId(null); }}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Ticket: {adminTickets.find(t => t.id === selectedTicketId)?.subject}</DialogTitle>
            </DialogHeader>
            <div className="text-sm text-muted-foreground mb-2">
              From: {adminTickets.find(t => t.id === selectedTicketId)?.user_name || adminTickets.find(t => t.id === selectedTicketId)?.user_email}
            </div>
            <div className="flex gap-2 mb-2">
              <Select onValueChange={(v) => selectedTicketId && handleUpdateTicketStatus(selectedTicketId, v)}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Update status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 py-2 min-h-0">
              {ticketMsgs.map(m => (
                <div key={m.id} className={`flex ${m.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${m.sender_type === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm font-medium">{m.sender_name}</p>
                    <p className="text-sm">{m.message}</p>
                    <p className={`text-xs mt-1 ${m.sender_type === 'admin' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {new Date(m.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Input value={ticketReply} onChange={e => setTicketReply(e.target.value)} placeholder="Type admin reply..." onKeyDown={e => e.key === 'Enter' && handleSendTicketReply()} />
              <Button onClick={handleSendTicketReply} disabled={!ticketReply}><Send className="w-4 h-4" /></Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Chat View Dialog */}
        <Dialog open={!!selectedChatId} onOpenChange={(open) => { if (!open) setSelectedChatId(null); }}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Chat with {adminChatSessions.find(s => s.id === selectedChatId)?.user_name || adminChatSessions.find(s => s.id === selectedChatId)?.user_email}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-2 py-2 min-h-0">
              {chatMsgs.map(m => (
                <div key={m.id} className={`flex ${m.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-2 rounded-lg text-sm ${m.sender_type === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {m.message}
                    <div className={`text-xs mt-0.5 ${m.sender_type === 'admin' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {m.sender_name} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Input value={chatReply} onChange={e => setChatReply(e.target.value)} placeholder="Type admin message..." onKeyDown={e => e.key === 'Enter' && handleSendChatReply()} />
              <Button onClick={handleSendChatReply} disabled={!chatReply}><Send className="w-4 h-4" /></Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default EnhancedAdminDashboard;