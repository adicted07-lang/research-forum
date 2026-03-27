"use client";

import { useState, useTransition } from "react";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { updateDocument } from "@/server/actions/projects";

interface DocumentEditorProps {
  docId: string;
  initialContent: string;
  version: number;
}

export function DocumentEditor({ docId, initialContent, version }: DocumentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      const result = await updateDocument(docId, content);
      if ("success" in result) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <div>
      <RichTextEditor content={initialContent} onChange={setContent} placeholder="Start writing..." />
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-5 py-2 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
        <span className="text-xs text-text-tertiary ml-auto">Version {version}</span>
      </div>
    </div>
  );
}
