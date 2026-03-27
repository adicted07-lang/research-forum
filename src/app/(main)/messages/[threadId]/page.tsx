import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getMessages, getThreads } from "@/server/actions/messages";
import { MessageThread } from "@/components/hire/message-thread";
import { MessageForm } from "@/components/hire/message-form";
import { UserAvatar } from "@/components/shared/user-avatar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conversation — ResearchHub",
};

interface ThreadPageProps {
  params: Promise<{ threadId: string }>;
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { threadId } = await params;

  const session = await auth();
  if (!session?.user?.id) notFound();

  const currentUserId = session.user.id;

  let messages: Awaited<ReturnType<typeof getMessages>> = [];
  try {
    messages = await getMessages(threadId);
  } catch {
    // DB not available
  }

  // Get thread info from threads list to find other participant
  let otherName = "User";
  let otherUsername: string | null = null;
  let otherImage: string | null = null;

  try {
    const threads = await getThreads();
    const thread = threads.find((t) => t.id === threadId);
    if (thread) {
      const isParticipant1 = thread.participant1 === currentUserId;
      const other = isParticipant1 ? thread.user2 : thread.user1;
      otherName = other.companyName ?? other.name ?? other.username ?? "User";
      otherUsername = other.username ?? null;
      otherImage = other.image ?? null;
    }
  } catch {
    // fallback
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6">
      <div className="bg-white border border-border-light rounded-lg flex flex-col h-[calc(100vh-160px)] dark:bg-surface-dark dark:border-border-dark-light">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-light dark:border-border-dark-light">
          <Link
            href="/messages"
            className="text-text-tertiary hover:text-text-primary dark:text-text-dark-tertiary dark:hover:text-text-dark-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <UserAvatar name={otherName} src={otherImage} size="md" />
          <div>
            <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
              {otherName}
            </p>
            {otherUsername && (
              <Link
                href={`/@${otherUsername}`}
                className="text-xs text-primary hover:underline"
              >
                @{otherUsername}
              </Link>
            )}
          </div>
        </div>

        {/* Messages */}
        <MessageThread messages={messages} currentUserId={currentUserId} />

        {/* Message input */}
        <MessageForm threadId={threadId} />
      </div>
    </div>
  );
}
