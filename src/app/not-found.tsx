import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found — T.I.E",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface dark:bg-surface-dark px-4">
      <h1 className="text-8xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-text-primary dark:text-text-dark-primary">
        Page not found
      </h2>
      <p className="mt-2 text-center text-text-secondary dark:text-text-dark-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 bg-primary text-white rounded-md px-4 py-2 hover:opacity-90 transition-opacity"
      >
        Go Home
      </Link>
    </div>
  );
}
