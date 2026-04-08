import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";

export const metadata: Metadata = {
  title: "About Us — T.I.E",
  description: "Learn about The Intellectual Exchange, the professional platform for researchers, academics, and companies.",
};

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto py-12 space-y-12">
        <section className="text-center">
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-4">
            About The Intellectual Exchange
          </h1>
          <p className="text-lg text-text-secondary dark:text-text-dark-secondary max-w-2xl mx-auto">
            The Intellectual Exchange is a professional platform connecting researchers, academics, and companies to share knowledge, collaborate, and advance science together.
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
            T.I.E is built by a passionate team of engineers, researchers, and designers dedicated to connecting the global research community. We come from diverse academic and industry backgrounds, united by the belief that breaking down barriers between disciplines and institutions leads to better science. Every feature we ship is guided by direct feedback from the researchers and companies who use the platform daily.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-text-primary dark:text-text-dark-primary mb-4">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <span className="mt-1 flex-shrink-0 text-2xl" style={{ color: "#DA552F" }} aria-hidden="true">📖</span>
              <div>
                <h3 className="font-semibold text-text-primary dark:text-text-dark-primary">Knowledge Sharing</h3>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary">Science advances fastest when insights are shared openly and accessibly across every discipline.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 flex-shrink-0 text-2xl" style={{ color: "#DA552F" }} aria-hidden="true">🔬</span>
              <div>
                <h3 className="font-semibold text-text-primary dark:text-text-dark-primary">Research Excellence</h3>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary">We hold every answer, listing, and publication on the platform to the highest standard of rigor and quality.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 flex-shrink-0 text-2xl" style={{ color: "#DA552F" }} aria-hidden="true">🌍</span>
              <div>
                <h3 className="font-semibold text-text-primary dark:text-text-dark-primary">Global Community</h3>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary">Great research knows no borders — we connect academics, labs, and companies across every continent.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 flex-shrink-0 text-2xl" style={{ color: "#DA552F" }} aria-hidden="true">🤝</span>
              <div>
                <h3 className="font-semibold text-text-primary dark:text-text-dark-primary">Open Collaboration</h3>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary">The best breakthroughs happen when people with different expertise work together toward a common goal.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
