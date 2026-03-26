"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead } from "@/server/actions/notifications";
import { NotificationItem } from "./notification-item";

type Notification = {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: Date;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch unread count on mount
  useEffect(() => {
    getUnreadCount().then(setUnreadCount);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  async function handleOpen() {
    if (!open) {
      setLoading(true);
      const data = await getNotifications(10);
      setNotifications(data as Notification[]);
      setLoading(false);
    }
    setOpen((prev) => !prev);
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  async function handleNotificationClick(notification: Notification) {
    if (!notification.isRead) {
      await markAsRead(notification.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
    }
    setOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center bg-error text-white text-[10px] font-bold rounded-full leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-border-light rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
            <h4 className="text-sm font-semibold text-text-primary">Notifications</h4>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-text-tertiary">
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-text-tertiary">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  {...n}
                  onClick={() => handleNotificationClick(n)}
                />
              ))
            )}
          </div>

          {!loading && notifications.length > 0 && (
            <div className="border-t border-border-light px-4 py-2.5">
              <button
                onClick={handleMarkAllRead}
                className="w-full text-xs text-center text-primary hover:underline"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
