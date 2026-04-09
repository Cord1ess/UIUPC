import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Us | UIU Photography Club",
  description: "Become a member of the UIU Photography Club and start your photographic journey with a community of passionate creators.",
};

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
