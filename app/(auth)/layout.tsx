import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth",
  description: "Authentication pages",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
