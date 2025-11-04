import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRecurringTransfers } from '@/hooks/useRecurringTransfers';
import { useBankingData } from '@/hooks/useBankingData';
import { ArrowLeft, Calendar, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function RecurringTransfers() {
  const navigate = useNavigate();
  const { recurringTransfers, loading, setupRecurringTransfer, deleteRecurringTransfer } = useRecurringTransfers();
  const { primaryAccount } = useBankingData();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    recipientAccount: '',
    amount: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly',
    memo: ''
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientAccount || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!primaryAccount) {
      toast.error('No primary account found');
      return;
    }

    try {
      await setupRecurringTransfer(
        primaryAccount.id,
        formData.recipientAccount,
        parseFloat(formData.amount),
        formData.frequency as 'daily' | 'weekly' | 'biweekly' | 'monthly',
        formData.memo || undefined
      );
      setFormData({ recipientAccount: '', amount: '', frequency: 'monthly', memo: '' });
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating recurring transfer:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this recurring transfer?')) {
      try {
        await deleteRecurringTransfer(id);
        toast.success('Recurring transfer deleted');
      } catch (error) {
        console.error('Error deleting recurring transfer:', error);
      }
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: 'bg-blue-100 text-blue-800',
      weekly: 'bg-green-100 text-green-800',
      monthly: 'bg-purple-100 text-purple-800'
    };
    return colors[frequency as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Recurring Transfers</h1>
            <p className="text-muted-foreground">Set up automatic transfers</p>
          </div>
        </div>

        {!isCreating ? (
          <Button onClick={() => setIsCreating(true)} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Recurring Transfer
          </Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>New Recurring Transfer</CardTitle>
              <CardDescription>Set up an automatic transfer schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientAccount">Recipient Account Number *</Label>
                  <Input
                    id="recipientAccount"
                    placeholder="Enter account number"
                    value={formData.recipientAccount}
                    onChange={(e) => setFormData({ ...formData, recipientAccount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select value={formData.frequency} onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memo">Memo (Optional)</Label>
                  <Input
                    id="memo"
                    placeholder="What's this for?"
                    value={formData.memo}
                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Create Transfer</Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Recurring Transfers</h2>
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          ) : recurringTransfers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No recurring transfers set up yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recurringTransfers.map((transfer) => (
                <Card key={transfer.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            ${transfer.amount.toFixed(2)}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyBadge(transfer.frequency)}`}>
                            {transfer.frequency}
                          </span>
                          {!transfer.active && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          To: {transfer.to_account_number}
                        </p>
                        {transfer.memo && (
                          <p className="text-sm text-muted-foreground">
                            {transfer.memo}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Next transfer: {format(new Date(transfer.next_execution_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transfer.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
