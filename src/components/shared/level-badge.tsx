import { getLevel, getLevelProgress, getNextLevel } from "@/lib/reputation";

const COLOR_MAP: Record<string, string> = {
  gray: "bg-text-tertiary/10 text-text-tertiary",
  blue: "bg-info/10 text-info",
  green: "bg-success/10 text-success",
  purple: "bg-primary/10 text-primary",
  orange: "bg-warning/10 text-warning",
  red: "bg-error/10 text-error",
};

interface LevelBadgeProps {
  points: number;
  showProgress?: boolean;
  size?: "sm" | "md";
}

export function LevelBadge({ points, showProgress = false, size = "sm" }: LevelBadgeProps) {
  const level = getLevel(points);
  const colors = COLOR_MAP[level.color] || COLOR_MAP.gray;

  return (
    <div className="inline-flex flex-col">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${colors} ${
          size === "md" ? "px-2.5 py-1 text-xs" : ""
        }`}
      >
        {level.name}
      </span>
      {showProgress && (() => {
        const next = getNextLevel(points);
        const progress = getLevelProgress(points);
        if (!next) return null;
        return (
          <div className="mt-1.5 w-full">
            <div className="flex justify-between text-[10px] text-text-tertiary mb-0.5">
              <span>{points} pts</span>
              <span>{next.minPoints} pts</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        );
      })()}
    </div>
  );
}
