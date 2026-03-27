"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { getTags, createTag, deleteTag } from "@/server/actions/admin";
import { Trash2, Plus, Tag } from "lucide-react";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export function TagManager() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    getTags().then((result) => {
      setTags(result as TagItem[]);
      setLoading(false);
    });
  }, []);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newTagName.trim();
    if (!name) return;

    startTransition(async () => {
      const result = await createTag(name);
      if ("error" in result) {
        toast.error(result.error);
      } else if (result.tag) {
        setTags((prev) => [...prev, result.tag as TagItem].sort((a, b) => a.name.localeCompare(b.name)));
        setNewTagName("");
        toast.success("Tag created");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    startTransition(async () => {
      const result = await deleteTag(id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setTags((prev) => prev.filter((t) => t.id !== id));
        toast.success(`"${name}" deleted`);
      }
    });
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* Add tag form */}
      <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="size-4" />
          Add New Tag
        </h2>
        <form onSubmit={handleCreate} className="flex items-center gap-3">
          <input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Tag name..."
            disabled={pending}
            className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 flex-1 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={pending || !newTagName.trim()}
            className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </div>

      {/* Tag list */}
      <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Tag className="size-4" />
            Tags
          </h2>
          <span className="text-sm text-muted-foreground">{tags.length} total</span>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : tags.length === 0 ? (
          <div className="px-5 py-10 text-center text-muted-foreground text-sm">
            No tags yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {tags.map((tag) => (
              <li
                key={tag.id}
                className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{tag.name}</p>
                  <p className="text-xs text-muted-foreground">{tag.slug}</p>
                </div>
                <button
                  onClick={() => handleDelete(tag.id, tag.name)}
                  disabled={pending}
                  className="text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50 p-1 rounded-md hover:bg-destructive/10"
                  title={`Delete "${tag.name}"`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
