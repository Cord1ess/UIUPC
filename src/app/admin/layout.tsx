import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | UIU Photography Club",
  description: "Secure administrative access for managing UIU Photography Club membership, events, and content.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
