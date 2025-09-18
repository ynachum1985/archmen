import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enhancedAIService } from '@/lib/services/enhanced-ai.service'
import { MultiLLMService } from '@/lib/services/multi-llm.service'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      messages,
      personalityId,
      conversationId,
      assessmentId,
      provider = 'openai',
      model = 'gpt-4-turbo-preview',
      temperature = 0.7,
      maxTokens = 2000
    } = await request.json()

    console.log('Enhanced chat request:', { provider, model, assessmentId, messagesCount: messages?.length })
    
    // Check if user is authenticated (optional for demo)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Log if user is authenticated (for analytics)
    if (user) {
      console.log('Authenticated enhanced chat request from user:', user.id)
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1]?.content || ''
    const conversationHistory = messages.slice(0, -1)

    let result

    // If this is for assessment testing, use multi-LLM service for all providers
    if (assessmentId) {
      console.log('Creating MultiLLMService for assessment testing')
      const multiLLMService = new MultiLLMService()

      // Get assessment content for RAG if available
      let contextContent = ''
      if (assessmentId) {
        try {
          const { data: chunks } = await supabase
            .from('assessment_content_chunks')
            .select('chunk_text, metadata')
            .eq('assessment_id', assessmentId)
            .limit(5)

          if (chunks && chunks.length > 0) {
            contextContent = chunks.map(chunk => chunk.chunk_text).join('\n\n')
          }
        } catch (error) {
          console.error('Error fetching assessment content:', error)
        }
      }

      // Prepare messages with context
      const contextualMessages = [
        ...messages.slice(0, -1), // Previous conversation
        {
          role: 'system',
          content: contextContent ? `Context information:\n${contextContent}\n\nUser message:` : 'User message:'
        },
        {
          role: 'user',
          content: userMessage
        }
      ]

      // Use multi-LLM service
      console.log('Calling generateChatCompletion with:', { provider, model, temperature, maxTokens })
      result = await multiLLMService.generateChatCompletion(contextualMessages, {
        provider,
        model,
        temperature,
        maxTokens
      })
      console.log('MultiLLM response received:', { provider: result.provider, model: result.model })
    } else {
      // Use enhanced AI service with RAG for default OpenAI
      result = await enhancedAIService.getInstance().generateResponse(
        userMessage,
        conversationHistory,
        personalityId
      )
    }

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
      content: result.content || result.response,
      context: result.context,
      personalityUsed: result.personalityUsed,
      provider: provider,
      model: model,
      usage: result.usage,
      cost: result.cost
    })
  } catch (error) {
    console.error('Enhanced chat API error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      {
        error: 'Failed to process enhanced chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
