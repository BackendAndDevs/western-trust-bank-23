import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingDown, Banknote } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBankingData } from "@/hooks/useBankingData";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";

const Withdraw = () => {
  const { user } = useAuth();
  const { primaryAccount, withdraw, loading } = useBankingData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("atm");

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > 0) {
      const result = await withdraw(withdrawAmount);
      if (!result.error) {
        setAmount("");
        toast({
          title: "Withdrawal Request Submitted ✅",
          description: `$${withdrawAmount.toFixed(2)} via ${method === 'atm' ? 'ATM' : method === 'branch' ? 'Branch' : method === 'check' ? 'Check' : 'Transfer'} is being processed.`,
          duration: 6000,
        });
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        toast({
          title: "Withdrawal Failed",
          description: result.error.message || "Insufficient funds or invalid amount.",
          variant: "destructive",
        });
      }
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const suggestedAmounts = [20, 40, 60, 80, 100, 200];

  if (!user) return null;

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5" /> Available Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {primaryAccount ? formatCurrency(primaryAccount.balance) : formatCurrency(0)}
          </div>
          <p className="text-sm text-muted-foreground">Primary Checking Account</p>
        </CardContent>
      </Card>

      {primaryAccount && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quick Withdrawal</CardTitle>
            <CardDescription>Select a common amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {suggestedAmounts.map((sa) => (
                <Button key={sa} variant="outline" onClick={() => setAmount(sa.toString())} disabled={sa > primaryAccount.balance}>
                  {formatCurrency(sa)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" /> Custom Withdrawal
          </CardTitle>
          <CardDescription>Withdraw a specific amount from your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWithdraw} className="space-y-6">
            <div className="space-y-2">
              <Label>Withdrawal Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="atm">ATM Withdrawal</SelectItem>
                  <SelectItem value="branch">Branch Teller</SelectItem>
                  <SelectItem value="check">Request Check</SelectItem>
                  <SelectItem value="transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} min="0.01" step="0.01" max={primaryAccount?.balance || 0} required className="text-lg" />
              <p className="text-sm text-muted-foreground">Available: {primaryAccount ? formatCurrency(primaryAccount.balance) : formatCurrency(0)}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">⚠️ Withdrawal Limits</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• ATM daily limit: $200,000</li>
                <li>• Branch: No limit with ID</li>
                <li>• All withdrawals require admin approval</li>
              </ul>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={!primaryAccount || !amount || parseFloat(amount) > (primaryAccount?.balance || 0)}>
              <Banknote className="w-4 h-4 mr-2" />
              Withdraw {amount ? formatCurrency(parseFloat(amount) || 0) : "Funds"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default Withdraw;
