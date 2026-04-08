import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  href?: string;
  linkText?: string;
  icon?: LucideIcon;
}

export function SectionHeader({
  title,
  href,
  linkText = "View all →",
  icon: Icon,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="w-[18px] h-[18px] text-primary shrink-0" strokeWidth={2.2} />}
        <h2 className="text-lg font-bold text-text-primary dark:text-text-dark-primary tracking-tight">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="text-sm font-medium text-primary hover:underline ml-4 shrink-0"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
}
