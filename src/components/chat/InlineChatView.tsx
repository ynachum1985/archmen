'use client'

import { useState, useEffect } from 'react'
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '@/components/ui/chat/chat-bubble'
import { ChatMessageList } from '@/components/ui/chat/chat-message-list'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Send, Sparkles, AlertTriangle, Shield, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useContentModeration, getModerationMessage, shouldAllowContent, getCategoryWarnings } from '@/hooks/useContentModeration'
import { InlineArchetypeCard } from '@/components/chat/InlineArchetypeCard'

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
  const [moderationWarning, setModerationWarning] = useState<string | null>(null)
  const [generatingFirstMessage, setGeneratingFirstMessage] = useState(false)
  const { moderateContent, isLoading: moderationLoading } = useContentModeration()

  // Generate first question when conversation is empty
  useEffect(() => {
    const generateFirstMessage = async () => {
      if (!conversation || conversation.messages.length > 0 || conversation.metadata?.firstMessageGenerated) {
        return
      }

      setGeneratingFirstMessage(true)
      try {
        const supabase = createClient()

        // Fetch assessment details to get the prompt
        let provider = 'openai'
        let model = 'gpt-4-turbo-preview'

        if (conversation.metadata?.assessmentId) {
          try {
            const { data: assessment } = await supabase
              .from('enhanced_assessments')
              .select('live_provider, live_model, assessment_prompt')
              .eq('id', conversation.metadata.assessmentId)
              .single()

            if (assessment) {
              provider = assessment.live_provider || 'openai'
              model = assessment.live_model || 'gpt-4-turbo-preview'
            }
          } catch (error) {
            console.error('Error fetching assessment config:', error)
          }
        }

        // Call the enhanced-chat API to generate the first question
        const response = await fetch('/api/enhanced-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [],
            conversationId: conversation.id,
            assessmentId: conversation.metadata?.assessmentId,
            userId,
            provider,
            model,
            temperature: 0.7,
            isFirstMessage: true
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate first question')
        }

        const aiData = await response.json()

        // Add the first AI message to the conversation
        const updatedConversation = {
          ...conversation,
          messages: [{
            role: 'assistant',
            content: aiData.content,
            timestamp: new Date().toISOString(),
            metadata: aiData.metadata
          }],
          metadata: {
            ...conversation.metadata,
            firstMessageGenerated: true
          }
        }

        // Update the conversation in the database
        const { error } = await supabase
          .from('conversations')
          .update({
            messages: updatedConversation.messages,
            metadata: updatedConversation.metadata,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversation.id)

        if (error) throw error

        // Update the parent component
        onConversationUpdate(updatedConversation)
      } catch (error) {
        console.error('Error generating first message:', error)
      } finally {
        setGeneratingFirstMessage(false)
      }
    }

    generateFirstMessage()
  }, [conversation?.id, conversation?.messages.length])

  const sendMessage = async () => {
    if (!message.trim() || !conversation || !userId || sending) return

    setSending(true)
    setModerationWarning(null)

    try {
      // First, moderate the content
      const moderationResult = await moderateContent(message.trim(), {
        userId,
        assessmentId: conversation.metadata.assessmentId,
        conversationType: 'chat'
      })

      // Check if content should be blocked
      if (!shouldAllowContent(moderationResult)) {
        const moderationMsg = getModerationMessage(moderationResult)
        setModerationWarning(moderationMsg.message)
        setSending(false)
        return
      }

      // Show warnings for flagged content but allow it to proceed
      if (moderationResult.flagged) {
        const warnings = getCategoryWarnings(moderationResult.categories)
        if (warnings.length > 0) {
          setModerationWarning(`Content flagged: ${warnings.join(', ')}. Please ensure your message is respectful and constructive.`)
        }
      }
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

      // Get AI response using enhanced-chat API
      // First, fetch the assessment configuration to get the configured LLM model
      let provider = 'openai'
      let model = 'gpt-4-turbo-preview'

      if (conversation.metadata?.assessmentId) {
        try {
          const supabase = createClient()
          const { data: assessment } = await supabase
            .from('enhanced_assessments')
            .select('live_provider, live_model')
            .eq('id', conversation.metadata.assessmentId)
            .single()

          if (assessment) {
            provider = assessment.live_provider || 'openai'
            model = assessment.live_model || 'gpt-4-turbo-preview'
            console.log(`Using configured LLM for assessment: ${provider}/${model}`)
          }
        } catch (error) {
          console.error('Error fetching assessment LLM config:', error)
          // Fall back to defaults
        }
      }

      const response = await fetch('/api/enhanced-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...conversation.messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: message.trim() }
          ],
          conversationId: conversation.id,
          assessmentId: conversation.metadata?.assessmentId,
          userId,
          provider,
          model,
          temperature: 0.7
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
        metadata: {
          ...aiData.metadata,
          detectedArchetypes: aiData.detectedArchetypes || []
        }
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
          <div className="flex-1">
            <h2 className="font-medium text-gray-900">{conversation.metadata.title}</h2>
            <p className="text-xs text-gray-500 mb-1">
              {conversation.metadata.category} • Level {conversation.metadata.assessmentLevel}
            </p>
            {conversation.metadata.description && (
              <p className="text-xs text-gray-600 leading-relaxed">
                {conversation.metadata.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages - with bottom padding for fixed input */}
      <div className="flex-1 overflow-hidden">
        <ChatMessageList className="h-full pb-24">
          <div className="max-w-3xl mx-auto px-4">
            {generatingFirstMessage && conversation.messages.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-500">Generating your first question...</p>
                </div>
              </div>
            )}
            {conversation.messages.map((msg, index) => (
              <div key={index} className="mb-6">
                <ChatBubble
                  variant={msg.role === 'user' ? 'sent' : 'received'}
                  className="mb-4"
                >
                  <ChatBubbleAvatar
                    src={msg.role === 'assistant' ? '/ai-avatar.png' : undefined}
                    fallback={msg.role === 'assistant' ? 'AI' : 'You'}
                  />
                  <ChatBubbleMessage>
                    {msg.content}
                  </ChatBubbleMessage>
                </ChatBubble>

                {/* Display detected archetypes inline */}
                {msg.metadata?.detectedArchetypes && msg.metadata.detectedArchetypes.length > 0 && (
                  <div className="ml-12 space-y-3">
                    {msg.metadata.detectedArchetypes.map((archetype: any, arcIdx: number) => (
                      <InlineArchetypeCard
                        key={arcIdx}
                        archetypeName={archetype.name}
                        description={archetype.description}
                        confidenceScore={archetype.confidenceScore}
                        isNewlyRevealed={archetype.isNewlyRevealed}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ChatMessageList>
      </div>

      {/* Fixed Message Input - ChatGPT style */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 via-white/90 to-transparent backdrop-blur-sm border-t border-gray-200/50">
        <div className="max-w-3xl mx-auto p-4">
          {/* Moderation Warning */}
          {moderationWarning && (
            <Alert className="mb-3 border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                {moderationWarning}
              </AlertDescription>
            </Alert>
          )}

          <div className="relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message ArchMen..."
              className="w-full min-h-[3rem] max-h-[8rem] resize-none bg-white/90 backdrop-blur-sm border-gray-300/50 focus:border-blue-400 rounded-xl pr-12 shadow-sm"
              disabled={sending || moderationLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || sending || moderationLoading}
              size="icon"
              className="absolute right-2 bottom-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg h-8 w-8"
            >
              {moderationLoading ? (
                <Shield className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
