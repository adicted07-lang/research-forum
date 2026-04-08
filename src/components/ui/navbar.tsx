"use client";

import React from "react";
import {
  MessageSquare,
  ShoppingBag,
  Users,
  Newspaper,
  Megaphone,
  Menu,
  Search,
  BookOpen,
  Briefcase,
  BarChart3,
  HelpCircle,
  FileText,
  Lightbulb,
  UserSearch,
  Store,
  Wrench,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { SearchWithResults } from "@/components/search/search-with-results";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UnreadMessageBadge } from "@/components/messages/unread-badge";
import { AuthButtons } from "@/components/ui/auth-buttons";
import { TieBrand } from "@/components/shared/tie-logo";
import { useSession } from "next-auth/react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  logo?: {
    url: string;
    src?: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  mobileExtraLinks?: {
    name: string;
    url: string;
  }[];
  auth?: {
    login: {
      text: string;
      url: string;
    };
    signup: {
      text: string;
      url: string;
    };
  };
}

const Navbar1 = ({
  logo = {
    url: "/",
    alt: "The Intellectual Exchange",
    title: "The Intellectual Exchange",
  },
  menu = [
    { title: "Home", url: "/" },
    {
      title: "Exchange Floor",
      url: "/forum",
      items: [
        {
          title: "All Questions",
          description: "Browse and answer research questions from the community",
          icon: <MessageSquare className="size-5 shrink-0" />,
          url: "/forum",
        },
        {
          title: "Ask a Question",
          description: "Get expert answers from researchers worldwide",
          icon: <HelpCircle className="size-5 shrink-0" />,
          url: "/forum/new",
        },
        {
          title: "Research Methodologies",
          description: "Discuss techniques, tools, and best practices",
          icon: <BookOpen className="size-5 shrink-0" />,
          url: "/forum?category=Research+Methodologies",
        },
        {
          title: "AMA",
          description: "Ask Me Anything sessions with research experts",
          icon: <Lightbulb className="size-5 shrink-0" />,
          url: "/forum?category=AMA",
        },
      ],
    },
    {
      title: "Marketplace",
      url: "/marketplace",
      items: [
        {
          title: "Browse Services",
          description: "Find expert research services for your project",
          icon: <Store className="size-5 shrink-0" />,
          url: "/marketplace?type=SERVICE",
        },
        {
          title: "Browse Tools",
          description: "Discover research tools and software",
          icon: <Wrench className="size-5 shrink-0" />,
          url: "/marketplace?type=TOOL",
        },
        {
          title: "List Your Service",
          description: "Reach thousands of researchers and companies",
          icon: <ShoppingBag className="size-5 shrink-0" />,
          url: "/marketplace/new",
        },
      ],
    },
    {
      title: "Talent Board",
      url: "/hire",
      items: [
        {
          title: "Browse Jobs",
          description: "Find freelance research opportunities (For Researchers)",
          icon: <Briefcase className="size-5 shrink-0" />,
          url: "/hire",
        },
        {
          title: "Browse Researchers",
          description: "Search profiles by expertise, rate, and availability (For Companies)",
          icon: <UserSearch className="size-5 shrink-0" />,
          url: "/researchers",
        },
      ],
    },
    {
      title: "The Journal",
      url: "/news",
    },
    {
      title: "Leaderboard",
      url: "/leaderboard",
    },
  ],
  mobileExtraLinks = [
    { name: "Dashboard", url: "/dashboard" },
    { name: "Messages", url: "/messages" },
    { name: "Settings", url: "/settings" },
    { name: "Advertise", url: "/advertise" },
  ],
  auth = {
    login: { text: "Sign in", url: "/login" },
    signup: { text: "Sign up", url: "/signup" },
  },
}: Navbar1Props) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isProfilePage = pathname?.startsWith("/profile/");
  const isCompany = (session?.user as any)?.role === "COMPANY";

  // Inject "Post a Job" into Hire menu for company users
  const dynamicMenu = menu.map((item) => {
    if (item.title === "Talent Board" && isCompany && item.items) {
      return {
        ...item,
        items: [
          ...item.items,
          {
            title: "Post a Job",
            description: "Find the perfect research expert for your project",
            icon: <FileText className="size-5 shrink-0" />,
            url: "/hire/new",
          },
        ],
      };
    }
    return item;
  });

  return (
    <section className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-border dark:bg-[#0F0F13]/95 dark:border-border-dark">
      <div className="max-w-[1280px] mx-auto px-6">
        <nav className="hidden justify-between lg:flex h-16 items-center">
          <div className="flex items-center gap-6">
            <a href={logo.url} className="shrink-0">
              <TieBrand />
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {dynamicMenu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {!isProfilePage && <SearchWithResults />}
            <NotificationBell />
            <UnreadMessageBadge />
            <ThemeToggle />
            <AuthButtons
              loginUrl={auth.login.url}
              loginText={auth.login.text}
              signupUrl={auth.signup.url}
              signupText={auth.signup.text}
            />
          </div>
        </nav>
        <div className="block lg:hidden">
          <div className="flex items-center justify-between h-16">
            <a href={logo.url}>
              <TieBrand />
            </a>
            <Sheet>
              <SheetTrigger className={buttonVariants({ variant: "outline", size: "icon" })}>
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url}>
                      <TieBrand compact />
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="my-6 flex flex-col gap-6">
                  <div className="flex items-center gap-2">
                    {!isProfilePage && (
                      <div className="flex-1">
                        <SearchWithResults />
                      </div>
                    )}
                    <NotificationBell />
                    <UnreadMessageBadge />
                    <ThemeToggle />
                  </div>
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {dynamicMenu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>
                  <div className="border-t py-4">
                    <div className="grid grid-cols-2 justify-start">
                      {mobileExtraLinks.map((link, idx) => (
                        <a
                          key={idx}
                          className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground"
                          href={link.url}
                        >
                          {link.name}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <AuthButtons
                      loginUrl={auth.login.url}
                      loginText={auth.login.text}
                      signupUrl={auth.signup.url}
                      signupText={auth.signup.text}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title} className="text-muted-foreground">
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="w-80 p-3">
            <NavigationMenuLink>
              {item.items.map((subItem) => (
                <li key={subItem.title}>
                  <a
                    className="flex select-none gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
                    href={subItem.url}
                  >
                    {subItem.icon}
                    <div>
                      <div className="text-sm font-semibold">
                        {subItem.title}
                      </div>
                      {subItem.description && (
                        <p className="text-sm leading-snug text-muted-foreground">
                          {subItem.description}
                        </p>
                      )}
                    </div>
                  </a>
                </li>
              ))}
            </NavigationMenuLink>
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <a
      key={item.title}
      className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground"
      href={item.url}
    >
      {item.title}
    </a>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <a
              key={subItem.title}
              className="flex select-none gap-4 rounded-md p-3 leading-none outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
              href={subItem.url}
            >
              {subItem.icon}
              <div>
                <div className="text-sm font-semibold">{subItem.title}</div>
                {subItem.description && (
                  <p className="text-sm leading-snug text-muted-foreground">
                    {subItem.description}
                  </p>
                )}
              </div>
            </a>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a key={item.title} href={item.url} className="font-semibold">
      {item.title}
    </a>
  );
};

export { Navbar1 };
