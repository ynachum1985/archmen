'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Brain, Loader2, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react'

interface RAGContext {
  totalChunks: number
  archetypeChunks: number
  assessmentChunks: number
  searchQuery: string
}

interface ChatResponse {
  content: string
  metadata?: {
    ragContext?: RAGContext
  }
  ragContext?: RAGContext
  usage?: {
    totalTokens: number
    promptTokens: number
    completionTokens: number
  }
}

export function RAGChatTester() {
  const [message, setMessage] = useState('')
  const [responses, setResponses] = useState<{[key: string]: ChatResponse | null}>({
    basic: null,
    conversation: null,
    enhanced: null
  })
  const [loading, setLoading] = useState<{[key: string]: boolean}>({
    basic: false,
    conversation: false,
    enhanced: false
  })
  const [errors, setErrors] = useState<{[key: string]: string | null}>({
    basic: null,
    conversation: null,
    enhanced: null
  })

  const testEndpoints = [
    {
      key: 'basic',
      name: 'Basic Chat',
      endpoint: '/api/chat',
      description: 'Basic chat with RAG enhancement',
      payload: (msg: string) => ({
        messages: [{ role: 'user', content: msg }]
      })
    },
    {
      key: 'conversation',
      name: 'Conversation Chat',
      endpoint: '/api/conversation-chat',
      description: 'Assessment conversation with RAG',
      payload: (msg: string) => ({
        message: msg,
        conversationId: '550e8400-e29b-41d4-a716-446655440000',
        assessmentId: '03b868b0-a914-4d33-9dd7-d9bc431d6dbb', // Monogamy vs Polyamory
        userId: '550e8400-e29b-41d4-a716-446655440001'
      })
    },
    {
      key: 'enhanced',
      name: 'Enhanced Chat',
      endpoint: '/api/enhanced-chat',
      description: 'Enhanced chat with RAG + moderation',
      payload: (msg: string) => ({
        messages: [{ role: 'user', content: msg }],
        conversationId: '550e8400-e29b-41d4-a716-446655440000',
        assessmentId: '03b868b0-a914-4d33-9dd7-d9bc431d6dbb'
      })
    }
  ]

  const testMessage = async (endpoint: typeof testEndpoints[0]) => {
    if (!message.trim()) return

    setLoading(prev => ({ ...prev, [endpoint.key]: true }))
    setErrors(prev => ({ ...prev, [endpoint.key]: null }))

    try {
      const response = await fetch(endpoint.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(endpoint.payload(message))
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResponses(prev => ({ ...prev, [endpoint.key]: data }))
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        [endpoint.key]: error instanceof Error ? error.message : 'Unknown error' 
      }))
    } finally {
      setLoading(prev => ({ ...prev, [endpoint.key]: false }))
    }
  }

  const testAllEndpoints = async () => {
    if (!message.trim()) return

    for (const endpoint of testEndpoints) {
      await testMessage(endpoint)
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const sampleMessages = [
    "I think I might be an Alpha Male type. How do I know for sure?",
    "What are the differences between monogamy and polyamory?",
    "I'm struggling with emotional vulnerability in my relationship",
    "How do I set better boundaries with my partner?"
  ]

  const getRagContextBadge = (ragContext: RAGContext | undefined) => {
    if (!ragContext || ragContext.totalChunks === 0) {
      return <Badge variant="secondary">No RAG Context</Badge>
    }

    return (
      <div className="flex gap-1 flex-wrap">
        <Badge variant="default">
          {ragContext.totalChunks} chunks
        </Badge>
        {ragContext.archetypeChunks > 0 && (
          <Badge variant="outline">
            {ragContext.archetypeChunks} archetype
          </Badge>
        )}
        {ragContext.assessmentChunks > 0 && (
          <Badge variant="outline">
            {ragContext.assessmentChunks} assessment
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          RAG Chat Tester
        </CardTitle>
        <CardDescription>
          Test the RAG-enhanced chat functionality across all endpoints
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Message Input */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Test Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a message to test RAG functionality..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Sample Messages */}
          <div>
            <label className="text-sm font-medium">Sample Messages</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {sampleMessages.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(sample)}
                  className="text-xs"
                >
                  {sample.substring(0, 30)}...
                </Button>
              ))}
            </div>
          </div>

          {/* Test Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={testAllEndpoints}
              disabled={!message.trim() || Object.values(loading).some(Boolean)}
              className="flex items-center gap-2"
            >
              {Object.values(loading).some(Boolean) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              Test All Endpoints
            </Button>
          </div>
        </div>

        {/* Results */}
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {testEndpoints.map((endpoint) => (
              <TabsTrigger key={endpoint.key} value={endpoint.key} className="flex items-center gap-2">
                {loading[endpoint.key] ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : errors[endpoint.key] ? (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                ) : responses[endpoint.key] ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : null}
                {endpoint.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {testEndpoints.map((endpoint) => (
            <TabsContent key={endpoint.key} value={endpoint.key} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{endpoint.name}</h3>
                  <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                </div>
                <Button
                  onClick={() => testMessage(endpoint)}
                  disabled={!message.trim() || loading[endpoint.key]}
                  size="sm"
                >
                  {loading[endpoint.key] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Test'
                  )}
                </Button>
              </div>

              {errors[endpoint.key] && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors[endpoint.key]}</p>
                </div>
              )}

              {responses[endpoint.key] && (
                <div className="space-y-4">
                  {/* RAG Context Info */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">RAG Context</h4>
                      {getRagContextBadge(responses[endpoint.key]?.metadata?.ragContext || responses[endpoint.key]?.ragContext)}
                    </div>
                    
                    {responses[endpoint.key]?.usage && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          {responses[endpoint.key]?.usage?.totalTokens} tokens
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Response Content */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <h4 className="font-medium text-sm mb-2">AI Response</h4>
                    <p className="text-sm whitespace-pre-wrap">{responses[endpoint.key]?.content}</p>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
