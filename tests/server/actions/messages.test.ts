import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    follow: { findUnique: vi.fn(), count: vi.fn() },
    messageThread: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn() },
    message: { create: vi.fn() },
    user: { findUnique: vi.fn() },
    notification: { create: vi.fn(), findFirst: vi.fn() },
  },
}));
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/server/actions/follows", () => ({ isFollowing: vi.fn(), isMutualFollow: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { isFollowing, isMutualFollow } from "@/server/actions/follows";

describe("startDirectMessage", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns error when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const { startDirectMessage } = await import("@/server/actions/messages");
    const result = await startDirectMessage("user2", "hello");
    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("returns error when messaging yourself", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as any);
    const { startDirectMessage } = await import("@/server/actions/messages");
    const result = await startDirectMessage("user1", "hello");
    expect(result).toEqual({ error: "Cannot message yourself" });
  });

  it("returns error when not following recipient", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as any);
    vi.mocked(isFollowing).mockResolvedValue(false);
    const { startDirectMessage } = await import("@/server/actions/messages");
    const result = await startDirectMessage("user2", "hello");
    expect(result).toEqual({ error: "You must follow this user to message them" });
  });

  it("returns error when daily limit reached for non-mutual follow", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as any);
    vi.mocked(isFollowing).mockResolvedValue(true);
    vi.mocked(isMutualFollow).mockResolvedValue(false);
    vi.mocked(db.messageThread.findFirst).mockResolvedValue(null);
    vi.mocked(db.messageThread.count).mockResolvedValue(5);
    const { startDirectMessage } = await import("@/server/actions/messages");
    const result = await startDirectMessage("user2", "hello");
    expect(result).toEqual({ error: "Daily message request limit reached (5/day)" });
  });

  it("creates thread with REQUEST status for non-mutual follow", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as any);
    vi.mocked(isFollowing).mockResolvedValue(true);
    vi.mocked(isMutualFollow).mockResolvedValue(false);
    vi.mocked(db.messageThread.findFirst).mockResolvedValue(null);
    vi.mocked(db.messageThread.count).mockResolvedValue(0);
    vi.mocked(db.messageThread.create).mockResolvedValue({ id: "thread1" } as any);
    vi.mocked(db.message.create).mockResolvedValue({ id: "msg1" } as any);
    vi.mocked(db.user.findUnique).mockResolvedValue({ name: "User One", email: "u@test.com" } as any);

    const { startDirectMessage } = await import("@/server/actions/messages");
    const result = await startDirectMessage("user2", "hello");
    expect(result).toHaveProperty("success", true);
    expect(db.messageThread.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: "DIRECT", status: "REQUEST" }),
      })
    );
  });

  it("creates thread with ACTIVE status for mutual follow", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user1" } } as any);
    vi.mocked(isFollowing).mockResolvedValue(true);
    vi.mocked(isMutualFollow).mockResolvedValue(true);
    vi.mocked(db.messageThread.findFirst).mockResolvedValue(null);
    vi.mocked(db.messageThread.create).mockResolvedValue({ id: "thread1" } as any);
    vi.mocked(db.message.create).mockResolvedValue({ id: "msg1" } as any);
    vi.mocked(db.user.findUnique).mockResolvedValue({ name: "User One", email: "u@test.com" } as any);

    const { startDirectMessage } = await import("@/server/actions/messages");
    const result = await startDirectMessage("user2", "hello");
    expect(db.messageThread.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: "DIRECT", status: "ACTIVE" }),
      })
    );
  });
});
