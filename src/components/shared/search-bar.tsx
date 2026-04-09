"use client";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  className,
}: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        data-testid="search-icon"
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-label="Search"
        className={cn(
          "w-full py-1 pl-8 pr-3 text-xs rounded-md border border-border",
          "bg-surface text-text-primary placeholder:text-text-tertiary",
          "outline-none transition-all duration-200",
          "focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary-light",
          "dark:bg-surface-dark dark:border-border-dark dark:text-text-dark-primary",
          "dark:focus:bg-background dark:focus:ring-primary/20"
        )}
      />
    </div>
  );
}
