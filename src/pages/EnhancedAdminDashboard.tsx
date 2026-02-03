import { useState } from "react";
import { useAdminData, AdminUser } from '@/hooks/useAdminData';
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
  X
} from 'lucide-react';
import Logo from "@/components/Logo";

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

  if (loading) {
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Logo size="sm" />
              <Badge variant="outline" className="border-destructive text-destructive">Admin</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowCreateUser(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Create User
              </Button>
              <Badge variant="outline" className="border-primary text-primary">
                <Shield className="w-4 h-4 mr-2" />
                Administrator
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Active accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
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
              <TrendingUp className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingLoans.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Alert for pending items */}
        {(pendingTransactions.length > 0 || pendingLoans.length > 0) && (
          <Alert className="mb-6">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              You have {pendingTransactions.length} pending transactions and {pendingLoans.length} pending loan requests that require your attention.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="pending-transactions">Pending Transactions</TabsTrigger>
              <TabsTrigger value="pending-loans">Pending Loans</TabsTrigger>
              <TabsTrigger value="accounts">User Accounts</TabsTrigger>
              <TabsTrigger value="all-transactions">All Transactions</TabsTrigger>
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
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;