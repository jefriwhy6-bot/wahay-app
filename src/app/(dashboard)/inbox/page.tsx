"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  Loader2,
  Phone,
  User,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationItem {
  id: string;
  contact: { id: string; phoneNumber: string; name: string | null; tags: string[] };
  lastMessage: string;
  lastMessageAt: string;
  lastSender: string | null;
  unreadCount: number;
  isRead: boolean;
  sentiment: string;
  isEscalated: boolean;
}

interface Message {
  id: string;
  senderType: "USER" | "AI" | "CONTACT" | "SYSTEM";
  content: string;
  mediaType: string | null;
  mediaUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  contact: { phoneNumber: string; name: string | null; tags: string[] };
  messages: Message[];
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selected, setSelected] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/inbox");
      const data = await res.json();
      setConversations(data);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  async function openChat(id: string) {
    setLoadingChat(true);
    try {
      const res = await fetch(`/api/inbox/${id}`);
      const data = await res.json();
      setSelected(data);
      loadConversations();
    } catch {
      toast.error("Gagal memuat chat");
    }
    setLoadingChat(false);
  }

  async function handleSend() {
    if (!message.trim() || !selected) return;
    setSending(true);
    try {
      const res = await fetch(`/api/inbox/${selected.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message }),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setSelected({
          ...selected,
          messages: [...selected.messages, newMsg],
        });
        setMessage("");
        loadConversations();
      } else {
        toast.error("Gagal mengirim pesan");
      }
    } catch {
      toast.error("Gagal mengirim pesan");
    }
    setSending(false);
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Kemarin";
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Conversation List */}
      <div className={cn(
        "w-full md:w-[380px] border-r border-gray-200 bg-white flex flex-col",
        selected && "hidden md:flex"
      )}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
          <p className="text-sm text-gray-500">{conversations.length} percakapan</p>
        </div>

        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Phone className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm text-gray-500">Belum ada percakapan</p>
              <p className="text-xs text-gray-400 mt-1">Hubungkan WAHA di Settings untuk mulai</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => openChat(conv.id)}
                className={cn(
                  "w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors",
                  selected?.id === conv.id && "bg-emerald-50",
                  !conv.isRead && "bg-emerald-50/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {conv.contact.name || conv.contact.phoneNumber}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {conv.isEscalated && <AlertTriangle className="w-3 h-3 text-red-500" />}
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-emerald-600 text-white text-xs px-1.5 py-0 min-w-[20px] flex items-center justify-center">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Panel */}
      <div className={cn(
        "flex-1 flex flex-col bg-gray-50",
        !selected && "hidden md:flex"
      )}>
        {!selected ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <MessageSquare className="w-16 h-16 text-gray-200 mx-auto" />
              <h3 className="text-lg font-medium text-gray-400">Pilih percakapan</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                Pilih percakapan dari daftar di kiri untuk melihat dan membalas pesan.
              </p>
            </div>
          </div>
        ) : loadingChat ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-200 bg-white px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  className="md:hidden p-1"
                  onClick={() => setSelected(null)}
                >
                  ←
                </button>
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {selected.contact.name || selected.contact.phoneNumber}
                  </p>
                  <p className="text-xs text-gray-500">{selected.contact.phoneNumber}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {selected.contact.tags?.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3 max-w-3xl mx-auto">
                {selected.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.senderType === "CONTACT" ? "justify-start" : "justify-end"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2 max-w-[75%] shadow-sm",
                        msg.senderType === "CONTACT"
                          ? "bg-white text-gray-900 rounded-bl-sm"
                          : msg.senderType === "AI"
                            ? "bg-purple-100 text-purple-900 rounded-br-sm"
                            : "bg-emerald-600 text-white rounded-br-sm"
                      )}
                    >
                      {msg.senderType === "AI" && (
                        <p className="text-xs font-medium text-purple-600 mb-0.5">AI</p>
                      )}
                      {msg.mediaUrl && (
                        <div className="mb-1">
                          {msg.mediaType === "IMAGE" ? (
                            <img src={msg.mediaUrl} alt="" className="rounded max-w-full max-h-48" />
                          ) : (
                            <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className="text-xs underline">
                              📎 Lihat file
                            </a>
                          )}
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        msg.senderType === "CONTACT" ? "text-gray-400" : "text-white/70"
                      )}>
                        {new Date(msg.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-gray-200 bg-white p-3">
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2 max-w-3xl mx-auto"
              >
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis pesan..."
                  className="flex-1"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 px-4"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
