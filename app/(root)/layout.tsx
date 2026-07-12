import { Nav } from "@/components/landing/Nav";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Home page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className="min-h-full flex flex-col">
        <Nav/>
        {children}
        </body>
    </html>
  );
}
