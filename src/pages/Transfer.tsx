import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Send, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBankingData } from "@/hooks/useBankingData";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";

const Transfer = () => {
  const { user } = useAuth();
  const { primaryAccount, transfer, loading } = useBankingData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const transferAmount = parseFloat(amount);
    if (transferAmount > 0 && recipient) {
      const result = await transfer(recipient, transferAmount, memo);
      if (!result.error) {
        setAmount("");
        setRecipient("");
        setMemo("");
        toast({
          title: "Transfer Request Submitted Successfully! 💸",
          description: (
            <div className="space-y-2">
              <p><strong>Amount:</strong> ${transferAmount.toFixed(2)}</p>
              <p><strong>To Account:</strong> {recipient}</p>
              {memo && <p><strong>Memo:</strong> {memo}</p>}
              <p className="text-sm opacity-80">Your transfer is being processed and will be reviewed by our team. Both parties will receive notifications once it's completed.</p>
            </div>
          ),
          duration: 6000,
        });
        // Navigate back to dashboard after a short delay
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        toast({
          title: "Transfer Failed ❌",
          description: result.error.message || "Unable to process transfer. Please verify the recipient account number and your available balance.",
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

  // Example recipients for quick transfer
  const exampleRecipients = [
    { name: "John Doe", account: "WTB1234567" },
    { name: "Jane Smith", account: "WTB2345678" },
    { name: "Mike Johnson", account: "WTB3456789" }
  ];

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
    <PageLayout>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Account Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
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

          {/* Quick Recipients */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Transfer</CardTitle>
              <CardDescription>Select an account to transfer to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {exampleRecipients.map((recipient) => (
                  <Button
                    key={recipient.account}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setRecipient(recipient.account)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{recipient.name}</div>
                      <div className="text-sm text-muted-foreground">{recipient.account}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transfer Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Money
              </CardTitle>
              <CardDescription>Transfer money to another Western Trust Bank account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransfer} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Account Number</Label>
                  <Input
                    id="recipient"
                    type="text"
                    placeholder="Enter account number (e.g., WTB1234567)"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the recipient's account number (e.g., WTB1234567)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Transfer Amount</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="memo">Memo (Optional)</Label>
                  <Textarea
                    id="memo"
                    placeholder="What's this transfer for?"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-sm text-muted-foreground">
                    Add a note for your records (max 100 characters)
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">💳 Transfer Information</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Internal transfers:</strong> Processed within 1 business day</li>
                    <li>• <strong>Transfer fees:</strong> $0 for Western Trust Bank accounts</li>
                    <li>• <strong>Daily limit:</strong> $200,000 per account</li>
                    <li>• <strong>Security:</strong> All transfers require admin approval</li>
                    <li>• Both parties will receive email confirmation</li>
                    <li>• Transfer history is available in your dashboard</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={!primaryAccount || !amount || !recipient || parseFloat(amount) > (primaryAccount?.balance || 0)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send {amount ? formatCurrency(parseFloat(amount) || 0) : "Transfer"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Transfer;