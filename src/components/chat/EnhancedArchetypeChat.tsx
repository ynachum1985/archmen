'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Brain, Sparkles, Eye, TrendingUp } from 'lucide-react'
import { aiPersonalityService, AIPersonality } from '@/lib/services/ai-personality.service'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  context?: RelevantContext
}

interface RelevantContext {
  archetypes: Array<{
    name: string
    description: string
    similarity: number
  }>
  patterns: Array<{
    archetype_name: string
    keywords: string[]
    similarity: number
  }>
}

export function EnhancedArchetypeChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [personalities, setPersonalities] = useState<AIPersonality[]>([])
  const [selectedPersonalityId, setSelectedPersonalityId] = useState<string>('')
  const [showContext, setShowContext] = useState(false)
  const [lastContext, setLastContext] = useState<RelevantContext | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadPersonalities()
    // Add welcome message
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m here to help you explore your archetypal patterns through conversation. I use advanced AI with access to a comprehensive database of archetypes and linguistic patterns to provide personalized insights. What would you like to explore today?',
      timestamp: new Date()
    }])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadPersonalities = async () => {
    try {
      const data = await aiPersonalityService.getActivePersonalities()
      setPersonalities(data)
    } catch (error) {
      console.error('Error loading personalities:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call the enhanced AI API
      const response = await fetch('/api/enhanced-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          personalityId: selectedPersonalityId || undefined,
          conversationId: `conv_${Date.now()}`
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        context: data.context
      }

      setMessages(prev => [...prev, assistantMessage])
      setLastContext(data.context)
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
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
      handleSend()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Enhanced Archetype Chat with RAG
          </CardTitle>
          <p className="text-gray-600">
            AI-powered conversation with real-time access to archetype database and linguistic patterns
          </p>
        </CardHeader>
      </Card>

      {/* Controls */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Select value={selectedPersonalityId} onValueChange={setSelectedPersonalityId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose AI personality (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Default AI Personality</SelectItem>
              {personalities.map(personality => (
                <SelectItem key={personality.id} value={personality.id}>
                  {personality.name} - {personality.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowContext(!showContext)}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          {showContext ? 'Hide' : 'Show'} Context
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
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
                    <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts, experiences, or ask about your archetypal patterns..."
                  className="flex-1 min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading || !input.trim()}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Context Panel */}
        {showContext && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lastContext ? (
                  <>
                    {/* Relevant Archetypes */}
                    {lastContext.archetypes.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Relevant Archetypes</h4>
                        <div className="space-y-2">
                          {lastContext.archetypes.map((archetype, index) => (
                            <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                              <div className="font-medium">{archetype.name}</div>
                              <div className="text-gray-600 text-xs">{archetype.description}</div>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {Math.round(archetype.similarity * 100)}% match
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Linguistic Patterns */}
                    {lastContext.patterns.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Linguistic Patterns</h4>
                        <div className="space-y-2">
                          {lastContext.patterns.map((pattern, index) => (
                            <div key={index} className="p-2 bg-green-50 rounded text-sm">
                              <div className="font-medium">{pattern.archetype_name}</div>
                              <div className="text-gray-600 text-xs">
                                Keywords: {pattern.keywords?.join(', ')}
                              </div>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {Math.round(pattern.similarity * 100)}% match
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Context will appear here after your first message
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
