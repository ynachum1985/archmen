'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Brain, Heart, Shield, Send, Sparkles } from 'lucide-react'
import { APP_CONFIG } from '@/config/app.config'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { LinguisticAssessment } from '@/components/chat/LinguisticAssessment'
import { DiscoveredArchetypes } from '@/components/chat/AssessmentQuiz'

export default function HomePage() {
  const [message, setMessage] = useState('')
  const [discoveredArchetypes, setDiscoveredArchetypes] = useState<string[]>([])
  const [showAssessment, setShowAssessment] = useState(false)


  const handleDiscoveredArchetypes = (archetypes: string[]) => {
    setDiscoveredArchetypes(archetypes)
  }

  const handleQuizComplete = (results: {
    theme: string
    conversation: Array<{
      question: string
      response: string
      timestamp: string
      linguisticAnalysis: Record<string, unknown>
    }>
    finalScores: Record<string, number>
    report: string
  }) => {
    console.log('Assessment completed:', results)
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Column - Hero Content */}
        <div className="flex flex-col justify-center px-8 lg:px-16 py-12">
          <div className="max-w-lg">
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              {APP_CONFIG.name}
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              {APP_CONFIG.description}
            </p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                <Brain className="h-4 w-4 text-slate-600" />
                <span className="text-sm text-slate-700">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                <Heart className="h-4 w-4 text-slate-600" />
                <span className="text-sm text-slate-700">Jungian Psychology</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                <Shield className="h-4 w-4 text-slate-600" />
                <span className="text-sm text-slate-700">Shadow Work</span>
              </div>
            </div>
            
            {showAssessment ? (
              <LinguisticAssessment 
                onDiscoveredArchetypes={handleDiscoveredArchetypes}
                onAssessmentComplete={handleQuizComplete}
              />
            ) : (
              <Button 
                onClick={() => setShowAssessment(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 text-lg"
              >
                Start Free Assessment
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}

            {/* Discovered Archetypes */}
            {discoveredArchetypes.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-teal-600" />
                  Your Emerging Archetypes
                </h3>
                <DiscoveredArchetypes archetypes={discoveredArchetypes} />
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Chat Interface */}
        <div className="bg-slate-900 flex flex-col p-8 lg:p-16">
          <div className="flex items-center gap-3 mb-8">
            <Brain className="h-8 w-8 text-teal-400" />
            <h2 className="text-2xl font-semibold text-white">Chat with ArchMen</h2>
          </div>
          
          <div className="flex-1 flex flex-col">
            {/* Chat welcome message */}
            <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-700">
              <p className="text-gray-300 leading-relaxed">
                Welcome! I&apos;m here to help you understand your archetypal patterns in relationships. 
                Start with our free assessment, or ask me any questions about archetypes, 
                shadow work, or relationship dynamics.
              </p>
            </div>
            
            {/* Chat input area */}
            <div className="flex-1 flex flex-col justify-end">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Ask me about your archetypes, relationships, or shadow work..."
                  className="bg-slate-800 border-slate-700 text-white placeholder-gray-400 min-h-[100px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button 
                  size="icon" 
                  className="bg-teal-600 hover:bg-teal-700 text-white self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
