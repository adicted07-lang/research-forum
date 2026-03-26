import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, sidebar, className }: PageLayoutProps) {
  return (
    <div
      className={cn(
        "max-w-[1280px] mx-auto px-6 py-6",
        sidebar ? "grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8" : "",
        className
      )}
    >
      <main>{children}</main>
      {sidebar && <aside className="space-y-6">{sidebar}</aside>}
    </div>
  );
}
