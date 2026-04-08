"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = localStorage.getItem(STORAGE_KEY);
    if (!choice) {
      setVisible(true);
    }
  }, []);

  function handleChoice(value: "accepted" | "declined") {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 animate-[slideUp_0.3s_ease-out]
        border-t border-border bg-white p-4 shadow-lg dark:border-border-dark dark:bg-surface-dark"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary">
          We use cookies to improve your experience. By continuing, you agree to
          our{" "}
          <Link
            href="/cookies"
            className="underline underline-offset-2 hover:text-primary"
          >
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => handleChoice("declined")}
            className="rounded-sm border border-border px-4 py-1.5 text-sm text-text-secondary
              transition-colors hover:bg-surface dark:border-border-dark
              dark:text-text-dark-secondary dark:hover:bg-surface-dark-hover"
          >
            Decline
          </button>
          <button
            onClick={() => handleChoice("accepted")}
            className="rounded-sm bg-primary px-4 py-1.5 text-sm text-white
              transition-colors hover:bg-primary-hover"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
