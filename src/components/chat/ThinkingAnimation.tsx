'use client'

import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '@/components/ui/chat/chat-bubble'

export function ThinkingAnimation() {
  return (
    <div className="mb-6">
      <ChatBubble variant="received" className="mb-4">
        <ChatBubbleAvatar
          src="/ai-avatar.png"
          fallback="AI"
        />
        <ChatBubbleMessage>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-gray-500">Thinking...</span>
          </div>
        </ChatBubbleMessage>
      </ChatBubble>
    </div>
  )
}

