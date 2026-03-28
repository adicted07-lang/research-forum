"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { getRSSSources, addRSSSource, removeRSSSource } from "@/server/actions/rss";
import { Rss, Plus, Trash2, RefreshCw, Clock } from "lucide-react";

interface RSSSource {
  id: string;
  name: string;
  url: string;
  pollInterval: number;
  lastPolledAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

const POLL_INTERVAL_OPTIONS = [
  { value: 900, label: "15 minutes" },
  { value: 1800, label: "30 minutes" },
  { value: 3600, label: "1 hour" },
  { value: 7200, label: "2 hours" },
  { value: 21600, label: "6 hours" },
  { value: 86400, label: "24 hours" },
];

export function RSSManager() {
  const [sources, setSources] = useState<RSSSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [pollInterval, setPollInterval] = useState(3600);
  const [polling, setPolling] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    getRSSSources().then((result) => {
      setSources((result.sources as RSSSource[]) ?? []);
      setLoading(false);
    });
  }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim()) {
      toast.error("Name and URL are required");
      return;
    }

    startTransition(async () => {
      const result = await addRSSSource(name.trim(), url.trim(), pollInterval);
      if ("error" in result) {
        toast.error(result.error);
      } else if (result.source) {
        setSources((prev) => [result.source as RSSSource, ...prev]);
        setName("");
        setUrl("");
        setPollInterval(3600);
        toast.success("RSS source added");
      }
    });
  }

  function handleRemove(id: string, sourceName: string) {
    startTransition(async () => {
      const result = await removeRSSSource(id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setSources((prev) => prev.filter((s) => s.id !== id));
        toast.success(`"${sourceName}" removed`);
      }
    });
  }

  async function handlePollNow() {
    setPolling(true);
    try {
      const res = await fetch("/api/cron/rss-poll", { method: "GET" });
      if (res.ok) {
        toast.success("RSS poll triggered");
        // Reload sources to refresh lastPolledAt
        const result = await getRSSSources();
        setSources((result.sources as RSSSource[]) ?? []);
      } else {
        toast.error("Failed to trigger poll");
      }
    } catch {
      toast.error("Failed to trigger poll");
    } finally {
      setPolling(false);
    }
  }

  function formatInterval(seconds: number): string {
    if (seconds < 3600) return `${seconds / 60}m`;
    if (seconds < 86400) return `${seconds / 3600}h`;
    return `${seconds / 86400}d`;
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Add Source form */}
      <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plus className="size-4" />
          Add RSS Source
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Source name (e.g. Nature News)"
            disabled={pending}
            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Feed URL (e.g. https://feeds.nature.com/...)"
            disabled={pending}
            type="url"
            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          <div className="flex items-center gap-3">
            <select
              value={pollInterval}
              onChange={(e) => setPollInterval(Number(e.target.value))}
              disabled={pending}
              className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              {POLL_INTERVAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Poll every {opt.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={pending || !name.trim() || !url.trim()}
              className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Sources list */}
      <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Rss className="size-4" />
            Sources
            <span className="text-sm font-normal text-muted-foreground">
              ({sources.length})
            </span>
          </h2>
          <button
            onClick={handlePollNow}
            disabled={polling}
            className="text-sm px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${polling ? "animate-spin" : ""}`} />
            Poll Now
          </button>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : sources.length === 0 ? (
          <div className="px-5 py-10 text-center text-muted-foreground text-sm">
            No RSS sources yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {sources.map((source) => (
              <li
                key={source.id}
                className="flex items-start justify-between px-5 py-4 hover:bg-muted/20 transition-colors gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {source.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {source.url}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      Every {formatInterval(source.pollInterval)}
                    </span>
                    {source.lastPolledAt && (
                      <span className="text-xs text-muted-foreground">
                        Last polled:{" "}
                        {new Date(source.lastPolledAt).toLocaleString()}
                      </span>
                    )}
                    {!source.lastPolledAt && (
                      <span className="text-xs text-muted-foreground italic">
                        Never polled
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(source.id, source.name)}
                  disabled={pending}
                  className="text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50 p-1 rounded-md hover:bg-destructive/10 shrink-0"
                  title={`Remove "${source.name}"`}
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
