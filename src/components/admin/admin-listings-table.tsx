import { getAdminListings } from "@/server/actions/admin";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { DeleteContentButton } from "./delete-content-button";
import Link from "next/link";

interface AdminListingsTableProps {
  search?: string;
  page?: number;
}

export async function AdminListingsTable({
  search,
  page = 1,
}: AdminListingsTableProps) {
  const result = await getAdminListings({ search, page, limit: 20 });

  if ("error" in result) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Failed to load listings.
      </div>
    );
  }

  const { listings, totalPages, currentPage } = result;

  return (
    <div className="space-y-4">
      {/* Search */}
      <form method="GET" className="flex items-center gap-3">
        <input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search listings..."
          className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
        />
        <button
          type="submit"
          className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Author
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Created
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No listings found.
                  </td>
                </tr>
              ) : (
                listings.map((listing) => (
                  <tr
                    key={listing.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground line-clamp-1 max-w-xs">
                        {listing.title}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          name={listing.author.name ?? "?"}
                          src={listing.author.image}
                          size="sm"
                        />
                        <span className="text-muted-foreground text-xs">
                          {listing.author.name ?? listing.author.username ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{listing.type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {listing.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <DeleteContentButton type="listing" id={listing.id} />
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
