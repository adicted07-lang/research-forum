import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Advertising — T.I.E",
  description: "Get in touch about advertising opportunities on The Intellectual Exchange.",
  robots: { index: false, follow: false },
};

export default function AdvertiseContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
