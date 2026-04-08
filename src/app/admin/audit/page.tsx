import type { Metadata } from "next";
import { getAuditLogs } from "@/server/actions/audit";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit Log — Admin — T.I.E",
};

interface AuditPageProps {
  searchParams: Promise<{ action?: string; limit?: string }>;
}

export default async function AdminAuditPage({
  searchParams,
}: AuditPageProps) {
  const params = await searchParams;
  const limit = params.limit ? parseInt(params.limit, 10) : 100;

  const result = await getAuditLogs(limit);

  if ("error" in result) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Audit Log</h1>
        <p className="text-muted-foreground mb-6">
          Track all administrative actions.
        </p>
        <div className="text-center py-12 text-muted-foreground">
          Failed to load audit logs.
        </div>
      </div>
    );
  }

  const { logs } = result;

  // Collect unique action types for filtering
  const actionTypes = Array.from(new Set(logs.map((l: any) => l.action))).sort();
  const filterAction = params.action ?? "";
  const filtered = filterAction
    ? logs.filter((l) => l.action === filterAction)
    : logs;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Audit Log</h1>
      <p className="text-muted-foreground mb-6">
        Track all administrative actions.
      </p>

      {/* Filter */}
      <form method="GET" className="flex items-center gap-3 mb-4 flex-wrap">
        <select
          name="action"
          defaultValue={filterAction}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground"
        >
          <option value="">All actions</option>
          {actionTypes.map((a: any) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
        >
          Filter
        </button>
      </form>

      <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Admin
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Action
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Target
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Details
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                filtered.map((log: any) => (
                  <tr
                    key={log.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-foreground truncate">
                          {log.admin.name ?? "—"}
                        </span>
                        {log.admin.username && (
                          <span className="text-xs text-muted-foreground">
                            @{log.admin.username}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {log.targetType && (
                        <span>
                          {log.targetType}
                          {log.targetId && (
                            <span className="font-mono ml-1">
                              {log.targetId.slice(0, 10)}…
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs">
                      <span className="line-clamp-2 text-xs">
                        {log.details ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
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
