import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Calendar, Filter } from "lucide-react";
import { useBankingData } from "@/hooks/useBankingData";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";

const Statements = () => {
  const { primaryAccount, transactions } = useBankingData();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedMonth, setSelectedMonth] = useState("all");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = ["2024", "2023", "2022"];

  const handleDownloadStatement = (month: string, year: string) => {
    // Simulate download
    toast({
      title: "Downloading Statement",
      description: `${month} ${year} statement is being prepared...`,
    });

    // In a real app, this would generate a PDF
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: `${month} ${year} statement downloaded successfully.`,
      });
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getMonthTransactions = (monthIndex: number) => {
    return transactions.filter(t => {
      const date = new Date(t.created_at);
      return date.getMonth() === monthIndex && date.getFullYear() === parseInt(selectedYear);
    });
  };

  const getMonthTotal = (monthIndex: number, type: 'deposit' | 'withdraw') => {
    const monthTxs = getMonthTransactions(monthIndex);
    return monthTxs
      .filter(t => t.transaction_type === type && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const filteredMonths = selectedMonth === "all" 
    ? months 
    : [months[parseInt(selectedMonth)]];

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6 glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Statements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {months.map((month, idx) => (
                      <SelectItem key={month} value={idx.toString()}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Summary */}
        <Card className="mb-6 glass animate-fade-in">
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
            <CardDescription>
              Account: {primaryAccount?.account_number} • Current Balance: {formatCurrency(primaryAccount?.balance || 0)}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Statements List */}
        <div className="space-y-4">
          {filteredMonths.map((month, idx) => {
            const monthIndex = selectedMonth === "all" ? months.indexOf(month) : parseInt(selectedMonth);
            const monthTxs = getMonthTransactions(monthIndex);
            const deposits = getMonthTotal(monthIndex, 'deposit');
            const withdrawals = getMonthTotal(monthIndex, 'withdraw');

            return (
              <Card key={`${month}-${idx}`} className="glass card-hover animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{month} {selectedYear} Statement</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {monthTxs.length} transactions
                          </Badge>
                          <Badge variant={monthTxs.length > 0 ? "default" : "secondary"} className="text-xs">
                            {monthTxs.length > 0 ? "Available" : "No Activity"}
                          </Badge>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Total Deposits</p>
                            <p className="font-semibold text-green-600">+{formatCurrency(deposits)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Withdrawals</p>
                            <p className="font-semibold text-red-600">-{formatCurrency(withdrawals)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleDownloadStatement(month, selectedYear)}
                      disabled={monthTxs.length === 0}
                      className="shadow-glow"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
};

export default Statements;
