import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Send, AlertCircle } from "lucide-react";
import { USBank } from "@/hooks/useBanking";

interface ExternalTransferFormProps {
  banks: USBank[];
  loading: boolean;
  onSubmit: (formData: {
    toBankId: string;
    toAccountNumber: string;
    toAccountHolderName: string;
    amount: string;
    transferType: "deposit" | "withdrawal" | "transfer";
    description: string;
  }) => void;
  formatCurrency: (amount: number) => string;
}

const ExternalTransferForm = ({ banks, loading, onSubmit, formatCurrency }: ExternalTransferFormProps) => {
  const [formData, setFormData] = useState({
    toBankId: "",
    toAccountNumber: "",
    toAccountHolderName: "",
    amount: "",
    transferType: "transfer" as "deposit" | "withdrawal" | "transfer",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const selectedBank = banks.find(bank => bank.id === formData.toBankId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          External Bank Transfer
        </CardTitle>
        <CardDescription>
          Transfer funds to any bank account in the United States
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transfer Type */}
          <div>
            <Label htmlFor="transfer-type">Transfer Type</Label>
            <Select 
              value={formData.transferType} 
              onValueChange={(value: "deposit" | "withdrawal" | "transfer") => 
                setFormData({ ...formData, transferType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transfer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Send Money (Transfer)</SelectItem>
                <SelectItem value="withdrawal">Withdraw to External Bank</SelectItem>
                <SelectItem value="deposit">Receive from External Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bank Selection */}
          <div>
            <Label htmlFor="bank">Destination Bank</Label>
            <Select 
              value={formData.toBankId} 
              onValueChange={(value) => setFormData({ ...formData, toBankId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    <div className="flex flex-col">
                      <span>{bank.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {bank.city}, {bank.state} • Routing: {bank.routing_number}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedBank && (
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>SWIFT Code:</span>
                  <span className="font-mono">{selectedBank.swift_code || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Routing Number:</span>
                  <span className="font-mono">{selectedBank.routing_number}</span>
                </div>
              </div>
            )}
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                placeholder="Enter account number"
                value={formData.toAccountNumber}
                onChange={(e) => setFormData({ ...formData, toAccountNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="account-holder">Account Holder Name</Label>
              <Input
                id="account-holder"
                placeholder="Full name on account"
                value={formData.toAccountHolderName}
                onChange={(e) => setFormData({ ...formData, toAccountHolderName: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            {parseFloat(formData.amount) > 1000 && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Transfers over $1,000 incur a $25 processing fee.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Reference or note for this transfer"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Processing Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              External transfers typically take 1-3 business days to process. 
              You'll receive email updates on the transfer status.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={loading}
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Processing..." : `Initiate Transfer ${formData.amount ? formatCurrency(parseFloat(formData.amount) || 0) : ""}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExternalTransferForm;