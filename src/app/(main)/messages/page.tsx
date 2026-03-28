import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { SectionHeader } from "@/components/shared/section-header";
import { EmptyState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { getThreads } from "@/server/actions/messages";
import { auth } from "@/auth";
import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages — ResearchHub",
  description: "Your conversations on ResearchHub.",
};

function formatTime(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const currentUserId = session.user.id;

  let threads: Awaited<ReturnType<typeof getThreads>> = [];
  try {
    threads = await getThreads();
  } catch {
    // DB not available
  }

  return (
    <PageLayout>
      <SectionHeader title="Messages" />

      {threads.length > 0 ? (
        <div className="space-y-2">
          {threads.map((thread: any) => {
            const isParticipant1 = thread.participant1 === currentUserId;
            const other = isParticipant1 ? thread.user2 : thread.user1;
            const otherName =
              other.companyName ?? other.name ?? other.username ?? "User";
            const latestMessage = thread.messages[0];

            return (
              <Link
                key={thread.id}
                href={`/messages/${thread.id}`}
                className="block bg-white border border-border-light rounded-lg p-4 hover:border-primary/40 hover:shadow-sm transition-all dark:bg-surface-dark dark:border-border-dark-light"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar name={otherName} src={other.image} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
                        {otherName}
                      </span>
                      {latestMessage && (
                        <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary shrink-0">
                          {formatTime(latestMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {other.username && (
                      <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
                        @{other.username}
                      </p>
                    )}
                    {latestMessage && (
                      <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1 line-clamp-1">
                        {latestMessage.senderId === currentUserId ? "You: " : ""}
                        {latestMessage.body}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No messages yet"
          description="Start a conversation by contacting a researcher or company."
          icon={<MessageSquare className="w-12 h-12" />}
        />
      )}
    </PageLayout>
  );
}
