import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, DollarSign, LogOut, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrencyExchange } from "@/hooks/useCurrencyExchange";
import { useBankingData } from "@/hooks/useBankingData";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Logo from "@/components/Logo";

const CurrencyExchange = () => {
  const { user, signOut } = useAuth();
  const { rates, exchanges, currencies, exchangeCurrency, getRate } = useCurrencyExchange();
  const { primaryAccount } = useBankingData();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("");

  const selectedRate = getRate(fromCurrency, toCurrency);
  const estimatedOutput = selectedRate && amount ? (parseFloat(amount) * (1 - selectedRate.spread) * selectedRate.rate) : 0;
  const feeAmount = selectedRate && amount ? parseFloat(amount) * selectedRate.spread : 0;

  const handleExchange = async () => {
    if (!primaryAccount || !amount || parseFloat(amount) <= 0) return;
    const result = await exchangeCurrency(primaryAccount.id, fromCurrency, toCurrency, parseFloat(amount));
    if (result.error) {
      toast({ title: "Exchange Failed", description: (result.error as any)?.message || "Exchange failed", variant: "destructive" });
    } else {
      const d = result.data as any;
      toast({ title: "Exchange Complete", description: `Exchanged ${formatCurrency(parseFloat(amount), fromCurrency)} → ${formatCurrency(d?.to_amount || estimatedOutput, toCurrency)}` });
      setAmount("");
    }
  };

  const formatCurrency = (n: number, cur = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, minimumFractionDigits: 2 }).format(n);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-banking-green-light to-accent">
      <header className="bg-card shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link to="/" className="shrink-0"><Logo size="sm" /></Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Navigation />
              <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate("/"); }} className="hidden sm:flex">
                <LogOut className="w-4 h-4 mr-2" />Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exchange Form */}
          <Card className="glass shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ArrowLeftRight className="h-5 w-5" /> Currency Exchange</CardTitle>
              <CardDescription>Convert currencies at competitive rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>From Currency</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount</Label>
                <Input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" />
                {primaryAccount && <p className="text-xs text-muted-foreground mt-1">Available: {formatCurrency(primaryAccount.balance)}</p>}
              </div>
              <div className="flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <Label>To Currency</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{currencies.filter(c => c !== fromCurrency).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              {selectedRate && amount && parseFloat(amount) > 0 && (
                <div className="p-4 rounded-lg bg-muted space-y-2">
                  <div className="flex justify-between"><span>Exchange Rate</span><span className="font-medium">1 {fromCurrency} = {selectedRate.rate.toFixed(4)} {toCurrency}</span></div>
                  <div className="flex justify-between text-sm text-muted-foreground"><span>Fee ({(selectedRate.spread * 100).toFixed(1)}%)</span><span>{formatCurrency(feeAmount, fromCurrency)}</span></div>
                  <div className="flex justify-between font-bold border-t pt-2"><span>You'll Receive</span><span className="text-primary">{formatCurrency(estimatedOutput, toCurrency)}</span></div>
                </div>
              )}

              {!selectedRate && fromCurrency !== toCurrency && (
                <p className="text-sm text-destructive">Exchange rate not available for this pair.</p>
              )}

              <Button className="w-full" onClick={handleExchange} disabled={!selectedRate || !amount || parseFloat(amount) <= 0}>
                Exchange Currency
              </Button>
            </CardContent>
          </Card>

          {/* Rates Table */}
          <Card className="glass shadow-elegant">
            <CardHeader>
              <CardTitle>Exchange Rates</CardTitle>
              <CardDescription>Current simulated rates</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pair</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Spread</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates.map(r => (
                    <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => { setFromCurrency(r.from_currency); setToCurrency(r.to_currency); }}>
                      <TableCell className="font-medium">{r.from_currency}/{r.to_currency}</TableCell>
                      <TableCell className="text-right">{r.rate.toFixed(4)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{(r.spread * 100).toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Exchange History */}
        <Card className="glass shadow-elegant mt-6">
          <CardHeader>
            <CardTitle>Exchange History</CardTitle>
          </CardHeader>
          <CardContent>
            {exchanges.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No exchanges yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exchanges.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="text-sm">{formatDate(e.created_at)}</TableCell>
                      <TableCell>{e.from_amount.toFixed(2)} {e.from_currency}</TableCell>
                      <TableCell className="font-medium">{e.to_amount.toFixed(2)} {e.to_currency}</TableCell>
                      <TableCell className="text-right">{e.exchange_rate.toFixed(4)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">${e.fee_amount.toFixed(2)}</TableCell>
                      <TableCell><Badge variant="outline">{e.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CurrencyExchange;
