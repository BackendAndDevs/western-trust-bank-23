import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, TrendingUp, ArrowLeft, PiggyBank } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBankingData } from "@/hooks/useBankingData";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
          title: "Deposit Successful",
          description: `$${depositAmount.toFixed(2)} has been deposited to your account via ${method}.`,
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Deposit Failed",
          description: "Please try again.",
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
              <p className="text-sm text-muted-foreground">Deposit Funds</p>
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
                  <h3 className="font-medium mb-2">Deposit Information</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Deposits are processed immediately for demonstration</li>
                    <li>• Mobile check deposits may take 1-2 business days in real banking</li>
                    <li>• Wire transfers typically clear within 24 hours</li>
                    <li>• ATM deposits are available immediately up to $200</li>
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