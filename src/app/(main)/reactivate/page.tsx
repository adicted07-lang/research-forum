"use client";

import { useState, useTransition } from "react";
import { reactivateAccount } from "@/server/actions/profiles";
import { PageLayout } from "@/components/layout/page-layout";

export default function ReactivatePage() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await reactivateAccount(email);
      if ("success" in result) {
        setMessage({ type: "success", text: "Account reactivated! You can now log in." });
      } else {
        setMessage({ type: "error", text: result.error ?? "Something went wrong" });
      }
    });
  }

  return (
    <PageLayout>
      <div className="max-w-md mx-auto mt-16">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
          Reactivate Your Account
        </h1>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-6">
          If you deleted your account within the last 30 days, you can reactivate it here.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2 text-sm rounded-md border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text-primary dark:text-text-dark-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

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

          <button
            type="submit"
            disabled={isPending}
            className="w-full px-4 py-2.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "Reactivating..." : "Reactivate Account"}
          </button>
        </form>
      </div>
    </PageLayout>
  );
}
