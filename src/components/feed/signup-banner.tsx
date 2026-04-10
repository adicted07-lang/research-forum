import Link from "next/link";
import { BarChart3, FlaskConical, Search, TrendingUp, PieChart, Microscope } from "lucide-react";

export function SignupBanner() {
  return (
    <div className="relative border border-border dark:border-border-dark rounded-xl p-6 mb-6 bg-white dark:bg-surface-dark overflow-hidden">
      {/* Research icons at 70% opacity */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
        <BarChart3 className="absolute top-3 right-8 w-16 h-16 text-text-primary dark:text-text-dark-primary rotate-12" />
        <FlaskConical className="absolute top-6 right-36 w-12 h-12 text-text-primary dark:text-text-dark-primary -rotate-6" />
        <Search className="absolute bottom-4 right-16 w-10 h-10 text-text-primary dark:text-text-dark-primary rotate-6" />
        <TrendingUp className="absolute top-2 right-64 w-14 h-14 text-text-primary dark:text-text-dark-primary -rotate-12" />
        <PieChart className="absolute bottom-3 right-48 w-11 h-11 text-text-primary dark:text-text-dark-primary rotate-3" />
        <Microscope className="absolute bottom-6 right-80 w-13 h-13 text-text-primary dark:text-text-dark-primary -rotate-6" />
      </div>

      <div className="relative z-10">
        <h2 className="text-lg font-bold text-text-primary dark:text-text-dark-primary mb-1">
          The Intellectual Exchange
        </h2>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
          Join our community of market researchers. Sign up to personalize your feed.
        </p>
        <div className="flex gap-3">
          <Link
            href="/signup"
            className="px-5 py-2 bg-[#b8461f] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Sign up free
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 border border-border dark:border-border-dark text-text-primary dark:text-text-dark-primary rounded-lg text-sm font-medium hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
