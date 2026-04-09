import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Results & Payments | UIU Photography Club",
  description: "Check the results of the latest photography exhibitions and complete your registration payments securely.",
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
