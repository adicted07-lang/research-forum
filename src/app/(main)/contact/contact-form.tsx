"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ContactForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Message sent! We'll get back to you soon.");
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-xl p-8">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">Name</label>
        <input id="name" name="name" type="text" required placeholder="Your name" className="w-full px-3.5 py-2.5 text-sm border border-border dark:border-border-dark rounded-md bg-white dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">Email</label>
        <input id="email" name="email" type="email" required placeholder="you@example.com" className="w-full px-3.5 py-2.5 text-sm border border-border dark:border-border-dark rounded-md bg-white dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors" />
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">Subject</label>
        <input id="subject" name="subject" type="text" required placeholder="How can we help?" className="w-full px-3.5 py-2.5 text-sm border border-border dark:border-border-dark rounded-md bg-white dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">Message</label>
        <textarea id="message" name="message" required rows={5} placeholder="Tell us more..." className="w-full px-3.5 py-2.5 text-sm border border-border dark:border-border-dark rounded-md bg-white dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors resize-none" />
      </div>
      <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover transition-all disabled:opacity-60 disabled:cursor-not-allowed">
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
