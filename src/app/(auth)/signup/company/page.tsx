export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { CompanySignupForm } from "@/components/auth/company-signup-form";

export const metadata: Metadata = {
  title: "Company Sign Up — The Intellectual Exchange",
  description: "Register your company on The Intellectual Exchange to hire researchers and post jobs.",
};

export default function CompanySignupPage() {
  return <CompanySignupForm />;
}
