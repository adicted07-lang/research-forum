import { cn } from "@/lib/utils";
import Link from "next/link";

interface CardWrapperProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export function CardWrapper({ children, href, className }: CardWrapperProps) {
  const classes = cn(
    "bg-white border border-border-light rounded-md p-5 transition-all duration-200",
    "hover:border-border hover:shadow-sm hover:-translate-y-px",
    "dark:bg-surface-dark dark:border-border-dark-light dark:hover:border-border-dark",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
}
