export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { CompanySignupForm } from "@/components/auth/company-signup-form";

export const metadata: Metadata = {
  title: "Company Sign Up — T.I.E",
  description: "Register your company on The Intellectual Exchange to hire researchers and post jobs.",
  robots: { index: false, follow: false },
};

export default function CompanySignupPage() {
  return <CompanySignupForm />;
}
