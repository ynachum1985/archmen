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
      maxTokens = 2000,
      isFirstMessage = false // Flag for generating first question
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
    console.log('Is First Message:', isFirstMessage)
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
    // Initialize moderation service (used for both input and output)
    const moderation = new AIModeration(
      process.env.OPENAI_API_KEY!,
      process.env.PERSPECTIVE_API_KEY
    )

    // Skip moderation for first message (no user input yet)
    let moderationResult = { flagged: false, action: 'allow', confidence: 0 }

    if (!isFirstMessage && userMessage) {
      console.log('=== Content Moderation Check ===')
      moderationResult = await moderation.moderateContent(userMessage, {
        userId: user?.id,
        assessmentId,
        conversationType: assessmentId ? 'assessment' : 'chat'
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
    } else if (isFirstMessage) {
      console.log('Skipping moderation for first message generation')
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
    let ragContext = null  // Initialize outside so it's available throughout

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
      // Skip RAG for first message since there's no user input yet
      if (!isFirstMessage && userMessage) {
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
      } else {
        console.log('Skipping RAG context for first message generation')
        ragContext = { archetypeContent: [], assessmentContent: [], totalChunks: 0, searchQuery: '' }
      }

      // Ensure ragContext is always initialized
      if (!ragContext) {
        ragContext = { archetypeContent: [], assessmentContent: [], totalChunks: 0, searchQuery: '' }
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

      // For first message, generate an opening question instead of responding to user input
      let contextualMessages
      if (isFirstMessage) {
        contextualMessages = [
          {
            role: 'system',
            content: enhancedSystemPrompt
          },
          {
            role: 'user',
            content: 'Please generate your first question to begin this assessment. Make it open-ended and engaging.'
          }
        ]
      } else {
        contextualMessages = [
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
      }

      console.log('Final system prompt length:', finalSystemPrompt.length)
      console.log('Using personality:', personalityConfig?.name || 'None')
      console.log('Contextual messages:', {
        count: contextualMessages.length,
        roles: contextualMessages.map(m => m.role),
        isFirstMessage
      })

      // Use multi-LLM service
      console.log('Calling generateChatCompletion with:', { provider, model, temperature, maxTokens })
      try {
        result = await multiLLMService.generateChatCompletion(contextualMessages, {
          provider,
          model,
          temperature,
          maxTokens
        })
        console.log('MultiLLM response received:', { provider: result.provider, model: result.model, contentLength: result.content?.length })
      } catch (llmError) {
        console.error('MultiLLM service error:', llmError)
        console.error('Error details:', {
          message: llmError instanceof Error ? llmError.message : 'Unknown error',
          stack: llmError instanceof Error ? llmError.stack : 'No stack',
          provider,
          model,
          isFirstMessage
        })
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

    // Detect archetypes from the conversation for inline revelation using RAG
    let detectedArchetypes = []
    let archetypeConfidence: Record<string, number> = {}

    // Always attempt archetype detection if we have an assessment and conversation history
    if (assessmentId && conversationHistory.length > 0) {
      try {
        // Fetch assessment configuration for thresholds
        let minConfidenceThreshold = 50 // Default

        try {
          const { data: assessment } = await supabase
            .from('enhanced_assessments')
            .select('min_confidence, min_archetypes')
            .eq('id', assessmentId)
            .single()

          if (assessment) {
            minConfidenceThreshold = assessment.min_confidence || 50
          }
        } catch (error) {
          console.error('Error fetching assessment config:', error)
        }

        // Analyze the user's latest message for archetype patterns using RAG context
        const latestUserMessage = finalMessages[finalMessages.length - 1]?.content || ''

        // Build archetype knowledge from RAG results or use fallback
        let archetypeAnalysisPrompt = ''

        if (ragContext && ragContext.archetypeContent && ragContext.archetypeContent.length > 0) {
          // Use RAG-based analysis when knowledge is available
          const archetypeKnowledge = ragContext.archetypeContent
            .slice(0, 10) // Use top 10 relevant chunks
            .map(chunk => `${chunk.archetype_name}:\n${chunk.content}`)
            .join('\n\n---\n\n')

          archetypeAnalysisPrompt = `You are an expert Jungian psychologist analyzing user responses for archetypal patterns.

Based on the embedded archetype knowledge provided below, analyze this user message and identify which archetypes are present. Return ONLY a JSON object with archetype names as keys and confidence percentages (0-100) as values.

IMPORTANT:
- Only include archetypes that appear in the knowledge base below
- Only include archetypes with confidence >= ${minConfidenceThreshold}
- Return top 5 matches maximum
- Match based on language patterns, values, behaviors, and emotional responses

EMBEDDED ARCHETYPE KNOWLEDGE:
${archetypeKnowledge}

User message: "${latestUserMessage}"

Recent conversation context: ${conversationHistory.slice(-3).map(m => `${m.role}: ${m.content.substring(0, 150)}`).join('\n')}

Analyze the patterns and match them to the archetypes in the knowledge base above.

Return ONLY valid JSON like: {"Archetype Name": 75, "Another Archetype": 60}
Do NOT include any other text.`
        } else {
          // Fallback analysis using Jungian archetypes when RAG context is unavailable
          console.log('⚠️ RAG context empty, using fallback archetype analysis')

          archetypeAnalysisPrompt = `You are an expert Jungian psychologist analyzing user responses for archetypal patterns.

Analyze this user message and identify which Jungian archetypes are present. Return ONLY a JSON object with archetype names as keys and confidence percentages (0-100) as values.

Common Jungian Archetypes:
- The Hero: courage, strength, overcoming challenges
- The Shadow: repressed aspects, darkness, unconscious
- The Wise Old Man/Woman: wisdom, knowledge, guidance
- The Innocent: optimism, happiness, safety
- The Explorer: freedom, adventure, discovery
- The Lover: intimacy, passion, connection
- The Creator: innovation, self-expression, imagination
- The Caregiver: compassion, service, support
- The Everyman: belonging, connection, relatability
- The Jester: humor, playfulness, entertainment
- The Sage: analysis, truth-seeking, reflection
- The Magician: transformation, power, knowledge
- The Ruler: control, order, leadership
- The Lover: intimacy, relationships, passion
- The King: authority, responsibility, leadership
- The Warrior: discipline, courage, competition

IMPORTANT:
- Only include archetypes with confidence >= ${minConfidenceThreshold}
- Return top 5 matches maximum
- Match based on language patterns, values, behaviors, and emotional responses

User message: "${latestUserMessage}"

Recent conversation context: ${conversationHistory.slice(-3).map(m => `${m.role}: ${m.content.substring(0, 150)}`).join('\n')}

Analyze the patterns and identify matching archetypes.

Return ONLY valid JSON like: {"Archetype Name": 75, "Another Archetype": 60}
Do NOT include any other text.`
        }

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
          console.log('🎭 Detected archetype scores:', archetypeScores)

          // Store ALL archetype confidence for database saving (for RAG context)
          archetypeConfidence = Object.entries(archetypeScores)
            .reduce((acc, [name, score]) => {
              acc[name] = score as number
              return acc
            }, {} as Record<string, number>)

          // Only reveal archetypes that meet the high confidence threshold
          const revealThreshold = Math.max(minConfidenceThreshold + 20, 70) // Default 70% or 20 points above threshold
          console.log('🎯 Reveal threshold:', revealThreshold)

          // Convert to array and match with archetype data from RAG
          detectedArchetypes = Object.entries(archetypeScores)
            .filter(([_, score]) => (score as number) >= revealThreshold) // Only reveal high confidence archetypes
            .map(([name, score]) => {
              // Find archetype description from RAG context
              const archetypeChunk = ragContext && ragContext.archetypeContent && ragContext.archetypeContent.find(
                chunk => chunk.archetype_name === name
              )
              return {
                name,
                confidenceScore: score as number,
                description: archetypeChunk?.content?.substring(0, 300) || '',
                isNewlyRevealed: true // All returned archetypes are newly revealed (they passed the threshold)
              }
            })
            .sort((a, b) => b.confidenceScore - a.confidenceScore)
            .slice(0, 5) // Top 5 archetypes

          console.log('✅ Archetypes to reveal:', detectedArchetypes.length, 'out of', Object.keys(archetypeScores).length, 'detected')
        } catch (parseError) {
          console.error('Error parsing archetype analysis:', parseError)
          console.error('Raw response:', archetypeAnalysis.content)
        }
      } catch (error) {
        console.error('Error detecting archetypes:', error)
      }
    }

    // Save detailed analysis to database for RAG and admin visibility
    if (user && conversationId && assessmentId && Object.keys(archetypeConfidence).length > 0) {
      try {
        console.log('💾 Saving assessment response to database...')
        const latestUserMessage = finalMessages[finalMessages.length - 1]?.content || ''

        // Generate a UUID for question_id (v4 random UUID)
        const generateUUID = () => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0
            const v = c === 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
          })
        }

        // Save to assessment_responses table
        const { data: insertedResponse, error: insertError } = await supabase
          .from('assessment_responses')
          .insert({
            user_id: user.id,
            session_id: conversationId,
            template_id: assessmentId,
            question_id: generateUUID(),
            response_value: latestUserMessage,
            response_data: {
              archetype_confidence: archetypeConfidence,
              detected_archetypes: detectedArchetypes.map(a => ({
                name: a.name,
                confidenceScore: a.confidenceScore,
                isNewlyRevealed: a.isNewlyRevealed
              })),
              timestamp: new Date().toISOString()
            }
          })
          .select()

        if (insertError) {
          console.error('❌ Error inserting assessment response:', insertError)
        } else {
          console.log('✅ Assessment response saved successfully')
        }
      } catch (error) {
        console.error('❌ Error saving assessment response:', error)
        // Don't throw - continue with response even if save fails
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
