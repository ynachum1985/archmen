import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enhancedAIService } from '@/lib/services/enhanced-ai.service'
import { MultiLLMService } from '@/lib/services/multi-llm.service'
import { AIModeration } from '@/lib/moderation/ai-moderation'
import { aiPersonalityService } from '@/lib/services/ai-personality.service'

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
    console.log('- OPENROUTER_API_KEY:', !!process.env.OPENROUTER_API_KEY)
    
    // Check if user is authenticated (optional for demo)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Log if user is authenticated (for analytics)
    if (user) {
      console.log('Authenticated enhanced chat request from user:', user.id)
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1]?.content || ''
    const conversationHistory = messages.slice(0, -1)

    // Step 1: Get assessment moderation settings if available
    let assessmentModerationSettings = null
    if (assessmentId) {
      try {
        const { data: assessment } = await supabase
          .from('enhanced_assessments')
          .select('moderation_level, custom_moderation_settings')
          .eq('id', assessmentId)
          .single()

        if (assessment) {
          assessmentModerationSettings = {
            level: assessment.moderation_level || 'moderate',
            settings: assessment.custom_moderation_settings
          }
        }
      } catch (error) {
        console.error('Error fetching assessment moderation settings:', error)
      }
    }

    // Step 2: Moderate user input for safety (if enabled)
    const shouldModerateInput = assessmentModerationSettings?.settings?.enableUserInputModeration ?? true
    let moderationResult = { flagged: false, action: 'allow' as const, confidence: 0 }

    if (shouldModerateInput && assessmentModerationSettings?.level !== 'disabled') {
      console.log('=== Content Moderation Check ===')
      const moderation = new AIModeration()
      moderationResult = await moderation.moderateContent(userMessage, {
        userId: user?.id,
        assessmentId,
        conversationType: assessmentId ? 'assessment' : 'chat',
        moderationLevel: assessmentModerationSettings?.level
      })

      console.log('Moderation result:', {
        flagged: moderationResult.flagged,
        action: moderationResult.action,
        confidence: moderationResult.confidence
      })
    }

    console.log('Moderation result:', {
      flagged: moderationResult.flagged,
      action: moderationResult.action,
      confidence: moderationResult.confidence
    })

    // Block harmful content immediately
    if (moderationResult.action === 'block') {
      return NextResponse.json({
        error: 'Content blocked due to safety concerns',
        moderation: {
          flagged: true,
          reason: 'Your message contains content that violates our community guidelines. Please rephrase your message in a respectful way.'
        }
      }, { status: 400 })
    }

    // Flag for human review but allow to continue
    if (moderationResult.action === 'human_review') {
      console.log('Content flagged for human review but allowing to continue')
    }

    // Step 3: Load AI personality if specified
    let systemPrompt = ''
    let personalityConfig = null

    if (personalityId) {
      console.log('=== Loading AI Personality ===')
      try {
        personalityConfig = await aiPersonalityService.getPersonality(personalityId)
        if (personalityConfig) {
          systemPrompt = personalityConfig.system_prompt_template
          console.log('Loaded personality:', personalityConfig.name)
          console.log('System prompt length:', systemPrompt.length)
        }
      } catch (error) {
        console.error('Failed to load personality:', error)
        // Continue with default behavior if personality loading fails
      }
    }

    let result

    // If this is for assessment testing, use multi-LLM service for all providers
    if (assessmentId) {
      console.log('Creating MultiLLMService for assessment testing')

      // Check if the requested provider is available
      const availableProviders = []
      if (process.env.OPENROUTER_API_KEY) availableProviders.push('openrouter')
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

      // Get assessment configuration to use proper prompt
      let assessmentPrompt = ''
      if (assessmentId) {
        try {
          const { data: assessment } = await supabase
            .from('enhanced_assessments')
            .select('assessment_prompt, description, purpose')
            .eq('id', assessmentId)
            .single()

          if (assessment) {
            assessmentPrompt = assessment.assessment_prompt ||
              `You are conducting the "${assessment.description || 'assessment'}" assessment. ${assessment.purpose || ''}`
          }
        } catch (error) {
          console.error('Error fetching assessment prompt:', error)
        }
      }

      // Prepare messages with context, assessment prompt, and personality
      let finalSystemPrompt = ''

      if (systemPrompt) {
        // Use AI personality system prompt as primary
        finalSystemPrompt = systemPrompt
        if (assessmentPrompt) {
          finalSystemPrompt += `\n\nAssessment Context: ${assessmentPrompt}`
        }
      } else if (assessmentPrompt) {
        // Fall back to assessment prompt
        finalSystemPrompt = assessmentPrompt
      } else {
        // Default prompt
        finalSystemPrompt = 'You are conducting an assessment. Ask thoughtful, open-ended questions to understand the user better.'
      }

      // Add personality safety limits if available
      if (personalityConfig?.safety_limits && personalityConfig.safety_limits.length > 0) {
        finalSystemPrompt += `\n\nSafety Guidelines:\n${personalityConfig.safety_limits.map(limit => `- ${limit}`).join('\n')}`
      }

      // Add personality escalation triggers if available
      if (personalityConfig?.escalation_triggers && personalityConfig.escalation_triggers.length > 0) {
        finalSystemPrompt += `\n\nEscalation Triggers (refer to professional help if mentioned):\n${personalityConfig.escalation_triggers.map(trigger => `- ${trigger}`).join('\n')}`
      }

      const contextualMessages = [
        ...messages.slice(0, -1), // Previous conversation
        {
          role: 'system',
          content: contextContent ? `${finalSystemPrompt}\n\nRelevant context:\n${contextContent}` : finalSystemPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ]

      console.log('Final system prompt length:', finalSystemPrompt.length)
      console.log('Using personality:', personalityConfig?.name || 'None')

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

    // Step 4: Moderate AI response for safety (if enabled)
    const aiResponse = result.content || result.response
    const shouldModerateResponse = assessmentModerationSettings?.settings?.enableAIResponseModeration ?? true
    let aiModerationResult = { flagged: false, action: 'allow' as const, confidence: 0 }

    if (shouldModerateResponse && assessmentModerationSettings?.level !== 'disabled') {
      console.log('=== AI Response Moderation Check ===')
      const moderation = new AIModeration()
      aiModerationResult = await moderation.moderateContent(aiResponse, {
        userId: user?.id,
        assessmentId,
        conversationType: assessmentId ? 'assessment' : 'chat',
        moderationLevel: assessmentModerationSettings?.level
      })

      console.log('AI response moderation result:', {
        flagged: aiModerationResult.flagged,
        action: aiModerationResult.action,
        confidence: aiModerationResult.confidence
      })
    }

    // If AI response is flagged, provide a safe fallback
    let finalResponse = aiResponse
    if (aiModerationResult.action === 'block') {
      finalResponse = "I apologize, but I need to rephrase my response. Let me provide a more appropriate answer to your question."
      console.log('AI response blocked, using fallback')
    } else if (aiModerationResult.action === 'human_review') {
      console.log('AI response flagged for human review but allowing to continue')
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
      content: finalResponse,
      context: result.context,
      personalityUsed: result.personalityUsed || personalityConfig?.name,
      provider: provider,
      model: model,
      usage: result.usage,
      cost: result.cost,
      moderation: {
        userInput: {
          flagged: moderationResult.flagged,
          action: moderationResult.action
        },
        aiResponse: {
          flagged: aiModerationResult.flagged,
          action: aiModerationResult.action
        }
      }
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
