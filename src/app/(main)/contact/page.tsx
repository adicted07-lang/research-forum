import type { Metadata } from "next";
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

export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary mb-2 text-center">
        Contact Us
      </h1>
      <p className="text-text-secondary dark:text-text-dark-secondary text-center mb-8">
        Have a question or feedback? We'd love to hear from you.
      </p>
      <ContactForm />
    </div>
  );
}
