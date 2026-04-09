import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Committee | UIU Photography Club",
  description: "Meet the passionate individuals and executive committee members driving the UIU Photography Club forward.",
};

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
