import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";

export const metadata: Metadata = {
  title: "Getting Started — T.I.E",
  description:
    "Learn how to use The Intellectual Exchange platform. A complete guide for researchers, academics, and professionals.",
  openGraph: {
    title: "Getting Started — T.I.E",
    description:
      "Learn how to use The Intellectual Exchange platform. A complete guide for researchers, academics, and professionals.",
    siteName: "The Intellectual Exchange",
  },
  twitter: {
    card: "summary",
    title: "Getting Started — T.I.E",
    description:
      "Learn how to use The Intellectual Exchange platform. A complete guide for researchers, academics, and professionals.",
  },
};

export default function GuidePage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto py-12">
        <article className="prose dark:prose-invert prose-headings:font-semibold">
          <h1>Getting Started</h1>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            A complete guide for researchers, academics, and professionals.
          </p>
          <p>
            Looking for the company guide?{" "}
            <Link href="/guide/companies">
              Read the guide for companies &rarr;
            </Link>
          </p>

          {/* ---- Welcome ---- */}
          <h2>Welcome to The Intellectual Exchange</h2>
          <p>
            The Intellectual Exchange (T.I.E) is the professional platform where
            researchers exchange knowledge, hire domain experts, and discover
            tools that accelerate their work. Whether you are an early-career
            academic, a seasoned industry scientist, or an independent
            consultant, T.I.E gives you the community and infrastructure to
            grow.
          </p>

          {/* ---- Profile ---- */}
          <h2>Creating Your Profile</h2>
          <p>
            After signing up, take a few minutes to build a strong profile. A
            complete profile helps you get hired, builds credibility, and makes
            it easier for others to find you.
          </p>
          <ul>
            <li>
              <strong>Bio:</strong> Write a concise summary of your background
              and research interests.
            </li>
            <li>
              <strong>Expertise tags:</strong> Add tags that describe your
              skills and domains (e.g., machine learning, genomics,
              econometrics).
            </li>
            <li>
              <strong>Experience:</strong> Specify your years of experience so
              potential clients can gauge seniority.
            </li>
            <li>
              <strong>Hourly rate:</strong> Set a rate if you offer consulting
              or freelance work.
            </li>
            <li>
              <strong>Social links:</strong> Connect your Google Scholar, ORCID,
              LinkedIn, or personal website for additional visibility.
            </li>
          </ul>

          {/* ---- Forum ---- */}
          <h2>Forum &mdash; Ask &amp; Answer</h2>
          <p>
            The forum is the heart of T.I.E. It is where researchers pose
            questions, share insights, and solve problems together.
          </p>

          <h3>Asking a Question</h3>
          <p>
            When you create a new question you can provide a title, a detailed
            body (Markdown supported), tags, a category, a research domain, and
            an industry. The more context you give, the better answers you will
            receive.
          </p>

          <h3>Answering Questions</h3>
          <p>
            Browse open questions in your areas of expertise and contribute
            answers. Well-written answers earn upvotes and build your
            reputation.
          </p>

          <h3>Voting</h3>
          <p>
            Use upvotes to surface the most useful content and downvotes to
            flag low-quality posts. The question author can mark one answer as
            the accepted answer, which pins it to the top and awards bonus
            reputation points to the answerer.
          </p>

          <h3>Bounties</h3>
          <p>
            Need an urgent or highly specialized answer? Attach a bounty of IC
            points to your question. Bounties draw more attention and reward the
            best response.
          </p>

          {/* ---- Reputation ---- */}
          <h2>Reputation &amp; Levels</h2>
          <p>
            Your reputation is measured in <strong>IC (Intellectual Capital)</strong>{" "}
            points. You earn IC by contributing to the platform:
          </p>
          <ul>
            <li>Ask a question: <strong>+5 IC</strong></li>
            <li>Post an answer: <strong>+10 IC</strong></li>
            <li>Answer accepted: <strong>+25 IC</strong></li>
            <li>Receive an upvote: <strong>+2 IC</strong></li>
            <li>Write a review: <strong>+5 IC</strong></li>
            <li>Publish an article: <strong>+15 IC</strong></li>
          </ul>

          <h3>Levels</h3>
          <p>
            As you accumulate IC you advance through six levels, each unlocking
            new privileges:
          </p>
          <ol>
            <li>
              <strong>Associate</strong> (0 IC) &mdash; Default level. Ask
              questions, post answers, upvote.
            </li>
            <li>
              <strong>Analyst</strong> (50 IC) &mdash; Unlock downvoting.
            </li>
            <li>
              <strong>Strategist</strong> (200 IC) &mdash; Create and award
              bounties.
            </li>
            <li>
              <strong>Director</strong> (500 IC) &mdash; Cast close/reopen votes
              on questions.
            </li>
            <li>
              <strong>Partner</strong> (1,000 IC) &mdash; Directly edit other
              users&apos; posts for clarity and accuracy.
            </li>
            <li>
              <strong>Fellow</strong> (2,500 IC) &mdash; Access moderation tools
              and help govern the community.
            </li>
          </ol>

          {/* ---- Marketplace ---- */}
          <h2>Marketplace</h2>
          <p>
            The marketplace is where you can browse and list research services
            and tools. Find software, consulting offers, data services, and more
            from other researchers and companies.
          </p>
          <p>
            After using a product or service, leave a review. Reviews help the
            community make informed decisions and earn you <strong>+5 IC</strong>{" "}
            per review.
          </p>

          {/* ---- Finding Work ---- */}
          <h2>Finding Work</h2>
          <p>
            The Talent Board lists research jobs posted by companies and
            institutions. You can filter by job type (one-time, ongoing,
            contract) and work arrangement (remote, on-site, hybrid).
          </p>
          <ul>
            <li>
              <strong>Apply:</strong> Submit a cover letter and proposed rate
              directly through the platform.
            </li>
            <li>
              <strong>Track:</strong> Monitor the status of all your
              applications from your dashboard.
            </li>
          </ul>

          {/* ---- News & Articles ---- */}
          <h2>News &amp; Articles</h2>
          <p>
            Stay current with the latest research news curated by the community.
            You can also submit your own articles for review. Published articles
            are categorized by topic and earn you <strong>+15 IC</strong>.
          </p>

          {/* ---- Datasets & Projects ---- */}
          <h2>Datasets &amp; Projects</h2>
          <p>
            Share datasets in common formats such as CSV, JSON, and Parquet.
            Create collaborative projects where you can invite team members,
            organize shared documents, and work together in one place.
          </p>

          {/* ---- Messaging & Notifications ---- */}
          <h2>Messaging &amp; Notifications</h2>
          <p>
            Use direct messaging to reach out to other researchers, discuss
            opportunities, or follow up on answers. The notification center
            keeps you informed about new answers to your questions, upvotes on
            your content, new followers, and other important activity.
          </p>

          {/* ---- Tips ---- */}
          <h2>Tips for Success</h2>
          <ul>
            <li>
              <strong>Complete your profile:</strong> Profiles with a photo,
              bio, and expertise tags get significantly more engagement.
            </li>
            <li>
              <strong>Be active daily:</strong> T.I.E tracks activity streaks.
              Consistent participation keeps you visible and earns trust.
            </li>
            <li>
              <strong>Answer in your expertise:</strong> Focused, high-quality
              answers build your reputation faster than broad, shallow ones.
            </li>
            <li>
              <strong>Write quality content:</strong> Detailed questions, clear
              answers, and thoughtful reviews all contribute to a stronger
              profile.
            </li>
            <li>
              <strong>Engage with the community:</strong> Upvote helpful
              content, leave reviews on marketplace listings, and follow
              researchers whose work interests you.
            </li>
          </ul>
        </article>
      </div>
    </PageLayout>
  );
}
