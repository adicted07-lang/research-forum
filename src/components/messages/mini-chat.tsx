"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronDown, Paperclip, Smile, Send } from "lucide-react";
import { getMessages, sendMessage } from "@/server/actions/messages";

interface MiniChatProps {
  threadId: string;
  otherUser: { id: string; name: string | null; username: string; image: string | null };
  currentUserId: string;
  onClose: () => void;
  onMinimize: () => void;
  minimized: boolean;
}

export function MiniChat({ threadId, otherUser, currentUserId, onClose, onMinimize, minimized }: MiniChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMessages(threadId).then(setMessages);
  }, [threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    setSending(true);
    const formData = new FormData();
    formData.set("body", input.trim());
    const result = await sendMessage(threadId, formData);
    if (!result?.error) {
      setInput("");
      const updated = await getMessages(threadId);
      setMessages(updated);
    }
    setSending(false);
  }

  const displayName = otherUser.name || otherUser.username;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="w-[280px] bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light border-b-0 rounded-t-[10px] shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-primary text-white cursor-pointer select-none shrink-0"
        onClick={onMinimize}
      >
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-semibold shrink-0">
          {otherUser.image ? (
            <img src={otherUser.image} alt={displayName || "User avatar"} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <span className="text-sm font-semibold flex-1 truncate">{displayName}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          className="p-1 rounded hover:bg-white/15 transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 rounded hover:bg-white/15 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      {!minimized && (
        <>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 max-h-[340px] min-h-[200px] bg-white dark:bg-surface-dark">
            {messages.map((msg: any) => {
              const isOwn = msg.senderId === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${
                      isOwn
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-surface dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-bl-sm"
                    }`}
                  >
                    {msg.body}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t border-border-light dark:border-border-dark-light bg-white dark:bg-surface-dark">
            <div className="flex items-center gap-1 mb-1.5">
              <button className="p-1 text-text-tertiary hover:text-primary transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <button className="p-1 text-text-tertiary hover:text-primary transition-colors">
                <Smile className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Write a message..."
                className="flex-1 border border-border-light dark:border-border-dark-light rounded-full px-3 py-1.5 text-[13px] outline-none focus:border-primary bg-white dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
