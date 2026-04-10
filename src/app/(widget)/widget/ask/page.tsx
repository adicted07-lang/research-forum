import { auth } from "@/auth";
import { WidgetAskForm } from "@/components/widget/widget-ask-form";

export default async function WidgetAskPage() {
  const session = await auth();

  if (!session?.user) {
    // Show login prompt inside widget
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8 bg-white">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ask the Community</h2>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Sign in to The Intellectual Exchange to ask your question to our community of market researchers.
        </p>
        <a
          href="https://theintellectualexchange.com/login"
          target="_blank"
          rel="noopener"
          className="px-6 py-3 bg-[#b8461f] text-white rounded-lg font-semibold text-sm hover:opacity-90"
        >
          Sign in to ask
        </a>
        <p className="text-xs text-gray-400 mt-4">
          Don&apos;t have an account?{" "}
          <a href="https://theintellectualexchange.com/signup" target="_blank" rel="noopener" className="text-[#b8461f]">
            Sign up free
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Ask the Community</h2>
      <p className="text-gray-500 text-sm mb-4">Your question will be posted to The Intellectual Exchange forum.</p>
      <WidgetAskForm />
    </div>
  );
}
