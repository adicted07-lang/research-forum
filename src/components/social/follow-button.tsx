"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toggleFollow } from "@/server/actions/follows";

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
}

export function FollowButton({ targetUserId, initialFollowing }: FollowButtonProps) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState(initialFollowing);
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center px-4 py-1.5 rounded-md text-sm font-medium border border-primary text-primary hover:bg-primary-light transition-colors"
      >
        Follow
      </Link>
    );
  }

  // Don't show button if it's the current user
  if (session.user.id === targetUserId) return null;

  async function handleClick() {
    setLoading(true);
    // Optimistic update
    setFollowing((prev) => !prev);
    try {
      const result = await toggleFollow(targetUserId);
      if ("following" in result && typeof result.following === "boolean") {
        setFollowing(result.following);
      } else {
        // Revert on error
        setFollowing((prev) => !prev);
      }
    } catch {
      // Revert on error
      setFollowing((prev) => !prev);
    } finally {
      setLoading(false);
    }
  }

  if (!following) {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center px-4 py-1.5 rounded-md text-sm font-medium border border-primary text-primary hover:bg-primary-light transition-colors disabled:opacity-50"
      >
        Follow
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`inline-flex items-center px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
        hovered
          ? "bg-error text-white border border-error"
          : "bg-primary text-white border border-primary"
      }`}
    >
      {hovered ? "Unfollow" : "Following"}
    </button>
  );
}
