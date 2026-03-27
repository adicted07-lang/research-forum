import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { db } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Verify admin role from DB
  let isAdmin = false;
  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";
  } catch {
    // DB not available
  }

  if (!isAdmin) redirect("/");

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 bg-background dark:bg-[#0F0F13] min-w-0">
        {children}
      </main>
    </div>
  );
}
