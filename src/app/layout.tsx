import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import SiteHeader from "@/components/SiteHeader";
import VisitTracker from "@/components/VisitTracker";
import BlogPet from "@/components/BlogPet";
import StarField from "@/components/StarField";

export const metadata: Metadata = {
  title: {
    default: "Sylive Chu's Blog",
    template: "%s | Sylive Chu's Blog",
  },
  description: "A personal blog with articles, resume, and photo gallery",
  openGraph: {
    title: "Sylive Chu's Blog",
    description: "A personal blog with articles, resume, and photo gallery",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <SiteHeader />
            {children}
            <VisitTracker />
            <StarField />
            <BlogPet />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
