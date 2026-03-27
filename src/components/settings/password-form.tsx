"use client";

import { useState } from "react";
import { changePassword } from "@/server/actions/profiles";

export function PasswordForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const result = await changePassword(formData);
    setPending(false);
    if (result && "error" in result) {
      setMessage({ type: "error", text: result.error as string });
    } else {
      setMessage({ type: "success", text: "Password changed successfully" });
      (e.target as HTMLFormElement).reset();
    }
  }

  const inputClass =
    "w-full px-3 py-2 text-sm rounded-md border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";
  const labelClass = "block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {message && (
        <div
          className={`px-4 py-3 rounded-md text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="oldPassword">Current password</label>
        <input
          id="oldPassword"
          name="oldPassword"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="newPassword">New password</label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
        <p className="text-xs text-text-tertiary mt-1">Must be at least 8 characters</p>
      </div>

      <div>
        <label className={labelClass} htmlFor="confirmPassword">Confirm new password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {pending ? "Updating..." : "Update password"}
        </button>
      </div>
    </form>
  );
}
