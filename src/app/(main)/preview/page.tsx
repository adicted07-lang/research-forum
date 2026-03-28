"use client";

export const dynamic = "force-dynamic";

import { MenuBar, type MenuBarItem } from "@/components/ui/bottom-menu";
import {
  MessageSquare,
  Mail,
  Hash,
  Share2,
  Feather,
  Menu,
  Home,
  Search,
  BookOpen,
  Briefcase,
  Bell,
  User,
} from "lucide-react";

const demoItems: MenuBarItem[] = [
  {
    icon: (props) => <MessageSquare {...props} />,
    label: "Messages",
    href: "/messages",
  },
  {
    icon: (props) => <Mail {...props} />,
    label: "Mail",
  },
  {
    icon: (props) => <Hash {...props} />,
    label: "Explore",
    href: "/forum",
  },
  {
    icon: (props) => <Share2 {...props} />,
    label: "Share",
  },
  {
    icon: (props) => <Feather {...props} />,
    label: "Write",
    href: "/forum/new",
  },
  {
    icon: (props) => <Menu {...props} />,
    label: "Menu",
  },
];

const researchItems: MenuBarItem[] = [
  {
    icon: (props) => <Home {...props} />,
    label: "Home",
    href: "/",
  },
  {
    icon: (props) => <Search {...props} />,
    label: "Search",
    href: "/search",
  },
  {
    icon: (props) => <BookOpen {...props} />,
    label: "Forum",
    href: "/forum",
  },
  {
    icon: (props) => <Briefcase {...props} />,
    label: "Jobs",
    href: "/hire",
  },
  {
    icon: (props) => <Bell {...props} />,
    label: "Notifications",
  },
  {
    icon: (props) => <User {...props} />,
    label: "Profile",
    href: "/dashboard",
  },
];

export default function PreviewPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-16 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
          Bottom Menu Bar
        </h1>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-8">
          Hover over icons to see the tooltip animation
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-text-tertiary mb-4 text-center">Default Demo</p>
        <MenuBar items={demoItems} />
      </div>

      <div>
        <p className="text-xs font-medium text-text-tertiary mb-4 text-center">ResearchHub Navigation</p>
        <MenuBar items={researchItems} />
      </div>
    </div>
  );
}
