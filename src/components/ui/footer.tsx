"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const footerConfig = {
  description:
    "The Intellectual Exchange is a professional platform for researchers, academics, and companies. Ask questions, share knowledge, hire experts, and discover research tools.",
  contact: {
    email: "support@theintellectualexchange.com",
  },
  socials: [
    { icon: "linkedin" as const, href: "https://www.linkedin.com/company/the-intellectual-exchange/", label: "LinkedIn" },
    { icon: "x" as const, href: "https://x.com/intellectualexc", label: "X (Twitter)" },
    { icon: Mail, href: "mailto:support@theintellectualexchange.com", label: "Email" },
  ],
  columns: [
    {
      title: "Community",
      links: [
        { label: "Forum", href: "/forum" },
        { label: "Ask a Question", href: "/forum/new" },
        { label: "Leaderboard", href: "/leaderboard" },
        { label: "Researchers", href: "/researchers" },
        { label: "News", href: "/news" },
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
        { label: "Browse Jobs", href: "/talent-board" },
        { label: "Post a Job", href: "/talent-board/new" },
        { label: "Research Grants", href: "/grants" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Researcher Guide", href: "/guide" },
        { label: "Company Guide", href: "/guide/companies" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
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
          <Link href="/" className="inline-flex mb-4">
            <Image src="/tie-logo-full.svg" alt="The Intellectual Exchange" width={180} height={55} className="dark:invert" />
          </Link>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed max-w-2xl">
            {footerConfig.description}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-10">
          {/* Left Side: Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
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
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="p-2 rounded-md text-text-tertiary hover:text-primary hover:bg-surface dark:hover:bg-surface-dark transition-colors"
                        aria-label={label}
                      >
                        {Icon === "linkedin" ? (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        ) : Icon === "x" ? (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        ) : typeof Icon === "function" ? (
                          <Icon className="w-4 h-4" />
                        ) : null}
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
