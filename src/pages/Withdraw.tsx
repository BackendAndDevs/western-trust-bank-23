import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, TrendingDown, ArrowLeft, Banknote } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBankingData } from "@/hooks/useBankingData";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Withdraw = () => {
  const { user } = useAuth();
  const { primaryAccount, withdraw, loading } = useBankingData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("atm");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > 0) {
      const result = await withdraw(withdrawAmount);
      if (!result.error) {
        setAmount("");
        toast({
          title: "Withdrawal Request Submitted Successfully! ✅",
          description: (
            <div className="space-y-2">
              <p><strong>Amount:</strong> ${withdrawAmount.toFixed(2)}</p>
              <p><strong>Method:</strong> {method === 'atm' ? 'ATM Withdrawal' : method === 'branch' ? 'Branch Teller' : method === 'check' ? 'Request Check' : 'Bank Transfer'}</p>
              <p className="text-sm opacity-80">Your withdrawal is being processed and will be reviewed by our team. You'll receive a notification once it's approved.</p>
            </div>
          ),
          duration: 6000,
        });
        // Navigate back to dashboard after a short delay
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        toast({
          title: "Withdrawal Failed ❌",
          description: result.error.message || "Insufficient funds or invalid amount. Please check your balance and try again.",
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const suggestedAmounts = [20, 40, 60, 80, 100, 200];

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading your account...</p>
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Western Trust Bank</h1>
              <p className="text-sm text-muted-foreground">Withdraw Funds</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                Available Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {primaryAccount ? formatCurrency(primaryAccount.balance) : formatCurrency(0)}
              </div>
              <p className="text-sm text-muted-foreground">Primary Checking Account</p>
            </CardContent>
          </Card>

          {/* Quick Amount Selection */}
          {primaryAccount && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Withdrawal</CardTitle>
                <CardDescription>Select a common amount</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {suggestedAmounts.map((suggestedAmount) => (
                    <Button
                      key={suggestedAmount}
                      variant="outline"
                      onClick={() => setAmount(suggestedAmount.toString())}
                      disabled={suggestedAmount > primaryAccount.balance}
                      className="text-center"
                    >
                      {formatCurrency(suggestedAmount)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Withdrawal Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Custom Withdrawal
              </CardTitle>
              <CardDescription>Withdraw a specific amount from your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="withdrawal-method">Withdrawal Method</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select withdrawal method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="atm">ATM Withdrawal</SelectItem>
                      <SelectItem value="branch">Branch Teller</SelectItem>
                      <SelectItem value="check">Request Check</SelectItem>
                      <SelectItem value="transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Withdrawal Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    max={primaryAccount?.balance || 0}
                    required
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Available: {primaryAccount ? formatCurrency(primaryAccount.balance) : formatCurrency(0)}
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">⚠️ Withdrawal Limits & Information</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>ATM daily limit:</strong> $500 per day</li>
                    <li>• <strong>Branch withdrawals:</strong> No daily limit with ID</li>
                    <li>• <strong>Check requests:</strong> Processed within 3-5 business days</li>
                    <li>• <strong>Bank transfers:</strong> Same day processing available</li>
                    <li>• All withdrawals require admin approval for security</li>
                    <li>• You'll receive confirmation once processed</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={!primaryAccount || !amount || parseFloat(amount) > (primaryAccount?.balance || 0)}
                >
                  <Banknote className="w-4 h-4 mr-2" />
                  Withdraw {amount ? formatCurrency(parseFloat(amount) || 0) : "Funds"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;