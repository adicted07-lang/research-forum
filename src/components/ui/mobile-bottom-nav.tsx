"use client";

import { MenuBar, type MenuBarItem } from "@/components/ui/bottom-menu";
import {
  Home,
  Search,
  MessageSquare,
  Briefcase,
  BookOpen,
  User,
} from "lucide-react";

const mobileNavItems: MenuBarItem[] = [
  {
    icon: (props) => <Home {...props} />,
    label: "Home",
    href: "/",
  },
  {
    icon: (props) => <MessageSquare {...props} />,
    label: "Exchange",
    href: "/forum",
  },
  {
    icon: (props) => <Search {...props} />,
    label: "Search",
    href: "/search",
  },
  {
    icon: (props) => <Briefcase {...props} />,
    label: "Jobs",
    href: "/talent-board",
  },
  {
    icon: (props) => <BookOpen {...props} />,
    label: "Journal",
    href: "/news",
  },
  {
    icon: (props) => <User {...props} />,
    label: "Profile",
    href: "/dashboard",
  },
];

export function MobileBottomNav() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden">
      <MenuBar items={mobileNavItems} />
    </div>
  );
}
