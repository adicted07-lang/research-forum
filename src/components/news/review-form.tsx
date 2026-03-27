"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/server/actions/article-reviews";

interface ReviewFormProps {
  articleId: string;
}

export function ReviewForm({ articleId }: ReviewFormProps) {
  const [decision, setDecision] = useState<"approve" | "revise" | "reject">("approve");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if ((decision === "revise" || decision === "reject") && !feedback.trim()) {
      setMessage({ type: "error", text: "Feedback is required for revisions and rejections" });
      return;
    }
    startTransition(async () => {
      const result = await submitReview(articleId, decision, feedback);
      if ("success" in result) {
        setMessage({ type: "success", text: `Review submitted — article ${decision === "approve" ? "approved" : decision === "reject" ? "rejected" : "sent back for revisions"}` });
      } else {
        setMessage({ type: "error", text: result.error ?? "Something went wrong" });
      }
    });
  }

  const options = [
    { value: "approve", label: "Approve", desc: "Publish this article" },
    { value: "revise", label: "Request Revisions", desc: "Send back with feedback" },
    { value: "reject", label: "Reject", desc: "Decline this submission" },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              decision === opt.value
                ? "border-primary bg-primary/5"
                : "border-border dark:border-border-dark hover:bg-surface dark:hover:bg-surface-dark"
            }`}
          >
            <input
              type="radio"
              name="decision"
              value={opt.value}
              checked={decision === opt.value}
              onChange={() => setDecision(opt.value)}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">{opt.label}</p>
              <p className="text-xs text-text-tertiary">{opt.desc}</p>
            </div>
          </label>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1">
          Feedback {decision !== "approve" && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          placeholder={decision === "approve" ? "Optional comments..." : "Explain what needs to change..."}
          className="w-full px-3 py-2 text-sm rounded-md border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-text-primary dark:text-text-dark-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-md text-sm font-medium ${
          message.type === "success"
            ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
