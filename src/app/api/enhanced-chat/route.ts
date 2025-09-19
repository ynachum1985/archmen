import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enhancedAIService } from '@/lib/services/enhanced-ai.service'
import { MultiLLMService } from '@/lib/services/multi-llm.service'

export async function POST(request: Request) {
  try {
    console.log('=== Enhanced Chat API Started ===')
    console.log('Creating Supabase client...')
    const supabase = await createClient()
    console.log('Supabase client created successfully')

    console.log('Parsing request body...')
    let requestBody
    try {
      requestBody = await request.json()
      console.log('Request body parsed successfully')
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const {
      messages,
      personalityId,
      conversationId,
      assessmentId,
      provider = 'openai',
      model = 'gpt-4-turbo-preview',
      temperature = 0.7,
      maxTokens = 2000
    } = requestBody

    console.log('=== Enhanced Chat API Request ===')
    console.log('Provider:', provider, 'Model:', model)
    console.log('Assessment ID:', assessmentId)
    console.log('Messages count:', messages?.length)
    console.log('Environment variables check:')
    console.log('- OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY)
    console.log('- ANTHROPIC_API_KEY:', !!process.env.ANTHROPIC_API_KEY)
    console.log('- KIMI_API_KEY:', !!process.env.KIMI_API_KEY)
    console.log('- GROQ_API_KEY:', !!process.env.GROQ_API_KEY)
    
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

      // Check if the requested provider is available
      const availableProviders = []
      if (process.env.OPENAI_API_KEY) availableProviders.push('openai')
      if (process.env.ANTHROPIC_API_KEY) availableProviders.push('anthropic')
      if (process.env.KIMI_API_KEY) availableProviders.push('kimi')
      if (process.env.GROQ_API_KEY) availableProviders.push('groq')
      if (process.env.PERPLEXITY_API_KEY) availableProviders.push('perplexity')
      if (process.env.TOGETHER_API_KEY) availableProviders.push('together')
      availableProviders.push('local')

      if (!availableProviders.includes(provider)) {
        return NextResponse.json(
          { error: `Provider ${provider} is not available. Available providers: ${availableProviders.join(', ')}` },
          { status: 400 }
        )
      }

      console.log('Creating MultiLLMService instance...')
      let multiLLMService
      try {
        multiLLMService = new MultiLLMService()
        console.log('MultiLLMService created successfully')
      } catch (serviceError) {
        console.error('Failed to create MultiLLMService:', serviceError)
        return NextResponse.json(
          { error: `Failed to initialize LLM service: ${serviceError instanceof Error ? serviceError.message : 'Unknown error'}` },
          { status: 500 }
        )
      }

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

      // Prepare messages with context and proper assessment instructions
      const systemPrompt = `You are conducting a psychological assessment about relationship structure preferences, specifically focusing on monogamy vs. polyamory patterns. Your role is to ask thoughtful, open-ended questions that help reveal the user's underlying archetypes and relationship patterns.

IMPORTANT INSTRUCTIONS:
1. Start by asking ONE open-ended question about their relationship preferences, experiences, or values
2. Do NOT provide summaries, explanations, or overviews of the assessment
3. Do NOT list multiple questions at once
4. Ask questions that explore emotional patterns, attachment styles, and relationship dynamics
5. Focus on understanding their authentic preferences rather than judging them
6. Keep questions conversational and non-clinical

${contextContent ? `\nRelevant context about this assessment:\n${contextContent}` : ''}

Begin by asking your first open-ended question about their relationship structure preferences or experiences.`

      const contextualMessages = [
        ...messages.slice(0, -1), // Previous conversation
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ]

      // Use multi-LLM service
      console.log('Calling generateChatCompletion with:', { provider, model, temperature, maxTokens })
      try {
        result = await multiLLMService.generateChatCompletion(contextualMessages, {
          provider,
          model,
          temperature,
          maxTokens
        })
        console.log('MultiLLM response received:', { provider: result.provider, model: result.model })
      } catch (llmError) {
        console.error('MultiLLM service error:', llmError)
        return NextResponse.json(
          { error: `LLM service error: ${llmError instanceof Error ? llmError.message : 'Unknown error'}` },
          { status: 500 }
        )
      }
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
