import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
