"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OAuthButtons } from "./oauth-buttons";
import { loginAction } from "@/server/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 bg-primary rounded-[14px] flex items-center justify-center text-white font-bold text-2xl shadow-[0_4px_12px_rgba(218,85,47,0.35)] mb-4">
          R
        </div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-dark-primary">
          Welcome back
        </h1>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mt-1">
          Sign in to your ResearchHub account
        </p>
      </div>

      <div className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark-light rounded-xl p-8 shadow-sm">
        <OAuthButtons />

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border-light dark:bg-border-dark-light" />
          <span className="text-xs text-text-tertiary dark:text-text-dark-tertiary font-medium">or</span>
          <div className="flex-1 h-px bg-border-light dark:bg-border-dark-light" />
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-error/10 border border-error/20 rounded-md text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 text-sm border border-border dark:border-border-dark rounded-md bg-white dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary dark:placeholder:text-text-dark-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary dark:text-text-dark-primary mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm border border-border dark:border-border-dark rounded-md bg-white dark:bg-[#0F0F13] text-text-primary dark:text-text-dark-primary placeholder:text-text-tertiary dark:placeholder:text-text-dark-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover transition-all hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(218,85,47,0.25)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary dark:text-text-dark-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Sign up
          </Link>{" "}
          or{" "}
          <Link href="/signup/company" className="text-primary font-medium hover:underline">
            Join as a company
          </Link>
        </p>
      </div>
    </div>
  );
}
