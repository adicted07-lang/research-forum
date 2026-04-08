import type { Metadata } from "next";
import Script from "next/script";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "ResearchHub — Research Forum & Marketplace",
  description:
    "A professional platform for researchers, academics, and companies. Ask questions, share knowledge, hire experts, and discover research tools.",
  openGraph: {
    title: "ResearchHub — Research Forum & Marketplace",
    description:
      "A professional platform for researchers, academics, and companies. Ask questions, share knowledge, hire experts, and discover research tools.",
    siteName: "ResearchHub",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResearchHub — Research Forum & Marketplace",
    description:
      "A professional platform for researchers, academics, and companies.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
