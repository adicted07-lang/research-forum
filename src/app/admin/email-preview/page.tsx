"use client";

import { useState, useTransition, useEffect } from "react";
import { getEmailPreview, sendTestEmail } from "@/server/actions/email-preview";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

const TEMPLATES = [
  { value: "new-follower", label: "New Follower" },
  { value: "new-answer", label: "New Answer" },
  { value: "application-status", label: "Application Status" },
  { value: "new-message", label: "New Message" },
  { value: "newsletter", label: "Newsletter" },
];

export default function AdminEmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("new-follower");
  const [html, setHtml] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getEmailPreview(selectedTemplate).then(setHtml);
  }, [selectedTemplate]);

  function handleSendTest() {
    setSendStatus("idle");
    startTransition(async () => {
      const result = await sendTestEmail(selectedTemplate);
      setSendStatus("error" in result ? "error" : "success");
      setTimeout(() => setSendStatus("idle"), 3000);
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Email Template Preview
      </h1>
      <p className="text-muted-foreground mb-6">
        Preview and test email templates sent to users.
      </p>

      <div className="flex items-center gap-4 mb-6">
        <select
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
          className="h-8 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
        >
          {TEMPLATES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <Button onClick={handleSendTest} disabled={isPending} variant="outline">
          {isPending ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Send className="size-4 mr-2" />
          )}
          Send Test
        </Button>

        {sendStatus === "success" && (
          <span className="text-sm text-green-600 font-medium">
            Test email sent!
          </span>
        )}
        {sendStatus === "error" && (
          <span className="text-sm text-red-500 font-medium">
            Failed to send.
          </span>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
          <div className="size-3 rounded-full bg-red-400" />
          <div className="size-3 rounded-full bg-yellow-400" />
          <div className="size-3 rounded-full bg-green-400" />
          <span className="ml-2 text-xs text-muted-foreground">
            Preview:{" "}
            {TEMPLATES.find((t) => t.value === selectedTemplate)?.label}
          </span>
        </div>
        <iframe
          srcDoc={html}
          className="w-full h-[600px] border-0 bg-white"
          title="Email preview"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
