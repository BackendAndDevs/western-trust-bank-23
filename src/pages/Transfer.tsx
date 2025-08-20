import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Send, ArrowLeft, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBankingData } from "@/hooks/useBankingData";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
          title: "Transfer Successful",
          description: `$${transferAmount.toFixed(2)} has been transferred to ${recipient}.`,
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Transfer Failed",
          description: result.error.message || "Insufficient funds, invalid recipient, or you cannot transfer to yourself.",
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
              <p className="text-sm text-muted-foreground">Transfer Funds</p>
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
                  <h3 className="font-medium mb-2">Transfer Information</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Transfers between Western Trust Bank accounts are instant</li>
                    <li>• No fees for internal transfers</li>
                    <li>• Both parties will receive confirmation notifications</li>
                    <li>• Daily transfer limit: $5,000</li>
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
    </div>
  );
};

export default Transfer;