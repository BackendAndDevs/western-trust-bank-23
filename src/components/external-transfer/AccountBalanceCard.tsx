import { Card, CardContent } from "@/components/ui/card";

interface AccountBalanceCardProps {
  balance: number;
  accountNumber: string | undefined;
  formatCurrency: (amount: number) => string;
}

const AccountBalanceCard = ({ balance, accountNumber, formatCurrency }: AccountBalanceCardProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Account Number</p>
            <p className="font-mono">{accountNumber}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountBalanceCard;