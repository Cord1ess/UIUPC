import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | UIU Photography Club",
  description: "Get in touch with UIU Photography Club. Reach out for inquiries, collaborations, or information about our club.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
