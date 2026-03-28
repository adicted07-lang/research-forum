import { Navbar1 } from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { QuickDMDock } from "@/components/dock/quick-dm-dock";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar1 />
      <main className="min-h-screen pb-20 lg:pb-0">{children}</main>
      <Footer />
      <QuickDMDock />
      <MobileBottomNav />
    </>
  );
}
