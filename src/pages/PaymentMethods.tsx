import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Plus, Trash2, Star, StarOff } from "lucide-react";
import { useSavedPaymentMethods } from "@/hooks/useSavedPaymentMethods";
import PageLayout from "@/components/PageLayout";

const brandIcons: Record<string, string> = {
  visa: "💳 Visa",
  mastercard: "💳 Mastercard",
  amex: "💳 Amex",
  discover: "💳 Discover",
};

const PaymentMethods = () => {
  const { methods, loading, addMethod, removeMethod, setDefault } = useSavedPaymentMethods();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    card_holder_name: "",
    card_number: "",
    expiry_month: "",
    expiry_year: "",
    card_brand: "visa",
    nickname: "",
    billing_address: "",
    is_default: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = form.card_number.replace(/\s/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return;
    
    await addMethod({
      card_holder_name: form.card_holder_name,
      card_number: cleaned,
      expiry_month: parseInt(form.expiry_month),
      expiry_year: parseInt(form.expiry_year),
      card_brand: form.card_brand,
      nickname: form.nickname || undefined,
      billing_address: form.billing_address || undefined,
      is_default: form.is_default,
    });
    setForm({
      card_holder_name: "",
      card_number: "",
      expiry_month: "",
      expiry_year: "",
      card_brand: "visa",
      nickname: "",
      billing_address: "",
      is_default: false,
    });
    setDialogOpen(false);
  };

  const formatCardInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const getCardGradient = (brand: string) => {
    switch (brand) {
      case 'visa': return 'bg-gradient-to-br from-primary to-royal-blue-dark';
      case 'mastercard': return 'bg-gradient-to-br from-orange-500 to-red-600';
      case 'amex': return 'bg-gradient-to-br from-blue-400 to-blue-700';
      case 'discover': return 'bg-gradient-to-br from-orange-400 to-orange-600';
      default: return 'bg-gradient-primary';
    }
  };

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Payment Methods</h1>
            <p className="text-muted-foreground mt-1">Manage your saved cards for quick payments</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground shadow-elegant">
                <Plus className="w-4 h-4 mr-2" /> Add Card
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Holder Name</Label>
                  <Input
                    value={form.card_holder_name}
                    onChange={(e) => setForm({ ...form, card_holder_name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input
                    value={form.card_number}
                    onChange={(e) => setForm({ ...form, card_number: formatCardInput(e.target.value) })}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Month</Label>
                    <Select value={form.expiry_month} onValueChange={(v) => setForm({ ...form, expiry_month: v })}>
                      <SelectTrigger><SelectValue placeholder="MM" /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {String(i + 1).padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select value={form.expiry_year} onValueChange={(v) => setForm({ ...form, expiry_year: v })}>
                      <SelectTrigger><SelectValue placeholder="YY" /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return <SelectItem key={year} value={String(year)}>{year}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Select value={form.card_brand} onValueChange={(v) => setForm({ ...form, card_brand: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visa">Visa</SelectItem>
                        <SelectItem value="mastercard">Mastercard</SelectItem>
                        <SelectItem value="amex">Amex</SelectItem>
                        <SelectItem value="discover">Discover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nickname (optional)</Label>
                  <Input
                    value={form.nickname}
                    onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                    placeholder="e.g. My Travel Card"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.is_default}
                    onCheckedChange={(v) => setForm({ ...form, is_default: v })}
                  />
                  <Label>Set as default payment method</Label>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground">
                    Save Card
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading payment methods...</p>
          </div>
        ) : methods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {methods.map((m) => (
              <div key={m.id} className="space-y-3">
                <div className={`${getCardGradient(m.card_brand)} p-6 rounded-2xl text-white relative overflow-hidden shadow-premium`}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <CreditCard className="w-8 h-8 opacity-80" />
                      <div className="text-right">
                        {m.is_default && (
                          <Badge className="bg-white/20 text-white border-white/30 text-[10px]">
                            DEFAULT
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="font-mono text-lg tracking-[0.2em] mb-4">
                      •••• •••• •••• {m.card_last_four}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider opacity-60">Card Holder</p>
                        <p className="text-sm font-medium">{m.card_holder_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider opacity-60">Expires</p>
                        <p className="font-mono text-sm">{String(m.expiry_month).padStart(2, '0')}/{String(m.expiry_year).slice(-2)}</p>
                      </div>
                    </div>
                    {m.nickname && (
                      <p className="text-xs mt-3 opacity-70 italic">{m.nickname}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!m.is_default && (
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setDefault(m.id)}>
                      <Star className="w-3 h-3 mr-1" /> Set Default
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => removeMethod(m.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="text-center py-16">
              <CreditCard className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No saved payment methods</h3>
              <p className="text-muted-foreground mb-6">Add a card to make quick payments</p>
              <Button onClick={() => setDialogOpen(true)} className="bg-gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" /> Add Your First Card
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default PaymentMethods;
