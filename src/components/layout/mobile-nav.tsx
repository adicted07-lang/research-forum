"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, ShoppingBag, Users, Newspaper, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileLinks = [
  { label: "Exchange", href: "/forum", icon: MessageSquare },
  { label: "Market", href: "/marketplace", icon: ShoppingBag },
  { label: "Talent", href: "/talent-board", icon: Users },
  { label: "Journal", href: "/news", icon: Newspaper },
  { label: "More", href: "/leaderboard", icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-xl border-t border-border-light dark:bg-[#0F0F13]/95 dark:border-border-dark-light">
      <div className="flex items-center justify-around h-14">
        {mobileLinks.map((link) => {
          const isActive = pathname?.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-text-tertiary dark:text-text-dark-tertiary"
              )}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
