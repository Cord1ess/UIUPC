import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f5ea" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};
import { DM_Sans, Playfair_Display } from "next/font/google";
import "../styles/index.css";

// Phase 4: next/font Zero-CLS integration
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "UIUPC | UIU Photography Club",
    template: "%s | UIUPC"
  },
  description: "Official portal of United International University Photography Club. Explore our gallery, join the community, and participate in premier photography events.",
  keywords: ["UIU", "Photography", "Club", "United International University", "Photo Exhibition", "Shutter Stories"],
  authors: [{ name: "UIUPC Core Team" }],
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: "https://uiupc.com",
    siteName: "UIUPC",
    title: "UIU Photography Club",
    description: "The most active photography community at United International University.",
    images: [
      {
        url: "https://uiupc.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "UIUPC Official"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "UIU Photography Club",
    description: "Capturing perspectives since 2019.",
    images: ["https://uiupc.com/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GlobalLoader from "@/components/shared/GlobalLoader";
import DynamicGrid from "@/components/shared/DynamicGrid";
import PageTransition from "@/components/layout/PageTransition";

import GlobalPrefetch from "@/components/shared/GlobalPrefetch";
import ConsoleArt from "@/components/shared/ConsoleArt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfairDisplay.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
        <ConsoleArt />
        <link rel="preconnect" href="https://wsrv.nl" />
        <link rel="dns-prefetch" href="https://wsrv.nl" />
      </head>
      <body className="font-sans antialiased transition-colors duration-300 relative min-h-screen">
        <ThemeProvider>
          <GlobalPrefetch />
          <DynamicGrid />
          <SupabaseAuthProvider>
            <GlobalLoader />
            <Header />
            <main className="relative z-10 flex-1 isolate">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <Footer />
          </SupabaseAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
