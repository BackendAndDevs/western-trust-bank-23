import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Settings, 
  LogOut,
  Send,
  PiggyBank,
  FileText
} from "lucide-react";
import { useBanking } from "@/contexts/BankingContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { currentUser, transactions, loanRequests, deposit, withdraw, transfer, requestLoan, logout } = useBanking();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferRecipient, setTransferRecipient] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const userTransactions = transactions.filter(t => t.userId === currentUser.id).slice(0, 10);
  const userLoanRequests = loanRequests.filter(l => l.userId === currentUser.id);

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(depositAmount);
    if (amount > 0) {
      deposit(amount);
      setDepositAmount("");
      toast({
        title: "Deposit Successful",
        description: `$${amount.toFixed(2)} has been deposited to your account.`,
      });
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (amount > 0) {
      const success = withdraw(amount);
      if (success) {
        setWithdrawAmount("");
        toast({
          title: "Withdrawal Successful",
          description: `$${amount.toFixed(2)} has been withdrawn from your account.`,
        });
      } else {
        toast({
          title: "Withdrawal Failed",
          description: "Insufficient funds or invalid amount.",
          variant: "destructive",
        });
      }
    }
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (amount > 0 && transferRecipient) {
      const success = transfer(transferRecipient, amount);
      if (success) {
        setTransferAmount("");
        setTransferRecipient("");
        toast({
          title: "Transfer Successful",
          description: `$${amount.toFixed(2)} has been transferred to ${transferRecipient}.`,
        });
      } else {
        toast({
          title: "Transfer Failed",
          description: "Insufficient funds, invalid recipient, or you cannot transfer to yourself.",
          variant: "destructive",
        });
      }
    }
  };

  const handleLoanRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(loanAmount);
    if (amount > 0 && loanPurpose) {
      requestLoan(amount, loanPurpose);
      setLoanAmount("");
      setLoanPurpose("");
      toast({
        title: "Loan Request Submitted",
        description: "Your loan request has been submitted for review.",
      });
    }
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
                <h1 className="text-lg sm:text-xl font-bold text-primary">Western Trust Bank</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {currentUser.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                <Link to="/profile">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Account Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-primary">{formatCurrency(currentUser.balance)}</div>
              <p className="text-xs text-muted-foreground">Primary Checking Account</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{userTransactions.length}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Loans</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{userLoanRequests.filter(l => l.status === 'pending').length}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button asChild className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 text-xs sm:text-sm">
            <Link to="/deposit">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Deposit</span>
            </Link>
          </Button>
          <Button asChild className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 text-xs sm:text-sm" variant="outline">
            <Link to="/withdraw">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Withdraw</span>
            </Link>
          </Button>
          <Button asChild className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 text-xs sm:text-sm" variant="outline">
            <Link to="/transfer">
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Transfer</span>
            </Link>
          </Button>
          <Button asChild className="h-16 sm:h-20 flex-col space-y-1 sm:space-y-2 text-xs sm:text-sm" variant="outline">
            <Link to="/profile">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Settings</span>
            </Link>
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="transactions" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
            <TabsTrigger value="transactions" className="px-2 sm:px-4">Transactions</TabsTrigger>
            <TabsTrigger value="summary" className="px-2 sm:px-4">Summary</TabsTrigger>
            <TabsTrigger value="loans" className="px-2 sm:px-4">Loans</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent account activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {userTransactions.length > 0 ? (
                    userTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'deposit' || transaction.type === 'transfer_received' 
                              ? 'bg-success/10' 
                              : 'bg-destructive/10'
                          }`}>
                            {transaction.type === 'deposit' || transaction.type === 'transfer_received' ? (
                              <ArrowUpRight className={`w-4 h-4 ${
                                transaction.type === 'deposit' || transaction.type === 'transfer_received' 
                                  ? 'text-success' 
                                  : 'text-destructive'
                              }`} />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4 text-destructive" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">{transaction.description}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {formatDate(transaction.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className={`font-semibold text-sm sm:text-base text-right ${
                          transaction.type === 'deposit' || transaction.type === 'transfer_received' 
                            ? 'text-success' 
                            : 'text-destructive'
                        }`}>
                          {transaction.type === 'deposit' || transaction.type === 'transfer_received' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Overview</CardTitle>
                  <CardDescription>Your account at a glance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Account Type:</span>
                    <span className="font-medium">Primary Checking</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Account Number:</span>
                    <span className="font-mono">****-{currentUser.id.padStart(4, '0')}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Available Balance:</span>
                    <span className="font-semibold text-primary">{formatCurrency(currentUser.balance)}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Account Status:</span>
                    <span className="text-success">Active</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>This month's activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Total Transactions:</span>
                    <span className="font-medium">{userTransactions.length}</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Deposits:</span>
                    <span className="font-medium text-success">
                      {userTransactions.filter(t => t.type === 'deposit').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Withdrawals:</span>
                    <span className="font-medium text-warning">
                      {userTransactions.filter(t => t.type === 'withdraw').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span>Transfers:</span>
                    <span className="font-medium">
                      {userTransactions.filter(t => t.type.includes('transfer')).length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="loans">
            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Request Loan
                  </CardTitle>
                  <CardDescription>Apply for a personal loan</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLoanRequest} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="loan-amount">Loan Amount</Label>
                        <Input
                          id="loan-amount"
                          type="number"
                          placeholder="0.00"
                          value={loanAmount}
                          onChange={(e) => setLoanAmount(e.target.value)}
                          min="100"
                          step="100"
                          required
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="loan-purpose">Purpose</Label>
                        <Textarea
                          id="loan-purpose"
                          placeholder="Describe the purpose of this loan"
                          value={loanPurpose}
                          onChange={(e) => setLoanPurpose(e.target.value)}
                          required
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Submit Loan Request
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Loan Requests</CardTitle>
                  <CardDescription>Track your loan application status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {userLoanRequests.length > 0 ? (
                      userLoanRequests.map((loan) => (
                        <div key={loan.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm sm:text-base">{formatCurrency(loan.amount)}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{loan.purpose}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(loan.timestamp)}
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium self-start sm:self-center ${
                            loan.status === 'approved' 
                              ? 'bg-success/10 text-success' 
                              : loan.status === 'rejected'
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-warning/10 text-warning'
                          }`}>
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-6 sm:py-8">No loan requests yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;