'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatInput } from '@/components/ui/chat/chat-input'
import { ChatMessageList } from '@/components/ui/chat/chat-message-list'
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '@/components/ui/chat/chat-bubble'
import { ExpandableChat } from '@/components/ui/chat/expandable-chat'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Bot, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Welcome! I'm here to help you understand your relationship patterns through the lens of Jungian archetypes. Let's start with a simple question: What brought you here today? Are you looking to understand a specific relationship challenge or pattern?",
    timestamp: new Date()
  }
]

const SUGGESTED_PROMPTS = [
  "I keep attracting the same type of partner",
  "I struggle with emotional intimacy",
  "I feel like I'm always the one giving in relationships",
  "I want to understand my shadow patterns"
]

export function ArchetypeChat() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)
  
  useEffect(() => {
    // Initialize Supabase client only on client-side
    try {
      const client = createClient()
      setSupabase(client)
    } catch (error) {
      console.log('Supabase client initialization failed:', error)
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      // Call the AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Save conversation to database (only if user is authenticated)
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          try {
            await supabase.from('conversations').insert([{
            user_id: user.id,
            messages: JSON.parse(JSON.stringify([...messages, userMessage, assistantMessage])),
            metadata: { type: 'archetype_assessment' }
          }])
                  } catch (dbError) {
            console.log('Failed to save conversation:', dbError)
            // Continue without saving - this is ok for demo users
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePromptClick = (prompt: string) => {
    setInput(prompt)
  }

  // Desktop view - embedded in page
  const DesktopChat = () => (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <div>
            <h3 className="font-semibold">Archetype Assessment Assistant</h3>
            <p className="text-sm text-muted-foreground">Discover your relationship patterns through Jungian psychology</p>
          </div>
        </div>
      </div>
      
      <ChatMessageList className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatBubble key={message.id} variant={message.role === 'user' ? 'sent' : 'received'}>
            <ChatBubbleAvatar 
              fallback={message.role === 'user' ? 'U' : 'AI'}
            />
            <ChatBubbleMessage>{message.content}</ChatBubbleMessage>
          </ChatBubble>
        ))}
        {isLoading && (
          <ChatBubble variant="received">
            <ChatBubbleAvatar 
              fallback="AI"
            />
            <ChatBubbleMessage isLoading />
          </ChatBubble>
        )}
        <div ref={messagesEndRef} />
      </ChatMessageList>

      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-sm text-muted-foreground mb-2">Quick starts:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => handlePromptClick(prompt)}
                className="text-xs"
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about your relationship patterns..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )

  // Mobile view - expandable chat
  const MobileChat = () => (
    <ExpandableChat
      icon={<Bot className="h-6 w-6" />}
      size="lg"
      position="bottom-right"
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b bg-background">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Archetype Assistant</h3>
              <p className="text-xs text-muted-foreground">Discover your patterns</p>
            </div>
          </div>
        </div>
        
        <ChatMessageList className="flex-1 overflow-y-auto p-3">
          {messages.map((message) => (
            <ChatBubble key={message.id} variant={message.role === 'user' ? 'sent' : 'received'}>
                          <ChatBubbleAvatar 
              fallback={message.role === 'user' ? 'U' : 'AI'}
            />
              <ChatBubbleMessage className="text-sm">{message.content}</ChatBubbleMessage>
            </ChatBubble>
          ))}
          {isLoading && (
            <ChatBubble variant="received">
                          <ChatBubbleAvatar 
              fallback="AI"
            />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
          <div ref={messagesEndRef} />
        </ChatMessageList>

        <div className="p-3 border-t">
          <div className="flex gap-2">
            <ChatInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 text-sm"
            />
            <Button size="sm" onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </ExpandableChat>
  )

  return (
    <>
      <div className="hidden md:block">
        <DesktopChat />
      </div>
      <div className="md:hidden">
        <MobileChat />
      </div>
    </>
  )
} 