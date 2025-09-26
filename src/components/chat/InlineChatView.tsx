'use client'

import { useState } from 'react'
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '@/components/ui/chat/chat-bubble'
import { ChatMessageList } from '@/components/ui/chat/chat-message-list'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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

interface InlineChatViewProps {
  conversation: Conversation | null
  userId: string
  onConversationUpdate: (conversation: Conversation) => void
}

export function InlineChatView({ conversation, userId, onConversationUpdate }: InlineChatViewProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

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
        .eq('id', conversation.id)

      if (updateError) throw updateError

      // Update local state
      const updatedConversation = {
        ...conversation,
        messages: updatedMessages
      }
      onConversationUpdate(updatedConversation)
      
      setMessage('')

      // Get AI response
      const response = await fetch('/api/conversation-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversation.id,
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
        .eq('id', conversation.id)

      // Update local state
      const finalConversation = {
        ...conversation,
        messages: finalMessages
      }
      onConversationUpdate(finalConversation)

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

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50/30">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Assessment</h3>
          <p className="text-gray-600">Choose an assessment from the sidebar to start a conversation</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm relative">
      {/* Chat Header */}
      <div className="border-b border-gray-200/50 p-4 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-gray-700" />
          </div>
          <div>
            <h2 className="font-medium text-gray-900">{conversation.metadata.title}</h2>
            <p className="text-xs text-gray-500">
              {conversation.metadata.category} • Level {conversation.metadata.assessmentLevel}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages - with bottom padding for fixed input */}
      <div className="flex-1 overflow-hidden">
        <ChatMessageList className="h-full pb-24">
          <div className="max-w-3xl mx-auto px-4">
            {conversation.messages.map((msg, index) => (
              <ChatBubble
                key={index}
                variant={msg.role === 'user' ? 'sent' : 'received'}
                className="mb-6"
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
          </div>
        </ChatMessageList>
      </div>

      {/* Fixed Message Input - ChatGPT style */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 via-white/90 to-transparent backdrop-blur-sm border-t border-gray-200/50">
        <div className="max-w-3xl mx-auto p-4">
          <div className="relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message ArchMen..."
              className="w-full min-h-[3rem] max-h-[8rem] resize-none bg-white/90 backdrop-blur-sm border-gray-300/50 focus:border-blue-400 rounded-xl pr-12 shadow-sm"
              disabled={sending}
            />
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || sending}
              size="icon"
              className="absolute right-2 bottom-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg h-8 w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
