"use client";

import { useEffect, useRef } from "react";

interface Message {
  id: string;
  body: string;
  senderId: string;
  createdAt: Date;
  isRead: boolean;
}

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
}

function formatTime(date: Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function MessageThread({ messages, currentUserId }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12 text-center">
        <p className="text-sm text-text-tertiary dark:text-text-dark-tertiary">
          No messages yet. Start the conversation!
        </p>
      </div>
    );
  }

  // Group messages by date
  let lastDate = "";

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
      {messages.map((message) => {
        const isOwn = message.senderId === currentUserId;
        const messageDate = formatDate(message.createdAt);
        const showDateSeparator = messageDate !== lastDate;
        lastDate = messageDate;

        return (
          <div key={message.id}>
            {showDateSeparator && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border-light dark:bg-border-dark-light" />
                <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary px-2">
                  {messageDate}
                </span>
                <div className="flex-1 h-px bg-border-light dark:bg-border-dark-light" />
              </div>
            )}
            <div
              className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  isOwn
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-surface dark:bg-gray-800 text-text-primary dark:text-text-dark-primary rounded-bl-sm border border-border-light dark:border-border-dark-light"
                }`}
              >
                <p className="text-sm leading-relaxed break-words">{message.body}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    isOwn ? "text-white/70" : "text-text-tertiary dark:text-text-dark-tertiary"
                  }`}
                >
                  {formatTime(message.createdAt)}
                  {isOwn && (
                    <span className="ml-1">{message.isRead ? " · Read" : " · Delivered"}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
