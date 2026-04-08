import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";

export const metadata: Metadata = {
  title: "About Us — ResearchHub",
  description: "Learn about ResearchHub, the professional platform for researchers, academics, and companies.",
};

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto py-12 space-y-12">
        <section className="text-center">
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
            About ResearchHub
          </h1>
          <p className="text-lg text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto">
            ResearchHub is a professional platform connecting researchers, academics, and companies to share knowledge, collaborate, and advance science together.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">Our Mission</h2>
          <p className="text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            We believe that research thrives when knowledge is shared openly. Our mission is to build the best platform for the research community — a place to ask questions, find collaborators, hire experts, and discover tools that accelerate scientific progress.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">Our Team</h2>
          <p className="text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            Content coming soon.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">Our Values</h2>
          <p className="text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            Content coming soon.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
