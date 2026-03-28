"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import {
  getAllAnnouncements,
  createAnnouncement,
  toggleAnnouncementActive,
} from "@/server/actions/announcements";
import { Plus, Bell, ToggleLeft, ToggleRight } from "lucide-react";

interface Announcement {
  id: string;
  message: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date | null;
}

const ANNOUNCEMENT_TYPES = [
  { value: "info", label: "Info", color: "blue" },
  { value: "warning", label: "Warning", color: "yellow" },
  { value: "success", label: "Success", color: "green" },
  { value: "error", label: "Error", color: "red" },
];

const typeClasses: Record<string, string> = {
  info: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  warning: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  success: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
  error: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
};

const typeBadgeClasses: Record<string, string> = {
  info: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
  success: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  error: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
};

export function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    getAllAnnouncements().then((result) => {
      setAnnouncements((result.announcements as Announcement[]) ?? []);
      setLoading(false);
    });
  }, []);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Message is required");
      return;
    }

    startTransition(async () => {
      const result = await createAnnouncement(
        message.trim(),
        type,
        expiresAt || undefined
      );
      if ("error" in result) {
        toast.error(result.error);
      } else if (result.announcement) {
        setAnnouncements((prev) => [
          result.announcement as Announcement,
          ...prev,
        ]);
        setMessage("");
        setType("info");
        setExpiresAt("");
        toast.success("Announcement created");
      }
    });
  }

  function handleToggle(id: string, currentlyActive: boolean) {
    startTransition(async () => {
      const result = await toggleAnnouncementActive(id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, isActive: !currentlyActive } : a
          )
        );
        toast.success(currentlyActive ? "Announcement deactivated" : "Announcement activated");
      }
    });
  }

  const previewClasses = typeClasses[type] ?? typeClasses.info;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="bg-white dark:bg-[#13131A] border border-border rounded-xl p-5 space-y-4"
      >
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Plus className="size-4" />
          New Announcement
        </h2>

        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Announcement message..."
            disabled={pending}
            rows={3}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 resize-y"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={pending}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              {ANNOUNCEMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Expires At (optional)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={pending}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Preview */}
        {message.trim() && (
          <div className={`rounded-lg border px-4 py-3 text-sm ${previewClasses}`}>
            <span className="font-medium">Preview: </span>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={pending || !message.trim()}
          className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {pending ? "Creating..." : "Create Announcement"}
        </button>
      </form>

      {/* Announcements list */}
      <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Bell className="size-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground text-sm">
            All Announcements
          </h2>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : announcements.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No announcements yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between px-5 py-4 hover:bg-muted/20 transition-colors gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        typeBadgeClasses[a.type] ?? typeBadgeClasses.info
                      }`}
                    >
                      {a.type}
                    </span>
                    {!a.isActive && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                    {a.expiresAt && (
                      <span className="text-xs text-muted-foreground">
                        Expires: {new Date(a.expiresAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(a.id, a.isActive)}
                  disabled={pending}
                  title={a.isActive ? "Deactivate" : "Activate"}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 shrink-0"
                >
                  {a.isActive ? (
                    <>
                      <ToggleRight className="size-4 text-green-500" />
                      Active
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="size-4 text-muted-foreground" />
                      Inactive
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
