import type { Metadata } from "next";
import { getPendingReports } from "@/server/actions/reports";
import { ReportActions } from "@/components/admin/report-actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reports — Admin — T.I.E",
};

export default async function AdminReportsPage() {
  const result = await getPendingReports();

  if ("error" in result) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Reported Content
        </h1>
        <p className="text-muted-foreground mb-6">
          Review and resolve user-submitted reports.
        </p>
        <div className="text-center py-12 text-muted-foreground">
          Failed to load reports.
        </div>
      </div>
    );
  }

  const { reports } = result;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Reported Content
      </h1>
      <p className="text-muted-foreground mb-6">
        Review and resolve user-submitted reports.
      </p>

      <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Reporter
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Target Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Target ID
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Reason
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No pending reports.
                  </td>
                </tr>
              ) : (
                reports.map((report: any) => (
                  <tr
                    key={report.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-foreground truncate">
                          {report.reporter.name ?? "—"}
                        </span>
                        {report.reporter.username && (
                          <span className="text-xs text-muted-foreground">
                            @{report.reporter.username}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {report.targetType}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {report.targetId.slice(0, 12)}…
                    </td>
                    <td className="px-4 py-3 text-foreground max-w-xs">
                      <span className="line-clamp-2">{report.reason}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <ReportActions reportId={report.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
