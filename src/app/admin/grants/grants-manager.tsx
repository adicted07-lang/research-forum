"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { createGrant, getAllGrants, toggleGrantActive } from "@/server/actions/grants";
import { Plus, DollarSign, ToggleLeft, ToggleRight, ExternalLink } from "lucide-react";

interface Grant {
  id: string;
  title: string;
  slug: string;
  description: string;
  funder: string;
  fundingRange: string | null;
  deadline: Date | null;
  eligibility: string | null;
  applicationUrl: string | null;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
}

export function GrantsManager() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [funder, setFunder] = useState("");
  const [fundingRange, setFundingRange] = useState("");
  const [deadline, setDeadline] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    getAllGrants().then((result) => {
      setGrants((result.grants as Grant[]) ?? []);
      setLoading(false);
    });
  }, []);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !funder.trim()) {
      toast.error("Title, description, and funder are required");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("title", title.trim());
      formData.set("description", description.trim());
      formData.set("funder", funder.trim());
      if (fundingRange.trim()) formData.set("fundingRange", fundingRange.trim());
      if (deadline) formData.set("deadline", deadline);
      if (eligibility.trim()) formData.set("eligibility", eligibility.trim());
      if (applicationUrl.trim()) formData.set("applicationUrl", applicationUrl.trim());
      if (tags.trim()) formData.set("tags", tags.trim());

      const result = await createGrant(formData);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Grant created");
        setTitle("");
        setDescription("");
        setFunder("");
        setFundingRange("");
        setDeadline("");
        setEligibility("");
        setApplicationUrl("");
        setTags("");
        setShowForm(false);
        // Reload grants
        const updated = await getAllGrants();
        setGrants((updated.grants as Grant[]) ?? []);
      }
    });
  }

  function handleToggle(id: string, currentlyActive: boolean) {
    startTransition(async () => {
      const result = await toggleGrantActive(id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setGrants((prev) =>
          prev.map((g) => (g.id === id ? { ...g, isActive: !currentlyActive } : g))
        );
        toast.success(currentlyActive ? "Grant deactivated" : "Grant activated");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Add Grant button */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {grants.length} grant{grants.length !== 1 ? "s" : ""} total
        </span>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="size-4" />
          {showForm ? "Cancel" : "Add Grant"}
        </button>
      </div>

      {/* Add Grant form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-[#13131A] border border-border rounded-xl p-5 space-y-4"
        >
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Plus className="size-4" />
            New Grant
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Grant title"
                disabled={pending}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Funder *
              </label>
              <input
                value={funder}
                onChange={(e) => setFunder(e.target.value)}
                placeholder="Funding organization"
                disabled={pending}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Grant description"
              disabled={pending}
              rows={4}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Funding Range
              </label>
              <input
                value={fundingRange}
                onChange={(e) => setFundingRange(e.target.value)}
                placeholder="e.g. $10,000 – $50,000"
                disabled={pending}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={pending}
                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Eligibility
            </label>
            <input
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              placeholder="Who can apply?"
              disabled={pending}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Application URL
            </label>
            <input
              type="url"
              value={applicationUrl}
              onChange={(e) => setApplicationUrl(e.target.value)}
              placeholder="https://..."
              disabled={pending}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
              Tags (comma-separated)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. biology, climate, early-career"
              disabled={pending}
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={
                pending ||
                !title.trim() ||
                !description.trim() ||
                !funder.trim()
              }
              className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {pending ? "Creating..." : "Create Grant"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Grants list */}
      <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="px-5 py-10 text-center text-muted-foreground text-sm">
            Loading...
          </div>
        ) : grants.length === 0 ? (
          <div className="px-5 py-10 text-center text-muted-foreground text-sm">
            No grants yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {grants.map((grant) => (
              <li
                key={grant.id}
                className="flex items-start justify-between px-5 py-4 hover:bg-muted/20 transition-colors gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-foreground">
                      {grant.title}
                    </p>
                    {!grant.isActive && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                    {grant.isActive && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {grant.funder}
                    {grant.fundingRange && ` · ${grant.fundingRange}`}
                    {grant.deadline && (
                      <>
                        {" "}
                        · Due{" "}
                        {new Date(grant.deadline).toLocaleDateString()}
                      </>
                    )}
                  </p>
                  {grant.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      {grant.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {grant.applicationUrl && (
                    <a
                      href={grant.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                      title="Open application URL"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleToggle(grant.id, grant.isActive)}
                    disabled={pending}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
                    title={grant.isActive ? "Deactivate" : "Activate"}
                  >
                    {grant.isActive ? (
                      <>
                        <ToggleRight className="size-4 text-green-500" />
                        Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="size-4 text-muted-foreground" />
                        Inactive
                      </>
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
