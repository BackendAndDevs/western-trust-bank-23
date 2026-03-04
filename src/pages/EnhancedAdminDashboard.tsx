import { useState, useRef } from "react";
import PageLayout from "@/components/PageLayout";
import AdminCustomization from "@/components/AdminCustomization";
import { useAdminData } from '@/hooks/useAdminData';
import { useEnhancedAdminData } from '@/hooks/useEnhancedAdminData';
import { useAdminSupport, AdminMessage } from '@/hooks/useAdminSupport';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, DollarSign, Clock, CheckCircle, XCircle, Edit, UserPlus, Trash2,
  TrendingUp, Shield, Check, X, Building2, CreditCard, Send, FileCheck,
  UserCheck, RefreshCw, MessageSquare, Headphones, Activity, Layers,
  ArrowUpRight, LayoutDashboard, Settings, Palette
} from 'lucide-react';

const EnhancedAdminDashboard = () => {
  const { signOut } = useAuth();
  const { 
    accounts, transactions, loans, users, pendingTransactions, pendingLoans,
    totalBalance, totalUsers, loading, processTransaction, reviewLoan,
    updateAccountBalance, createUser, deleteUser, updateAccountStatus, refetchData
  } = useAdminData();

  const {
    stats, externalTransfers, wireTransfers, checkDeposits, cards, beneficiaries,
    pendingExternalTransfers, pendingWireTransfers, pendingCheckDeposits, pendingBeneficiaries,
    loading: enhancedLoading, processExternalTransfer, processWireTransfer,
    processCheckDeposit, updateCardStatus, verifyBeneficiary, refetchData: refetchEnhancedData
  } = useEnhancedAdminData();

  const {
    tickets: adminTickets, chatSessions: adminChatSessions, pendingTickets,
    activeChatSessions, getTicketMessages: adminGetTicketMessages,
    getChatMessages: adminGetChatMessages, sendTicketReply, sendChatReply,
    updateTicketStatus, loading: supportLoading, refetch: refetchSupport,
  } = useAdminSupport();

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [editForm, setEditForm] = useState({ accountId: '', newBalance: '', notes: '' });
  const [createUserForm, setCreateUserForm] = useState({ email: '', password: '', fullName: '', initialBalance: 1000, role: 'user' });
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketMsgs, setTicketMsgs] = useState<AdminMessage[]>([]);
  const [ticketReply, setTicketReply] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatMsgs, setChatMsgs] = useState<AdminMessage[]>([]);
  const [chatReply, setChatReply] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Handlers
  const handleProcessTransaction = async (id: string, status: 'approved' | 'rejected') => {
    const result = await processTransaction(id, status);
    toast({ title: result?.error ? "Error" : "Success", description: result?.error ? "Failed to process." : `Transaction ${status}.`, variant: result?.error ? "destructive" : undefined });
  };

  const handleReviewLoan = async (id: string, status: 'approved' | 'rejected') => {
    const result = await reviewLoan(id, status);
    toast({ title: result?.error ? "Error" : "Success", description: result?.error ? "Failed." : `Loan ${status}.`, variant: result?.error ? "destructive" : undefined });
  };

  const handleUpdateBalance = async () => {
    if (!editForm.accountId || !editForm.newBalance) return;
    const result = await updateAccountBalance(editForm.accountId, parseFloat(editForm.newBalance), editForm.notes);
    if (!result?.error) { setSelectedAccount(null); setEditForm({ accountId: '', newBalance: '', notes: '' }); }
    toast({ title: result?.error ? "Error" : "Success", description: result?.error ? "Failed." : "Balance updated.", variant: result?.error ? "destructive" : undefined });
  };

  const handleCreateUser = async () => {
    if (!createUserForm.email || !createUserForm.password || !createUserForm.fullName) return;
    const result = await createUser(createUserForm.email, createUserForm.password, createUserForm.fullName, createUserForm.initialBalance, createUserForm.role);
    if (!result?.error) { setCreateUserForm({ email: '', password: '', fullName: '', initialBalance: 1000, role: 'user' }); setShowCreateUser(false); }
    toast({ title: result?.error ? "Error" : "Success", description: result?.error ? "Failed to create user." : "User created!", variant: result?.error ? "destructive" : undefined });
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await deleteUser(userId);
    toast({ title: result?.error ? "Error" : "Success", description: result?.error ? "Failed." : "User deleted.", variant: result?.error ? "destructive" : undefined });
  };

  const handleUpdateAccountStatus = async (userId: string, status: string) => {
    const result = await updateAccountStatus(userId, status);
    toast({ title: result?.error ? "Error" : "Success", description: result?.error ? "Failed." : `Account ${status}.`, variant: result?.error ? "destructive" : undefined });
  };

  const handleProcessExternalTransfer = async (id: string, status: 'approved' | 'rejected') => {
    const result = await processExternalTransfer(id, status);
    toast({ title: result?.error ? "Error" : "Success", description: result?.error ? "Failed." : `Transfer ${status}.`, variant: result?.error ? "destructive" : undefined });
  };

  const handleProcessWireTransfer = async (id: string, status: 'approved' | 'rejected') => {
    const result = await processWireTransfer(id, status);
    toast({ title: result?.error ? "Error" : "Success", description: result?.error ? "Failed." : `Wire ${status}.`, variant: result?.error ? "destructive" : undefined });
  };

  const handleProcessCheckDeposit = async (id: string, status: 'approved' | 'rejected' | 'cleared') => {
    const result = await processCheckDeposit(id, status);
    toast({ title: result?.error ? "Error" : "Success", description: result?.error ? "Failed." : `Check ${status}.`, variant: result?.error ? "destructive" : undefined });
  };

  const handleUpdateCardStatus = async (cardId: string, status: string) => {
    const result = await updateCardStatus(cardId, status);
    toast({ title: result?.error ? "Error" : "Success", description: result?.error ? "Failed." : `Card ${status}.`, variant: result?.error ? "destructive" : undefined });
  };

  const handleVerifyBeneficiary = async (id: string, status: 'active' | 'suspended') => {
    const result = await verifyBeneficiary(id, status);
    toast({ title: result?.error ? "Error" : "Success", description: result?.error ? "Failed." : `Beneficiary ${status === 'active' ? 'verified' : 'suspended'}.`, variant: result?.error ? "destructive" : undefined });
  };

  const handleRefreshAll = async () => {
    await Promise.all([refetchData(), refetchEnhancedData(), refetchSupport()]);
    toast({ title: "Refreshed", description: "All data refreshed." });
  };

  const handleViewTicket = async (ticketId: string) => { setSelectedTicketId(ticketId); setTicketMsgs(await adminGetTicketMessages(ticketId)); };
  const handleSendTicketReply = async () => {
    if (!selectedTicketId || !ticketReply) return;
    const result = await sendTicketReply(selectedTicketId, ticketReply);
    if (!result.error) { setTicketReply(""); setTicketMsgs(await adminGetTicketMessages(selectedTicketId)); }
  };
  const handleViewChat = async (sessionId: string) => { setSelectedChatId(sessionId); setChatMsgs(await adminGetChatMessages(sessionId)); };
  const handleSendChatReply = async () => {
    if (!selectedChatId || !chatReply) return;
    const result = await sendChatReply(selectedChatId, chatReply);
    if (!result.error) { setChatReply(""); setChatMsgs(await adminGetChatMessages(selectedChatId)); }
  };
  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    const result = await updateTicketStatus(ticketId, status);
    toast({ title: result.error ? "Error" : "Success", description: result.error ? "Failed." : `Ticket ${status}.`, variant: result.error ? "destructive" : undefined });
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const fmtDate = (d: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));

  const totalPending = pendingTransactions.length + pendingLoans.length + pendingExternalTransfers.length + pendingWireTransfers.length + pendingCheckDeposits.length + pendingBeneficiaries.length;

  if (loading || enhancedLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground font-medium">Loading admin dashboard…</p>
        </div>
      </div>
    );
  }

  // Sidebar navigation items
  const sidebarItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, badge: totalPending > 0 ? totalPending : undefined },
    { id: "users", label: "Users", icon: Users, badge: users.length },
    { id: "transactions", label: "Transactions", icon: Activity, badge: pendingTransactions.length || undefined },
    { id: "loans", label: "Loans", icon: TrendingUp, badge: pendingLoans.length || undefined },
    { id: "external", label: "External Transfers", icon: Building2, badge: pendingExternalTransfers.length || undefined },
    { id: "wires", label: "Wire Transfers", icon: Send, badge: pendingWireTransfers.length || undefined },
    { id: "checks", label: "Check Deposits", icon: FileCheck, badge: pendingCheckDeposits.length || undefined },
    { id: "cards", label: "Cards", icon: CreditCard },
    { id: "beneficiaries", label: "Beneficiaries", icon: UserCheck, badge: pendingBeneficiaries.length || undefined },
    { id: "accounts", label: "Accounts", icon: Layers },
    { id: "tickets", label: "Support Tickets", icon: Headphones, badge: pendingTickets.length || undefined },
    { id: "chats", label: "Live Chats", icon: MessageSquare, badge: activeChatSessions.length || undefined },
    { id: "customize", label: "Customize", icon: Palette },
  ];

  return (
    <PageLayout>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">Management Console</p>
              </div>
            </div>
          </div>
          <ScrollArea className="flex-1 p-2">
            <nav className="space-y-0.5">
              {sidebarItems.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      active ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge variant={active ? "default" : "secondary"} className="ml-auto h-5 min-w-5 text-[10px] px-1.5">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </ScrollArea>
          <div className="p-3 border-t border-border/50 space-y-2">
            <Button variant="outline" size="sm" className="w-full" onClick={handleRefreshAll}>
              <RefreshCw className="w-3.5 h-3.5 mr-2" /> Refresh Data
            </Button>
            <Button size="sm" className="w-full" onClick={() => setShowCreateUser(true)}>
              <UserPlus className="w-3.5 h-3.5 mr-2" /> Create User
            </Button>
          </div>
        </aside>

        {/* Mobile Tab Selector */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/50 p-2">
          <ScrollArea className="w-full">
            <div className="flex gap-1 pb-1 min-w-max">
              {sidebarItems.slice(0, 8).map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                      activeTab === item.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{sidebarItems.find(i => i.id === activeTab)?.label || "Overview"}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {activeTab === 'overview' && `${totalPending} items require attention`}
                  {activeTab === 'users' && `${users.length} registered users`}
                </p>
              </div>
              <div className="flex items-center gap-2 lg:hidden">
                <Button variant="outline" size="sm" onClick={handleRefreshAll}><RefreshCw className="w-4 h-4" /></Button>
                <Button size="sm" onClick={() => setShowCreateUser(true)}><UserPlus className="w-4 h-4" /></Button>
              </div>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={Users} label="Total Users" value={totalUsers.toString()} />
                  <StatCard icon={DollarSign} label="Total Balance" value={fmt(totalBalance)} accent />
                  <StatCard icon={Clock} label="Pending Items" value={totalPending.toString()} warning={totalPending > 0} />
                  <StatCard icon={CreditCard} label="Active Cards" value={cards.length.toString()} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <MiniStat label="Transactions" count={pendingTransactions.length} onClick={() => setActiveTab("transactions")} />
                  <MiniStat label="Loans" count={pendingLoans.length} onClick={() => setActiveTab("loans")} />
                  <MiniStat label="External" count={pendingExternalTransfers.length} onClick={() => setActiveTab("external")} />
                  <MiniStat label="Wires" count={pendingWireTransfers.length} onClick={() => setActiveTab("wires")} />
                  <MiniStat label="Checks" count={pendingCheckDeposits.length} onClick={() => setActiveTab("checks")} />
                  <MiniStat label="Beneficiaries" count={pendingBeneficiaries.length} onClick={() => setActiveTab("beneficiaries")} />
                </div>
                {/* Recent pending items */}
                {totalPending > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Requires Attention</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {pendingTransactions.slice(0, 3).map(t => (
                        <PendingItem key={t.id} title={t.description || "Transaction"} subtitle={`${t.user_name} • ${fmtDate(t.created_at)}`} amount={fmt(t.amount)} type="transaction"
                          onApprove={() => handleProcessTransaction(t.id, 'approved')} onReject={() => handleProcessTransaction(t.id, 'rejected')} />
                      ))}
                      {pendingExternalTransfers.slice(0, 3).map(t => (
                        <PendingItem key={t.id} title={`External → ${t.recipient_name}`} subtitle={`${t.user_name} • ${t.bank_name}`} amount={fmt(t.amount)} type="external"
                          onApprove={() => handleProcessExternalTransfer(t.id, 'approved')} onReject={() => handleProcessExternalTransfer(t.id, 'rejected')} />
                      ))}
                      {pendingLoans.slice(0, 2).map(l => (
                        <PendingItem key={l.id} title={l.purpose} subtitle={`${l.user_name} • ${l.loan_type}`} amount={fmt(l.amount)} type="loan"
                          onApprove={() => handleReviewLoan(l.id, 'approved')} onReject={() => handleReviewLoan(l.id, 'rejected')} />
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === "users" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">User Management</CardTitle>
                  <CardDescription>Manage accounts, approve/suspend users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                          <TableHead className="text-right">Accounts</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map(u => (
                          <TableRow key={u.user_id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{u.full_name || "—"}</p>
                                <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select value={u.account_status} onValueChange={(v) => handleUpdateAccountStatus(u.user_id, v)}>
                                <SelectTrigger className="w-28 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">✅ Active</SelectItem>
                                  <SelectItem value="pending">⏳ Pending</SelectItem>
                                  <SelectItem value="suspended">🚫 Suspended</SelectItem>
                                  <SelectItem value="closed">❌ Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm">{fmt(u.total_balance)}</TableCell>
                            <TableCell className="text-right">{u.account_count}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {u.account_status !== 'active' && (
                                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleUpdateAccountStatus(u.user_id, 'active')}>
                                    <Check className="w-3 h-3 mr-1" /> Approve
                                  </Button>
                                )}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete user?</AlertDialogTitle>
                                      <AlertDialogDescription>This permanently removes {u.full_name || u.email} and all their data.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteUser(u.user_id)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TRANSACTIONS TAB */}
            {activeTab === "transactions" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Pending Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pendingTransactions.length > 0 ? (
                      <div className="space-y-3">
                        {pendingTransactions.map(t => (
                          <PendingItem key={t.id} title={t.description || "Transaction"} subtitle={`${t.user_name} (${t.user_email}) • ${fmtDate(t.created_at)}`}
                            amount={fmt(t.amount)} type={t.transaction_type}
                            onApprove={() => handleProcessTransaction(t.id, 'approved')} onReject={() => handleProcessTransaction(t.id, 'rejected')} />
                        ))}
                      </div>
                    ) : <EmptyState text="No pending transactions" />}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base">All Transactions</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {transactions.slice(0, 20).map(t => (
                        <div key={t.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{t.description}</p>
                            <p className="text-xs text-muted-foreground">{t.user_name} • {fmtDate(t.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{fmt(t.amount)}</span>
                            <Badge variant={t.status === 'completed' ? 'default' : t.status === 'pending' ? 'secondary' : 'destructive'} className="text-[10px]">
                              {t.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* LOANS TAB */}
            {activeTab === "loans" && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Loan Requests</CardTitle></CardHeader>
                <CardContent>
                  {pendingLoans.length > 0 ? (
                    <div className="space-y-3">
                      {pendingLoans.map(l => (
                        <PendingItem key={l.id} title={l.purpose} subtitle={`${l.user_name} • ${l.loan_type} • ${fmtDate(l.created_at)}`}
                          amount={fmt(l.amount)} type="loan"
                          onApprove={() => handleReviewLoan(l.id, 'approved')} onReject={() => handleReviewLoan(l.id, 'rejected')} />
                      ))}
                    </div>
                  ) : <EmptyState text="No pending loans" />}
                </CardContent>
              </Card>
            )}

            {/* EXTERNAL TRANSFERS */}
            {activeTab === "external" && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">External Transfers</CardTitle></CardHeader>
                <CardContent>
                  {pendingExternalTransfers.length > 0 ? (
                    <div className="space-y-3">
                      {pendingExternalTransfers.map(t => (
                        <PendingItem key={t.id} title={`→ ${t.recipient_name}`} subtitle={`${t.user_name} • ${t.bank_name} • Acct: ${t.recipient_account_number}`}
                          amount={fmt(t.amount)} type="external"
                          onApprove={() => handleProcessExternalTransfer(t.id, 'approved')} onReject={() => handleProcessExternalTransfer(t.id, 'rejected')} />
                      ))}
                    </div>
                  ) : <EmptyState text="No pending external transfers" />}
                </CardContent>
              </Card>
            )}

            {/* WIRES */}
            {activeTab === "wires" && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Wire Transfers</CardTitle></CardHeader>
                <CardContent>
                  {pendingWireTransfers.length > 0 ? (
                    <div className="space-y-3">
                      {pendingWireTransfers.map(w => (
                        <PendingItem key={w.id} title={`→ ${w.recipient_name} (${w.recipient_bank})`}
                          subtitle={`${w.user_name} • ${w.wire_type.toUpperCase()} • Fee: ${fmt(w.fee_amount)}`}
                          amount={fmt(w.amount)} type="wire"
                          onApprove={() => handleProcessWireTransfer(w.id, 'approved')} onReject={() => handleProcessWireTransfer(w.id, 'rejected')} />
                      ))}
                    </div>
                  ) : <EmptyState text="No pending wires" />}
                </CardContent>
              </Card>
            )}

            {/* CHECKS */}
            {activeTab === "checks" && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Check Deposits</CardTitle></CardHeader>
                <CardContent>
                  {pendingCheckDeposits.length > 0 ? (
                    <div className="space-y-3">
                      {pendingCheckDeposits.map(d => (
                        <div key={d.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card/50">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">Check #{d.check_number}</p>
                            <p className="text-xs text-muted-foreground">{d.payer_name} • {d.user_name} • Hold: {d.hold_days}d</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-semibold">{fmt(d.check_amount)}</span>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleProcessCheckDeposit(d.id, 'approved')}><Check className="w-3 h-3" /></Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleProcessCheckDeposit(d.id, 'cleared')}>Clear</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleProcessCheckDeposit(d.id, 'rejected')}><X className="w-3 h-3" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <EmptyState text="No pending checks" />}
                </CardContent>
              </Card>
            )}

            {/* CARDS */}
            {activeTab === "cards" && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Card Management</CardTitle></CardHeader>
                <CardContent>
                  {cards.length > 0 ? (
                    <div className="space-y-2">
                      {cards.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50">
                          <div>
                            <p className="text-sm font-medium">{c.card_type.toUpperCase()} •••• {c.card_number.slice(-4)}</p>
                            <p className="text-xs text-muted-foreground">{c.user_name} • Exp: {c.expiry_date} • Limit: {fmt(c.daily_limit)}</p>
                          </div>
                          <Select value={c.card_status} onValueChange={(v) => handleUpdateCardStatus(c.id, v)}>
                            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="frozen">Frozen</SelectItem>
                              <SelectItem value="deactivated">Deactivated</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  ) : <EmptyState text="No cards" />}
                </CardContent>
              </Card>
            )}

            {/* BENEFICIARIES */}
            {activeTab === "beneficiaries" && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Beneficiary Verification</CardTitle></CardHeader>
                <CardContent>
                  {beneficiaries.length > 0 ? (
                    <div className="space-y-2">
                      {beneficiaries.map(b => (
                        <div key={b.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50">
                          <div>
                            <p className="text-sm font-medium">{b.nickname}</p>
                            <p className="text-xs text-muted-foreground">{b.account_number} • {b.bank_name || 'Internal'} • By: {b.user_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={b.status === 'active' ? 'default' : b.status === 'pending' ? 'secondary' : 'destructive'} className="text-[10px]">
                              {b.is_verified ? '✓ Verified' : b.status}
                            </Badge>
                            {b.status === 'pending' && (
                              <>
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleVerifyBeneficiary(b.id, 'active')}><Check className="w-3 h-3 mr-1" />Verify</Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleVerifyBeneficiary(b.id, 'suspended')}><X className="w-3 h-3" /></Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <EmptyState text="No beneficiaries" />}
                </CardContent>
              </Card>
            )}

            {/* ACCOUNTS */}
            {activeTab === "accounts" && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Account Balances</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {accounts.map(a => (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50">
                        <div>
                          <p className="text-sm font-medium">{a.user_name}</p>
                          <p className="text-xs text-muted-foreground">{a.user_email} • {a.account_number}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-semibold">{fmt(a.balance)}</span>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                            setSelectedAccount(a);
                            setEditForm({ accountId: a.id, newBalance: a.balance.toString(), notes: '' });
                          }}>
                            <Edit className="w-3 h-3 mr-1" /> Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TICKETS */}
            {activeTab === "tickets" && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Support Tickets ({pendingTickets.length} pending)</CardTitle></CardHeader>
                <CardContent>
                  {adminTickets.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adminTickets.map(t => (
                            <TableRow key={t.id}>
                              <TableCell className="font-medium text-sm">{t.subject}</TableCell>
                              <TableCell className="text-sm">{t.user_name || t.user_email}</TableCell>
                              <TableCell>
                                <Badge variant={t.priority === 'urgent' ? 'destructive' : t.priority === 'high' ? 'default' : 'outline'} className="text-[10px]">{t.priority}</Badge>
                              </TableCell>
                              <TableCell><Badge variant="outline" className="text-[10px]">{t.status}</Badge></TableCell>
                              <TableCell className="text-right">
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleViewTicket(t.id)}>
                                  <MessageSquare className="w-3 h-3 mr-1" />Reply
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : <EmptyState text="No tickets" />}
                </CardContent>
              </Card>
            )}

            {/* CHATS */}
            {activeTab === "chats" && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Live Chats ({activeChatSessions.length} active)</CardTitle></CardHeader>
                <CardContent>
                  {adminChatSessions.length > 0 ? (
                    <div className="space-y-2">
                      {adminChatSessions.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50">
                          <div>
                            <p className="text-sm font-medium">{s.user_name || s.user_email}</p>
                            <p className="text-xs text-muted-foreground">{s.message_count} messages • {new Date(s.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={s.status === 'active' ? 'default' : 'outline'} className="text-[10px]">{s.status}</Badge>
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleViewChat(s.id)}>
                              <MessageSquare className="w-3 h-3 mr-1" />Open
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <EmptyState text="No chats" />}
                </CardContent>
              </Card>
            )}

            {/* CUSTOMIZE */}
            {activeTab === "customize" && <AdminCustomization />}
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <Dialog open={selectedAccount !== null} onOpenChange={() => setSelectedAccount(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Account Balance</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>New Balance</Label><Input type="number" step="0.01" value={editForm.newBalance} onChange={e => setEditForm({...editForm, newBalance: e.target.value})} /></div>
            <div><Label>Admin Notes</Label><Textarea value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} placeholder="Reason..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAccount(null)}>Cancel</Button>
            <Button onClick={handleUpdateBalance}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Email</Label><Input type="email" value={createUserForm.email} onChange={e => setCreateUserForm({...createUserForm, email: e.target.value})} placeholder="user@example.com" /></div>
            <div><Label>Password</Label><Input type="password" value={createUserForm.password} onChange={e => setCreateUserForm({...createUserForm, password: e.target.value})} /></div>
            <div><Label>Full Name</Label><Input value={createUserForm.fullName} onChange={e => setCreateUserForm({...createUserForm, fullName: e.target.value})} /></div>
            <div><Label>Initial Balance ($)</Label><Input type="number" value={createUserForm.initialBalance} onChange={e => setCreateUserForm({...createUserForm, initialBalance: parseFloat(e.target.value) || 0})} /></div>
            <div><Label>Role</Label>
              <Select value={createUserForm.role} onValueChange={v => setCreateUserForm({...createUserForm, role: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateUser(false)}>Cancel</Button>
            <Button onClick={handleCreateUser}><UserPlus className="w-4 h-4 mr-2" />Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedTicketId} onOpenChange={open => { if (!open) setSelectedTicketId(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader><DialogTitle>Ticket: {adminTickets.find(t => t.id === selectedTicketId)?.subject}</DialogTitle></DialogHeader>
          <div className="flex gap-2 mb-2">
            <Select onValueChange={v => selectedTicketId && handleUpdateTicketStatus(selectedTicketId, v)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Update status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem><SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem><SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-2 pr-4">
              {ticketMsgs.map(m => (
                <div key={m.id} className={`flex ${m.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg text-sm ${m.sender_type === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="font-medium text-xs mb-1">{m.sender_name}</p>
                    <p>{m.message}</p>
                    <p className={`text-[10px] mt-1 ${m.sender_type === 'admin' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2 pt-2 border-t">
            <Input value={ticketReply} onChange={e => setTicketReply(e.target.value)} placeholder="Reply..." onKeyDown={e => e.key === 'Enter' && handleSendTicketReply()} />
            <Button onClick={handleSendTicketReply} disabled={!ticketReply}><Send className="w-4 h-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedChatId} onOpenChange={open => { if (!open) setSelectedChatId(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader><DialogTitle>Chat: {adminChatSessions.find(s => s.id === selectedChatId)?.user_name}</DialogTitle></DialogHeader>
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-2 pr-4">
              {chatMsgs.map(m => (
                <div key={m.id} className={`flex ${m.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-2 rounded-lg text-sm ${m.sender_type === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {m.message}
                    <div className={`text-[10px] mt-0.5 ${m.sender_type === 'admin' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {m.sender_name} • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
          <div className="flex gap-2 pt-2 border-t">
            <Input value={chatReply} onChange={e => setChatReply(e.target.value)} placeholder="Message..." onKeyDown={e => e.key === 'Enter' && handleSendChatReply()} />
            <Button onClick={handleSendChatReply} disabled={!chatReply}><Send className="w-4 h-4" /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

/* ─── Sub Components ─── */
const StatCard = ({ icon: Icon, label, value, accent, warning }: { icon: any; label: string; value: string; accent?: boolean; warning?: boolean }) => (
  <Card className="overflow-hidden">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 ${warning ? 'text-amber-500' : 'text-muted-foreground'}`} />
      </div>
      <p className={`text-xl font-bold ${accent ? 'bg-gradient-primary bg-clip-text text-transparent' : ''} ${warning ? 'text-amber-500' : ''}`}>{value}</p>
    </CardContent>
  </Card>
);

const MiniStat = ({ label, count, onClick }: { label: string; count: number; onClick: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-center">
    <span className={`text-lg font-bold ${count > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>{count}</span>
    <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
  </button>
);

const PendingItem = ({ title, subtitle, amount, type, onApprove, onReject }: {
  title: string; subtitle: string; amount: string; type: string;
  onApprove: () => void; onReject: () => void;
}) => (
  <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card/50 hover:border-primary/20 transition-all">
    <div className="min-w-0 flex-1 mr-4">
      <p className="text-sm font-medium truncate">{title}</p>
      <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <span className="font-mono text-sm font-semibold">{amount}</span>
      <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={onApprove}>
        <Check className="w-3.5 h-3.5 text-green-600" />
      </Button>
      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onReject}>
        <X className="w-3.5 h-3.5 text-destructive" />
      </Button>
    </div>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="text-center py-12">
    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
      <CheckCircle className="w-6 h-6 text-muted-foreground" />
    </div>
    <p className="text-sm text-muted-foreground">{text}</p>
  </div>
);

export default EnhancedAdminDashboard;
