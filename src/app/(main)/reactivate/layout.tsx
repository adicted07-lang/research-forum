import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reactivate Account — The Intellectual Exchange",
  description: "Reactivate your deactivated account on The Intellectual Exchange.",
  robots: { index: false, follow: false },
};

export default function ReactivateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
