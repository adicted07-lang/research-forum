import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";

export const dynamic = "force-dynamic";
import { ForumSidebar } from "@/components/forum/forum-sidebar";
import { QuestionList } from "@/components/forum/question-list";
import { AnimatedTooltipGroup, type TooltipItem } from "@/components/ui/animated-tooltip";

const communityMembers: TooltipItem[] = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    designation: "ML Researcher",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Prof. James Okafor",
    designation: "Climate Scientist",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Dr. Emily Torres",
    designation: "Neuroscientist",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "Dr. Marcus Webb",
    designation: "Bioinformatician",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
  },
  {
    id: 5,
    name: "Dr. Priya Sharma",
    designation: "Genomics Expert",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face",
  },
];

export const metadata: Metadata = {
  title: "Exchange Floor — ResearchHub",
};

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const domain = typeof params.domain === "string" ? params.domain : undefined;
  const industry = typeof params.industry === "string" ? params.industry : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;

  return (
    <PageLayout sidebar={<ForumSidebar />}>
      <QuestionList category={category} researchDomain={domain} industry={industry} sort={sort} page={page} />
    </PageLayout>
  );
}
