import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events | UIU Photography Club",
  description: "Experience the pinnacle of photographic excellence through our signature events at UIU Photography Club.",
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
