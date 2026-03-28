"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { banUser } from "@/server/actions/bans";

interface BanButtonProps {
  userId: string;
}

export function BanButton({ userId }: BanButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleBan() {
    startTransition(async () => {
      const result = await banUser(userId, "Flagged by spam detection");
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("User banned");
        router.refresh();
      }
    });
  }

  return (
    <button
      onClick={handleBan}
      disabled={pending}
      className="text-xs px-2 py-1 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50 font-medium"
    >
      Ban
    </button>
  );
}
