import { Navbar1 } from "@/components/ui/navbar";
import { QuickDMDock } from "@/components/dock/quick-dm-dock";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar1 />
      {children}
      <QuickDMDock />
    </>
  );
}
