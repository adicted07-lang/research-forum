import Link from "next/link";

export function SignupBanner() {
  return (
    <div className="border border-border dark:border-border-dark rounded-xl p-6 mb-6 bg-gradient-to-r from-[#21293C] to-[#2d3748] text-white">
      <h2 className="text-lg font-bold mb-1">The Intellectual Exchange</h2>
      <p className="text-sm text-gray-300 mb-4">
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
          className="px-5 py-2 border border-gray-500 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
