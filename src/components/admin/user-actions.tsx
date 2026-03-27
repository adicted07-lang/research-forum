"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  updateUserRole,
  suspendUser,
  unsuspendUser,
  verifyUser,
} from "@/server/actions/admin";

interface UserActionsProps {
  userId: string;
  currentRole: string;
  isSuspended: boolean;
  isVerified: boolean;
}

const ROLES = ["RESEARCHER", "COMPANY", "MODERATOR", "ADMIN"];

export function UserActions({
  userId,
  currentRole,
  isSuspended,
  isVerified,
}: UserActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState(currentRole);

  function handleRoleChange(newRole: string) {
    setRole(newRole);
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if ("error" in result) {
        toast.error(result.error);
        setRole(currentRole);
      } else {
        toast.success("Role updated");
        router.refresh();
      }
    });
  }

  function handleVerify() {
    startTransition(async () => {
      const result = await verifyUser(userId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("User verified");
        router.refresh();
      }
    });
  }

  function handleSuspend() {
    startTransition(async () => {
      const result = isSuspended
        ? await unsuspendUser(userId)
        : await suspendUser(userId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(isSuspended ? "User unsuspended" : "User suspended");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={role}
        onChange={(e) => handleRoleChange(e.target.value)}
        disabled={pending}
        className="text-xs border border-border rounded-md px-2 py-1 bg-background text-foreground disabled:opacity-50"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      {!isVerified && (
        <button
          onClick={handleVerify}
          disabled={pending}
          className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 font-medium"
        >
          Verify
        </button>
      )}

      <button
        onClick={handleSuspend}
        disabled={pending}
        className={`text-xs px-2 py-1 rounded-md font-medium transition-colors disabled:opacity-50 ${
          isSuspended
            ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400"
            : "bg-destructive/10 text-destructive hover:bg-destructive/20"
        }`}
      >
        {isSuspended ? "Unsuspend" : "Suspend"}
      </button>
    </div>
  );
}
