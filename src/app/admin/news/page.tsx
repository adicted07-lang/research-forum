import type { Metadata } from "next";
import { ModerationQueue } from "@/components/admin/moderation-queue";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News — Admin — ResearchHub",
};

interface NewsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminNewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">The Journal</h1>
      <p className="text-muted-foreground mb-6">
        Review and publish article submissions from community members.
      </p>
      <ModerationQueue page={page} />
    </div>
  );
}
