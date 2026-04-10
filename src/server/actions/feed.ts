"use server";

import { auth } from "@/auth";
import { getFeedItems, type FeedResponse } from "@/lib/feed";

export async function loadMoreFeedItems(page: number): Promise<FeedResponse> {
  const session = await auth();
  return getFeedItems(page, session?.user?.id);
}
