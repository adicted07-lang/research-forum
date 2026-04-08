"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface dark:bg-surface-dark px-4">
      <h1 className="text-3xl font-bold text-text-primary dark:text-text-dark-primary">
        Something went wrong
      </h1>
      <p className="mt-2 text-center text-text-secondary dark:text-text-dark-secondary">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="bg-primary text-white rounded-md px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-md border border-border dark:border-border-dark px-4 py-2 text-text-primary dark:text-text-dark-primary hover:bg-surface-hover dark:hover:bg-surface-dark transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
