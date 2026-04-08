import { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";

export const metadata: Metadata = {
  title: "Privacy Policy — T.I.E",
  description: "Privacy Policy for The Intellectual Exchange platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto py-12">
        <article className="prose dark:prose-invert prose-headings:font-semibold">
          <h1>Privacy Policy</h1>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            Last updated: January 1, 2026
          </p>

          <p>
            The Intellectual Exchange (&quot;T.I.E,&quot; &quot;we,&quot;
            &quot;us,&quot; or &quot;our&quot;) operates theintellectualexchange.com.
            This Privacy Policy explains how we collect, use, disclose, and
            safeguard your information when you visit our platform.
          </p>

          <h2>Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li>
              <strong>Account Information:</strong> Name, email address, password,
              institutional affiliation, and profile details you provide when
              creating an account.
            </li>
            <li>
              <strong>Content:</strong> Questions, answers, comments, and other
              content you post on the platform.
            </li>
            <li>
              <strong>Usage Data:</strong> Pages visited, time spent on pages,
              links clicked, and other interactions with the platform.
            </li>
            <li>
              <strong>Device Information:</strong> Browser type, operating system,
              IP address, and device identifiers.
            </li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve the platform.</li>
            <li>Create and manage your account.</li>
            <li>
              Personalize your experience and deliver relevant content and
              recommendations.
            </li>
            <li>
              Communicate with you about updates, security alerts, and support
              messages.
            </li>
            <li>
              Monitor and analyze usage trends to improve functionality and user
              experience.
            </li>
            <li>
              Detect, prevent, and address fraud, abuse, or other harmful
              activity.
            </li>
          </ul>

          <h2>Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to collect and store
            information about your interactions with the platform. Cookies help us
            authenticate users, remember preferences, and analyze traffic. You can
            control cookie preferences through your browser settings. For more
            details, please see our{" "}
            <Link href="/cookies">Cookie Policy</Link>.
          </p>

          <h2>Data Security</h2>
          <p>
            We implement commercially reasonable technical and organizational
            measures to protect your personal information against unauthorized
            access, alteration, disclosure, or destruction. However, no method of
            transmission over the Internet or electronic storage is completely
            secure, and we cannot guarantee absolute security.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            Our platform may contain links to third-party websites and services
            that are not operated by us. We are not responsible for the privacy
            practices of these third parties. We may also use third-party service
            providers for analytics, hosting, payment processing, and email
            delivery. These providers have access to your information only to
            perform tasks on our behalf and are obligated to protect it.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is
            active or as needed to provide you services. We may also retain and use
            your information to comply with legal obligations, resolve disputes,
            and enforce our agreements.
          </p>

          <h2>Your Rights</h2>
          <p>
            Depending on your location, you may have the right to access, correct,
            delete, or export your personal data. To exercise any of these rights,
            please contact us using the information below.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please
            contact us at{" "}
            <a href="mailto:support@theintellectualexchange.com">
              support@theintellectualexchange.com
            </a>
            .
          </p>
        </article>
      </div>
    </PageLayout>
  );
}
