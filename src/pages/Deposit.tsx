import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, ArrowLeft, PiggyBank } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBankingData } from "@/hooks/useBankingData";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

const Deposit = () => {
  const { user } = useAuth();
  const { primaryAccount, deposit, loading } = useBankingData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("check");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const depositAmount = parseFloat(amount);
    if (depositAmount > 0) {
      const result = await deposit(depositAmount);
      if (!result.error) {
        setAmount("");
        toast({
          title: "Deposit Request Submitted Successfully! 🎉",
          description: (
            <div className="space-y-2">
              <p><strong>Amount:</strong> ${depositAmount.toFixed(2)}</p>
              <p><strong>Method:</strong> {method === 'check' ? 'Mobile Check Deposit' : method === 'transfer' ? 'Bank Transfer' : method === 'cash' ? 'ATM Cash Deposit' : 'Wire Transfer'}</p>
              <p className="text-sm opacity-80">Your deposit is being processed and will be reviewed by our team. You'll receive a notification once it's approved.</p>
            </div>
          ),
          duration: 6000,
        });
        // Navigate back to dashboard after a short delay to let user see the success message
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        toast({
          title: "Deposit Failed ❌",
          description: result.error.message || "Unable to process deposit. Please try again or contact support.",
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
                Back
              </Button>
            </Link>
            <Logo size="sm" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {primaryAccount ? formatCurrency(primaryAccount.balance) : formatCurrency(0)}
              </div>
              <p className="text-sm text-muted-foreground">Primary Checking Account</p>
            </CardContent>
          </Card>

          {/* Deposit Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Make a Deposit
              </CardTitle>
              <CardDescription>Add funds to your Western Trust Bank account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeposit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="deposit-method">Deposit Method</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select deposit method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="check">Mobile Check Deposit</SelectItem>
                      <SelectItem value="transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">ATM Cash Deposit</SelectItem>
                      <SelectItem value="wire">Wire Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Deposit Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    required
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum deposit: $0.01
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">💡 Deposit Information</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Mobile check deposits:</strong> 1-2 business days, $0 fee</li>
                    <li>• <strong>Bank transfers:</strong> 1-3 business days, $0 fee</li>
                    <li>• <strong>ATM cash deposits:</strong> Available immediately, $0 fee</li>
                    <li>• <strong>Wire transfers:</strong> Same day processing, $15 fee</li>
                    <li>• All deposits require admin approval for security</li>
                    <li>• You'll receive an email notification once processed</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={!primaryAccount}>
                  <PiggyBank className="w-4 h-4 mr-2" />
                  Deposit {amount ? formatCurrency(parseFloat(amount) || 0) : "Funds"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Deposit;