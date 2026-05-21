import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Sylive Chu's Blog",
  description: "A personal blog with articles, resume, and photo gallery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <SiteHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
