import { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export const metadata: Metadata = {
  title: "Cookie Policy — T.I.E",
  description: "Cookie Policy for The Intellectual Exchange platform.",
  alternates: { canonical: `${baseUrl}/cookies` },
};

export default function CookiePolicyPage() {
  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto py-12">
        <article className="prose dark:prose-invert prose-headings:font-semibold">
          <h1>Cookie Policy</h1>
          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
            Last updated: January 1, 2026
          </p>

          <p>
            The Intellectual Exchange (&quot;T.I.E&quot;) uses cookies and similar
            technologies on theintellectualexchange.com. This Cookie Policy
            explains what cookies are, the types we use, and how you can manage
            them.
          </p>

          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files placed on your device by websites you
            visit. They are widely used to make websites work more efficiently, to
            remember your preferences, and to provide information to site owners.
          </p>

          <h2>Types of Cookies We Use</h2>

          <h3>Essential Cookies</h3>
          <p>
            These cookies are necessary for the platform to function properly.
            They enable core features such as authentication, session management,
            and security. The platform cannot operate without these cookies.
          </p>

          <h3>Analytics Cookies</h3>
          <p>
            We use analytics cookies to understand how visitors interact with the
            platform. These cookies collect information such as pages visited,
            time spent on pages, and referral sources. This data helps us improve
            the platform experience.
          </p>

          <h3>Preference Cookies</h3>
          <p>
            Preference cookies allow the platform to remember choices you have
            made, such as your preferred language, theme (light or dark mode), and
            display settings.
          </p>

          <h2>How to Control Cookies</h2>
          <p>
            Most web browsers allow you to manage cookies through their settings.
            You can typically choose to block or delete cookies. Please note that
            disabling essential cookies may affect the functionality of the
            platform.
          </p>
          <p>Common browser cookie settings:</p>
          <ul>
            <li>
              <strong>Chrome:</strong> Settings &gt; Privacy and Security &gt;
              Cookies and other site data
            </li>
            <li>
              <strong>Firefox:</strong> Settings &gt; Privacy &amp; Security &gt;
              Cookies and Site Data
            </li>
            <li>
              <strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage
              Website Data
            </li>
            <li>
              <strong>Edge:</strong> Settings &gt; Cookies and site permissions
            </li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            If you have questions about our use of cookies, please contact us at{" "}
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
