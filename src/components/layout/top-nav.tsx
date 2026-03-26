"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/shared/search-bar";

const navLinks = [
  { label: "Forum", href: "/forum" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Hire", href: "/hire" },
  { label: "News", href: "/news" },
  { label: "Advertise", href: "/advertise" },
];

export function TopNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-white/92 backdrop-blur-xl border-b border-border-light dark:bg-[#0F0F13]/92 dark:border-border-dark-light">
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 bg-primary rounded-[10px] flex items-center justify-center text-white font-bold text-lg shadow-[0_2px_8px_rgba(218,85,47,0.3)]">
            R
          </div>
          <span className="text-xl font-bold text-text-primary dark:text-text-dark-primary tracking-tight">
            ResearchHub
          </span>
        </Link>

        <ul className="hidden md:flex gap-1">
          {navLinks.map((link) => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "text-sm font-medium px-3.5 py-2 rounded-md transition-all",
                    isActive
                      ? "text-primary bg-primary-light"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface dark:text-text-dark-secondary dark:hover:text-text-dark-primary dark:hover:bg-surface-dark"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <SearchBar
          placeholder="Search questions, researchers, tools..."
          className="flex-1 max-w-xs"
        />

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface dark:hover:bg-surface-dark transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
          </button>

          <button
            className="relative w-9 h-9 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface dark:hover:bg-surface-dark transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-[#0F0F13]" />
          </button>

          <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-primary to-warning cursor-pointer border-2 border-transparent hover:border-primary transition-colors" />

          <Link
            href="/forum/new"
            className="hidden sm:inline-flex px-4 py-2 bg-primary text-white text-[13.5px] font-semibold rounded-md hover:bg-primary-hover transition-all hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(218,85,47,0.25)]"
          >
            Ask Question
          </Link>
        </div>
      </div>
    </nav>
  );
}
