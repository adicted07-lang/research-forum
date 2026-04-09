import { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export const metadata: Metadata = {
  title: "Terms of Service — T.I.E",
  description: "Terms of Service for The Intellectual Exchange platform.",
  alternates: { canonical: `${baseUrl}/terms` },
};

export default function TermsOfServicePage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-xl p-8 sm:p-10">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-1">Terms of Service</h1>
          <p className="text-sm text-text-tertiary mb-8">Last updated: January 1, 2026</p>

          <div className="space-y-8 text-[15px] text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            <p>
              Welcome to The Intellectual Exchange (&quot;T.I.E,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or using theintellectualexchange.com, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.
            </p>

            <section>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">Acceptance of Terms</h2>
              <p>
                By registering for an account or using any part of the platform, you acknowledge that you have read, understood, and agree to these Terms. We reserve the right to update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must provide accurate and complete information when creating an account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">Content</h2>
              <p className="mb-3">
                You retain ownership of the content you post on The Intellectual Exchange. By posting content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content in connection with operating and promoting the platform.
              </p>
              <p>
                You are solely responsible for the content you submit. Content must not infringe on intellectual property rights, contain false or misleading information, or violate any applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">Prohibited Conduct</h2>
              <p className="mb-3">You agree not to:</p>
              <ul className="space-y-2 ml-1">
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /><span>Use the platform for any unlawful purpose or in violation of any applicable laws or regulations.</span></li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /><span>Post spam, unsolicited promotions, or malicious content.</span></li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /><span>Impersonate another person or entity, or misrepresent your affiliation with any person or entity.</span></li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /><span>Attempt to gain unauthorized access to any part of the platform, other accounts, or any systems or networks connected to the platform.</span></li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /><span>Harass, abuse, or threaten other users or engage in any conduct that is harmful, offensive, or disruptive.</span></li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /><span>Scrape, crawl, or use automated means to access the platform without our express written permission.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">Disclaimers</h2>
              <p>
                The platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, either express or implied. We do not warrant that the platform will be uninterrupted, secure, or error-free. We are not responsible for the accuracy, reliability, or completeness of any content posted by users.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, The Intellectual Exchange and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">Termination</h2>
              <p>
                We may suspend or terminate your account and access to the platform at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">Contact Us</h2>
              <p>
                If you have questions about these Terms, please contact us at{" "}
                <a href="mailto:support@theintellectualexchange.com" className="text-primary font-medium hover:underline">support@theintellectualexchange.com</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
