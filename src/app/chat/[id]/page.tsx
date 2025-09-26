'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '@/components/ui/chat/chat-bubble'
import { ChatMessageList } from '@/components/ui/chat/chat-message-list'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Send, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: any
}

interface Conversation {
  id: string
  user_id: string
  messages: Message[]
  metadata: {
    title: string
    status: string
    phase: string
    assessmentId?: string
    category?: string
    assessmentLevel?: number
    systemPrompt?: string
  }
  created_at: string
  updated_at: string
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string
  
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push('/login')
          return
        }
        
        setUserId(user.id)
        
        // Fetch conversation
        const { data: conv, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .eq('user_id', user.id)
          .single()

        if (convError) {
          console.error('Error fetching conversation:', convError)
          setError('Conversation not found')
          return
        }

        setConversation(conv)
      } catch (err) {
        console.error('Error initializing chat:', err)
        setError('Failed to load conversation')
      } finally {
        setLoading(false)
      }
    }

    if (conversationId) {
      initializeChat()
    }
  }, [conversationId, router])

  const sendMessage = async () => {
    if (!message.trim() || !conversation || !userId || sending) return

    setSending(true)
    try {
      const supabase = createClient()
      
      // Add user message to conversation
      const userMessage: Message = {
        role: 'user',
        content: message.trim(),
        timestamp: new Date().toISOString()
      }

      const updatedMessages = [...conversation.messages, userMessage]
      
      // Update conversation in database
      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      if (updateError) throw updateError

      // Update local state
      setConversation(prev => prev ? {
        ...prev,
        messages: updatedMessages
      } : null)
      
      setMessage('')

      // Get AI response
      const response = await fetch('/api/conversation-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          message: message.trim(),
          userId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const aiData = await response.json()
      
      // Add AI response to conversation
      const aiMessage: Message = {
        role: 'assistant',
        content: aiData.content,
        timestamp: new Date().toISOString(),
        metadata: aiData.metadata
      }

      const finalMessages = [...updatedMessages, aiMessage]
      
      // Update conversation with AI response
      await supabase
        .from('conversations')
        .update({
          messages: finalMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)

      // Update local state
      setConversation(prev => prev ? {
        ...prev,
        messages: finalMessages
      } : null)

    } catch (err) {
      console.error('Error sending message:', err)
      // TODO: Show error toast
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-gray-600">Loading conversation...</span>
        </div>
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Conversation Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The conversation you\'re looking for doesn\'t exist.'}</p>
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-gray-700" />
          </div>
          <div>
            <h1 className="font-medium text-gray-900">{conversation.metadata.title}</h1>
            <p className="text-xs text-gray-500">
              {conversation.metadata.category} • Level {conversation.metadata.assessmentLevel}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        <ChatMessageList className="flex-1 p-4">
          {conversation.messages.map((msg, index) => (
            <ChatBubble
              key={index}
              variant={msg.role === 'user' ? 'sent' : 'received'}
            >
              <ChatBubbleAvatar
                src={msg.role === 'assistant' ? '/ai-avatar.png' : undefined}
                fallback={msg.role === 'assistant' ? 'AI' : 'You'}
              />
              <ChatBubbleMessage>
                {msg.content}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}
        </ChatMessageList>

        {/* Message Input */}
        <div className="p-4 border-t bg-white/60 backdrop-blur-sm">
          <div className="flex gap-3">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 min-h-[3rem] max-h-[8rem] resize-none bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-blue-300 rounded-lg"
              disabled={sending}
            />
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || sending}
              size="icon"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
