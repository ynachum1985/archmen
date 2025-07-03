"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { linguisticAssessmentService } from '@/lib/services/linguistic-assessment.service'
import { Sparkles, Brain, Heart, Send, Loader2 } from 'lucide-react'

interface AssessmentTheme {
  id: string
  name: string
  description: string
  focusAreas: string[]
  initialPrompt: string
  archetypeMapping: Record<string, string[]>
}

interface ConversationTurn {
  question: string
  response: string
  timestamp: string
  linguisticAnalysis: any
}

interface LinguisticAssessmentProps {
  onDiscoveredArchetypes: (archetypes: string[]) => void
  onAssessmentComplete: (results: {
    theme: string
    conversation: ConversationTurn[]
    finalScores: Record<string, number>
    report: string
  }) => void
}

export function LinguisticAssessment({ onDiscoveredArchetypes, onAssessmentComplete }: LinguisticAssessmentProps) {
  const [themes, setThemes] = useState<AssessmentTheme[]>([])
  const [selectedTheme, setSelectedTheme] = useState<AssessmentTheme | null>(null)
  const [assessmentStarted, setAssessmentStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [userResponse, setUserResponse] = useState('')
  const [conversation, setConversation] = useState<ConversationTurn[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [archetypeScores, setArchetypeScores] = useState<Record<string, number>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [finalReport, setFinalReport] = useState('')

  useEffect(() => {
    // Load available themes
    const availableThemes = linguisticAssessmentService.getAvailableThemes()
    setThemes(availableThemes)
  }, [])

  const startAssessment = async (themeId: string) => {
    try {
      const { theme, initialQuestion } = await linguisticAssessmentService.startAssessment(themeId)
      setSelectedTheme(theme)
      setCurrentQuestion(initialQuestion)
      setAssessmentStarted(true)
      setConversation([])
      setArchetypeScores({})
    } catch (error) {
      console.error('Error starting assessment:', error)
    }
  }

  const submitResponse = async () => {
    if (!userResponse.trim() || !selectedTheme || isAnalyzing) return

    setIsAnalyzing(true)

    try {
      const result = await linguisticAssessmentService.analyzeResponse(
        userResponse,
        conversation,
        selectedTheme
      )

      // Add this turn to conversation history
      const newTurn: ConversationTurn = {
        question: currentQuestion,
        response: userResponse,
        timestamp: new Date().toISOString(),
        linguisticAnalysis: result.linguisticAnalysis
      }

      const updatedConversation = [...conversation, newTurn]
      setConversation(updatedConversation)
      setArchetypeScores(result.archetypeScores)

      // Update discovered archetypes
      const topArchetypes = Object.entries(result.archetypeScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .filter(([,score]) => score > 0.3)
        .map(([archetype]) => archetype)
      
      onDiscoveredArchetypes(topArchetypes)

      if (result.isComplete) {
        // Generate final report
        const report = await linguisticAssessmentService.generateFinalReport(
          updatedConversation,
          result.archetypeScores,
          selectedTheme
        )
        
        setFinalReport(report)
        setIsComplete(true)
        
        onAssessmentComplete({
          theme: selectedTheme.name,
          conversation: updatedConversation,
          finalScores: result.archetypeScores,
          report
        })
      } else {
        // Continue with next question
        setCurrentQuestion(result.nextQuestion)
        setUserResponse('')
      }
    } catch (error) {
      console.error('Error analyzing response:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      submitResponse()
    }
  }

  const progress = selectedTheme ? Math.min(100, (conversation.length / 7) * 100) : 0

  if (!assessmentStarted) {
    return (
      <div className="space-y-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Brain className="h-6 w-6 text-teal-400" />
              AI-Powered Linguistic Assessment
            </CardTitle>
            <CardDescription className="text-gray-400">
              Choose an area of life to explore through conversational analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-400 space-y-2">
                <p>✨ <strong>How it works:</strong> I'll ask you thoughtful questions and analyze your linguistic patterns, word choices, and communication style to reveal your archetypal patterns.</p>
                <p>🎯 <strong>What's different:</strong> No multiple choice - just natural conversation that adapts to your responses.</p>
                <p>🧠 <strong>Focus:</strong> Your language reveals deep patterns about how you show up in different areas of life.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {themes.map((theme) => (
            <Card key={theme.id} className="bg-slate-800/30 border-slate-700 hover:border-teal-500 transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white mb-2">{theme.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{theme.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {theme.focusAreas.map((area) => (
                        <Badge key={area} variant="outline" className="border-slate-600 text-slate-300 text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={() => startAssessment(theme.id)}
                    className="bg-teal-600 hover:bg-teal-700 text-white ml-4"
                  >
                    Start Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-teal-400" />
            Assessment Complete
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your archetypal patterns in {selectedTheme?.name.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 whitespace-pre-line">{finalReport}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => {
                  setAssessmentStarted(false)
                  setIsComplete(false)
                  setSelectedTheme(null)
                }}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Take Another Assessment
              </Button>
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                Save Results
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-white">
            {selectedTheme?.name} Assessment
          </CardTitle>
          <Badge variant="outline" className="border-teal-600 text-teal-400">
            {conversation.length}/7 exchanges
          </Badge>
        </div>
        <Progress value={progress} className="w-full h-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Conversation History */}
          {conversation.length > 0 && (
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {conversation.slice(-2).map((turn, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-sm text-gray-400">
                    <strong>Q:</strong> {turn.question}
                  </div>
                  <div className="text-sm text-gray-300 bg-slate-700/50 p-3 rounded">
                    <strong>You:</strong> {turn.response}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Current Question */}
          <div className="space-y-4">
            <div className="text-white font-medium leading-relaxed">
              {currentQuestion}
            </div>
            
            <div className="space-y-3">
              <Textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Share your thoughts naturally... Press Cmd+Enter to submit"
                className="bg-slate-700 border-slate-600 text-white min-h-[120px] resize-none"
                disabled={isAnalyzing}
              />
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-400">
                  Tip: Speak naturally - I'm analyzing your language patterns, not looking for "right" answers
                </div>
                <Button
                  onClick={submitResponse}
                  disabled={!userResponse.trim() || isAnalyzing}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Response
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 