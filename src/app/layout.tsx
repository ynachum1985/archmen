import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { APP_CONFIG } from "@/config/app.config";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

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

'use client'

import { usePathname } from 'next/navigation'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard'

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={inter.className + " antialiased"}>
        <div className={isDashboard ? "flex h-screen flex-col" : "flex min-h-screen flex-col"}>
          <Header />
          <main className={isDashboard ? "flex-1 overflow-hidden" : "flex-1"}>{children}</main>
          {!isDashboard && <Footer />}
        </div>
      </body>
    </html>
  );
}
