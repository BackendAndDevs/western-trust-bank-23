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
  const { currentUser, withdraw } = useBanking();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("atm");

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > 0) {
      const success = withdraw(withdrawAmount);
      if (success) {
        setAmount("");
        toast({
          title: "Withdrawal Successful",
          description: `$${withdrawAmount.toFixed(2)} has been withdrawn from your account via ${method}.`,
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Withdrawal Failed",
          description: "Insufficient funds or invalid amount.",
          variant: "destructive",
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
              <h1 className="text-xl font-bold text-primary">Western Trust Bank</h1>
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
              <div className="text-3xl font-bold text-primary">{formatCurrency(currentUser.balance)}</div>
              <p className="text-sm text-muted-foreground">Primary Checking Account</p>
            </CardContent>
          </Card>

          {/* Quick Amount Selection */}
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
                    disabled={suggestedAmount > currentUser.balance}
                    className="text-center"
                  >
                    {formatCurrency(suggestedAmount)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

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
                    max={currentUser.balance}
                    required
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Available: {formatCurrency(currentUser.balance)}
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Withdrawal Limits & Information</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• ATM daily limit: $500</li>
                    <li>• Branch withdrawals: No daily limit</li>
                    <li>• Check requests processed within 3-5 business days</li>
                    <li>• All withdrawals are processed immediately in this demo</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={!amount || parseFloat(amount) > currentUser.balance}
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