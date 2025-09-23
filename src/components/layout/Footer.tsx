import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200/50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 mb-4 md:mb-0">
            © 2024 ArchMen. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900">
              Terms
            </Link>
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
