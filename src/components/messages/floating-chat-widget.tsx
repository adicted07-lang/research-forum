"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessagingHub } from "./messaging-hub";
import { MiniChat } from "./mini-chat";

interface OpenChat {
  threadId: string;
  otherUser: any;
  minimized: boolean;
}

interface FloatingChatWidgetProps {
  currentUser: { id: string; name: string | null; image: string | null };
}

export function FloatingChatWidget({ currentUser }: FloatingChatWidgetProps) {
  const pathname = usePathname();
  const [openChats, setOpenChats] = useState<OpenChat[]>([]);

  // Hide on /messages page
  if (pathname === "/messages" || pathname?.startsWith("/messages/")) return null;

  function handleOpenChat(threadId: string, otherUser: any) {
    setOpenChats((prev) => {
      const existing = prev.find((c) => c.threadId === threadId);
      if (existing) {
        return prev.map((c) =>
          c.threadId === threadId ? { ...c, minimized: false } : c
        );
      }
      const updated =
        prev.length >= 2 ? [{ ...prev[0], minimized: true }, ...prev.slice(1)] : prev;
      return [...updated, { threadId, otherUser, minimized: false }];
    });
  }

  function handleCloseChat(threadId: string) {
    setOpenChats((prev) => prev.filter((c) => c.threadId !== threadId));
  }

  function handleMinimizeChat(threadId: string) {
    setOpenChats((prev) =>
      prev.map((c) =>
        c.threadId === threadId ? { ...c, minimized: !c.minimized } : c
      )
    );
  }

  return (
    <div className="fixed bottom-0 right-6 flex items-end gap-2.5 z-50">
      {openChats.map((chat) => (
        <MiniChat
          key={chat.threadId}
          threadId={chat.threadId}
          otherUser={chat.otherUser}
          currentUserId={currentUser.id}
          onClose={() => handleCloseChat(chat.threadId)}
          onMinimize={() => handleMinimizeChat(chat.threadId)}
          minimized={chat.minimized}
        />
      ))}
      <MessagingHub currentUser={currentUser} onOpenChat={handleOpenChat} />
    </div>
  );
}
