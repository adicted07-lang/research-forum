import type { Metadata } from "next";
import { CompanySignupForm } from "@/components/auth/company-signup-form";

export const metadata: Metadata = {
  title: "Company Sign Up — ResearchHub",
};

export default function CompanySignupPage() {
  return <CompanySignupForm />;
}
