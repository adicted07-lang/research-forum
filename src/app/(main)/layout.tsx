import { Navbar1 } from "@/components/ui/navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar1 />
      {children}
    </>
  );
}
