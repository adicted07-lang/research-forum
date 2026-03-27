import type { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
}

export function StatsCard({ icon, label, value }: StatsCardProps) {
  const formatted =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <div className="bg-white dark:bg-[#13131A] border border-border rounded-xl p-5 flex items-start gap-4">
      <div className="text-primary shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{formatted}</p>
      </div>
    </div>
  );
}
