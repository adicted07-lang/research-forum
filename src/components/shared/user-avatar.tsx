import { cn } from "@/lib/utils";
import Image from "next/image";

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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const emojiRegex = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200d\ufe0f]/u;

function isEmoji(str: string): boolean {
  return emojiRegex.test(str) && str.length <= 8;
}

const emojiBgMap: Record<string, string> = {
  "🧙‍♂️": "bg-green-300", "🦄": "bg-purple-300", "🐵": "bg-yellow-300",
  "🤖": "bg-red-300", "🦊": "bg-orange-300", "🐼": "bg-gray-300",
  "🦉": "bg-amber-300", "🐸": "bg-emerald-300", "🦁": "bg-yellow-400",
  "🐧": "bg-sky-300", "🐱": "bg-pink-300", "🐶": "bg-amber-200",
  "🦋": "bg-blue-300", "🐙": "bg-rose-300", "🦜": "bg-lime-300",
  "🐝": "bg-yellow-200", "🦖": "bg-teal-300", "👨‍🚀": "bg-indigo-300",
  "🥷": "bg-slate-400", "🧑‍🔬": "bg-cyan-300",
};

export function UserAvatar({
  name,
  src,
  size = "md",
  className,
}: UserAvatarProps) {
  const initials = getInitials(name);

  // Check if src is an emoji avatar
  if (src && isEmoji(src)) {
    const emojiBg = emojiBgMap[src] || "bg-gray-200 dark:bg-gray-700";
    const emojiSize = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg";
    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden flex items-center justify-center shrink-0",
          sizeClasses[size],
          emojiBg,
          className
        )}
      >
        <span className={emojiSize}>{src}</span>
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
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes="40px"
        />
      ) : (
        initials
      )}
    </div>
  );
}
