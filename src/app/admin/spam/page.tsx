import type { Metadata } from "next";
import { getSuspiciousAccounts } from "@/server/actions/spam";
import { BanButton } from "@/components/admin/ban-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Spam Detection — Admin — ResearchHub",
};

export default async function AdminSpamPage() {
  const result = await getSuspiciousAccounts();

  if ("error" in result) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Spam Detection
        </h1>
        <p className="text-muted-foreground mb-6">
          Accounts flagged as potentially suspicious.
        </p>
        <div className="text-center py-12 text-muted-foreground">
          Failed to load suspicious accounts.
        </div>
      </div>
    );
  }

  const { accounts } = result;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Spam Detection
      </h1>
      <p className="text-muted-foreground mb-6">
        Accounts created in the last 7 days flagged as suspicious (high post
        volume, excessive links, or multiple reports).
      </p>

      <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Joined
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Posts
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Links
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Reports
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {accounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No suspicious accounts found.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr
                    key={account.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-foreground truncate">
                          {account.name ?? "—"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {account.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(account.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-foreground font-semibold">
                      {account.postCount}
                    </td>
                    <td className="px-4 py-3 text-foreground font-semibold">
                      {account.linkCount}
                    </td>
                    <td className="px-4 py-3 text-foreground font-semibold">
                      {account.reportCount}
                    </td>
                    <td className="px-4 py-3">
                      <BanButton userId={account.id} />
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
