import { Navbar1 } from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { QuickDMDock } from "@/components/dock/quick-dm-dock";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { AnnouncementBanner } from "@/components/ui/announcement-banner";
import { getActiveAnnouncement } from "@/server/actions/announcements";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  let announcement = null;
  try {
    announcement = await getActiveAnnouncement();
  } catch {
    // DB not available — skip announcement
  }

  return (
    <>
      <AnnouncementBanner announcement={announcement} />
      <Navbar1 />
      <main className="min-h-screen pb-20 lg:pb-0">{children}</main>
      <Footer />
    </>
  );
}
