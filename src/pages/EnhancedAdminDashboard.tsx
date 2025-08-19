import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CreditCard, 
  Users, 
  FileText, 
  TrendingUp, 
  LogOut,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminData } from "@/hooks/useAdminData";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const EnhancedAdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { 
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
    updateAccountBalance
  } = useAdminData();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editForm, setEditForm] = useState({ balance: "", notes: "" });

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    toast({
      title: "Logged Out",
      description: "Admin session ended successfully.",
    });
  };

  const handleProcessTransaction = async (transactionId: string, status: 'approved' | 'rejected') => {
    const { error } = await processTransaction(transactionId, status);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to process transaction.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Transaction ${status} successfully.`,
      });
    }
  };

  const handleReviewLoan = async (loanId: string, status: 'approved' | 'rejected', notes?: string) => {
    const { error } = await reviewLoan(loanId, status, notes);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to process loan request.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Loan ${status} successfully.`,
      });
    }
  };

  const handleUpdateBalance = async (accountId: string, newBalance: number, notes: string) => {
    const { error } = await updateAccountBalance(accountId, newBalance, notes);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update account balance.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Account balance updated successfully.",
      });
      setEditForm({ balance: "", notes: "" });
      setSelectedAccount(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-banking-green-light to-accent flex items-center justify-center">
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Western Trust Bank Admin</h1>
                <p className="text-sm text-muted-foreground">Administrator Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Navigation />
              <Badge variant="destructive">Admin</Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Admin Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Active accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalBalance)}</div>
              <p className="text-xs text-muted-foreground">All accounts combined</p>
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
              <CardTitle className="text-sm font-medium">Pending Loans</CardTitle>
              <FileText className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingLoans.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(pendingTransactions.length > 0 || pendingLoans.length > 0) && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have {pendingTransactions.length} pending transactions and {pendingLoans.length} pending loan requests that require your attention.
            </AlertDescription>
          </Alert>
        )}

        {/* Admin Content */}
        <Tabs defaultValue="pending-transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending-transactions">
              Pending Transactions ({pendingTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="pending-loans">
              Pending Loans ({pendingLoans.length})
            </TabsTrigger>
            <TabsTrigger value="accounts">User Accounts</TabsTrigger>
            <TabsTrigger value="all-transactions">All Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="pending-transactions">
            <Card>
              <CardHeader>
                <CardTitle>Pending Transactions</CardTitle>
                <CardDescription>Transactions awaiting admin approval</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {pendingTransactions.map((transaction) => (
                      <div key={transaction.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-warning/10 rounded-full">
                              <Clock className="w-4 h-4 text-warning" />
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.user_name || transaction.user_email}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Account: {transaction.account_number}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(transaction.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatCurrency(transaction.amount)}</p>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              {transaction.transaction_type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        
                        {transaction.recipient_info && (
                          <div className="mb-4 p-3 bg-muted rounded">
                            <p className="text-sm font-medium">Additional Info:</p>
                            <p className="text-sm">{JSON.stringify(transaction.recipient_info, null, 2)}</p>
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleProcessTransaction(transaction.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleProcessTransaction(transaction.id, 'rejected')}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
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
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="font-medium">{loan.purpose}</p>
                            <p className="text-sm text-muted-foreground">
                              {loan.user_name || loan.user_email}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                              Type: {loan.loan_type.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(loan.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatCurrency(loan.amount)}</p>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Pending
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          {loan.annual_income && (
                            <div>
                              <span className="font-medium">Annual Income:</span>
                              <p>{formatCurrency(loan.annual_income)}</p>
                            </div>
                          )}
                          {loan.credit_score && (
                            <div>
                              <span className="font-medium">Credit Score:</span>
                              <p>{loan.credit_score}</p>
                            </div>
                          )}
                          {loan.employment_status && (
                            <div>
                              <span className="font-medium">Employment:</span>
                              <p className="capitalize">{loan.employment_status.replace('_', ' ')}</p>
                            </div>
                          )}
                        </div>
                        
                        <Dialog>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleReviewLoan(loan.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleReviewLoan(loan.id, 'rejected')}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending loan requests</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts">
            <Card>
              <CardHeader>
                <CardTitle>User Account Management</CardTitle>
                <CardDescription>Manage user accounts and balances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{account.user_name || account.user_email}</p>
                            <p className="text-sm text-muted-foreground">
                              Account: {account.account_number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Type: {account.account_type} | Currency: {account.currency}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatCurrency(Number(account.balance))}</p>
                            {account.is_primary && (
                              <Badge variant="secondary">Primary</Badge>
                            )}
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedAccount(account);
                                  setEditForm({ balance: account.balance.toString(), notes: "" });
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Account Balance</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Current Balance</Label>
                                  <p className="text-lg font-semibold">{formatCurrency(Number(account.balance))}</p>
                                </div>
                                <div>
                                  <Label htmlFor="new-balance">New Balance</Label>
                                  <Input
                                    id="new-balance"
                                    type="number"
                                    step="0.01"
                                    value={editForm.balance}
                                    onChange={(e) => setEditForm({ ...editForm, balance: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="admin-notes">Admin Notes</Label>
                                  <Textarea
                                    id="admin-notes"
                                    placeholder="Reason for balance adjustment..."
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                  />
                                </div>
                                <Button
                                  onClick={() => handleUpdateBalance(
                                    account.id, 
                                    parseFloat(editForm.balance), 
                                    editForm.notes
                                  )}
                                  className="w-full"
                                >
                                  Update Balance
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
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
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          transaction.transaction_type === 'deposit' || transaction.transaction_type === 'transfer_received' 
                            ? 'bg-success/10' 
                            : 'bg-destructive/10'
                        }`}>
                          {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'transfer_received' ? (
                            <ArrowUpRight className="w-4 h-4 text-success" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.user_name || transaction.user_email} - {transaction.account_number}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.transaction_type === 'deposit' || transaction.transaction_type === 'transfer_received' 
                            ? 'text-success' 
                            : 'text-destructive'
                        }`}>
                          {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'transfer_received' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <Badge variant={
                          transaction.status === 'completed' ? 'default' : 
                          transaction.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;