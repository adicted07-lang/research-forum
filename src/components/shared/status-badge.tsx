import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "open" | "answered" | "closed" | "filled";
  className?: string;
}

const statusStyles = {
  open: "bg-success/10 text-success",
  answered: "bg-info/10 text-info",
  closed: "bg-text-tertiary/10 text-text-tertiary",
  filled: "bg-primary/10 text-primary",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide",
        statusStyles[status],
        className
      )}
    >
      {status.toUpperCase()}
    </span>
  );
}
