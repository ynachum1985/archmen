'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Send, 
  Settings, 
  Calendar,
  Plus,
  MoreHorizontal,
  User,
  Bot,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    archetypeConfidence?: Record<string, number>
    suggestedActions?: Array<{
      type: 'homework' | 'calendar' | 'reminder'
      label: string
      action: string
    }>
  }
}

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  isActive: boolean
}

interface ConversationDashboardProps {
  userId: string
}

export function ConversationDashboard({ userId }: ConversationDashboardProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHomework, setShowHomework] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
  }, [userId])

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId)
    }
  }, [activeConversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversations = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      const formattedConversations: Conversation[] = (data || []).map(conv => ({
        id: conv.id,
        title: conv.metadata?.title || 'New Assessment',
        lastMessage: conv.messages?.[conv.messages.length - 1]?.content?.substring(0, 50) + '...' || '',
        timestamp: new Date(conv.updated_at),
        isActive: conv.metadata?.status === 'active'
      }))

      setConversations(formattedConversations)
      
      // Auto-select first conversation or create new one
      if (formattedConversations.length > 0) {
        setActiveConversationId(formattedConversations[0].id)
      } else {
        await createNewConversation()
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('conversations')
        .select('messages')
        .eq('id', conversationId)
        .single()

      if (error) throw error

      const conversationMessages = data?.messages || []
      const formattedMessages: Message[] = conversationMessages.map((msg: any, index: number) => ({
        id: `${conversationId}-${index}`,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp || Date.now()),
        metadata: msg.metadata
      }))

      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const createNewConversation = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          messages: [{
            role: 'assistant',
            content: "Hello! I'm here to help you discover your archetypal patterns through conversation. Let's begin this journey of self-discovery together. What brings you here today?",
            timestamp: new Date().toISOString()
          }],
          metadata: {
            title: 'New Assessment',
            status: 'active',
            phase: 'assessment'
          }
        })
        .select()
        .single()

      if (error) throw error

      const newConversation: Conversation = {
        id: data.id,
        title: 'New Assessment',
        lastMessage: "Hello! I'm here to help you discover...",
        timestamp: new Date(),
        isActive: true
      }

      setConversations(prev => [newConversation, ...prev])
      setActiveConversationId(data.id)
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !activeConversationId) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call AI API for response
      const response = await fetch('/api/conversation-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: input,
          userId
        })
      })

      if (!response.ok) throw new Error('Failed to get AI response')

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        metadata: data.metadata
      }

      setMessages(prev => [...prev, assistantMessage])

      // Update conversation in database
      await updateConversation(activeConversationId, [...messages, userMessage, assistantMessage])

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const updateConversation = async (conversationId: string, updatedMessages: Message[]) => {
    try {
      const supabase = createClient()
      await supabase
        .from('conversations')
        .update({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
            metadata: msg.metadata
          })),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
    } catch (error) {
      console.error('Error updating conversation:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-gray-50/30">
      {/* Sidebar */}
      <div className="w-80 bg-white/60 backdrop-blur-sm border-r border-gray-200/50 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200/50">
          <Button 
            onClick={createNewConversation}
            className="w-full bg-gray-900/90 hover:bg-gray-900 text-white border-0 rounded-lg h-10"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Assessment
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setActiveConversationId(conversation.id)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  activeConversationId === conversation.id
                    ? 'bg-gray-100/80 border border-gray-200/60'
                    : 'hover:bg-gray-50/60'
                }`}
              >
                <div className="font-medium text-sm text-gray-900 mb-1 truncate">
                  {conversation.title}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {conversation.lastMessage}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {conversation.timestamp.toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-gray-700" />
            </div>
            <div>
              <h1 className="font-medium text-gray-900">Archetype Discovery</h1>
              <p className="text-xs text-gray-500">AI-powered conversation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHomework(true)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100/60"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <AvatarFallback>
                      <Bot className="h-4 w-4 text-gray-700" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div
                    className={`p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gray-900/90 text-white ml-auto'
                        : 'bg-white/80 border border-gray-200/60 text-gray-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  
                  {/* Archetype Confidence Indicators */}
                  {message.metadata?.archetypeConfidence && (
                    <div className="mt-3 p-3 bg-blue-50/60 rounded-lg border border-blue-200/40">
                      <p className="text-xs text-blue-700 mb-2 font-medium">Archetype Insights</p>
                      <div className="space-y-1">
                        {Object.entries(message.metadata.archetypeConfidence).map(([archetype, confidence]) => (
                          <div key={archetype} className="flex items-center justify-between">
                            <span className="text-xs text-blue-600">{archetype}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 transition-all duration-500"
                                  style={{ width: `${confidence}%` }}
                                />
                              </div>
                              <span className="text-xs text-blue-500 font-medium">{confidence}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 bg-gray-100">
                    <AvatarFallback>
                      <User className="h-4 w-4 text-gray-600" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  <AvatarFallback>
                    <Bot className="h-4 w-4 text-gray-700" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white/80 border border-gray-200/60 p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white/60 backdrop-blur-sm border-t border-gray-200/50 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts and experiences..."
                  className="min-h-[44px] bg-white/80 border-gray-200/60 rounded-xl resize-none pr-12 text-sm"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gray-900/90 hover:bg-gray-900 text-white border-0 rounded-xl h-11 px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
