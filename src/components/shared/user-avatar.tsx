import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
};

const sizePx = { sm: 24, md: 32, lg: 40 };

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserAvatar({
  name,
  src,
  size = "md",
  className,
}: UserAvatarProps) {
  const initials = getInitials(name);

  if (src) {
    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-surface dark:bg-surface-dark",
          sizeClasses[size],
          className
        )}
      >
        <Image src={src} alt={name} width={sizePx[size]} height={sizePx[size]} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex items-center justify-center font-semibold bg-gradient-to-br from-primary to-warning text-white shrink-0",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
