"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { linguisticAssessmentService } from '@/lib/services/linguistic-assessment.service'
import { assessmentIntegrationService, type HomepageAssessmentTheme } from '@/lib/services/assessment-integration.service'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Brain, Send, Loader2, UserPlus, AlertCircle } from 'lucide-react'

// Use the HomepageAssessmentTheme from integration service
type AssessmentTheme = HomepageAssessmentTheme

interface LinguisticIndicators {
  emotionalTone: string[]
  keyPhrases: string[]
  languagePatterns: string[]
  archetypeSignals: Record<string, number>
  [key: string]: unknown
}

interface ConversationTurn {
  question: string
  response: string
  timestamp: string
  linguisticAnalysis: LinguisticIndicators
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
  const [sessionId, setSessionId] = useState<string | undefined>()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [requiresAuth, setRequiresAuth] = useState(false)
  const [freeQuestionsRemaining, setFreeQuestionsRemaining] = useState(2)
  const [integrationStatus, setIntegrationStatus] = useState<string>('')

  const [isComplete, setIsComplete] = useState(false)
  const [finalReport, setFinalReport] = useState('')

  const supabase = createClient()

  useEffect(() => {
    // Load available themes and check auth status
    const initializeComponent = async () => {
      // Check integration status first
      const status = await assessmentIntegrationService.checkIntegrationStatus()
      setIntegrationStatus(status.recommendedAction)

      // First try to get assessments from the Assessment Builder
      const builderAssessments = await assessmentIntegrationService.getAvailableAssessments()

      if (builderAssessments.length > 0) {
        console.log(`Using ${builderAssessments.length} assessments from Assessment Builder`)
        setThemes(builderAssessments)
      } else {
        // Fallback to hardcoded themes from linguistic assessment service
        console.log('Using fallback hardcoded themes')
        const fallbackThemes = await linguisticAssessmentService.getAvailableThemes()
        setThemes(fallbackThemes)
      }

      await checkAuthStatus()
    }

    initializeComponent()
  }, []) // checkAuthStatus is stable and doesn't need to be in dependencies

  const checkAuthStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
  }

  const startAssessment = async (themeId: string) => {
    try {
      const { theme, initialQuestion, sessionId: newSessionId, isAuthenticated: authStatus } =
        await linguisticAssessmentService.startAssessment(themeId)

      setSelectedTheme(theme)
      setCurrentQuestion(initialQuestion)
      setAssessmentStarted(true)
      setConversation([])
      setSessionId(newSessionId)
      setIsAuthenticated(authStatus)
      setFreeQuestionsRemaining(2)
      setRequiresAuth(false)
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
        selectedTheme,
        sessionId
      )

      // Update state with result
      setRequiresAuth(result.requiresAuth)
      setFreeQuestionsRemaining(result.freeQuestionsRemaining)

      if (result.requiresAuth) {
        // Show authentication prompt
        setCurrentQuestion(result.nextQuestion)
        setUserResponse('')
        setIsAnalyzing(false)
        return
      }

      // Add this turn to conversation history
      const newTurn: ConversationTurn = {
        question: currentQuestion,
        response: userResponse,
        timestamp: new Date().toISOString(),
        linguisticAnalysis: result.linguisticAnalysis
      }

      const updatedConversation = [...conversation, newTurn]
      setConversation(updatedConversation)

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
          selectedTheme,
          sessionId
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
    if (e.key === 'Enter' && e.metaKey && !requiresAuth) {
      submitResponse()
    }
  }

  const handleSignUp = () => {
    // Redirect to sign up page
    window.location.href = '/register'
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
                <p>✨ <strong>How it works:</strong> I&apos;ll ask you thoughtful questions and analyze your linguistic patterns, word choices, and communication style to reveal your archetypal patterns.</p>
                <p>🎯 <strong>What&apos;s different:</strong> No multiple choice - just natural conversation that adapts to your responses.</p>
                <p>🧠 <strong>Focus:</strong> Your language reveals deep patterns about how you show up in different areas of life.</p>
              </div>

              {!isAuthenticated && (
                <Alert className="border-teal-600 bg-teal-950/20">
                  <AlertCircle className="h-4 w-4 text-teal-400" />
                  <AlertDescription className="text-teal-300">
                    <strong>Free Trial:</strong> Try 2 questions for free! Create a free account to continue your assessment and receive your personalized archetype analysis.
                  </AlertDescription>
                </Alert>
              )}

              {/* Development Info - Only show in development */}
              {process.env.NODE_ENV === 'development' && integrationStatus && (
                <Alert className="border-blue-600 bg-blue-950/20">
                  <Brain className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-300">
                    <strong>Assessment Builder Status:</strong> {integrationStatus}
                  </AlertDescription>
                </Alert>
              )}
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
          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <Badge variant="outline" className="border-orange-600 text-orange-400">
                Free: {freeQuestionsRemaining} left
              </Badge>
            )}
            <Badge variant="outline" className="border-teal-600 text-teal-400">
              {conversation.length}/7 exchanges
            </Badge>
          </div>
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

            {requiresAuth ? (
              // Authentication required prompt
              <div className="space-y-4">
                <Alert className="border-orange-600 bg-orange-950/20">
                  <UserPlus className="h-4 w-4 text-orange-400" />
                  <AlertDescription className="text-orange-300">
                    You&apos;ve completed your free trial questions! Create a free account to continue your assessment and receive your personalized archetype analysis.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSignUp}
                    className="bg-teal-600 hover:bg-teal-700 text-white flex-1"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Free Account
                  </Button>
                  <Button
                    onClick={() => {
                      setAssessmentStarted(false)
                      setRequiresAuth(false)
                    }}
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    Try Different Theme
                  </Button>
                </div>
              </div>
            ) : (
              // Normal response interface
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
                    Tip: Speak naturally - I&apos;m analyzing your language patterns, not looking for &quot;right&quot; answers
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
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 