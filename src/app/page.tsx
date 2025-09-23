'use client'

// Force dynamic rendering to avoid build-time issues
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Brain, Heart, Shield, Sparkles, MessageCircle } from 'lucide-react'
import { APP_CONFIG } from '@/config/app.config'
import { createClient } from '@/lib/supabase/client'
import { Footer } from '@/components/layout/Footer'
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
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="h-8 w-8 text-gray-700" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ArchMen
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover Your Authentic Self Through Archetypal Psychology
            </p>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Understand Your Archetypal Patterns
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Through AI-powered conversation and Jungian psychology, discover the archetypal patterns
                  that shape your personality, relationships, and life choices. Our comprehensive assessment
                  reveals your authentic self and provides personalized insights for growth.
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-100/60 rounded-full">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">AI-Powered Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-purple-100/60 rounded-full">
                    <Heart className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-purple-700">Jungian Psychology</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-100/60 rounded-full">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">Shadow Work</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Conversational Assessment</h3>
                    <p className="text-gray-600 text-sm">
                      Natural AI conversation that reveals your archetypal patterns through thoughtful questions and analysis.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Deep Analysis</h3>
                    <p className="text-gray-600 text-sm">
                      Advanced AI analyzes your language patterns, values, and responses to identify your core archetypes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Personal Growth</h3>
                    <p className="text-gray-600 text-sm">
                      Receive personalized insights and integration practices to develop your authentic self.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Main Assessment */}
            <div className="lg:sticky lg:top-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/60 shadow-lg">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-6 w-6 text-gray-700" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    Main Assessment
                  </h2>
                  <p className="text-gray-600 text-sm mb-6">
                    Begin your journey of self-discovery with our comprehensive archetypal assessment.
                    Takes approximately 18 minutes through natural conversation.
                  </p>
                </div>

                <div className="space-y-4">
                  <Link href="/auth/login" className="block">
                    <Button className="w-full bg-gray-900/90 hover:bg-gray-900 text-white border-0 rounded-xl h-12 text-base">
                      Start Free Assessment
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <p className="text-center text-xs text-gray-500">
                    New to ArchMen?{' '}
                    <Link href="/auth/signup" className="text-gray-700 hover:text-gray-900 font-medium">
                      Create an account
                    </Link>
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-xs text-gray-500 text-center">
                    <p className="mb-2">✓ Free comprehensive assessment</p>
                    <p className="mb-2">✓ Personalized archetype analysis</p>
                    <p>✓ Growth recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>

      <Footer />
    </div>
  )
}
