import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { APP_CONFIG } from "@/config/app.config";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: APP_CONFIG.seo.defaultTitle,
  description: APP_CONFIG.seo.defaultDescription,
  keywords: [...APP_CONFIG.seo.keywords],
  authors: [{ name: APP_CONFIG.name }],
  creator: APP_CONFIG.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_CONFIG.url,
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
    siteName: APP_CONFIG.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_CONFIG.name,
    description: APP_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={inter.className + " antialiased"}>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    ArchMen
                  </span>
                </Link>

              </div>
              <div className="flex items-center gap-4">
                <Link href="/auth/login" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
                  Login
                </Link>
                <Link href="/auth/signup" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft hover:bg-primary/90 transition-all hover:shadow-soft-lg">
                  Sign Up
                </Link>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
