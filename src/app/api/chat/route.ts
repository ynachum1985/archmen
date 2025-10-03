import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { APP_CONFIG } from '@/config/app.config'
import { ragChatService } from '@/lib/services/rag-chat.service'

// Initialize OpenAI client (handle missing API key gracefully during build)
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

export async function POST(request: Request) {
  try {
    // Check if OpenAI is configured
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const { messages, assessmentId, conversationId } = await request.json()

    // Check if user is authenticated (optional for demo)
    const { data: { user } } = await supabase.auth.getUser()

    // Log if user is authenticated (for analytics)
    if (user) {
      console.log('RAG-enhanced chat request from user:', user.id)
    }

    // Use RAG-enhanced chat service for intelligent responses
    const ragResponse = await ragChatService.generateResponse(
      [
        {
          role: 'system',
          content: APP_CONFIG.ai.systemPrompt
        },
        ...messages
      ],
      {
        conversationId,
        assessmentId,
        userId: user?.id,
        maxContextChunks: 6,
        similarityThreshold: 0.75,
        includeArchetypes: true,
        includeAssessments: true
      }
    )

    return NextResponse.json({
      content: ragResponse.content,
      metadata: {
        ragContext: {
          totalChunks: ragResponse.context.totalChunks,
          archetypeChunks: ragResponse.context.archetypeContent.length,
          assessmentChunks: ragResponse.context.assessmentContent.length
        },
        usage: ragResponse.usage
      }
    })
  } catch (error) {
    console.error('RAG Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}