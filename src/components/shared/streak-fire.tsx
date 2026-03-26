import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakFireProps {
  count: number;
  className?: string;
}

export function StreakFire({ count, className }: StreakFireProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs text-warning",
        className
      )}
      title={`${count}-day streak`}
    >
      <Flame className="w-3.5 h-3.5 fill-warning" />
      {count}
    </span>
  );
}
