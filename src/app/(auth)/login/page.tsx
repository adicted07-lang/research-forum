export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

export const metadata: Metadata = {
  title: "Sign In — The Intellectual Exchange",
  description: "Sign in to your account on The Intellectual Exchange. Access the research community forum, marketplace, and talent board.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${baseUrl}/login` },
  openGraph: {
    title: "Sign In — The Intellectual Exchange",
    description: "Sign in to your account on The Intellectual Exchange.",
    url: `${baseUrl}/login`,
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
