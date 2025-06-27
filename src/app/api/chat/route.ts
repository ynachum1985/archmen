import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { APP_CONFIG } from '@/config/app.config'

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
    const { messages } = await request.json()
    
    // Check if user is authenticated (optional for demo)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Log if user is authenticated (for analytics)
    if (user) {
      console.log('Authenticated chat request from user:', user.id)
    }

    // Create the AI completion with archetype-specific context
    const completion = await openai.chat.completions.create({
      model: APP_CONFIG.ai.model,
      messages: [
        {
          role: 'system',
          content: APP_CONFIG.ai.systemPrompt
        },
        ...messages
      ],
      temperature: APP_CONFIG.ai.temperature,
      max_tokens: APP_CONFIG.ai.maxTokens,
    })

    const responseContent = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.'

    return NextResponse.json({ content: responseContent })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
} 