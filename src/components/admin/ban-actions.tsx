"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { banUser, suspendUser, unbanUser } from "@/server/actions/bans";

interface BanActionsProps {
  userId: string;
  isBanned: boolean;
  suspendedUntil: Date | null;
}

export function BanActions({ userId, isBanned, suspendedUntil }: BanActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [banReason, setBanReason] = useState("");
  const [suspendDays, setSuspendDays] = useState("3");
  const [suspendReason, setSuspendReason] = useState("");
  const [mode, setMode] = useState<"idle" | "ban" | "suspend">("idle");

  const isSuspended =
    suspendedUntil != null && new Date(suspendedUntil) > new Date();
  const isRestricted = isBanned || isSuspended;

  function handleUnban() {
    startTransition(async () => {
      const result = await unbanUser(userId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("User unbanned / unsuspended");
        router.refresh();
      }
    });
  }

  function handleBan() {
    if (!banReason.trim()) {
      toast.error("Please enter a ban reason");
      return;
    }
    startTransition(async () => {
      const result = await banUser(userId, banReason);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("User banned");
        setMode("idle");
        router.refresh();
      }
    });
  }

  function handleSuspend() {
    if (!suspendReason.trim()) {
      toast.error("Please enter a suspension reason");
      return;
    }
    startTransition(async () => {
      const result = await suspendUser(userId, suspendReason, parseInt(suspendDays, 10));
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(`User suspended for ${suspendDays} day(s)`);
        setMode("idle");
        router.refresh();
      }
    });
  }

  if (isRestricted) {
    return (
      <button
        onClick={handleUnban}
        disabled={pending}
        className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 transition-colors disabled:opacity-50 font-medium"
      >
        Unban
      </button>
    );
  }

  if (mode === "ban") {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        <input
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          placeholder="Reason…"
          className="text-xs border border-border rounded-md px-2 py-1 bg-background text-foreground w-28 focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
        <button
          onClick={handleBan}
          disabled={pending}
          className="text-xs px-2 py-1 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50 font-medium"
        >
          Confirm
        </button>
        <button
          onClick={() => setMode("idle")}
          disabled={pending}
          className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (mode === "suspend") {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        <input
          value={suspendReason}
          onChange={(e) => setSuspendReason(e.target.value)}
          placeholder="Reason…"
          className="text-xs border border-border rounded-md px-2 py-1 bg-background text-foreground w-28 focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
        <select
          value={suspendDays}
          onChange={(e) => setSuspendDays(e.target.value)}
          className="text-xs border border-border rounded-md px-2 py-1 bg-background text-foreground"
        >
          <option value="1">1 day</option>
          <option value="3">3 days</option>
          <option value="7">7 days</option>
          <option value="14">14 days</option>
          <option value="30">30 days</option>
        </select>
        <button
          onClick={handleSuspend}
          disabled={pending}
          className="text-xs px-2 py-1 rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/20 dark:text-amber-400 transition-colors disabled:opacity-50 font-medium"
        >
          Confirm
        </button>
        <button
          onClick={() => setMode("idle")}
          disabled={pending}
          className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => setMode("ban")}
        disabled={pending}
        className="text-xs px-2 py-1 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50 font-medium"
      >
        Ban
      </button>
      <button
        onClick={() => setMode("suspend")}
        disabled={pending}
        className="text-xs px-2 py-1 rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/20 dark:text-amber-400 transition-colors disabled:opacity-50 font-medium"
      >
        Suspend
      </button>
    </div>
  );
}
