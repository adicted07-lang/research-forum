import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-xs text-text-tertiary dark:text-text-dark-tertiary mb-4 overflow-x-auto"
    >
      <Link
        href="/"
        className="shrink-0 hover:text-primary transition-colors"
        aria-label="Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1 shrink-0">
          <ChevronRight className="w-3 h-3" />
          {item.href && i < items.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-secondary dark:text-text-dark-secondary font-medium truncate max-w-[200px]">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
