import { Navbar1 } from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { QuickDMDock } from "@/components/dock/quick-dm-dock";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar1 />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <QuickDMDock />
    </>
  );
}
