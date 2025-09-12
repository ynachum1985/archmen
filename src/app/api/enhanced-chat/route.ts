import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enhancedAIService } from '@/lib/services/enhanced-ai.service'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { messages, personalityId, conversationId } = await request.json()
    
    // Check if user is authenticated (optional for demo)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Log if user is authenticated (for analytics)
    if (user) {
      console.log('Authenticated enhanced chat request from user:', user.id)
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1]?.content || ''
    const conversationHistory = messages.slice(0, -1)

    // Use enhanced AI service with RAG
    const result = await enhancedAIService.getInstance().generateResponse(
      userMessage,
      conversationHistory,
      personalityId
    )

    // Store conversation if conversationId is provided
    if (conversationId && user) {
      await supabase
        .from('conversations')
        .upsert({
          id: conversationId,
          user_id: user.id,
          messages: messages,
          personality_id: personalityId,
          context_used: result.context,
          updated_at: new Date().toISOString()
        })
    }

    return NextResponse.json({ 
      content: result.response,
      context: result.context,
      personalityUsed: result.personalityUsed
    })
  } catch (error) {
    console.error('Enhanced chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process enhanced chat request' },
      { status: 500 }
    )
  }
}
