import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Zap, 
  Droplets, 
  Wifi, 
  Phone, 
  ArrowLeft,
  DollarSign,
  Calendar,
  Trash2,
  Plus,
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBankingData } from "@/hooks/useBankingData";
import { useBills } from "@/hooks/useBills";
import PageLayout from "@/components/PageLayout";
import { format } from "date-fns";

const Bills = () => {
  const { user } = useAuth();
  const { primaryAccount } = useBankingData();
  const { bills, loading, addBill, payBill, deleteBill } = useBills();

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    biller_name: "",
    account_number: "",
    amount: "",
    due_date: "",
    category: "utilities" as const,
    auto_pay: false
  });

  const categoryIcons = {
    utilities: Zap,
    phone: Phone,
    internet: Wifi,
    rent: CreditCard,
    insurance: CreditCard,
    credit_card: CreditCard,
    other: DollarSign
  };

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addBill({
        biller_name: addForm.biller_name,
        account_number: addForm.account_number,
        amount: parseFloat(addForm.amount),
        due_date: addForm.due_date,
        category: addForm.category,
        auto_pay: addForm.auto_pay
      });
      
      setAddForm({
        biller_name: "",
        account_number: "",
        amount: "",
        due_date: "",
        category: "utilities",
        auto_pay: false
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding bill:', error);
    }
  };

  const handlePayBill = async (billId: string) => {
    if (!primaryAccount) return;
    
    try {
      await payBill(billId, primaryAccount.id);
    } catch (error) {
      console.error('Error paying bill:', error);
    }
  };

  const handleDeleteBill = async (billId: string) => {
    if (confirm('Are you sure you want to delete this bill?')) {
      try {
        await deleteBill(billId);
      } catch (error) {
        console.error('Error deleting bill:', error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getBillStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Account Balance & Add Bill */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Available Balance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {primaryAccount ? formatCurrency(primaryAccount.balance) : "$0.00"}
              </div>
              <p className="text-sm text-muted-foreground">
                Account: {primaryAccount?.account_number || "No account"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowAddForm(!showAddForm)} 
                className="w-full"
                variant={showAddForm ? "outline" : "default"}
              >
                <Plus className="w-4 h-4 mr-2" />
                {showAddForm ? "Cancel" : "Add New Bill"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Add Bill Form */}
        {showAddForm && (
          <Card className="mb-6 animate-fade-in">
            <CardHeader>
              <CardTitle>Add New Bill</CardTitle>
              <CardDescription>Set up a new bill for tracking and payment</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddBill} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="biller-name">Biller Name</Label>
                    <Input
                      id="biller-name"
                      placeholder="e.g., Electric Company"
                      value={addForm.biller_name}
                      onChange={(e) => setAddForm({ ...addForm, biller_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input
                      id="account-number"
                      placeholder="Your account number"
                      value={addForm.account_number}
                      onChange={(e) => setAddForm({ ...addForm, account_number: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={addForm.amount}
                      onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={addForm.due_date}
                      onChange={(e) => setAddForm({ ...addForm, due_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={addForm.category} 
                      onValueChange={(value: any) => setAddForm({ ...addForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="internet">Internet</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="auto-pay"
                      checked={addForm.auto_pay}
                      onChange={(e) => setAddForm({ ...addForm, auto_pay: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="auto-pay" className="cursor-pointer">Enable Auto-Pay</Label>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bill
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Bills List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Bills</CardTitle>
            <CardDescription>Manage and pay your bills</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading bills...</p>
              </div>
            ) : bills.length > 0 ? (
              <div className="space-y-4">
                {bills.map((bill) => {
                  const Icon = categoryIcons[bill.category];
                  return (
                    <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg bg-background/50">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium truncate">{bill.biller_name}</h3>
                            <Badge className={getBillStatusColor(bill.status)}>
                              {bill.status}
                            </Badge>
                            {bill.auto_pay && (
                              <Badge variant="outline" className="text-xs">
                                Auto-Pay
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Account: {bill.account_number}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            Due: {format(new Date(bill.due_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(bill.amount)}</p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          {bill.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handlePayBill(bill.id)}
                              disabled={!primaryAccount || primaryAccount.balance < bill.amount}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Pay
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteBill(bill.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No bills yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowAddForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Bill
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Bills;
