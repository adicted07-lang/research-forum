"use client";

import Link from "next/link";
import {
  Mail,
  MessageSquare,
} from "lucide-react";
import { TieBrand } from "@/components/shared/tie-logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const footerConfig = {
  description:
    "The Intellectual Exchange is a professional platform for researchers, academics, and companies. Ask questions, share knowledge, hire experts, and discover research tools.",
  contact: {
    email: "support@theintellectualexchange.com",
  },
  socials: [
    { icon: MessageSquare, href: "/forum", label: "Exchange Floor" },
    { icon: Mail, href: "mailto:support@theintellectualexchange.com", label: "Email" },
  ],
  columns: [
    {
      title: "Community",
      links: [
        { label: "Exchange Floor", href: "/forum" },
        { label: "Ask a Question", href: "/forum/new" },
        { label: "Leaderboard", href: "/leaderboard" },
        { label: "Researchers", href: "/researchers" },
        { label: "The Journal", href: "/news" },
      ],
    },
    {
      title: "Marketplace",
      links: [
        { label: "Browse Services", href: "/marketplace?type=SERVICE" },
        { label: "Browse Tools", href: "/marketplace?type=TOOL" },
        { label: "List a Service", href: "/marketplace/new" },
        { label: "Datasets", href: "/datasets" },
      ],
    },
    {
      title: "Hiring",
      links: [
        { label: "Browse Jobs", href: "/hire" },
        { label: "Post a Job", href: "/hire/new" },
        { label: "Research Grants", href: "/grants" },
      ],
    },
    {
      title: "Platform",
      links: [
        { label: "Projects", href: "/projects" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Settings", href: "/settings" },
        { label: "Messages", href: "/messages" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
      ],
    },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary px-6 py-14 border-t border-border dark:border-border-dark">
      <div className="max-w-[1280px] mx-auto">
        {/* Top Section: Logo and Description */}
        <div className="mb-12">
          <Link href="/" className="inline-flex mb-6">
            <TieBrand />
          </Link>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed max-w-2xl">
            {footerConfig.description}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-10">
          {/* Left Side: Links */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 flex-1">
            {footerConfig.columns.map((col, idx) => (
              <div key={idx}>
                <h3 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
                  {col.title}
                </h3>
                <ul className="space-y-2">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        href={link.href}
                        className="text-[0.85rem] text-text-secondary dark:text-text-dark-secondary hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Right Side: CTA and Quick Links */}
          <div className="lg:w-1/4">
            <Card className="shadow-none border-none bg-transparent mb-4">
              <CardContent className="p-0 space-y-3">
                <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">
                  For Companies & Universities
                </p>
                <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
                  Post research jobs, find expert researchers, and accelerate your projects.
                </p>
                <Link href="/signup/company">
                  <Button variant="outline" className="w-full mt-2">
                    Join as a Company
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-none border-none bg-transparent">
              <CardContent className="p-0">
                {/* Social Links */}
                <div className="pt-3 border-t border-border dark:border-border-dark">
                  <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary mb-3">
                    Follow Us
                  </p>
                  <div className="flex gap-3">
                    {footerConfig.socials.map(({ icon: Icon, href, label }, idx) => (
                      <Link
                        key={idx}
                        href={href}
                        className="p-2 rounded-md text-text-tertiary hover:text-primary hover:bg-surface dark:hover:bg-surface-dark transition-colors"
                        aria-label={label}
                      >
                        <Icon className="w-4 h-4" />
                      </Link>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-6 border-t border-border dark:border-border-dark flex flex-col md:flex-row justify-between items-center text-xs text-text-tertiary dark:text-text-dark-tertiary gap-4">
          <p>&copy; {new Date().getFullYear()} The Intellectual Exchange. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-primary transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
