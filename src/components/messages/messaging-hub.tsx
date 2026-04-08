"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Pencil, MoreHorizontal, Search } from "lucide-react";
import { getThreads, getUnreadMessageCount } from "@/server/actions/messages";

interface MessagingHubProps {
  currentUser: { id: string; name: string | null; image: string | null };
  onOpenChat: (threadId: string, otherUser: any) => void;
}

export function MessagingHub({ currentUser, onOpenChat }: MessagingHubProps) {
  const [expanded, setExpanded] = useState(false);
  const [threads, setThreads] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getUnreadMessageCount().then(setUnreadCount);
    getThreads().then(setThreads);
  }, []);

  const initials = (currentUser.name || "U").slice(0, 2).toUpperCase();

  function getOtherUser(thread: any) {
    return thread.user1.id === currentUser.id ? thread.user2 : thread.user1;
  }

  const filteredThreads = threads.filter((t) => {
    if (!search) return true;
    const other = getOtherUser(t);
    const name = (other.name || other.username || "").toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="w-[300px] bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light border-b-0 rounded-t-[10px] shadow-lg overflow-hidden">
      {/* Header bar */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-primary text-white cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-semibold shrink-0">
          {currentUser.image ? (
            <img src={currentUser.image} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <span className="text-sm font-semibold flex-1">Messaging</span>
        {unreadCount > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
          <button className="p-1 rounded hover:bg-white/15 transition-colors">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-white/15 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
        <button className="p-1 rounded hover:bg-white/15 transition-colors">
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="max-h-[400px] overflow-y-auto bg-white dark:bg-surface-dark">
          <div className="px-3 py-2 border-b border-border-light dark:border-border-dark-light">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-8 pr-3 py-1.5 border border-border-light dark:border-border-dark-light rounded-full text-[13px] outline-none focus:border-primary bg-surface dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary"
              />
            </div>
          </div>

          {filteredThreads.map((thread: any) => {
            const other = getOtherUser(thread);
            const lastMsg = thread.messages?.[0];
            const displayName =
              other.role === "COMPANY"
                ? other.companyName || other.name
                : other.name || other.username;
            const initials = (displayName || "?").slice(0, 2).toUpperCase();

            return (
              <div
                key={thread.id}
                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-surface dark:hover:bg-gray-800 border-b border-border-light dark:border-border-dark-light transition-colors"
                onClick={() => {
                  onOpenChat(thread.id, other);
                  setExpanded(false);
                }}
              >
                <div className="w-10 h-10 rounded-full bg-primary-lighter flex items-center justify-center text-primary text-sm font-semibold shrink-0">
                  {other.image ? (
                    <img src={other.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-text-primary dark:text-text-dark-primary truncate">
                      {displayName}
                    </span>
                    <span className="text-[11px] text-text-tertiary shrink-0">
                      {lastMsg
                        ? new Date(lastMsg.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </span>
                  </div>
                  {lastMsg && (
                    <p className="text-[12px] text-text-secondary dark:text-text-dark-secondary truncate mt-0.5">
                      {lastMsg.body}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {filteredThreads.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-text-tertiary">
              No conversations yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
