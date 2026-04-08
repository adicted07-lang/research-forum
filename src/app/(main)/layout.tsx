import { auth } from "@/auth";
import { Navbar1 } from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { MobileBottomNav } from "@/components/ui/mobile-bottom-nav";
import { FloatingChatWidget } from "@/components/messages/floating-chat-widget";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const currentUser = session?.user
    ? {
        id: (session.user as any).id,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      }
    : null;

  return (
    <>
      <Navbar1 />
      <main className="min-h-screen pb-20 lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      {currentUser && <FloatingChatWidget currentUser={currentUser} />}
    </>
  );
}
