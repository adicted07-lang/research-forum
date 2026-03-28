"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Mail } from "lucide-react";

export default function AdvertiseContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 800);
  }

  const inputClass =
    "w-full px-3 py-2 border border-border-light rounded-md text-sm text-text-primary bg-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors dark:bg-surface-dark dark:border-border-dark-light dark:text-text-dark-primary dark:placeholder:text-text-dark-tertiary";
  const labelClass =
    "block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1";

  return (
    <PageLayout>
      <div className="max-w-lg mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary mb-2">
            Contact for Advertising
          </h1>
          <p className="text-text-secondary dark:text-text-dark-secondary text-sm">
            Interested in managed campaigns, custom placements, or sponsorships?
            Our team would love to help you design an advertising strategy that
            reaches the right researchers.
          </p>
        </div>

        {/* Contact details */}
        <div className="bg-white border border-border-light rounded-lg p-4 mb-6 flex items-center gap-3 dark:bg-surface-dark dark:border-border-dark-light">
          <Mail className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary">
              Email us directly
            </p>
            <a
              href="mailto:info@researchhub.com"
              className="text-sm font-medium text-primary hover:underline"
            >
              info@researchhub.com
            </a>
          </div>
        </div>

        {/* Contact form */}
        {submitted ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">📬</div>
            <h2 className="text-lg font-semibold text-text-primary dark:text-text-dark-primary mb-1">
              Message received!
            </h2>
            <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
              We&apos;ll get back to you within 1-2 business days.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-border-light rounded-lg p-5 space-y-4 dark:bg-surface-dark dark:border-border-dark-light"
          >
            <h2 className="text-base font-semibold text-text-primary dark:text-text-dark-primary">
              Send us a message
            </h2>

            <div>
              <label className={labelClass} htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Dr. Jane Smith"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="jane@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="Tell us about your advertising goals, target audience, and budget..."
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-2.5 bg-primary text-white font-semibold rounded-md hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </PageLayout>
  );
}
