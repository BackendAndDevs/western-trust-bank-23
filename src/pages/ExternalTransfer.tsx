import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBankingData } from "@/hooks/useBankingData";
import { useBanking } from "@/hooks/useBanking";
import { useToast } from "@/hooks/use-toast";
import ExternalTransferForm from "@/components/external-transfer/ExternalTransferForm";
import AccountBalanceCard from "@/components/external-transfer/AccountBalanceCard";
import PageLayout from "@/components/PageLayout";

const ExternalTransfer = () => {
  const { user } = useAuth();
  const { primaryAccount, loading: bankingLoading } = useBankingData();
  const { banks, processExternalTransfer, loading } = useBanking();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleTransferSubmit = async (formData: {
    toBankId: string; toAccountNumber: string; toAccountHolderName: string;
    amount: string; transferType: "deposit" | "withdrawal" | "transfer"; description: string;
  }) => {
    if (!primaryAccount || !formData.toBankId || !formData.toAccountNumber || !formData.toAccountHolderName || !formData.amount) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    const amount = parseFloat(formData.amount);
    if (amount <= 0) { toast({ title: "Invalid Amount", variant: "destructive" }); return; }
    if (formData.transferType !== "deposit" && amount > (primaryAccount.balance || 0)) {
      toast({ title: "Insufficient Funds", variant: "destructive" }); return;
    }
    const { error } = await processExternalTransfer(primaryAccount.id, formData.toBankId, formData.toAccountNumber, formData.toAccountHolderName, amount, formData.description || undefined);
    if (error) { toast({ title: "Transfer Failed", description: error, variant: "destructive" }); }
    else { toast({ title: "Transfer Initiated", description: "Your external transfer has been submitted." }); navigate("/dashboard"); }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (!user) return null;

  if (bankingLoading) {
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
      <div>
        <h1 className="text-2xl font-bold">External Transfer</h1>
        <p className="text-muted-foreground">Send money to any US bank account</p>
      </div>
      <AccountBalanceCard balance={primaryAccount?.balance || 0} accountNumber={primaryAccount?.account_number} formatCurrency={formatCurrency} />
      <ExternalTransferForm banks={banks} loading={loading} onSubmit={handleTransferSubmit} formatCurrency={formatCurrency} />
    </PageLayout>
  );
};

export default ExternalTransfer;
