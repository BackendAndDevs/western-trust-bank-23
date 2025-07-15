import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  CreditCard, 
  Users, 
  FileText, 
  TrendingUp, 
  LogOut,
  Check,
  X,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Edit,
  Save
} from "lucide-react";
import { useBanking, User } from "@/contexts/BankingContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { 
    currentUser, 
    users, 
    transactions, 
    loanRequests, 
    updateLoanStatus, 
    removeUser, 
    updateUser,
    logout 
  } = useBanking();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', username: '', balance: '' });

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  if (!currentUser || !currentUser.isAdmin) return null;

  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);
  const pendingLoans = loanRequests.filter(loan => loan.status === 'pending').length;
  const totalUsers = users.filter(user => !user.isAdmin).length;

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({
      title: "Logged Out",
      description: "Admin session ended successfully.",
    });
  };

  const handleLoanApproval = (loanId: string, status: 'approved' | 'rejected') => {
    updateLoanStatus(loanId, status);
    toast({
      title: `Loan ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      description: `Loan request has been ${status}.`,
    });
  };

  const handleRemoveUser = (userId: string, username: string) => {
    if (window.confirm(`Are you sure you want to remove user ${username}? This action cannot be undone.`)) {
      removeUser(userId);
      toast({
        title: "User Removed",
        description: `User ${username} has been removed from the system.`,
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      username: user.username,
      balance: user.balance.toString(),
    });
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    
    const balance = parseFloat(editForm.balance);
    if (isNaN(balance) || balance < 0) {
      toast({
        title: "Invalid Balance",
        description: "Please enter a valid balance amount.",
        variant: "destructive",
      });
      return;
    }

    updateUser(editingUser.id, {
      name: editForm.name,
      email: editForm.email,
      username: editForm.username,
      balance: balance,
    });

    toast({
      title: "User Updated",
      description: `User ${editForm.username} has been updated successfully.`,
    });

    setEditingUser(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-primary">Western Trust Bank Admin</h1>
                <p className="text-sm text-muted-foreground">Administrator Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Admin</Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Admin Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-primary">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Active accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-primary">{formatCurrency(totalBalance)}</div>
              <p className="text-xs text-muted-foreground">All account balances</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Loans</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-warning">{pendingLoans}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-primary">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Content */}
        <Tabs defaultValue="users" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
            <TabsTrigger value="users" className="px-2 sm:px-4">Users</TabsTrigger>
            <TabsTrigger value="transactions" className="px-2 sm:px-4">Transactions</TabsTrigger>
            <TabsTrigger value="loans" className="px-2 sm:px-4">Loans</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {users.filter(user => !user.isAdmin).map((user) => (
                    <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">{user.name}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">@{user.username}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-semibold text-primary text-sm sm:text-base">{formatCurrency(user.balance)}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Account Balance</p>
                      </div>
                      <div className="flex space-x-2 self-start sm:self-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="text-xs sm:text-sm"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline ml-1">Edit</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User Account</DialogTitle>
                              <DialogDescription>
                                Update user account information and balance.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                  id="name"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={editForm.email}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="username">Username</Label>
                                <Input
                                  id="username"
                                  value={editForm.username}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="balance">Account Balance</Label>
                                <Input
                                  id="balance"
                                  type="number"
                                  step="0.01"
                                  value={editForm.balance}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, balance: e.target.value }))}
                                />
                              </div>
                              <Button onClick={handleSaveUser} className="w-full">
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRemoveUser(user.id, user.username)}
                          className="text-xs sm:text-sm"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline ml-1">Remove</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>Complete transaction history across all accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                  {transactions.map((transaction) => {
                    const user = users.find(u => u.id === transaction.userId);
                    return (
                      <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'deposit' || transaction.type === 'transfer_received' 
                              ? 'bg-success/10' 
                              : 'bg-destructive/10'
                          }`}>
                            {transaction.type === 'deposit' || transaction.type === 'transfer_received' ? (
                              <ArrowUpRight className="w-4 h-4 text-success" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">{transaction.description}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {user?.username} • {formatDate(transaction.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className={`font-semibold text-sm sm:text-base text-left sm:text-right ${
                          transaction.type === 'deposit' || transaction.type === 'transfer_received' 
                            ? 'text-success' 
                            : 'text-destructive'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'transfer_received' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loans">
            <Card>
              <CardHeader>
                <CardTitle>Loan Request Management</CardTitle>
                <CardDescription>Review and approve or reject loan applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loanRequests.map((loan) => (
                    <div key={loan.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-medium text-lg">{formatCurrency(loan.amount)}</p>
                          <p className="text-sm text-muted-foreground">@{loan.username}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(loan.timestamp)}</p>
                        </div>
                        <Badge 
                          variant={
                            loan.status === 'approved' 
                              ? 'default' 
                              : loan.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">Purpose:</p>
                        <p className="text-sm text-muted-foreground">{loan.purpose}</p>
                      </div>

                      {loan.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleLoanApproval(loan.id, 'approved')}
                            className="bg-success hover:bg-success/90"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleLoanApproval(loan.id, 'rejected')}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {loanRequests.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No loan requests yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;