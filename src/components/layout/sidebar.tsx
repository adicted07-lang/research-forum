import { cn } from "@/lib/utils";

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  return (
    <div className={cn("hidden lg:flex flex-col gap-6", className)}>
      {children}
    </div>
  );
}

interface SidebarCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function SidebarCard({ title, children, className }: SidebarCardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-border-light rounded-lg p-5",
        "dark:bg-surface-dark dark:border-border-dark-light",
        className
      )}
    >
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary dark:text-text-dark-secondary mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}
