'use client'

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Brain, Heart, Shield, Sparkles, MessageCircle } from 'lucide-react'
import { APP_CONFIG } from '@/config/app.config'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Redirect authenticated users to dashboard
        window.location.href = '/dashboard'
        return
      }

      setUser(null)
      setLoading(false)
    }

    checkUser()
  }, [])


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/60 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-gray-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {APP_CONFIG.name}
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Discover your archetypal patterns through AI-powered conversation
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100/60 rounded-full">
              <Brain className="h-3 w-3 text-gray-600" />
              <span className="text-xs text-gray-700">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100/60 rounded-full">
              <Heart className="h-3 w-3 text-gray-600" />
              <span className="text-xs text-gray-700">Jungian Psychology</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100/60 rounded-full">
              <Shield className="h-3 w-3 text-gray-600" />
              <span className="text-xs text-gray-700">Shadow Work</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link href="/auth/login" className="block">
              <Button className="w-full bg-gray-900/90 hover:bg-gray-900 text-white border-0 rounded-xl h-11">
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <p className="text-center text-xs text-gray-500">
              New to ArchMen?{' '}
              <Link href="/auth/signup" className="text-gray-700 hover:text-gray-900 font-medium">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
