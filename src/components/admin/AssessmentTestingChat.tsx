"use client"

import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Send, Loader2, X, TestTube } from 'lucide-react'

interface EnhancedAssessmentConfig {
  name: string
  description: string
  category: string
  purpose: string
  expectedDuration: number
  systemPrompt: string
  minQuestions: number
  maxQuestions: number
  evidenceThreshold: number
  adaptationSensitivity: number
  cycleSettings: {
    maxCycles: number
    evidencePerCycle: number
  }
  selectedPersonalityId?: string
  assessmentPrompt: string
  questionExamples: {
    openEnded: string[]
    followUp: string[]
    clarifying: string[]
    deepening: string[]
  }
  responseRequirements: {
    minSentences: number
    maxSentences: number
    followUpPrompts: string[]
  }
  reportGeneration: string
}

interface ConversationMessage {
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface AssessmentTestingChatProps {
  config: EnhancedAssessmentConfig
  onClose: () => void
}

export function AssessmentTestingChat({ config, onClose }: AssessmentTestingChatProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [questionCount, setQuestionCount] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  const generateInitialQuestion = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          systemPrompt: `${config.assessmentPrompt}

You are conducting an assessment with the following configuration:
- Min Questions: ${config.minQuestions}
- Max Questions: ${config.maxQuestions}
- Evidence Threshold: ${config.evidenceThreshold}
- Adaptation Sensitivity: ${config.adaptationSensitivity}

Start the conversation with an engaging opening question that aligns with the assessment purpose. Be natural and conversational.`
        })
      })

      const data = await response.json()
      const content = data.message || data.content || 'Hello! Let\'s begin your assessment.'

      const aiMessage: ConversationMessage = {
        role: 'ai',
        content,
        timestamp: new Date()
      }

      setMessages([aiMessage])
      setQuestionCount(1)
    } catch (error) {
      console.error('Error generating initial question:', error)
      const fallbackMessage: ConversationMessage = {
        role: 'ai',
        content: 'Hello! I\'m here to guide you through this assessment. Let\'s start with a simple question: What brings you here today?',
        timestamp: new Date()
      }
      setMessages([fallbackMessage])
      setQuestionCount(1)
    } finally {
      setIsLoading(false)
    }
  }, [config.assessmentPrompt, config.minQuestions, config.maxQuestions, config.evidenceThreshold, config.adaptationSensitivity])

  // Initialize the conversation with the first question
  useEffect(() => {
    if (!isInitialized) {
      generateInitialQuestion()
      setIsInitialized(true)
    }
  }, [isInitialized, generateInitialQuestion])

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isLoading) return

    const userMessage: ConversationMessage = {
      role: 'user',
      content: currentInput.trim(),
      timestamp: new Date()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setCurrentInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.content
          })),
          systemPrompt: `${config.assessmentPrompt}

Current question count: ${questionCount}
Min questions: ${config.minQuestions}
Max questions: ${config.maxQuestions}

Continue the assessment conversation. Ask follow-up questions based on their response. If you've reached the minimum questions and have sufficient evidence, you can conclude the assessment.`
        })
      })

      const data = await response.json()
      const content = data.message || data.content || 'Thank you for sharing that.'

      const aiMessage: ConversationMessage = {
        role: 'ai',
        content,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      setQuestionCount(prev => prev + 1)
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ConversationMessage = {
        role: 'ai',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
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

  const progress = Math.min((questionCount / config.maxQuestions) * 100, 100)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <TestTube className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Testing: {config.name}</h3>
              <p className="text-sm text-gray-500">Question {questionCount} of {config.maxQuestions}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress */}
        <div className="px-4 py-2 border-b border-gray-100">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
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
              <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !currentInput.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This is a test environment. Your responses help validate the assessment configuration.
          </p>
        </div>
      </div>
    </div>
  )
}
