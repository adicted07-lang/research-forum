import { getExportCounts } from "@/server/actions/admin-export";
import { Download, Users, HelpCircle, Newspaper } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Data Export — Admin — The Intellectual Exchange",
};

const EXPORT_TYPES = [
  {
    type: "users",
    label: "Users",
    description: "All active user accounts with role, IC, and join date.",
    icon: Users,
  },
  {
    type: "questions",
    label: "Questions",
    description: "All forum questions with vote counts, views, and answers.",
    icon: HelpCircle,
  },
  {
    type: "articles",
    label: "Articles",
    description: "All published and draft articles with status and category.",
    icon: Newspaper,
  },
] as const;

export default async function AdminExportPage() {
  const counts = await getExportCounts();

  const countMap: Record<string, number | undefined> = {
    users: counts?.users,
    questions: counts?.questions,
    articles: counts?.articles,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Data Export</h1>
      <p className="text-muted-foreground mb-6">
        Download platform data as CSV files.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {EXPORT_TYPES.map(({ type, label, description, icon: Icon }) => (
          <div
            key={type}
            className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Icon className="size-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{label}</h2>
                {countMap[type] !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    {countMap[type]?.toLocaleString()} records
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground flex-1">{description}</p>
            <Link
              href={`/api/admin/export/${type}`}
              className={buttonVariants({ variant: "outline" }) + " w-full"}
            >
              <Download className="size-4 mr-2" />
              Download CSV
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
