"use client";

import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { getUnreadMessageCount } from "@/server/actions/messages";

export function UnreadMessageBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    getUnreadMessageCount().then(setCount);
  }, []);

  return (
    <a
      href="/messages"
      className="relative p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface dark:hover:bg-surface-dark transition-colors"
      aria-label="Messages"
    >
      <Mail className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold px-1">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </a>
  );
}
