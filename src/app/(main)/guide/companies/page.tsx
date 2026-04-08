import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Company Guide — T.I.E",
  description:
    "Learn how companies can hire researchers, post jobs, and advertise on The Intellectual Exchange.",
  openGraph: {
    title: "Company Guide — T.I.E",
    description:
      "Learn how companies can hire researchers, post jobs, and advertise on The Intellectual Exchange.",
    siteName: "The Intellectual Exchange",
  },
  twitter: {
    card: "summary",
    title: "Company Guide — T.I.E",
    description:
      "Learn how companies can hire researchers, post jobs, and advertise on The Intellectual Exchange.",
  },
};

export default function CompanyGuidePage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto py-12 space-y-12">
        {/* Header */}
        <section className="text-center">
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2">
            Are you a researcher?{" "}
            <Link
              href="/guide"
              className="text-brand-primary hover:underline font-medium"
            >
              View the Researcher Guide
            </Link>
          </p>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
            Company Guide
          </h1>
          <p className="text-lg text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto">
            Everything you need to know about hiring researchers, posting jobs,
            and advertising on The Intellectual Exchange.
          </p>
        </section>

        {/* Welcome */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Welcome
          </h2>
          <p className="text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            The Intellectual Exchange (T.I.E) connects companies with top
            researchers worldwide. Whether you need to fill a specialized
            research role, find domain experts for a project, or promote your
            brand to the academic community, T.I.E gives you the tools to do it.
            Post jobs, find experts, and grow your presence among thousands of
            active researchers.
          </p>
        </section>

        {/* Setting Up Your Company Profile */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Setting Up Your Company Profile
          </h2>
          <div className="space-y-4 text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            <p>
              Get started by signing up with your corporate email at{" "}
              <Link
                href="/signup/company"
                className="text-brand-primary hover:underline"
              >
                /signup/company
              </Link>
              . Once registered, complete your company profile to build trust
              with the research community.
            </p>
            <p>Your profile should include:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Company name and logo</li>
              <li>Industry and company size</li>
              <li>Website URL</li>
              <li>A clear company description</li>
              <li>
                Hiring status — set this to{" "}
                <span className="font-medium text-text-primary dark:text-text-dark-primary">
                  Actively Hiring
                </span>{" "}
                or{" "}
                <span className="font-medium text-text-primary dark:text-text-dark-primary">
                  Not Hiring
                </span>{" "}
                so researchers know whether you have open roles
              </li>
            </ul>
            <p>
              A complete profile signals legitimacy and helps attract
              higher-quality applicants.
            </p>
          </div>
        </section>

        {/* Posting Research Jobs */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Posting Research Jobs
          </h2>
          <div className="space-y-4 text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            <p>
              Post open positions on the{" "}
              <Link
                href="/hire"
                className="text-brand-primary hover:underline"
              >
                Talent Board
              </Link>{" "}
              to reach researchers actively looking for work. Each job listing
              includes the following fields:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Job title</li>
              <li>Detailed description of the role and responsibilities</li>
              <li>Required skills and qualifications</li>
              <li>Research domains (e.g., machine learning, biology, economics)</li>
              <li>
                Project type — one-time, ongoing, or contract
              </li>
              <li>Budget range</li>
              <li>Timeline and expected duration</li>
              <li>Location preference (remote, on-site, or hybrid)</li>
            </ul>
            <div className="bg-surface-secondary dark:bg-surface-dark-secondary rounded-lg p-4 mt-2">
              <p className="font-medium text-text-primary dark:text-text-dark-primary mb-2">
                Tips for writing effective job posts
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                <li>
                  Be specific about the research problem — vague descriptions
                  attract fewer qualified candidates
                </li>
                <li>
                  List concrete deliverables so applicants understand what
                  success looks like
                </li>
                <li>
                  Include a realistic budget range to set expectations upfront
                </li>
                <li>
                  Mention any tools, datasets, or methodologies the work involves
                </li>
                <li>
                  Specify whether the role is remote-friendly to widen your
                  candidate pool
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Finding & Hiring Researchers */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Finding &amp; Hiring Researchers
          </h2>
          <div className="space-y-4 text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            <p>
              Browse the{" "}
              <Link
                href="/researchers"
                className="text-brand-primary hover:underline"
              >
                researcher directory
              </Link>{" "}
              to discover talent across every discipline. Use filters to narrow
              your search by:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Area of expertise and research domains</li>
              <li>Availability (full-time, part-time, freelance)</li>
              <li>Hourly rate range</li>
            </ul>
            <p>
              Each researcher profile shows their credentials, reputation score,
              publication history, and past work on the platform. When you find a
              good match, message them directly to discuss your project before
              making a formal offer.
            </p>
          </div>
        </section>

        {/* Managing Applications */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Managing Applications
          </h2>
          <div className="space-y-4 text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            <p>
              Once your job is live, applications appear on your{" "}
              <Link
                href="/dashboard"
                className="text-brand-primary hover:underline"
              >
                dashboard
              </Link>
              . Each application includes:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Cover letter from the applicant</li>
              <li>Proposed rate and timeline</li>
              <li>Portfolio and relevant work samples</li>
            </ul>
            <p>
              Applications move through a simple workflow:
            </p>
            <div className="flex items-center gap-2 text-sm font-medium text-text-primary dark:text-text-dark-primary my-2 flex-wrap">
              <span className="bg-surface-secondary dark:bg-surface-dark-secondary px-3 py-1 rounded">
                Pending
              </span>
              <span aria-hidden="true">&rarr;</span>
              <span className="bg-surface-secondary dark:bg-surface-dark-secondary px-3 py-1 rounded">
                Shortlisted
              </span>
              <span aria-hidden="true">&rarr;</span>
              <span className="bg-surface-secondary dark:bg-surface-dark-secondary px-3 py-1 rounded">
                Accepted / Rejected
              </span>
            </div>
            <p>
              You can message candidates directly at any stage to ask questions,
              request samples, or negotiate terms.
            </p>
          </div>
        </section>

        {/* Advertising on T.I.E */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Advertising on T.I.E
          </h2>
          <div className="space-y-4 text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            <p>
              Reach the research community with targeted advertising. T.I.E
              offers three ad formats:
            </p>
            <div className="space-y-4">
              <div className="bg-surface-secondary dark:bg-surface-dark-secondary rounded-lg p-4">
                <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-1">
                  Feed Ads
                </h3>
                <p className="text-sm mb-1">
                  Appear in-line with content in the main feed. Blend naturally
                  with posts and discussions.
                </p>
                <p className="text-sm font-medium">
                  $2 CPM / $0.50 CPC
                </p>
              </div>
              <div className="bg-surface-secondary dark:bg-surface-dark-secondary rounded-lg p-4">
                <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-1">
                  Banner Ads
                </h3>
                <p className="text-sm mb-1">
                  Displayed in the sidebar across all pages. High visibility
                  with persistent placement.
                </p>
                <p className="text-sm font-medium">
                  $5 CPM / $1 CPC
                </p>
              </div>
              <div className="bg-surface-secondary dark:bg-surface-dark-secondary rounded-lg p-4">
                <h3 className="font-semibold text-text-primary dark:text-text-dark-primary mb-1">
                  Featured Listings
                </h3>
                <p className="text-sm mb-1">
                  Pinned to the top of category pages. Ideal for promoting tools,
                  datasets, or job openings to a targeted audience.
                </p>
                <p className="text-sm font-medium">
                  $10 CPM / $2 CPC
                </p>
              </div>
            </div>
            <p>
              Campaign management lets you set a daily or total budget, define
              audience targeting, and choose a date range for your campaign. Track
              performance in real time with metrics for impressions, clicks, and
              spend on the{" "}
              <Link
                href="/advertise/dashboard"
                className="text-brand-primary hover:underline"
              >
                advertising dashboard
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Marketplace */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Marketplace
          </h2>
          <div className="space-y-4 text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            <p>
              The{" "}
              <Link
                href="/marketplace"
                className="text-brand-primary hover:underline"
              >
                Marketplace
              </Link>{" "}
              is where you can list your research tools, software, datasets, or
              professional services for the community to discover and purchase.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Create detailed listings with descriptions, pricing, and screenshots</li>
              <li>Collect reviews and ratings from researchers who use your products</li>
              <li>Showcase your offerings to thousands of active researchers on the platform</li>
            </ul>
          </div>
        </section>

        {/* Engaging with the Community */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Engaging with the Community
          </h2>
          <div className="space-y-4 text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            <p>
              Building a presence on T.I.E goes beyond hiring. Active
              participation in the community helps establish your company as a
              thought leader in your field.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                Ask and answer questions in the{" "}
                <Link
                  href="/forum"
                  className="text-brand-primary hover:underline"
                >
                  forum
                </Link>
              </li>
              <li>
                Share articles, industry news, and research findings on the{" "}
                <Link
                  href="/news"
                  className="text-brand-primary hover:underline"
                >
                  news board
                </Link>
              </li>
              <li>
                Comment on discussions and contribute insights from your
                company&apos;s expertise
              </li>
            </ul>
            <p>
              Companies with higher community engagement tend to attract
              stronger applicants and build lasting relationships with
              researchers.
            </p>
          </div>
        </section>

        {/* Tips for Success */}
        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">
            Tips for Success
          </h2>
          <div className="space-y-2 text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                Complete your company profile with a logo, description, and
                up-to-date hiring status
              </li>
              <li>
                Write detailed, specific job posts that clearly describe the
                research problem and deliverables
              </li>
              <li>
                Respond to applicants quickly — top researchers often evaluate
                multiple opportunities simultaneously
              </li>
              <li>
                Engage in forum discussions to build your company&apos;s
                reputation and visibility
              </li>
              <li>
                Consider running an{" "}
                <Link
                  href="/advertise"
                  className="text-brand-primary hover:underline"
                >
                  advertising campaign
                </Link>{" "}
                to boost your job listings and brand presence
              </li>
            </ul>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
