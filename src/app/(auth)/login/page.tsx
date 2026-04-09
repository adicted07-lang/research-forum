export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In — The Intellectual Exchange",
  description: "Sign in to your account on The Intellectual Exchange.",
};

export default function LoginPage() {
  return <LoginForm />;
}
