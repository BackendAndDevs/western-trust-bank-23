import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MessageSquare, Plus, Send, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSupport, TicketMessage } from "@/hooks/useSupport";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";

const Support = () => {
  const { user, signOut } = useAuth();
  const { tickets, createTicket, getTicketMessages, sendTicketMessage, refetch } = useSupport();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ subject: '', category: 'general', priority: 'medium', message: '' });
  const [viewTicket, setViewTicket] = useState<string | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewTicket) loadMessages(viewTicket);
  }, [viewTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticketMessages]);

  const loadMessages = async (ticketId: string) => {
    const msgs = await getTicketMessages(ticketId);
    setTicketMessages(msgs);
  };

  const handleCreate = async () => {
    if (!createForm.subject || !createForm.message) return;
    const result = await createTicket(createForm.subject, createForm.category, createForm.priority, createForm.message);
    if (result.error) {
      toast({ title: "Error", description: "Failed to create ticket", variant: "destructive" });
    } else {
      toast({ title: "Ticket Created", description: "Your support ticket has been submitted." });
      setCreateForm({ subject: '', category: 'general', priority: 'medium', message: '' });
      setShowCreate(false);
    }
  };

  const handleReply = async () => {
    if (!replyMessage || !viewTicket) return;
    await sendTicketMessage(viewTicket, replyMessage);
    setReplyMessage("");
    await loadMessages(viewTicket);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const statusColor = (s: string) => {
    switch(s) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return '';
    }
  };

  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Support Center</h1>
          <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />New Ticket</Button>
        </div>

        {/* Tickets List */}
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <Card className="glass"><CardContent className="p-8 text-center text-muted-foreground">No support tickets yet. Create one if you need help.</CardContent></Card>
          ) : (
            tickets.map(t => (
              <Card key={t.id} className="glass cursor-pointer hover:shadow-elegant transition-all" onClick={() => setViewTicket(t.id)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t.subject}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{t.category}</Badge>
                      <Badge variant="outline">{t.priority}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(t.created_at)}</span>
                    </div>
                  </div>
                  <Badge className={statusColor(t.status)}>{t.status.replace('_', ' ')}</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Ticket Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Support Ticket</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Subject</Label><Input value={createForm.subject} onChange={e => setCreateForm({ ...createForm, subject: e.target.value })} placeholder="Brief description of your issue" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={createForm.category} onValueChange={v => setCreateForm({ ...createForm, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="transaction">Transaction</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={createForm.priority} onValueChange={v => setCreateForm({ ...createForm, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Message</Label><Textarea value={createForm.message} onChange={e => setCreateForm({ ...createForm, message: e.target.value })} placeholder="Describe your issue in detail" rows={4} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!createForm.subject || !createForm.message}>Submit Ticket</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Ticket Dialog */}
        <Dialog open={!!viewTicket} onOpenChange={(open) => { if (!open) setViewTicket(null); }}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{tickets.find(t => t.id === viewTicket)?.subject}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-3 py-4 min-h-0">
              {ticketMessages.map(m => (
                <div key={m.id} className={`flex ${m.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${m.sender_type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm">{m.message}</p>
                    <p className={`text-xs mt-1 ${m.sender_type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {m.sender_type === 'admin' ? '🛡️ Support' : 'You'} • {formatDate(m.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {tickets.find(t => t.id === viewTicket)?.status !== 'closed' && (
              <div className="flex gap-2 pt-2 border-t">
                <Input value={replyMessage} onChange={e => setReplyMessage(e.target.value)} placeholder="Type your reply..." onKeyDown={e => e.key === 'Enter' && handleReply()} />
                <Button onClick={handleReply} disabled={!replyMessage}><Send className="w-4 h-4" /></Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default Support;
