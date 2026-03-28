export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In — ResearchHub",
};

export default function LoginPage() {
  return <LoginForm />;
}
