export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In — T.I.E",
  description: "Sign in to your account on The Intellectual Exchange.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
