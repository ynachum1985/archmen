'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Send, 
  Minimize2, 
  Maximize2,
  X,
  Bot,
  User
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ChatMessage {
  id: string
  message_type: 'question' | 'answer' | 'system' | 'follow_up'
  content: string
  message_index: number
  created_at: string
}

interface FloatingChatbotProps {
  assessmentId: string
  assessmentName: string
  userId: string
  initialMessages?: ChatMessage[]
}

export function FloatingChatbot({
  assessmentId,
  assessmentName,
  userId,
  initialMessages = []
}: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [currentInput, setCurrentInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      // Show floating button after scrolling 200px
      setIsVisible(scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      message_type: 'follow_up',
      content: currentInput.trim(),
      message_index: messages.length,
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentInput('')
    setIsLoading(true)

    try {
      // Save user message to database
      await fetch('/api/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentSessionId: assessmentId,
          userId: userId,
          messageType: 'follow_up',
          content: userMessage.content,
          messageIndex: userMessage.message_index
        })
      })

      // Get AI response
      const response = await fetch('/api/enhanced-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are continuing an archetypal assessment conversation for ${assessmentName}. The user has completed their assessment and is now in their personalized mini-course. Help them explore their discovered archetypes deeper, answer questions about integration, and provide guidance on their archetypal journey. Be supportive, insightful, and reference their specific archetypal profile when relevant.`
            },
            ...messages.slice(-5).map(m => ({
              role: m.message_type === 'answer' || m.message_type === 'system' ? 'assistant' : 'user',
              content: m.content
            })),
            {
              role: 'user',
              content: userMessage.content
            }
          ],
          assessmentId: assessmentId,
          provider: 'openai',
          model: 'gpt-4-turbo-preview',
          temperature: 0.7
        })
      })

      const data = await response.json()
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        message_type: 'system',
        content: data.content || 'I apologize, but I was unable to generate a response.',
        message_index: messages.length + 1,
        created_at: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])

      // Save AI response to database
      await fetch('/api/chat-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentSessionId: assessmentId,
          userId: userId,
          messageType: 'system',
          content: aiMessage.content,
          messageIndex: aiMessage.message_index
        })
      })

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        message_type: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        message_index: messages.length + 1,
        created_at: new Date().toISOString()
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

  if (!isVisible && !isOpen) return null

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && isVisible && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          {messages.length > initialMessages.length && (
            <Badge className="absolute -top-2 -right-2 bg-red-500">
              {messages.length - initialMessages.length}
            </Badge>
          )}
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 w-96 transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[500px]'
        }`}>
          <Card className="h-full shadow-xl">
            <CardHeader className="p-4 bg-blue-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <CardTitle className="text-sm">Continue Assessment Chat</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-6 w-6 p-0 text-white hover:bg-blue-700"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0 text-white hover:bg-blue-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {!isMinimized && (
              <CardContent className="p-0 flex flex-col h-[calc(100%-4rem)]">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.message_type === 'answer' || message.message_type === 'follow_up'
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.message_type === 'answer' || message.message_type === 'follow_up'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.message_type === 'answer' || message.message_type === 'follow_up' ? (
                            <User className="h-3 w-3" />
                          ) : (
                            <Bot className="h-3 w-3" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.message_type === 'answer' || message.message_type === 'follow_up' ? 'You' : 'AI Assistant'}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Bot className="h-3 w-3" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Continue your archetypal exploration..."
                      className="flex-1 min-h-[40px] max-h-[100px] resize-none"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!currentInput.trim() || isLoading}
                      size="sm"
                      className="px-3"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
