import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRecurringTransfers } from '@/hooks/useRecurringTransfers';
import { useBankingData } from '@/hooks/useBankingData';
import { Calendar, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import PageLayout from '@/components/PageLayout';

export default function RecurringTransfers() {
  const { recurringTransfers, loading, setupRecurringTransfer, deleteRecurringTransfer } = useRecurringTransfers();
  const { primaryAccount } = useBankingData();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ recipientAccount: '', amount: '', frequency: 'monthly' as const, memo: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientAccount || !formData.amount) { toast.error('Please fill in all required fields'); return; }
    if (!primaryAccount) { toast.error('No primary account found'); return; }
    try {
      await setupRecurringTransfer(primaryAccount.id, formData.recipientAccount, parseFloat(formData.amount), formData.frequency as any, formData.memo || undefined);
      setFormData({ recipientAccount: '', amount: '', frequency: 'monthly', memo: '' });
      setIsCreating(false);
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this recurring transfer?')) {
      try { await deleteRecurringTransfer(id); toast.success('Deleted'); } catch (e) { console.error(e); }
    }
  };

  return (
    <PageLayout className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recurring Transfers</h1>
          <p className="text-muted-foreground">Set up automatic transfers</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Transfer
          </Button>
        )}
      </div>

      {isCreating && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>New Recurring Transfer</CardTitle>
            <CardDescription>Set up an automatic transfer schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient Account Number *</Label>
                <Input placeholder="Enter account number" value={formData.recipientAccount} onChange={(e) => setFormData({ ...formData, recipientAccount: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Amount ($) *</Label>
                <Input type="number" step="0.01" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Frequency *</Label>
                <Select value={formData.frequency} onValueChange={(v: any) => setFormData({ ...formData, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Memo (Optional)</Label>
                <Input placeholder="What's this for?" value={formData.memo} onChange={(e) => setFormData({ ...formData, memo: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create</Button>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : recurringTransfers.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No recurring transfers set up yet</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {recurringTransfers.map((t) => (
            <Card key={t.id} className="shadow-card">
              <CardContent className="p-6 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">${t.amount.toFixed(2)}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{t.frequency}</span>
                    {!t.active && <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">Inactive</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">To: {t.to_account_number}</p>
                  {t.memo && <p className="text-sm text-muted-foreground">{t.memo}</p>}
                  <p className="text-xs text-muted-foreground">Next: {format(new Date(t.next_execution_date), 'MMM dd, yyyy')}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
