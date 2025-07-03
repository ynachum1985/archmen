"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Brain, Send, Loader2, Users, Target, MessageCircle, CheckCircle } from 'lucide-react'

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

interface ArchetypeScore {
  name: string
  score: number
  confidence: number
  evidence: string[]
  traits: string[]
}

interface ConversationMessage {
  role: 'ai' | 'user'
  content: string
  timestamp: Date
  archetypeAnalysis?: ArchetypeScore[]
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

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isLoading) return

    const userMessage: ConversationMessage = {
      role: 'user',
      content: currentInput,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentInput('')
    setIsLoading(true)

    try {
      const conversationHistory = [...messages, userMessage]
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          systemPrompt: `You are conducting a linguistic assessment with the following purpose: ${config.purpose}

Analysis Instructions: ${config.analysisInstructions}

Questioning Style: ${config.questioningStyle}

Target Archetypes: ${config.targetArchetypes.join(', ')}

Completion Criteria: ${config.completionCriteria}

Based on the user's responses, analyze their linguistic patterns and provide:
1. A thoughtful follow-up question OR assessment completion
2. Current archetype scores with confidence levels
3. Specific evidence from their language patterns
4. Key traits observed

Return your response in this JSON format:
{
  "message": "Your next question or completion message",
  "isComplete": false,
  "archetypeAnalysis": [
    {
      "name": "Archetype Name",
      "score": 0.8,
      "confidence": 0.7,
      "evidence": ["specific language patterns observed"],
      "traits": ["key traits identified"]
    }
  ]
}`
        })
      })

      const data = await response.json()
      
      let parsedData
      try {
        parsedData = JSON.parse(data.message)
      } catch {
        // Fallback if AI doesn't return JSON
        parsedData = {
          message: data.message,
          isComplete: false,
          archetypeAnalysis: []
        }
      }

      const aiMessage: ConversationMessage = {
        role: 'ai',
        content: parsedData.message,
        timestamp: new Date(),
        archetypeAnalysis: parsedData.archetypeAnalysis
      }
      
      setMessages(prev => [...prev, aiMessage])
      
      // Update discovered archetypes
      if (parsedData.archetypeAnalysis && parsedData.archetypeAnalysis.length > 0) {
        setDiscoveredArchetypes(parsedData.archetypeAnalysis)
        setProgress(Math.min(95, messages.length * 15))
      }
      
      // Check if assessment is complete
      if (parsedData.isComplete) {
        setAssessmentComplete(true)
        setProgress(100)
        onComplete(parsedData.archetypeAnalysis || discoveredArchetypes)
      }
      
    } catch (error) {
      console.error('Error sending message:', error)
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation */}
          <div className="lg:col-span-2">
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
          </div>

          {/* Real-time Archetype Discovery */}
          <div className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-400" />
                  Discovered Archetypes
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Emerging patterns from your responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {discoveredArchetypes.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">
                    Archetypes will appear here as patterns emerge from your responses
                  </p>
                ) : (
                  discoveredArchetypes
                    .sort((a, b) => b.score - a.score)
                    .map((archetype, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-white">{archetype.name}</h4>
                          <Badge 
                            variant="outline" 
                            className="border-teal-600 text-teal-400"
                          >
                            {Math.round(archetype.score * 100)}%
                          </Badge>
                        </div>
                        
                        <Progress 
                          value={archetype.score * 100} 
                          className="h-2"
                        />
                        
                        <div className="text-xs text-gray-400">
                          Confidence: {Math.round(archetype.confidence * 100)}%
                        </div>
                        
                        {archetype.traits && archetype.traits.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {archetype.traits.slice(0, 3).map((trait, i) => (
                              <Badge 
                                key={i} 
                                variant="secondary" 
                                className="text-xs bg-slate-700 text-gray-300"
                              >
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {index < discoveredArchetypes.length - 1 && (
                          <Separator className="bg-slate-700" />
                        )}
                      </div>
                    ))
                )}
              </CardContent>
            </Card>

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