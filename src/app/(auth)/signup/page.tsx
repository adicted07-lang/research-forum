export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign Up — T.I.E",
};

export default function SignupPage() {
  return <SignupForm />;
}
