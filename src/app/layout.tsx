import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { AudioProvider } from "@/lib/audio-context";
import { ThemeProvider } from "@/lib/theme-context";
import SiteHeader from "@/components/SiteHeader";
import PageTransition from "@/components/PageTransition";
import VisitTracker from "@/components/VisitTracker";
import CloudCompanion from "@/components/CloudCompanion";
import StarField from "@/components/StarField";

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const fontSerif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

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
      <body className={`antialiased ${fontSans.variable} ${fontSerif.variable} ${fontMono.variable}`}>
        <ThemeProvider>
          <AuthProvider>
            <AudioProvider>
              <SiteHeader />
              <PageTransition>{children}</PageTransition>
              <VisitTracker />
              <StarField />
              <CloudCompanion />
            </AudioProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
