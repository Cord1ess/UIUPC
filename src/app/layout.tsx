import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/index.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans transition-colors duration-300`}>
        <ThemeProvider>
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
