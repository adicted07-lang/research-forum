import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — T.I.E",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <article className="prose dark:prose-invert prose-headings:font-semibold">
        <h1>Terms of Service</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: January 1, 2026
        </p>

        <p>
          Welcome to The Intellectual Exchange (&quot;T.I.E,&quot;
          &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or
          using theintellectualexchange.com, you agree to be bound by these
          Terms of Service. If you do not agree, please do not use the platform.
        </p>

        <h2>Acceptance of Terms</h2>
        <p>
          By registering for an account or using any part of the platform, you
          acknowledge that you have read, understood, and agree to these Terms.
          We reserve the right to update these Terms at any time. Continued use
          of the platform after changes constitutes acceptance of the revised
          Terms.
        </p>

        <h2>User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account
          credentials and for all activity that occurs under your account. You
          must provide accurate and complete information when creating an
          account. You agree to notify us immediately of any unauthorized use of
          your account.
        </p>

        <h2>Content</h2>
        <p>
          You retain ownership of the content you post on The Intellectual
          Exchange. By posting content, you grant us a non-exclusive, worldwide,
          royalty-free license to use, display, reproduce, and distribute your
          content in connection with operating and promoting the platform.
        </p>
        <p>
          You are solely responsible for the content you submit. Content must not
          infringe on intellectual property rights, contain false or misleading
          information, or violate any applicable laws.
        </p>

        <h2>Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>
            Use the platform for any unlawful purpose or in violation of any
            applicable laws or regulations.
          </li>
          <li>
            Post spam, unsolicited promotions, or malicious content.
          </li>
          <li>
            Impersonate another person or entity, or misrepresent your
            affiliation with any person or entity.
          </li>
          <li>
            Attempt to gain unauthorized access to any part of the platform,
            other accounts, or any systems or networks connected to the
            platform.
          </li>
          <li>
            Harass, abuse, or threaten other users or engage in any conduct that
            is harmful, offensive, or disruptive.
          </li>
          <li>
            Scrape, crawl, or use automated means to access the platform without
            our express written permission.
          </li>
        </ul>

        <h2>Disclaimers</h2>
        <p>
          The platform is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis without warranties of any kind, either express or
          implied. We do not warrant that the platform will be uninterrupted,
          secure, or error-free. We are not responsible for the accuracy,
          reliability, or completeness of any content posted by users.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, The Intellectual Exchange and
          its affiliates shall not be liable for any indirect, incidental,
          special, consequential, or punitive damages arising out of or related
          to your use of the platform.
        </p>

        <h2>Termination</h2>
        <p>
          We may suspend or terminate your account and access to the platform at
          our sole discretion, without notice, for conduct that we believe
          violates these Terms or is harmful to other users or the platform.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about these Terms, please contact us at{" "}
          <a href="mailto:support@theintellectualexchange.com">
            support@theintellectualexchange.com
          </a>
          .
        </p>
      </article>
    </div>
  );
}
