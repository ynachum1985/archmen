"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
// import { Separator } from "@/components/ui/separator"
import { ProgressiveArchetypeDiscovery } from './ProgressiveArchetypeDiscovery'
import { Brain, Send, Loader2, Target, MessageCircle, CheckCircle } from 'lucide-react'

interface AssessmentConfig {
  name: string
  description: string
  purpose: string
  targetArchetypes: string[]
  analysisInstructions: string
  questioningStyle: string
  expectedDuration: number
  completionCriteria: string
}

interface ConversationMessage {
  role: 'user' | 'ai'
  content: string
  timestamp: Date
  analysis?: ArchetypeAnalysis
}

interface ArchetypeAnalysis {
  scores: { [archetype: string]: number }
  reasoning: string
  patterns: string[]
}

interface ArchetypeScore {
  name: string
  score: number
  confidence: number
  evidence: string[]
  traits: string[]
}

interface EnhancedLinguisticAssessmentProps {
  config: AssessmentConfig
  onComplete: (results: ArchetypeScore[]) => void
}

export function EnhancedLinguisticAssessment({ config, onComplete }: EnhancedLinguisticAssessmentProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [discoveredArchetypes, setDiscoveredArchetypes] = useState<ArchetypeScore[]>([])
  const [assessmentComplete, setAssessmentComplete] = useState(false)
  const [progress, setProgress] = useState(0)

  const generateInitialQuestion = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          systemPrompt: `You are conducting a linguistic assessment with the following purpose: ${config.purpose}

Analysis Instructions: ${config.analysisInstructions}

Questioning Style: ${config.questioningStyle}

Target Archetypes: ${config.targetArchetypes.join(', ')}

Start the assessment with an engaging opening question that will reveal linguistic patterns. Be warm, curious, and professional.`
        })
      })

      const data = await response.json()
      const aiMessage: ConversationMessage = {
        role: 'ai',
        content: data.message,
        timestamp: new Date()
      }
      
      setMessages([aiMessage])
    } catch (error) {
      console.error('Error generating initial question:', error)
    } finally {
      setIsLoading(false)
    }
  }, [config])

  // Initialize with AI's first question
  useEffect(() => {
    generateInitialQuestion()
  }, [generateInitialQuestion])

  const analyzeResponse = async (userMessage: string, conversationHistory: ConversationMessage[]) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory.map(m => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.content
          })),
          systemPrompt: `You are analyzing this conversation for archetypal patterns. Based on the user's responses, provide:

1. A natural follow-up question or comment
2. Analysis of archetypal patterns in their language

Focus on: ${config.targetArchetypes.join(', ')}

Analysis Instructions: ${config.analysisInstructions}

Respond in this format:
RESPONSE: [your natural follow-up question or comment]
ANALYSIS: [JSON object with archetype scores 0-1 and reasoning]

Example:
RESPONSE: That's fascinating how you approached that situation. What emotions were you experiencing in that moment?
ANALYSIS: {"scores": {"The Caregiver": 0.7, "The Wise Mentor": 0.4}, "reasoning": "Strong emphasis on helping others, nurturing language patterns", "patterns": ["Uses inclusive language", "Focuses on others' wellbeing"]}`
        })
      })

      const data = await response.json()
      const content = data.message || data.content || ''
      
      // Parse the response to extract the AI message and analysis
      const responsePart = content.split('ANALYSIS:')[0].replace('RESPONSE:', '').trim()
      const analysisPart = content.split('ANALYSIS:')[1]?.trim()

      let analysis: ArchetypeAnalysis | undefined
      if (analysisPart) {
        try {
          const parsed = JSON.parse(analysisPart)
          analysis = {
            scores: parsed.scores || {},
            reasoning: parsed.reasoning || '',
            patterns: parsed.patterns || []
          }
        } catch (e) {
          console.error('Error parsing analysis:', e)
        }
      }

      return {
        response: responsePart,
        analysis
      }
    } catch (error) {
      console.error('Error analyzing response:', error)
      return {
        response: "I'd love to hear more about that. Can you tell me what that experience was like for you?",
        analysis: undefined
      }
    }
  }

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isLoading) return

    const userMessage: ConversationMessage = {
      role: 'user',
      content: currentInput,
      timestamp: new Date()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setCurrentInput('')
    setIsLoading(true)

    try {
      const { response, analysis } = await analyzeResponse(currentInput, updatedMessages)
      
      const aiMessage: ConversationMessage = {
        role: 'ai',
        content: response,
        timestamp: new Date(),
        analysis
      }

      setMessages(prev => [...prev, aiMessage])

      // Update discovered archetypes based on analysis
      if (analysis && analysis.scores) {
        const newArchetypes: ArchetypeScore[] = Object.entries(analysis.scores).map(([name, score]) => ({
          name,
          score: score as number,
          confidence: score as number,
          evidence: analysis.patterns || [],
          traits: []
        }))
        
        setDiscoveredArchetypes(newArchetypes)
      }

      // Update progress based on conversation length
      const newProgress = Math.min((updatedMessages.length / 14) * 100, 100)
      setProgress(newProgress)

      // Check completion criteria
      if (updatedMessages.length >= 14 || newProgress >= 100) {
        setAssessmentComplete(true)
        onComplete(discoveredArchetypes)
      }

    } catch (error) {
      console.error('Error in conversation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Brain className="h-6 w-6 text-teal-400" />
              {config.name}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {config.description}
            </CardDescription>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              {assessmentComplete && (
                <Badge className="bg-green-600 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversation */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-teal-400" />
                Assessment Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Messages */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-700 text-gray-100'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-700 text-gray-100 p-3 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              {!assessmentComplete && (
                <div className="flex gap-2">
                  <Input
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share your thoughts..."
                    className="bg-slate-700 border-slate-600 text-white flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !currentInput.trim()}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progressive Archetype Discovery */}
          <div className="space-y-6">
            <ProgressiveArchetypeDiscovery 
              archetypeScores={discoveredArchetypes}
              conversationTurn={Math.floor(messages.length / 2)}
            />
            
            {/* Assessment Info */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-teal-400" />
                  Assessment Focus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Purpose</h4>
                  <p className="text-xs text-gray-400">{config.purpose}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Target Archetypes</h4>
                  <div className="flex flex-wrap gap-1">
                    {config.targetArchetypes.map((archetype, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className="text-xs border-slate-600 text-slate-400"
                      >
                        {archetype}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Duration</h4>
                  <p className="text-xs text-gray-400">{config.expectedDuration} minutes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 