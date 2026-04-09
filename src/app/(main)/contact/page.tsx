import type { Metadata } from "next";
import { Mail, Clock, MessageSquare, HelpCircle, BookOpen, Shield } from "lucide-react";
import { ContactForm } from "./contact-form";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export const metadata: Metadata = {
  title: "Contact Us — T.I.E",
  description: "Get in touch with the T.I.E team.",
  alternates: { canonical: `${baseUrl}/contact` },
  openGraph: {
    title: "Contact Us — T.I.E",
    description: "Get in touch with the T.I.E team.",
    siteName: "The Intellectual Exchange",
    images: [{ url: `${baseUrl}/api/og?title=Contact Us&subtitle=T.I.E`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us — T.I.E",
    description: "Get in touch with the T.I.E team.",
    images: [`${baseUrl}/api/og?title=Contact Us&subtitle=T.I.E`],
  },
};

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    description: "For general inquiries and support",
    detail: "support@theintellectualexchange.com",
    href: "mailto:support@theintellectualexchange.com",
  },
  {
    icon: Clock,
    title: "Response Time",
    description: "We typically respond within",
    detail: "24–48 business hours",
  },
];

const helpTopics = [
  { icon: HelpCircle, title: "Account Issues", description: "Login problems, profile setup, password resets" },
  { icon: MessageSquare, title: "Platform Support", description: "Questions about forum, marketplace, or jobs" },
  { icon: BookOpen, title: "Content & Moderation", description: "Report content or appeal moderation decisions" },
  { icon: Shield, title: "Privacy & Security", description: "Data requests, account deletion, security concerns" },
];

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
          Contact Us
        </h1>
        <p className="text-text-secondary dark:text-text-dark-secondary max-w-lg mx-auto">
          Have a question, feedback, or need help? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact details */}
          {contactInfo.map(({ icon: Icon, title, description, detail, href }) => (
            <div key={title} className="flex items-start gap-4 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary dark:text-text-dark-primary text-sm">{title}</h3>
                <p className="text-xs text-text-tertiary mb-1">{description}</p>
                {href ? (
                  <a href={href} className="text-sm text-primary font-medium hover:underline">{detail}</a>
                ) : (
                  <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">{detail}</p>
                )}
              </div>
            </div>
          ))}

          {/* Help topics */}
          <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-xl p-5">
            <h3 className="font-semibold text-text-primary dark:text-text-dark-primary text-sm mb-4">What can we help with?</h3>
            <div className="space-y-3">
              {helpTopics.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary">{title}</p>
                    <p className="text-xs text-text-tertiary">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
