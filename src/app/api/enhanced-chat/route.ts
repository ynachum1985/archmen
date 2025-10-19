import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enhancedAIService } from '@/lib/services/enhanced-ai.service'
import { MultiLLMService } from '@/lib/services/multi-llm.service'
import { AIModeration } from '@/lib/moderation/ai-moderation'
import { aiPersonalityService } from '@/lib/services/ai-personality.service'
import { ragChatService } from '@/lib/services/rag-chat.service'

export async function POST(request: Request) {
  try {
    console.log('=== Enhanced Chat API Started ===')
    console.log('Creating Supabase client...')
    const supabase = await createClient()

    // Handle build-time scenario where Supabase client might be null
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not available during build time' },
        { status: 500 }
      )
    }
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
      message, // Legacy conversation-chat format
      personalityId,
      conversationId,
      assessmentId,
      userId,
      provider = 'openai',
      model = 'gpt-4-turbo-preview',
      temperature = 0.7,
      maxTokens = 2000
    } = requestBody

    // Handle legacy conversation-chat format
    let finalMessages = messages
    if (message && !messages) {
      // Convert legacy format to new format
      finalMessages = [{ role: 'user', content: message }]
    }

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
    const userMessage = finalMessages[finalMessages.length - 1]?.content || ''
    const conversationHistory = finalMessages.slice(0, -1)

    // Step 1: Moderate user input for safety using centralized settings
    console.log('=== Content Moderation Check ===')
    const moderation = new AIModeration(
      process.env.OPENAI_API_KEY!,
      process.env.PERSPECTIVE_API_KEY
    )
    const moderationResult = await moderation.moderateContent(userMessage, {
      userId: user?.id,
      assessmentId,
      conversationType: assessmentId ? 'assessment' : 'chat'
    })

    console.log('Moderation result:', {
      flagged: moderationResult.flagged,
      action: moderationResult.action,
      confidence: moderationResult.confidence
    })

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

    // Step 2: Load AI personality if specified
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

      // Get RAG-enhanced context using the comprehensive service
      let ragContext = null
      try {
        ragContext = await ragChatService.getRelevantContext(userMessage, {
          conversationId,
          assessmentId,
          userId: user?.id,
          maxContextChunks: 8,
          similarityThreshold: 0.7,
          includeArchetypes: true,
          includeAssessments: true
        })
        console.log(`RAG context retrieved: ${ragContext.totalChunks} chunks (${ragContext.archetypeContent.length} archetype, ${ragContext.assessmentContent.length} assessment)`)
      } catch (error) {
        console.error('Error fetching RAG context:', error)
        ragContext = { archetypeContent: [], assessmentContent: [], totalChunks: 0, searchQuery: userMessage }
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

      // Create enhanced system prompt with RAG context
      const enhancedSystemPrompt = ragContext && ragContext.totalChunks > 0
        ? ragChatService.createEnhancedSystemPrompt(finalSystemPrompt, ragContext)
        : finalSystemPrompt

      const contextualMessages = [
        ...conversationHistory, // Previous conversation
        {
          role: 'system',
          content: enhancedSystemPrompt
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

    // Step 3: Moderate AI response for safety using centralized settings
    const aiResponse = result.content || result.response
    console.log('=== AI Response Moderation Check ===')
    const aiModerationResult = await moderation.moderateContent(aiResponse, {
      userId: user?.id,
      assessmentId,
      conversationType: assessmentId ? 'assessment' : 'chat'
    })

    console.log('AI response moderation result:', {
      flagged: aiModerationResult.flagged,
      action: aiModerationResult.action,
      confidence: aiModerationResult.confidence
    })

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

    // Detect archetypes from the conversation for inline revelation
    let detectedArchetypes = []
    if (assessmentId && conversationHistory.length > 0) {
      try {
        // Fetch assessment configuration for thresholds
        let minConfidenceThreshold = 50 // Default
        let minArchetypesToReveal = 1 // Default

        try {
          const { data: assessment } = await supabase
            .from('enhanced_assessments')
            .select('min_confidence, min_archetypes')
            .eq('id', assessmentId)
            .single()

          if (assessment) {
            minConfidenceThreshold = assessment.min_confidence || 50
            minArchetypesToReveal = assessment.min_archetypes || 1
          }
        } catch (error) {
          console.error('Error fetching assessment config:', error)
        }

        // Get ALL active archetypes from database (58+)
        const { data: allArchetypes } = await supabase
          .from('enhanced_archetypes')
          .select('id, name, description, core_traits, psychology_profile')
          .eq('is_active', true)

        if (allArchetypes && allArchetypes.length > 0) {
          // Analyze the user's latest message for archetype patterns
          const latestUserMessage = finalMessages[finalMessages.length - 1]?.content || ''

          // Build archetype context from RAG results
          let archetypeContext = ''
          if (ragContext && ragContext.archetypeContent.length > 0) {
            archetypeContext = `\n\nRelevant archetype patterns from knowledge base:\n${ragContext.archetypeContent
              .slice(0, 5)
              .map(chunk => `- ${chunk.archetype_name}: ${chunk.content.substring(0, 200)}...`)
              .join('\n')}`
          }

          // Use AI to detect archetypes with confidence scores against ALL archetypes
          const archetypeAnalysisPrompt = `You are an expert Jungian psychologist analyzing user responses for archetypal patterns.

Analyze this user message for Jungian archetype patterns. Compare against ALL available archetypes and return ONLY a JSON object with archetype names as keys and confidence percentages (0-100) as values.

IMPORTANT: Only include archetypes with confidence >= ${minConfidenceThreshold}. Return top 5 matches maximum.

Available archetypes (${allArchetypes.length} total):
${allArchetypes.map(a => `- ${a.name}: ${a.description?.substring(0, 100) || ''}`).join('\n')}
${archetypeContext}

User message: "${latestUserMessage}"

Recent conversation context: ${conversationHistory.slice(-3).map(m => `${m.role}: ${m.content.substring(0, 150)}`).join('\n')}

Analyze the language patterns, values, behaviors, and emotional responses. Match them to the archetypes.

Return ONLY valid JSON like: {"Archetype Name": 75, "Another Archetype": 60}
Do NOT include any other text.`

          const multiLLM = new MultiLLMService()
          const archetypeAnalysis = await multiLLM.generateChatCompletion(
            [{ role: 'user', content: archetypeAnalysisPrompt }],
            {
              provider: 'openai',
              model: 'gpt-3.5-turbo',
              temperature: 0.3,
              maxTokens: 300
            }
          )

          try {
            const archetypeScores = JSON.parse(archetypeAnalysis.content)

            // Convert to array and match with archetype data
            detectedArchetypes = Object.entries(archetypeScores)
              .filter(([_, score]) => (score as number) >= minConfidenceThreshold)
              .map(([name, score]) => {
                const archetypeData = allArchetypes.find(a => a.name === name)
                return {
                  name,
                  confidenceScore: score as number,
                  description: archetypeData?.description || '',
                  isNewlyRevealed: (score as number) >= Math.max(minConfidenceThreshold + 20, 70) // Reveal when confidence is 20+ points above threshold or 70%
                }
              })
              .sort((a, b) => b.confidenceScore - a.confidenceScore)
              .slice(0, 5) // Top 5 archetypes
          } catch (parseError) {
            console.error('Error parsing archetype analysis:', parseError)
            console.error('Raw response:', archetypeAnalysis.content)
          }
        }
      } catch (error) {
        console.error('Error detecting archetypes:', error)
      }
    }

    return NextResponse.json({
      content: finalResponse,
      context: result.context,
      personalityUsed: result.personalityUsed || personalityConfig?.name,
      provider: provider,
      model: model,
      usage: result.usage,
      cost: result.cost,
      detectedArchetypes: detectedArchetypes,
      ragContext: ragContext ? {
        totalChunks: ragContext.totalChunks,
        archetypeChunks: ragContext.archetypeContent.length,
        assessmentChunks: ragContext.assessmentContent.length,
        searchQuery: ragContext.searchQuery
      } : null,
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
