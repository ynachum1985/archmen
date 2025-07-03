'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Brain, Heart, Shield, Users, Target, Send, Sparkles } from 'lucide-react'
import { APP_CONFIG } from '@/config/app.config'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { AssessmentQuiz, DiscoveredArchetypes } from '@/components/chat/AssessmentQuiz'

export default function HomePage() {
  const [message, setMessage] = useState('')
  const [discoveredArchetypes, setDiscoveredArchetypes] = useState<string[]>([])
  const [showAssessment, setShowAssessment] = useState(false)
  const [assessmentCompleted, setAssessmentCompleted] = useState(false)

  const handleDiscoveredArchetypes = (archetypes: string[]) => {
    setDiscoveredArchetypes(archetypes)
  }

  const handleQuizComplete = (results: any) => {
    setAssessmentCompleted(true)
    console.log('Assessment completed:', results)
  }

  const handleStartAssessment = () => {
    setShowAssessment(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/30 bg-slate-900/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{APP_CONFIG.name}</h1>
                <p className="text-xs text-gray-400">Discover Your Archetypal Patterns</p>
              </div>
            </div>
            <nav className="flex items-center space-x-6">
              <Button
                variant="ghost"
                onClick={handleStartAssessment}
                className="text-gray-300 hover:text-white text-sm font-medium"
              >
                Take Assessment
              </Button>
              <Link href="/admin" className="text-gray-300 hover:text-white text-sm font-medium">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Discover Your <span className="text-teal-400">Inner Patterns</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Uncover the archetypal forces that shape your relationships, understand your shadow aspects, and embark on a journey of profound self-discovery.
            </p>
          </div>

          {/* Chat Interface */}
          <div className="bg-slate-800/20 border border-slate-700/30 rounded-3xl p-8 mb-12 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">ArchMen AI</p>
                <p className="text-sm text-gray-400">Your Archetypal Guide</p>
              </div>
            </div>
            
            <div className="bg-slate-700/20 rounded-2xl p-6 mb-6 border border-slate-600/30">
              <p className="text-gray-300 leading-relaxed">
                Welcome! I'm here to help you understand your archetypal patterns in relationships. 
                Start with our free assessment below, or ask me any questions about archetypes, 
                shadow work, or relationship dynamics.
              </p>
            </div>

            <div className="flex gap-3">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me about your relationship patterns..."
                className="flex-1 bg-slate-700/20 border-slate-600/30 text-white placeholder-gray-400 resize-none rounded-xl"
                rows={2}
              />
              <Button className="bg-teal-600 hover:bg-teal-700 text-white self-end rounded-xl">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Assessment and Discovery Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              {showAssessment ? (
                <AssessmentQuiz 
                  onDiscoveredArchetypes={handleDiscoveredArchetypes}
                  onQuizComplete={handleQuizComplete}
                />
              ) : (
                <Card className="bg-slate-800/20 border-slate-700/30 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">Ready to Begin?</h3>
                      <p className="text-gray-400">Take our free assessment to discover your archetypal patterns</p>
                    </div>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <Heart className="h-4 w-4 text-teal-400" />
                        <span>8 insightful questions</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <Target className="h-4 w-4 text-teal-400" />
                        <span>5 minutes to complete</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <Shield className="h-4 w-4 text-teal-400" />
                        <span>Discover your top 3 archetypes</span>
                      </div>
                    </div>
                    <Button 
                      onClick={handleStartAssessment}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 text-lg rounded-xl"
                    >
                      Start Free Assessment
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <DiscoveredArchetypes archetypes={discoveredArchetypes} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
