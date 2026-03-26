import { cn } from "@/lib/utils";

interface BadgePillProps {
  label: string;
  variant?: "default" | "bounty" | "primary";
  className?: string;
}

const variantClasses = {
  default: "bg-surface text-text-secondary dark:bg-surface-dark dark:text-text-dark-secondary",
  bounty: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
  primary: "bg-primary-light text-primary",
};

export function BadgePill({
  label,
  variant = "default",
  className,
}: BadgePillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium",
        variantClasses[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
