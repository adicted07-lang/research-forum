import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import {
  BookOpen, Microscope, Globe, Handshake,
  MessageSquare, ShoppingBag, Briefcase, Award,
  Users, Lightbulb,
} from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export const metadata: Metadata = {
  title: "About Us — T.I.E",
  description: "Learn about The Intellectual Exchange, the professional platform for researchers, academics, and companies.",
  alternates: { canonical: `${baseUrl}/about` },
  openGraph: {
    title: "About Us — T.I.E",
    description: "Learn about The Intellectual Exchange, the professional platform for researchers, academics, and companies.",
    siteName: "The Intellectual Exchange",
    images: [{ url: `${baseUrl}/api/og?title=About Us&subtitle=T.I.E`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us — T.I.E",
    description: "Learn about The Intellectual Exchange, the professional platform for researchers, academics, and companies.",
    images: [`${baseUrl}/api/og?title=About Us&subtitle=T.I.E`],
  },
};

const values = [
  {
    icon: BookOpen,
    title: "Knowledge Sharing",
    description: "Science advances fastest when insights are shared openly and accessibly across every discipline.",
  },
  {
    icon: Microscope,
    title: "Research Excellence",
    description: "We hold every answer, listing, and publication on the platform to the highest standard of rigor and quality.",
  },
  {
    icon: Globe,
    title: "Global Community",
    description: "Great research knows no borders — we connect academics, labs, and companies across every continent.",
  },
  {
    icon: Handshake,
    title: "Open Collaboration",
    description: "The best breakthroughs happen when people with different expertise work together toward a common goal.",
  },
];

const features = [
  { icon: MessageSquare, title: "Forum", description: "Ask questions and get expert answers from the research community." },
  { icon: ShoppingBag, title: "Marketplace", description: "Discover and list research services, tools, and datasets." },
  { icon: Briefcase, title: "Talent Board", description: "Post jobs and find expert researchers for your projects." },
  { icon: Award, title: "Reputation System", description: "Earn points and climb the leaderboard through quality contributions." },
  { icon: Users, title: "Researcher Profiles", description: "Showcase your expertise, publications, and availability." },
  { icon: Lightbulb, title: "News & Insights", description: "Stay updated with the latest research news and how-to guides." },
];

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto py-12 space-y-16">
        {/* Hero */}
        <section className="text-center">
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
            About The Intellectual Exchange
          </h1>
          <p className="text-lg text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto leading-relaxed">
            A professional platform connecting researchers, academics, and companies to share knowledge, collaborate, and advance science together.
          </p>
        </section>

        {/* Mission */}
        <section className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-xl p-8">
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-3">Our Mission</h2>
          <p className="text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            We believe that research thrives when knowledge is shared openly. Our mission is to build the best platform for the research community — a place to ask questions, find collaborators, hire experts, and discover tools that accelerate scientific progress.
          </p>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-6">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-xl p-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-1">{title}</h3>
                  <p className="text-sm text-text-secondary dark:text-text-dark-secondary leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What We Offer */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-6">What We Offer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-xl p-5 text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-1">{title}</h3>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-xl p-8">
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-3">Our Team</h2>
          <p className="text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            T.I.E is built by a passionate team of engineers, researchers, and designers dedicated to connecting the global research community. We come from diverse academic and industry backgrounds, united by the belief that breaking down barriers between disciplines and institutions leads to better science.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
