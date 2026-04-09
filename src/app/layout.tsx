import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import CookieConsent from "@/components/shared/cookie-consent";
import { SessionProvider } from "next-auth/react";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://theintellectualexchange.com";

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
  alternates: { canonical: baseUrl },
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
    url: baseUrl,
    images: [{ url: `${baseUrl}/api/og?title=The Intellectual Exchange&subtitle=Research Community`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Intellectual Exchange — Research Community & Marketplace",
    description:
      "A professional platform for researchers, academics, and companies.",
    images: [`${baseUrl}/api/og?title=The Intellectual Exchange&subtitle=Research Community`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="author" href={`${baseUrl}/about`} />
        <link rel="preconnect" href="https://api.dicebear.com" />
        <link rel="dns-prefetch" href="https://api.dicebear.com" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={`${outfit.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
        />
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <CookieConsent />
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
