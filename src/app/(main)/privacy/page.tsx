import { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export const metadata: Metadata = {
  title: "Privacy Policy — The Intellectual Exchange",
  description: "Privacy Policy for The Intellectual Exchange platform.",
  alternates: { canonical: `${baseUrl}/privacy` },
};

export default function PrivacyPolicyPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-xl p-8 sm:p-10">
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-1">Privacy Policy</h1>
          <p className="text-sm text-text-tertiary mb-8">Last updated: January 1, 2026</p>

          <div className="space-y-8 text-[15px] text-text-secondary dark:text-text-dark-secondary leading-relaxed">
            <p>
              The Intellectual Exchange (&quot;T.I.E,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates theintellectualexchange.com. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform.
            </p>

            <section>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">Information We Collect</h2>
              <p className="mb-3">We may collect the following types of information:</p>
              <ul className="space-y-2 ml-1">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span><strong className="text-text-primary dark:text-text-dark-primary">Account Information:</strong> Name, email address, password, institutional affiliation, and profile details you provide when creating an account.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span><strong className="text-text-primary dark:text-text-dark-primary">Content:</strong> Questions, answers, comments, and other content you post on the platform.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span><strong className="text-text-primary dark:text-text-dark-primary">Usage Data:</strong> Pages visited, time spent on pages, links clicked, and other interactions with the platform.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span><strong className="text-text-primary dark:text-text-dark-primary">Device Information:</strong> Browser type, operating system, IP address, and device identifiers.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="space-y-2 ml-1">
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /><span>Provide, maintain, and improve the platform.</span></li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /><span>Create and manage your account.</span></li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /><span>Personalize your experience and deliver relevant content and recommendations.</span></li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /><span>Communicate with you about updates, security alerts, and support messages.</span></li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /><span>Monitor and analyze usage trends to improve functionality and user experience.</span></li>
                <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" /><span>Detect, prevent, and address fraud, abuse, or other harmful activity.</span></li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">Cookies</h2>
              <p>
                We use cookies and similar tracking technologies to collect and store information about your interactions with the platform. Cookies help us authenticate users, remember preferences, and analyze traffic. You can control cookie preferences through your browser settings. For more details, please see our <Link href="/cookies" className="text-primary font-medium hover:underline">Cookie Policy</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">Data Security</h2>
              <p>
                We implement commercially reasonable technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">Third-Party Services</h2>
              <p>
                Our platform may contain links to third-party websites and services that are not operated by us. We are not responsible for the privacy practices of these third parties. We may also use third-party service providers for analytics, hosting, payment processing, and email delivery. These providers have access to your information only to perform tasks on our behalf and are obligated to protect it.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">Data Retention</h2>
              <p>
                We retain your personal information for as long as your account is active or as needed to provide you services. We may also retain and use your information to comply with legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">Your Rights</h2>
              <p>
                Depending on your location, you may have the right to access, correct, delete, or export your personal data. To exercise any of these rights, please contact us using the information below.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-3">Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy, please contact us at{" "}
                <a href="mailto:support@theintellectualexchange.com" className="text-primary font-medium hover:underline">support@theintellectualexchange.com</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
