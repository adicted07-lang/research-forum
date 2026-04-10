import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: vi.fn() },
    skillEndorsement: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    notification: { create: vi.fn(), findFirst: vi.fn() },
    badge: { upsert: vi.fn() },
  },
}));

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/server/actions/points", () => ({
  awardPoints: vi.fn(),
  deductPoints: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { db } from "@/lib/db";
import { auth } from "@/auth";

describe("normalizeSkill", () => {
  it("lowercases and trims skill strings", async () => {
    const { normalizeSkill } = await import("@/server/actions/endorsements");
    expect(normalizeSkill("Conjoint Analysis")).toBe("conjoint-analysis");
    expect(normalizeSkill("  UX Research  ")).toBe("ux-research");
    expect(normalizeSkill("AI-in-Research")).toBe("ai-in-research");
  });
});

describe("toggleEndorsement", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { toggleEndorsement } = await import("@/server/actions/endorsements");
    const result = await toggleEndorsement("user2", "survey-design");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when endorsing yourself", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as any);
    const { toggleEndorsement } = await import("@/server/actions/endorsements");
    const result = await toggleEndorsement("user1", "survey-design");
    expect(result).toEqual({ error: "Cannot endorse yourself" });
  });

  it("returns error when skill not in endorsee expertise", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as any);
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "user2", expertise: ["conjoint-analysis", "pricing-research"],
    } as any);
    const { toggleEndorsement } = await import("@/server/actions/endorsements");
    const result = await toggleEndorsement("user2", "nonexistent-skill");
    expect(result).toEqual({ error: "Skill not found on this profile" });
  });

  it("creates endorsement when none exists", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as any);
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "user2", expertise: ["survey-design"], username: "user2",
    } as any);
    vi.mocked(db.skillEndorsement.findUnique).mockResolvedValue(null);
    vi.mocked(db.skillEndorsement.create).mockResolvedValue({ id: "e1" } as any);
    vi.mocked(db.notification.findFirst).mockResolvedValue(null);
    vi.mocked(db.skillEndorsement.groupBy).mockResolvedValue([]);

    const { toggleEndorsement } = await import("@/server/actions/endorsements");
    const result = await toggleEndorsement("user2", "survey-design");
    expect(result).toEqual({ success: true, endorsed: true });
    expect(db.skillEndorsement.create).toHaveBeenCalledOnce();
  });

  it("deletes endorsement when one exists", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as any);
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "user2", expertise: ["survey-design"], username: "user2",
    } as any);
    vi.mocked(db.skillEndorsement.findUnique).mockResolvedValue({ id: "e1" } as any);
    vi.mocked(db.skillEndorsement.delete).mockResolvedValue({ id: "e1" } as any);

    const { toggleEndorsement } = await import("@/server/actions/endorsements");
    const result = await toggleEndorsement("user2", "survey-design");
    expect(result).toEqual({ success: true, endorsed: false });
    expect(db.skillEndorsement.delete).toHaveBeenCalledOnce();
  });
});
