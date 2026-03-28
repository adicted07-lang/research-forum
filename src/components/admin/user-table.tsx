import { getUsers } from "@/server/actions/admin";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./user-actions";
import { BanActions } from "./ban-actions";
import Link from "next/link";

interface UserTableProps {
  search?: string;
  role?: string;
  page?: number;
}

export async function UserTable({ search, role, page = 1 }: UserTableProps) {
  const result = await getUsers({ search, role, page, limit: 20 });

  if ("error" in result) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load users.
      </div>
    );
  }

  const { users, totalPages, currentPage } = result;

  return (
    <div className="space-y-4">
      {/* Search / filter form */}
      <form method="GET" className="flex items-center gap-3 flex-wrap">
        <input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search users..."
          className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
        />
        <select
          name="role"
          defaultValue={role ?? ""}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground"
        >
          <option value="">All roles</option>
          <option value="RESEARCHER">Researcher</option>
          <option value="COMPANY">Company</option>
          <option value="MODERATOR">Moderator</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button
          type="submit"
          className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
        >
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Username
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Joined
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Actions
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Ban / Suspend
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          name={user.name ?? "?"}
                          src={user.image}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {user.name ?? "—"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                        {user.isVerified && (
                          <Badge variant="default" className="shrink-0 text-[10px]">
                            Verified
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.username ? `@${user.username}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.deletedAt ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <UserActions
                        userId={user.id}
                        currentRole={user.role}
                        isSuspended={!!user.deletedAt}
                        isVerified={user.isVerified}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <BanActions
                        userId={user.id}
                        isBanned={user.isBanned}
                        suspendedUntil={user.suspendedUntil}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2 justify-center pt-2">
          {currentPage > 1 && (
            <Link
              href={`?${new URLSearchParams({
                ...(search ? { search } : {}),
                ...(role ? { role } : {}),
                page: String(currentPage - 1),
              })}`}
              className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Previous
            </Link>
          )}
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`?${new URLSearchParams({
                ...(search ? { search } : {}),
                ...(role ? { role } : {}),
                page: String(currentPage + 1),
              })}`}
              className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
