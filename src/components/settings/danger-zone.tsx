"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { deleteAccount } from "@/server/actions/profiles";

export function DangerZone() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (confirmText !== "DELETE") return;
    setPending(true);
    setError(null);
    const result = await deleteAccount();
    if (result && "error" in result) {
      setError(result.error as string);
      setPending(false);
    } else {
      await signOut({ callbackUrl: "/" });
    }
  }

  return (
    <div className="border border-red-200 dark:border-red-900/40 rounded-xl p-6">
      <h3 className="text-base font-semibold text-red-600 dark:text-red-400 mb-1">
        Delete Account
      </h3>
      <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
        Once you delete your account, there is no going back. Your account will be
        deactivated immediately and permanently deleted after 30 days. Please be certain.
      </p>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 rounded-md border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Delete my account
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">
            Type <span className="font-mono font-bold">DELETE</span> to confirm:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full max-w-xs px-3 py-2 text-sm rounded-md border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text-primary dark:text-text-dark-primary outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all"
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={confirmText !== "DELETE" || pending}
              className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {pending ? "Deleting..." : "Permanently delete account"}
            </button>
            <button
              onClick={() => { setShowConfirm(false); setConfirmText(""); setError(null); }}
              className="px-4 py-2 rounded-md border border-border dark:border-border-dark text-sm font-medium text-text-secondary hover:bg-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
