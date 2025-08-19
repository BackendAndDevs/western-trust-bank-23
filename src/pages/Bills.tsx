import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  CreditCard, 
  Zap, 
  Droplets, 
  Wifi, 
  Phone, 
  ArrowLeft,
  DollarSign
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBankingData } from "@/hooks/useBankingData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";

const Bills = () => {
  const { user } = useAuth();
  const { primaryAccount } = useBankingData();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedBill, setSelectedBill] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    accountNumber: "",
    memo: ""
  });

  const billTypes = [
    { id: "electricity", name: "Electricity", icon: Zap, color: "text-yellow-600" },
    { id: "water", name: "Water", icon: Droplets, color: "text-blue-600" },
    { id: "internet", name: "Internet", icon: Wifi, color: "text-purple-600" },
    { id: "phone", name: "Phone", icon: Phone, color: "text-green-600" },
    { id: "gas", name: "Gas", icon: CreditCard, color: "text-red-600" }
  ];

  const handlePayBill = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !primaryAccount) {
      toast({
        title: "Error",
        description: "No account found",
        variant: "destructive"
      });
      return;
    }

    if (!selectedBill || !paymentForm.amount || !paymentForm.accountNumber) {
      toast({
        title: "Error", 
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(paymentForm.amount);
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (amount > primaryAccount.balance) {
      toast({
        title: "Error",
        description: "Insufficient funds",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedBillType = billTypes.find(b => b.id === selectedBill);
      
      // Create pending transaction for bill payment
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: primaryAccount.id,
          transaction_type: 'bill_payment',
          amount,
          description: `${selectedBillType?.name} bill payment - ${paymentForm.accountNumber}`,
          status: 'pending',
          recipient_info: {
            bill_type: selectedBill,
            account_number: paymentForm.accountNumber,
            memo: paymentForm.memo
          }
        });

      if (error) throw error;

      toast({
        title: "Bill Payment Submitted",
        description: "Your bill payment has been submitted for admin approval.",
      });

      setSelectedBill("");
      setPaymentForm({ amount: "", accountNumber: "", memo: "" });
    } catch (error) {
      console.error('Error submitting bill payment:', error);
      toast({
        title: "Error",
        description: "Failed to submit bill payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-banking-green-light to-accent">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2 text-muted-foreground hover:text-primary">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <h1 className="text-lg font-semibold">Bill Payments</h1>
            <div className="flex items-center space-x-4">
              <Navigation />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Balance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Available Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {primaryAccount ? formatCurrency(primaryAccount.balance) : "$0.00"}
            </div>
            <p className="text-sm text-muted-foreground">
              Account: {primaryAccount?.account_number || "No account"}
            </p>
          </CardContent>
        </Card>

        {/* Bill Types */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Bill Type</CardTitle>
            <CardDescription>Choose the type of bill you want to pay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {billTypes.map((bill) => (
                <button
                  key={bill.id}
                  onClick={() => setSelectedBill(bill.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedBill === bill.id
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <bill.icon className={`w-8 h-8 mx-auto mb-2 ${bill.color}`} />
                  <p className="text-sm font-medium text-center">{bill.name}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        {selectedBill && (
          <Card>
            <CardHeader>
              <CardTitle>
                Pay {billTypes.find(b => b.id === selectedBill)?.name} Bill
              </CardTitle>
              <CardDescription>
                Enter your payment details below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayBill} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="account-number">Account/Reference Number</Label>
                    <Input
                      id="account-number"
                      placeholder="Enter your account number"
                      value={paymentForm.accountNumber}
                      onChange={(e) => setPaymentForm({
                        ...paymentForm,
                        accountNumber: e.target.value
                      })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Payment Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({
                        ...paymentForm,
                        amount: e.target.value
                      })}
                      min="0.01"
                      step="0.01"
                      max={primaryAccount?.balance || 0}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="memo">Memo (Optional)</Label>
                  <Textarea
                    id="memo"
                    placeholder="Add a note for this payment"
                    value={paymentForm.memo}
                    onChange={(e) => setPaymentForm({
                      ...paymentForm,
                      memo: e.target.value
                    })}
                  />
                </div>

                <Separator />

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Payment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bill Type:</span>
                      <span className="font-medium">
                        {billTypes.find(b => b.id === selectedBill)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Account Number:</span>
                      <span className="font-medium">{paymentForm.accountNumber || "Not entered"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">
                        {paymentForm.amount ? `$${paymentForm.amount}` : "$0.00"}
                      </span>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={!selectedBill || !paymentForm.amount || !paymentForm.accountNumber}
                >
                  Submit Bill Payment
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Bill payments require admin approval and will show as pending until processed.
                </p>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Bills;