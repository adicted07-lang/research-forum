"use client";

import { useState } from "react";

export function WidgetAskForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/widget/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });

      if (res.ok) {
        setSuccess(true);
        // Notify parent window
        window.parent.postMessage({ type: "tie-question-posted" }, "*");
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <p className="text-2xl mb-2">✓</p>
        <p className="text-gray-900 font-semibold">Question posted!</p>
        <p className="text-gray-500 text-sm mt-1">
          Researchers will see it on{" "}
          <a href="https://theintellectualexchange.com/forum" target="_blank" rel="noopener" className="text-[#b8461f]">
            the forum
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your question</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Best approach for sizing the EV battery market?"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b8461f] focus:border-transparent"
          required
          maxLength={200}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Context (optional)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add any extra context..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b8461f] focus:border-transparent resize-none"
          maxLength={1000}
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !title.trim()}
        className="w-full py-2.5 bg-[#b8461f] text-white rounded-lg font-semibold text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Posting..." : "Post Question"}
      </button>
      <p className="text-xs text-gray-400 text-center">
        Powered by{" "}
        <a href="https://theintellectualexchange.com" target="_blank" rel="noopener" className="text-[#b8461f]">
          The Intellectual Exchange
        </a>
      </p>
    </form>
  );
}
