import type { Metadata } from "next";
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

import { AuthProvider } from "@/contexts/AuthContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GlobalLoader from "@/components/shared/GlobalLoader";
import DynamicGrid from "@/components/shared/DynamicGrid";
import { cookies } from "next/headers";
import PageTransition from "@/components/layout/PageTransition";

import GlobalPrefetch from "@/components/shared/GlobalPrefetch";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";

  return (
    <html lang="en" className={`${theme === "dark" ? "dark" : ""} ${dmSans.variable} ${playfairDisplay.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-sans antialiased transition-colors duration-300 relative min-h-screen">
        <ThemeProvider>
          <GlobalPrefetch />
          <DynamicGrid />
          <AuthProvider>
            <SupabaseAuthProvider>
              <GlobalLoader />
              <Header />
              <main>
                <PageTransition>
                  {children}
                </PageTransition>
              </main>
              <Footer />
            </SupabaseAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
