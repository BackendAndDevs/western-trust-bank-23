import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Send, ArrowLeft, Users } from "lucide-react";
import { useBanking } from "@/contexts/BankingContext";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Transfer = () => {
  const { currentUser, transfer, users } = useBanking();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const transferAmount = parseFloat(amount);
    if (transferAmount > 0 && recipient) {
      const success = transfer(recipient, transferAmount);
      if (success) {
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
          description: "Insufficient funds, invalid recipient, or you cannot transfer to yourself.",
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

  // Get other users for suggestions (excluding current user and admin)
  const otherUsers = users.filter(user => 
    user.id !== currentUser.id && !user.isAdmin
  );

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
              <div className="text-3xl font-bold text-primary">{formatCurrency(currentUser.balance)}</div>
              <p className="text-sm text-muted-foreground">Primary Checking Account</p>
            </CardContent>
          </Card>

          {/* Quick Recipients */}
          {otherUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Transfer</CardTitle>
                <CardDescription>Select a recent contact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {otherUsers.slice(0, 3).map((user) => (
                    <Button
                      key={user.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setRecipient(user.username)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
                  <Label htmlFor="recipient">Recipient Username or Email</Label>
                  <Input
                    id="recipient"
                    type="text"
                    placeholder="Enter username or email address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the recipient's username (e.g., john_doe) or email address
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
                    max={currentUser.balance}
                    required
                    className="text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Available: {formatCurrency(currentUser.balance)}
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
                  disabled={!amount || !recipient || parseFloat(amount) > currentUser.balance}
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