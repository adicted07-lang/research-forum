export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign Up — The Intellectual Exchange",
  description: "Create a free researcher account on The Intellectual Exchange.",
};

export default function SignupPage() {
  return <SignupForm />;
}
