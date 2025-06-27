import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { APP_CONFIG } from "@/config/app.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_CONFIG.seo.defaultTitle,
  description: APP_CONFIG.seo.defaultDescription,
  keywords: [...APP_CONFIG.seo.keywords],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-primary">ArchMen</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6">
                  <a href="/chat" className="text-sm font-medium hover:text-primary transition-colors">
                    Assessment
                  </a>
                  <a href="/courses" className="text-sm font-medium hover:text-primary transition-colors">
                    Courses
                  </a>
                  <a href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                    About
                  </a>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="/login"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </a>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t">
            <div className="container py-8 text-center text-sm text-muted-foreground">
              © 2024 {APP_CONFIG.name}. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
