import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-text-tertiary dark:text-text-dark-tertiary">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary max-w-sm mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
