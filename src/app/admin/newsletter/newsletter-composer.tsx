"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { sendNewsletter, getSubscriberCounts } from "@/server/actions/newsletter";
import { Mail, Send, Eye } from "lucide-react";

const NEWSLETTER_TYPES = [
  {
    value: "weekly_digest",
    label: "Weekly Digest",
    description: "Weekly summary of top content",
  },
  {
    value: "product_updates",
    label: "Product Updates",
    description: "Platform news and feature announcements",
  },
  {
    value: "research_highlights",
    label: "Research Highlights",
    description: "Curated research articles and papers",
  },
];

export function NewsletterComposer() {
  const [type, setType] = useState("weekly_digest");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [subscriberCounts, setSubscriberCounts] = useState<Record<string, number>>({});
  const [countsLoaded, setCountsLoaded] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    getSubscriberCounts().then((result) => {
      if ("counts" in result && result.counts) {
        setSubscriberCounts(result.counts);
      }
      setCountsLoaded(true);
    });
  }, []);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and body are required");
      return;
    }

    startTransition(async () => {
      const result = await sendNewsletter(type, subject, body);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(`Newsletter sent to ${result.sent} subscribers`);
        setSubject("");
        setBody("");
        setShowPreview(false);
      }
    });
  }

  const selectedType = NEWSLETTER_TYPES.find((t) => t.value === type);
  const count = subscriberCounts[type] ?? 0;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Type selector with subscriber counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {NEWSLETTER_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`text-left p-4 rounded-xl border transition-colors ${
              type === t.value
                ? "border-primary bg-primary/5"
                : "border-border bg-white dark:bg-[#13131A] hover:bg-muted/40"
            }`}
          >
            <p className="text-sm font-semibold text-foreground">{t.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
            <p className="text-xs font-medium text-primary mt-2 flex items-center gap-1">
              <Mail className="size-3" />
              {countsLoaded ? (
                <>{subscriberCounts[t.value] ?? 0} subscribers</>
              ) : (
                "..."
              )}
            </p>
          </button>
        ))}
      </div>

      {/* Compose form */}
      <form
        onSubmit={handleSend}
        className="bg-white dark:bg-[#13131A] border border-border rounded-xl p-5 space-y-4"
      >
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Send className="size-4" />
          Compose — {selectedType?.label}
        </h2>

        {/* Subject */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line..."
            disabled={pending}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </div>

        {/* Body */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
            Body (HTML supported)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your newsletter content here..."
            disabled={pending}
            rows={12}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 resize-y font-mono"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setShowPreview((p) => !p)}
            disabled={!body.trim()}
            className="text-sm px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Eye className="size-4" />
            {showPreview ? "Hide Preview" : "Preview"}
          </button>
          <button
            type="submit"
            disabled={pending || !subject.trim() || !body.trim()}
            className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="size-4" />
            {pending ? "Sending..." : `Send to ${count} subscribers`}
          </button>
        </div>
      </form>

      {/* Preview */}
      {showPreview && body.trim() && (
        <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <Eye className="size-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground text-sm">
              Email Preview
            </h2>
          </div>
          <div className="p-5">
            <div className="bg-muted/30 rounded-lg p-4 mb-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                Subject
              </p>
              <p className="text-sm font-semibold text-foreground">
                {subject || "(no subject)"}
              </p>
            </div>
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
