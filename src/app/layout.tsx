import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SessionProvider } from "next-auth/react";
import { organizationSchema } from "@/lib/structured-data";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "The Intellectual Exchange — Research Community & Marketplace",
  description:
    "A professional platform for researchers, academics, and companies. Ask questions, share knowledge, hire experts, and discover research tools.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "The Intellectual Exchange — Research Community & Marketplace",
    description:
      "A professional platform for researchers, academics, and companies. Ask questions, share knowledge, hire experts, and discover research tools.",
    siteName: "The Intellectual Exchange",
    type: "website",
    locale: "en_US",
    images: [{ url: "/logo.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Intellectual Exchange — Research Community & Marketplace",
    description:
      "A professional platform for researchers, academics, and companies.",
    images: ["/logo.png"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
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
