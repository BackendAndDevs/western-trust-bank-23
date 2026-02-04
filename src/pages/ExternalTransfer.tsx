import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBankingData } from "@/hooks/useBankingData";
import { useBanking } from "@/hooks/useBanking";
import { useToast } from "@/hooks/use-toast";
import ExternalTransferForm from "@/components/external-transfer/ExternalTransferForm";
import AccountBalanceCard from "@/components/external-transfer/AccountBalanceCard";

const ExternalTransfer = () => {
  const { user } = useAuth();
  const { primaryAccount, loading: bankingLoading } = useBankingData();
  const { banks, processExternalTransfer, loading } = useBanking();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleTransferSubmit = async (formData: {
    toBankId: string;
    toAccountNumber: string;
    toAccountHolderName: string;
    amount: string;
    transferType: "deposit" | "withdrawal" | "transfer";
    description: string;
  }) => {
    if (!primaryAccount || !formData.toBankId || !formData.toAccountNumber || !formData.toAccountHolderName || !formData.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than $0.",
        variant: "destructive",
      });
      return;
    }

    if (formData.transferType !== "deposit" && amount > (primaryAccount.balance || 0)) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough funds for this transfer.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await processExternalTransfer(
      primaryAccount.id,
      formData.toBankId,
      formData.toAccountNumber,
      formData.toAccountHolderName,
      amount,
      formData.description || undefined
    );

    if (error) {
      toast({
        title: "Transfer Failed",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Transfer Initiated",
        description: "Your external transfer has been submitted for processing.",
      });
      navigate("/dashboard");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!user) return null;

  if (bankingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-banking-green-light to-accent flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-banking-green-light to-accent py-6">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard" className="p-2 hover:bg-background/20 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">External Transfer</h1>
            <p className="text-muted-foreground">Send money to any US bank account</p>
          </div>
        </div>

        <AccountBalanceCard 
          balance={primaryAccount?.balance || 0}
          accountNumber={primaryAccount?.account_number}
          formatCurrency={formatCurrency}
        />

        <ExternalTransferForm 
          banks={banks}
          loading={loading}
          onSubmit={handleTransferSubmit}
          formatCurrency={formatCurrency}
        />
      </div>
    </div>
  );
};

export default ExternalTransfer;