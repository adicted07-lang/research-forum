import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  href?: string;
  linkText?: string;
}

export function SectionHeader({
  title,
  href,
  linkText = "View all →",
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-text-primary dark:text-text-dark-primary tracking-tight">
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-sm font-medium text-primary hover:underline"
        >
          {linkText}
        </Link>
      )}
    </div>
  );
}
