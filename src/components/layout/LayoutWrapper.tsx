'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard'

  return (
    <div className={isDashboard ? "flex h-screen flex-col" : "flex min-h-screen flex-col"}>
      <Header />
      <main className={isDashboard ? "flex-1 overflow-hidden" : "flex-1"}>
        {children}
      </main>
      {!isDashboard && <Footer />}
    </div>
  )
}

