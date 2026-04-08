import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us — ResearchHub",
  description: "Get in touch with the ResearchHub team.",
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
