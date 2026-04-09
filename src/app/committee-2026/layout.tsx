import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Committee 2026 | UIU Photography Club",
  description: "Meet the next generation of leadership at UIU Photography Club. Discover the passionate individuals shaping the future of our club in 2026.",
};

export default function Committee2026Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
