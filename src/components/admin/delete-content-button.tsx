"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteContent } from "@/server/actions/admin";
import { Trash2 } from "lucide-react";

interface DeleteContentButtonProps {
  type: string;
  id: string;
}

export function DeleteContentButton({ type, id }: DeleteContentButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete this ${type}? This action cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteContent(type, id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(`${type} deleted`);
        router.refresh();
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      className="inline-flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 font-medium transition-colors disabled:opacity-50"
      title={`Delete ${type}`}
    >
      <Trash2 className="size-3" />
      Delete
    </button>
  );
}
