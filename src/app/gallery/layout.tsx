import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery | UIU Photography Club",
  description: "Explore the stunning collection of photographs captured by the talented members of UIU Photography Club.",
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
