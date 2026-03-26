export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white dark:bg-[#0F0F13]">
      {children}
    </div>
  );
}
