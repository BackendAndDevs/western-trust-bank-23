import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useBankingData } from "@/hooks/useBankingData";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";

const Portfolio = () => {
  const { user, signOut } = useAuth();
  const { assets, holdings, transactions, loading, totalValue, totalGainLoss, totalGainLossPercent, buyAsset, sellAsset } = usePortfolio();
  const { primaryAccount } = useBankingData();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tradeDialog, setTradeDialog] = useState<{ open: boolean; type: 'buy' | 'sell'; assetId: string; symbol: string; price: number; maxQty?: number }>({ open: false, type: 'buy', assetId: '', symbol: '', price: 0 });
  const [quantity, setQuantity] = useState("");
  const [filterType, setFilterType] = useState("all");

  const handleTrade = async () => {
    if (!primaryAccount || !quantity || parseFloat(quantity) <= 0) return;
    const fn = tradeDialog.type === 'buy' ? buyAsset : sellAsset;
    const result = await fn(primaryAccount.id, tradeDialog.assetId, parseFloat(quantity));
    if (result.error) {
      toast({ title: "Trade Failed", description: (result as any).error?.message || "Trade failed", variant: "destructive" });
    } else {
      const d = result.data as any;
      toast({ title: "Trade Executed", description: `${tradeDialog.type === 'buy' ? 'Bought' : 'Sold'} ${quantity} ${tradeDialog.symbol}. Total: $${d?.total?.toFixed(2)}, Fee: $${d?.fee?.toFixed(2)}` });
      setTradeDialog({ ...tradeDialog, open: false });
      setQuantity("");
    }
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const filteredAssets = filterType === 'all' ? assets : assets.filter(a => a.asset_type === filterType);
  const assetTypes = [...new Set(assets.map(a => a.asset_type))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-banking-green-light to-accent flex items-center justify-center">
        <Card><CardContent className="p-6 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" /><p className="mt-4 text-muted-foreground">Loading portfolio...</p></CardContent></Card>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="glass shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">{holdings.length} holdings</p>
            </CardContent>
          </Card>
          <Card className="glass shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
              {totalGainLoss >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
              </div>
              <p className={`text-xs ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGainLossPercent >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
          <Card className="glass shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Cash</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(primaryAccount?.balance || 0)}</div>
              <p className="text-xs text-muted-foreground">For trading</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="holdings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="holdings">My Holdings</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="history">Trade History</TabsTrigger>
          </TabsList>

          {/* Holdings Tab */}
          <TabsContent value="holdings">
            <Card className="glass shadow-elegant">
              <CardHeader>
                <CardTitle>Portfolio Holdings</CardTitle>
                <CardDescription>Your current investment positions</CardDescription>
              </CardHeader>
              <CardContent>
                {holdings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No holdings yet. Browse the market to start investing.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Avg Cost</TableHead>
                        <TableHead className="text-right">Current Price</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">P/L</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holdings.map(h => {
                        const asset = assets.find(a => a.id === h.asset_id) || h.asset;
                        if (!asset) return null;
                        const value = asset.current_price * h.quantity;
                        const cost = h.average_buy_price * h.quantity;
                        const pl = value - cost;
                        const plPct = cost > 0 ? (pl / cost) * 100 : 0;
                        return (
                          <TableRow key={h.id}>
                            <TableCell className="font-medium">{asset.symbol}<br/><span className="text-xs text-muted-foreground">{asset.name}</span></TableCell>
                            <TableCell><Badge variant="outline">{asset.asset_type}</Badge></TableCell>
                            <TableCell className="text-right">{h.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(h.average_buy_price)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(asset.current_price)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(value)}</TableCell>
                            <TableCell className={`text-right font-medium ${pl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {pl >= 0 ? '+' : ''}{formatCurrency(pl)}<br/><span className="text-xs">{plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%</span>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => setTradeDialog({ open: true, type: 'sell', assetId: h.asset_id, symbol: asset.symbol, price: asset.current_price, maxQty: h.quantity })}>
                                Sell
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Tab */}
          <TabsContent value="market">
            <Card className="glass shadow-elegant">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Market</CardTitle>
                    <CardDescription>Browse and trade assets</CardDescription>
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {assetTypes.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map(a => {
                      const change = a.current_price - a.previous_price;
                      const changePct = a.previous_price > 0 ? (change / a.previous_price) * 100 : 0;
                      return (
                        <TableRow key={a.id}>
                          <TableCell className="font-bold">{a.symbol}</TableCell>
                          <TableCell>{a.name}</TableCell>
                          <TableCell><Badge variant="outline">{a.asset_type}</Badge></TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(a.current_price)}</TableCell>
                          <TableCell className={`text-right ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change >= 0 ? '+' : ''}{formatCurrency(change)} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%)
                          </TableCell>
                          <TableCell>
                            <Button size="sm" onClick={() => setTradeDialog({ open: true, type: 'buy', assetId: a.id, symbol: a.symbol, price: a.current_price })}>
                              Buy
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trade History */}
          <TabsContent value="history">
            <Card className="glass shadow-elegant">
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
                <CardDescription>Your recent buy/sell activity</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No trades yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Asset</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Fee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map(t => (
                        <TableRow key={t.id}>
                          <TableCell className="text-sm">{formatDate(t.created_at)}</TableCell>
                          <TableCell>
                            <Badge variant={t.transaction_type === 'buy' ? 'default' : 'secondary'}>
                              {t.transaction_type === 'buy' ? <ArrowDownLeft className="w-3 h-3 mr-1" /> : <ArrowUpRight className="w-3 h-3 mr-1" />}
                              {t.transaction_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{t.asset?.symbol || 'N/A'}</TableCell>
                          <TableCell className="text-right">{t.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(t.price_per_unit)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(t.total_amount)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatCurrency(t.fee_amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Trade Dialog */}
        <Dialog open={tradeDialog.open} onOpenChange={(open) => { setTradeDialog({ ...tradeDialog, open }); setQuantity(""); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{tradeDialog.type === 'buy' ? 'Buy' : 'Sell'} {tradeDialog.symbol}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Current Price</Label>
                <p className="text-lg font-bold">{formatCurrency(tradeDialog.price)}</p>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input type="number" min="0.01" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Enter quantity" />
                {tradeDialog.maxQty && <p className="text-xs text-muted-foreground mt-1">Max: {tradeDialog.maxQty}</p>}
              </div>
              {quantity && parseFloat(quantity) > 0 && (
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(tradeDialog.price * parseFloat(quantity))}</span></div>
                  <div className="flex justify-between text-sm text-muted-foreground"><span>Fee (0.1%)</span><span>{formatCurrency(tradeDialog.price * parseFloat(quantity) * 0.001)}</span></div>
                  <div className="flex justify-between font-bold border-t mt-2 pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(tradeDialog.price * parseFloat(quantity) * (tradeDialog.type === 'buy' ? 1.001 : 0.999))}</span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTradeDialog({ ...tradeDialog, open: false })}>Cancel</Button>
              <Button onClick={handleTrade} disabled={!quantity || parseFloat(quantity) <= 0}>
                {tradeDialog.type === 'buy' ? 'Buy' : 'Sell'} {tradeDialog.symbol}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default Portfolio;
