import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Clock,
  LogOut,
  User,
  Home,
  Plus,
  Minus,
  ArrowLeftRight,
  FileText,
  Building2,
  Bell
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBankingData } from "@/hooks/useBankingData";
import { useToast } from "@/hooks/use-toast";
import { useInterest } from "@/hooks/useInterest";
import Navigation from "@/components/Navigation";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { 
    primaryAccount, 
    transactions, 
    loanRequests, 
    loading,
    deposit,
    withdraw,
    transfer,
    requestLoan
  } = useBankingData();
  const { calculateInterest, loading: interestLoading } = useInterest();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [transferForm, setTransferForm] = useState({
    recipient: "",
    amount: "",
    memo: ""
  });
  const [loanForm, setLoanForm] = useState({
    amount: "",
    purpose: "",
    loanType: "personal",
    annualIncome: "",
    creditScore: "",
    employmentStatus: ""
  });

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;

    const { error } = await deposit(parseFloat(depositAmount));
    if (error) {
      toast({
        title: "Deposit Failed",
        description: "Failed to process deposit. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deposit Submitted",
        description: `$${depositAmount} deposit submitted for admin approval.`,
      });
      setDepositAmount("");
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;

    const { error } = await withdraw(parseFloat(withdrawAmount));
    if (error) {
      toast({
        title: "Withdrawal Failed",
        description: typeof error === 'string' ? error : "Failed to process withdrawal.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Withdrawal Submitted", 
        description: `$${withdrawAmount} withdrawal submitted for admin approval.`,
      });
      setWithdrawAmount("");
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferForm.recipient || !transferForm.amount || parseFloat(transferForm.amount) <= 0) return;

    const { error } = await transfer(transferForm.recipient, parseFloat(transferForm.amount), transferForm.memo);
    if (error) {
      toast({
        title: "Transfer Failed",
        description: typeof error === 'string' ? error : "Failed to process transfer.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Transfer Submitted",
        description: `$${transferForm.amount} transfer submitted for admin approval.`,
      });
      setTransferForm({ recipient: "", amount: "", memo: "" });
    }
  };

  const handleLoanRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanForm.amount || !loanForm.purpose || parseFloat(loanForm.amount) <= 0) return;

    const { error } = await requestLoan({
      amount: parseFloat(loanForm.amount),
      purpose: loanForm.purpose,
      loanType: loanForm.loanType,
      annualIncome: loanForm.annualIncome ? parseFloat(loanForm.annualIncome) : undefined,
      creditScore: loanForm.creditScore ? parseInt(loanForm.creditScore) : undefined,
      employmentStatus: loanForm.employmentStatus || undefined
    });

    if (error) {
      toast({
        title: "Loan Request Failed",
        description: "Failed to submit loan request. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Loan Request Submitted",
        description: "Your loan request has been submitted for review.",
      });
      setLoanForm({
        amount: "",
        purpose: "",
        loanType: "personal",
        annualIncome: "",
        creditScore: "",
        employmentStatus: ""
      });
    }
  };

  const handleCalculateInterest = async () => {
    if (!primaryAccount) {
      toast({
        title: "Error",
        description: "No account found",
        variant: "destructive",
      });
      return;
    }

    try {
      await calculateInterest(primaryAccount.id);
      // Refresh account data after interest calculation
      window.location.reload();
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-banking-green-light to-accent flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-banking-green-light to-accent">
      {/* Header */}
      <header className="bg-card shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center">
                  <CreditCard className="w-3 h-3 sm:w-5 sm:h-5 text-primary-foreground" />
                </div>
                <span className="text-base sm:text-lg font-bold text-primary hidden sm:block">Western Trust Bank</span>
                <span className="text-sm font-bold text-primary sm:hidden">WTB</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Navigation />
              <span className="text-xs sm:text-sm text-muted-foreground hidden md:block max-w-32 sm:max-w-none truncate">
                Welcome, {user?.user_metadata?.full_name || user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Account Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {primaryAccount ? formatCurrency(primaryAccount.balance) : "$0.00"}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Account: {primaryAccount?.account_number || "No account"}
              </p>
              <Button 
                onClick={handleCalculateInterest} 
                size="sm" 
                variant="outline" 
                className="mt-3 w-full"
                disabled={interestLoading || !primaryAccount}
              >
                <TrendingUp className="w-3 h-3 mr-2" />
                {interestLoading ? 'Calculating...' : 'Calculate Interest'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Loans</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {loanRequests.filter(loan => loan.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link to="/deposit" className="block">
            <Button className="w-full h-14 sm:h-16 flex-col gap-1 bg-card/80 backdrop-blur-sm hover:bg-card" variant="outline">
              <Plus className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm">Deposit</span>
            </Button>
          </Link>
          <Link to="/withdraw" className="block">
            <Button className="w-full h-14 sm:h-16 flex-col gap-1 bg-card/80 backdrop-blur-sm hover:bg-card" variant="outline">
              <Minus className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm">Withdraw</span>
            </Button>
          </Link>
          <Link to="/transfer" className="block">
            <Button className="w-full h-14 sm:h-16 flex-col gap-1 bg-card/80 backdrop-blur-sm hover:bg-card" variant="outline">
              <ArrowLeftRight className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm">Transfer</span>
            </Button>
          </Link>
          <Link to="/external-transfer" className="block">
            <Button className="w-full h-14 sm:h-16 flex-col gap-1 bg-card/80 backdrop-blur-sm hover:bg-card" variant="outline">
              <Building2 className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm">External</span>
            </Button>
          </Link>
          <Link to="/bills" className="block">
            <Button className="w-full h-14 sm:h-16 flex-col gap-1 bg-card/80 backdrop-blur-sm hover:bg-card" variant="outline">
              <FileText className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm">Bills</span>
            </Button>
          </Link>
          <Link to="/cards" className="block">
            <Button className="w-full h-14 sm:h-16 flex-col gap-1 bg-card/80 backdrop-blur-sm hover:bg-card" variant="outline">
              <CreditCard className="w-4 h-4 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm">Cards</span>
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="transactions" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-card/80 backdrop-blur-sm">
            <TabsTrigger value="transactions" className="text-xs sm:text-sm">Transactions</TabsTrigger>
            <TabsTrigger value="quick-actions" className="text-xs sm:text-sm">Quick Actions</TabsTrigger>
            <TabsTrigger value="loans" className="text-xs sm:text-sm">Loans</TabsTrigger>
            <TabsTrigger value="summary" className="text-xs sm:text-sm">Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Recent Transactions</CardTitle>
                <CardDescription className="text-sm">
                  Your latest account activity (pending transactions require admin approval)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {transactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-background/50">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            transaction.transaction_type === 'deposit' ? 'bg-green-100 text-green-600' :
                            transaction.transaction_type === 'withdraw' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {transaction.transaction_type === 'deposit' ? <ArrowDownLeft className="w-3 h-3 sm:w-4 sm:h-4" /> :
                             transaction.transaction_type === 'withdraw' ? <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" /> :
                             <Send className="w-3 h-3 sm:w-4 sm:h-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm sm:text-base truncate">{transaction.description}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`font-bold text-sm sm:text-base ${
                            transaction.transaction_type === 'deposit' || transaction.transaction_type === 'transfer_received' 
                              ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'transfer_received' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No transactions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quick-actions">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Deposit */}
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Deposit Money</CardTitle>
                  <CardDescription>Add funds to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDeposit} className="space-y-4">
                    <div>
                      <Label htmlFor="deposit-amount">Amount</Label>
                      <Input
                        id="deposit-amount"
                        type="number"
                        placeholder="0.00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        min="0.01"
                        step="0.01"
                        required
                        className="bg-background/50"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Deposit
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Withdraw */}
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Withdraw Money</CardTitle>
                  <CardDescription>Take money from your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleWithdraw} className="space-y-4">
                    <div>
                      <Label htmlFor="withdraw-amount">Amount</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        min="0.01"
                        step="0.01"
                        max={primaryAccount?.balance || 0}
                        required
                        className="bg-background/50"
                      />
                    </div>
                    <Button type="submit" className="w-full" variant="outline">
                      <Minus className="w-4 h-4 mr-2" />
                      Withdraw
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Transfer */}
              <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Transfer Money</CardTitle>
                  <CardDescription>Send money to another account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTransfer} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="transfer-recipient">Recipient Account Number</Label>
                        <Input
                          id="transfer-recipient"
                          placeholder="WTB1234567"
                          value={transferForm.recipient}
                          onChange={(e) => setTransferForm({ ...transferForm, recipient: e.target.value })}
                          required
                          className="bg-background/50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="transfer-amount">Amount</Label>
                        <Input
                          id="transfer-amount"
                          type="number"
                          placeholder="0.00"
                          value={transferForm.amount}
                          onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                          min="0.01"
                          step="0.01"
                          max={primaryAccount?.balance || 0}
                          required
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="transfer-memo">Memo (Optional)</Label>
                      <Textarea
                        id="transfer-memo"
                        placeholder="What's this transfer for?"
                        value={transferForm.memo}
                        onChange={(e) => setTransferForm({ ...transferForm, memo: e.target.value })}
                        className="bg-background/50"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Send Transfer
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="loans">
            <div className="space-y-6">
              {/* Loan Requests */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Loan Requests</CardTitle>
                  <CardDescription>Track your loan applications</CardDescription>
                </CardHeader>
                <CardContent>
                  {loanRequests.length > 0 ? (
                    <div className="space-y-4">
                      {loanRequests.map((loan) => (
                        <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{formatCurrency(loan.amount)}</p>
                            <p className="text-sm text-muted-foreground">{loan.purpose}</p>
                            <p className="text-xs text-muted-foreground">
                              Applied on {formatDate(loan.created_at)}
                            </p>
                          </div>
                          <Badge variant={
                            loan.status === 'approved' ? 'default' :
                            loan.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {loan.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No loan requests yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Request New Loan */}
              <Card>
                <CardHeader>
                  <CardTitle>Request a Loan</CardTitle>
                  <CardDescription>Apply for a personal or business loan</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLoanRequest} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="loan-amount">Loan Amount</Label>
                        <Input
                          id="loan-amount"
                          type="number"
                          placeholder="10000"
                          value={loanForm.amount}
                          onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                          min="100"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="loan-type">Loan Type</Label>
                        <Select value={loanForm.loanType} onValueChange={(value) => setLoanForm({ ...loanForm, loanType: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="personal">Personal Loan</SelectItem>
                            <SelectItem value="auto">Auto Loan</SelectItem>
                            <SelectItem value="mortgage">Mortgage</SelectItem>
                            <SelectItem value="business">Business Loan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="loan-purpose">Purpose</Label>
                      <Textarea
                        id="loan-purpose"
                        placeholder="What will you use this loan for?"
                        value={loanForm.purpose}
                        onChange={(e) => setLoanForm({ ...loanForm, purpose: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="annual-income">Annual Income (Optional)</Label>
                        <Input
                          id="annual-income"
                          type="number"
                          placeholder="50000"
                          value={loanForm.annualIncome}
                          onChange={(e) => setLoanForm({ ...loanForm, annualIncome: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="credit-score">Credit Score (Optional)</Label>
                        <Input
                          id="credit-score"
                          type="number"
                          placeholder="750"
                          value={loanForm.creditScore}
                          onChange={(e) => setLoanForm({ ...loanForm, creditScore: e.target.value })}
                          min="300"
                          max="850"
                        />
                      </div>
                      <div>
                        <Label htmlFor="employment-status">Employment Status (Optional)</Label>
                        <Select value={loanForm.employmentStatus} onValueChange={(value) => setLoanForm({ ...loanForm, employmentStatus: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employed">Employed</SelectItem>
                            <SelectItem value="self-employed">Self-Employed</SelectItem>
                            <SelectItem value="unemployed">Unemployed</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Submit Loan Request
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
                <CardDescription>Overview of your banking activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Account Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Number:</span>
                        <span>{primaryAccount?.account_number || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account Type:</span>
                        <span className="capitalize">{primaryAccount?.account_type || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Currency:</span>
                        <span>{primaryAccount?.currency || "USD"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Activity Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Transactions:</span>
                        <span>{transactions.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deposits:</span>
                        <span className="text-green-600">
                          {transactions.filter(t => t.transaction_type === 'deposit').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Withdrawals:</span>
                        <span className="text-red-600">
                          {transactions.filter(t => t.transaction_type === 'withdraw').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transfers:</span>
                        <span className="text-blue-600">
                          {transactions.filter(t => t.transaction_type.includes('transfer')).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/deposit">
                      <Button variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Deposit
                      </Button>
                    </Link>
                    <Link to="/withdraw">
                      <Button variant="outline" className="w-full">
                        <Minus className="w-4 h-4 mr-2" />
                        Withdraw
                      </Button>
                    </Link>
                    <Link to="/transfer">
                      <Button variant="outline" className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Transfer
                      </Button>
                    </Link>
                    <Link to="/profile">
                      <Button variant="outline" className="w-full">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;