import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News & Updates | UIU Photography Club",
  description: "Stay updated with the latest stories, tutorials, and updates from the UIU Photography Club community.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
