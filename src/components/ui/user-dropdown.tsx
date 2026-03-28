"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

interface MenuItem {
  icon: string;
  label: string;
  action: string;
  iconClass?: string;
}

const MENU_ITEMS: Record<string, MenuItem[]> = {
  profile: [
    { icon: "solar:user-circle-line-duotone", label: "Your profile", action: "profile" },
    { icon: "solar:chart-2-line-duotone", label: "Dashboard", action: "dashboard" },
    { icon: "solar:settings-line-duotone", label: "Settings", action: "settings" },
    { icon: "solar:bell-line-duotone", label: "Notifications", action: "notifications" },
  ],
  content: [
    { icon: "solar:bookmark-line-duotone", label: "Saved Items", action: "bookmarks" },
    { icon: "solar:document-text-line-duotone", label: "My Projects", action: "projects" },
    { icon: "solar:letter-line-duotone", label: "Messages", action: "messages" },
  ],
  support: [
    { icon: "solar:question-circle-line-duotone", label: "Help & FAQ", action: "help" },
    { icon: "solar:star-bold", label: "Leaderboard", action: "leaderboard", iconClass: "text-amber-500" },
  ],
};

interface UserDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
    role?: string | null;
  };
}

export function UserDropdown({ user }: UserDropdownProps) {
  const router = useRouter();

  const displayName = user.name || user.username || "User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const actionMap: Record<string, () => void> = {
    profile: () => router.push(`/user/${user.username || ""}`),
    dashboard: () => router.push("/dashboard"),
    settings: () => router.push("/settings"),
    notifications: () => router.push("/dashboard"),
    bookmarks: () => router.push("/dashboard"),
    projects: () => router.push("/projects"),
    messages: () => router.push("/messages"),
    help: () => router.push("/forum?category=General+Discussion"),
    leaderboard: () => router.push("/leaderboard"),
    logout: () => signOut({ callbackUrl: "/" }),
  };

  function handleAction(action: string) {
    actionMap[action]?.();
  }

  const renderMenuItem = (item: typeof MENU_ITEMS.profile[0], index: number) => (
    <DropdownMenuItem
      key={index}
      className="p-2 rounded-lg cursor-pointer"
      onClick={() => handleAction(item.action)}
    >
      <span className="flex items-center gap-2 font-medium">
        <Icon
          icon={item.icon}
          className={cn("size-5", item.iconClass || "text-gray-500 dark:text-gray-400")}
        />
        {item.label}
      </span>
    </DropdownMenuItem>
  );

  const roleLabel = user.role === "ADMIN" ? "Admin" : user.role === "COMPANY" ? "Company" : "Researcher";
  const roleColor = user.role === "ADMIN"
    ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-500/50"
    : user.role === "COMPANY"
    ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500/50"
    : "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-500/50";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
        <Avatar className="cursor-pointer size-9">
          <AvatarImage src={user.image || undefined} alt={displayName} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[280px] rounded-xl p-0" align="end" sideOffset={8}>
        <section className="bg-white dark:bg-surface-dark rounded-xl p-1 border border-border dark:border-border-dark">
          {/* User info header */}
          <div className="flex items-center p-3 gap-3">
            <Avatar className="size-10 border border-border dark:border-border-dark">
              <AvatarImage src={user.image || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-text-primary dark:text-text-dark-primary truncate">
                {displayName}
              </h3>
              <p className="text-xs text-text-tertiary truncate">
                {user.email}
              </p>
            </div>
            <Badge className={cn("border-[0.5px] text-[11px] rounded-sm", roleColor)}>
              {roleLabel}
            </Badge>
          </div>

          <DropdownMenuSeparator />

          {/* Profile & navigation */}
          <DropdownMenuGroup>
            {MENU_ITEMS.profile.map(renderMenuItem)}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Content */}
          <DropdownMenuGroup>
            {MENU_ITEMS.content.map(renderMenuItem)}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Support */}
          <DropdownMenuGroup>
            {MENU_ITEMS.support.map(renderMenuItem)}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Logout */}
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="p-2 rounded-lg cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600"
              onClick={() => handleAction("logout")}
            >
              <span className="flex items-center gap-2 font-medium">
                <Icon icon="solar:logout-2-bold-duotone" className="size-5" />
                Log out
              </span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </section>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserDropdown;
