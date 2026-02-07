import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, MinusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSupport } from "@/hooks/useSupport";

const LiveChatWidget = () => {
  const { user } = useAuth();
  const { activeChat, chatMessages, startChat, sendChatMessage, closeChat } = useSupport();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!user) return null;

  const handleSend = async () => {
    if (!message.trim()) return;
    if (!activeChat) await startChat();
    await sendChatMessage(message);
    setMessage("");
  };

  const handleStartChat = async () => {
    await startChat();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-80 sm:w-96 bg-card border rounded-xl shadow-lg flex flex-col" style={{ height: '450px' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-foreground rounded-t-xl">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium text-sm">Live Chat</span>
              {activeChat && <Badge variant="secondary" className="text-xs">Active</Badge>}
            </div>
            <div className="flex gap-1">
              {activeChat && (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20" onClick={closeChat}>
                  <MinusCircle className="w-3 h-3" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setIsOpen(false)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {!activeChat ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-3">Start a conversation with our support team</p>
                <Button size="sm" onClick={handleStartChat}>Start Chat</Button>
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                Chat started. Send a message to begin.
              </div>
            ) : (
              chatMessages.map(m => (
                <div key={m.id} className={`flex ${m.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-2 rounded-lg text-sm ${m.sender_type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {m.message}
                    <div className={`text-xs mt-0.5 ${m.sender_type === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {m.sender_type === 'admin' ? '🛡️ Support' : ''} {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {activeChat && (
            <div className="p-2 border-t flex gap-2">
              <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." className="text-sm" onKeyDown={e => e.key === 'Enter' && handleSend()} />
              <Button size="icon" onClick={handleSend} disabled={!message.trim()}><Send className="w-4 h-4" /></Button>
            </div>
          )}
        </div>
      ) : (
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg hover:shadow-glow" onClick={() => setIsOpen(true)}>
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
};

export default LiveChatWidget;
