import type { Metadata } from "next";
import "../styles/index.css";
// Import Variable Fonts from Fontsource
import "@fontsource-variable/dm-sans";
import "@fontsource-variable/playfair-display";

export const metadata: Metadata = {
  title: "UIU Photography Club",
  description: "Official website of United International University Photography Club (UIUPC)",
  icons: {
    icon: "/favicon.svg",
  },
};

import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GlobalLoader from "@/components/common/GlobalLoader";
import DynamicGrid from "@/components/ui/DynamicGrid";
import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";

  return (
    <html lang="en" className={theme === "dark" ? "dark" : ""} suppressHydrationWarning>
      <body className="font-sans antialiased transition-colors duration-300 relative min-h-screen">
        <ThemeProvider>
          <DynamicGrid />
          <AuthProvider>
            <GlobalLoader />
            <Header />
            <main>{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
