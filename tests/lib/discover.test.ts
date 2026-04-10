import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    user: { findMany: vi.fn(), findUnique: vi.fn() },
    follow: { findMany: vi.fn() },
    question: { findMany: vi.fn() },
    $queryRaw: vi.fn(),
  },
}));
vi.mock("@/auth", () => ({ auth: vi.fn() }));

import { db } from "@/lib/db";
import { auth } from "@/auth";

describe("getSuggestedResearchers", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns researchers sorted by points when not logged in", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    vi.mocked(db.user.findMany).mockResolvedValue([
      { id: "r1", name: "A", username: "a", image: null, expertise: ["x"], points: 100, availability: null, _count: { followers: 5 } },
      { id: "r2", name: "B", username: "b", image: null, expertise: ["y"], points: 200, availability: null, _count: { followers: 3 } },
    ] as any);

    const { getSuggestedResearchers } = await import("@/lib/discover");
    const result = await getSuggestedResearchers(10);
    expect(result[0].id).toBe("r2");
    expect(result[0].isFollowing).toBe(false);
  });

  it("excludes self and already-followed users", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "me" } } as any);
    vi.mocked(db.user.findUnique).mockResolvedValue({ expertise: ["x"] } as any);
    vi.mocked(db.follow.findMany).mockImplementation(((args: any) => {
      if (args?.where?.followerId === "me") return Promise.resolve([{ followingId: "r1" }]);
      return Promise.resolve([]);
    }) as any);
    vi.mocked(db.question.findMany).mockResolvedValue([]);
    vi.mocked(db.user.findMany).mockResolvedValue([
      { id: "r2", name: "B", username: "b", image: null, expertise: ["x"], points: 50, availability: null, _count: { followers: 2 } },
    ] as any);

    const { getSuggestedResearchers } = await import("@/lib/discover");
    const result = await getSuggestedResearchers(10);
    expect(result.every(r => r.id !== "me" && r.id !== "r1")).toBe(true);
  });
});

describe("getTopExpertiseTags", () => {
  it("returns tags from raw query", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    vi.mocked(db.$queryRaw).mockResolvedValue([
      { tag: "survey-design", count: BigInt(10) },
      { tag: "data-analytics", count: BigInt(8) },
    ] as any);

    const { getTopExpertiseTags } = await import("@/lib/discover");
    const result = await getTopExpertiseTags(5);
    expect(result).toEqual(["survey-design", "data-analytics"]);
  });
});
