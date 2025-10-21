import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { conversationChatSchema, type ConversationChatRequest } from '@/lib/validations/api'
import { withAPIMiddleware, APIError } from '@/lib/middleware/api-validation'
import { ragChatService, type RAGContext } from '@/lib/services/rag-chat.service'

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new APIError('OpenAI API key not configured', 500, 'OPENAI_KEY_MISSING')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

interface ArchetypeConfidence {
  [archetypeName: string]: number
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: {
    archetypeConfidence?: ArchetypeConfidence
    suggestedActions?: Array<{
      type: 'homework' | 'calendar' | 'reminder'
      label: string
      action: string
    }>
  }
}

async function handleConversationChat(request: NextRequest, data: ConversationChatRequest) {
  const { conversationId, message, userId, assessmentId } = data

    const supabase = createClient()

    // Get conversation history
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('messages, metadata')
      .eq('id', conversationId)
      .single()

    if (convError) {
      throw new APIError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND')
    }

    const messages: ConversationMessage[] = conversation.messages || []
    const conversationPhase = conversation.metadata?.phase || 'assessment'

    // Get available archetypes for analysis
    const { data: archetypes, error: archetypesError } = await supabase
      .from('enhanced_archetypes')
      .select('id, name, description, core_traits')

    if (archetypesError) {
      console.error('Error fetching archetypes:', archetypesError)
      // Continue without archetypes rather than failing
    }

    // Prepare conversation context for AI
    const conversationHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    // Add the new user message
    conversationHistory.push({
      role: 'user',
      content: message
    })

    // Create AI prompt based on conversation phase
    const systemPrompt = createSystemPrompt(conversationPhase, archetypes || [])

    // Get RAG-enhanced response using the new service
    const ragResponse = await ragChatService.generateResponse(
      [
        { role: 'system', content: systemPrompt },
        ...conversationHistory
      ],
      {
        conversationId,
        assessmentId,
        userId,
        maxContextChunks: 8,
        similarityThreshold: 0.7,
        includeArchetypes: true,
        includeAssessments: true
      }
    )

    const aiResponse = ragResponse.content
    const ragContext = ragResponse.context

    // Perform detailed linguistic analysis
    const linguisticAnalysis = await performDetailedLinguisticAnalysis(
      message,
      conversationHistory,
      archetypes || []
    )

    // Analyze message for archetype patterns
    const archetypeConfidence = await analyzeArchetypePatterns(
      message,
      conversationHistory,
      archetypes || []
    )

    // Save detailed analysis to database for RAG and admin visibility
    if (Object.keys(archetypeConfidence).length > 0 || linguisticAnalysis.emotionalTone.length > 0) {
      await saveAnalysisToDatabase(
        supabase,
        userId,
        conversationId,
        assessmentId,
        message,
        linguisticAnalysis,
        archetypeConfidence
      )
    }

    // Update emerging archetypes in real-time
    if (Object.keys(archetypeConfidence).length > 0) {
      await updateEmergingArchetypes(
        supabase,
        conversationId,
        archetypeConfidence,
        archetypes || [],
        conversationHistory
      )
    }

    // Determine if we should suggest actions
    const suggestedActions = await determineSuggestedActions(
      aiResponse,
      conversationPhase,
      archetypeConfidence
    )

    // Prepare response metadata with RAG context
    const responseMetadata: any = {
      ragContext: {
        totalChunks: ragContext.totalChunks,
        archetypeChunks: ragContext.archetypeContent.length,
        assessmentChunks: ragContext.assessmentContent.length,
        searchQuery: ragContext.searchQuery
      }
    }

    if (Object.keys(archetypeConfidence).length > 0) {
      responseMetadata.archetypeConfidence = archetypeConfidence
    }

    if (suggestedActions.length > 0) {
      responseMetadata.suggestedActions = suggestedActions
    }

    // Add RAG context details for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      responseMetadata.ragContextDetails = ragContext
    }

    return NextResponse.json({
      content: aiResponse,
      metadata: responseMetadata
    })
}

function createSystemPrompt(phase: string, archetypes: any[]): string {
  const archetypeList = archetypes.map(a => `${a.name}: ${a.description}`).join('\n')

  const basePrompt = `You are an expert Jungian archetype analyst conducting a conversational assessment. Your goal is to discover the user's primary archetypal patterns through natural, engaging conversation.

Available Archetypes:
${archetypeList}

Current Phase: ${phase}

Guidelines:
- Be warm, empathetic, and genuinely curious
- Ask follow-up questions that reveal archetypal patterns
- Look for language patterns, values, motivations, and behavioral tendencies
- When you have sufficient confidence (70%+) in 3-5 archetypes, present them beautifully
- Gradually transition from assessment to integration and homework assignment
- Keep responses conversational and engaging, not clinical
- Use insights to guide the conversation deeper

Remember: This is a journey of self-discovery, not a test. Help them explore their authentic self.`

  if (phase === 'assessment') {
    return basePrompt + `

Focus on:
- Understanding their life experiences and challenges
- Identifying their core values and motivations
- Exploring their relationships and communication patterns
- Discovering their approach to conflict and growth
- Noticing their language patterns and emotional vocabulary`
  }

  if (phase === 'results') {
    return basePrompt + `

Focus on:
- Present their top archetypes with beautiful, personalized descriptions
- Help them understand how these archetypes show up in their life
- Encourage questions and deeper exploration
- Prepare them for the integration phase`
  }

  if (phase === 'integration') {
    return basePrompt + `

Focus on:
- Helping them integrate their archetypal insights
- Assigning personalized homework and practices
- Providing ongoing support and guidance
- Tracking their progress and growth`
  }

  return basePrompt
}

async function updateEmergingArchetypes(
  supabase: any,
  conversationId: string,
  archetypeConfidence: ArchetypeConfidence,
  archetypes: any[],
  conversationHistory: any[]
): Promise<void> {
  try {
    // Get current emerging archetypes
    const { data: conversation } = await supabase
      .from('conversations')
      .select('emerging_archetypes')
      .eq('id', conversationId)
      .single()

    const existingArchetypes = conversation?.emerging_archetypes || []

    // Build updated emerging archetypes array
    const updatedArchetypes = []

    for (const [archetypeName, confidence] of Object.entries(archetypeConfidence)) {
      // Find archetype details
      const archetypeDetails = archetypes.find(a => a.name === archetypeName)
      if (!archetypeDetails) continue

      // Check if archetype already exists
      const existingIndex = existingArchetypes.findIndex(
        (a: any) => a.archetype_name === archetypeName
      )

      // Get aliases and rank them
      const rankedAliases = await rankAliases(
        archetypeDetails,
        conversationHistory,
        confidence
      )

      // Extract evidence quotes from conversation
      const evidence = extractEvidenceQuotes(conversationHistory, archetypeName)

      if (existingIndex >= 0) {
        // Update existing archetype
        const existing = existingArchetypes[existingIndex]
        updatedArchetypes.push({
          ...existing,
          confidence_score: confidence,
          ranked_aliases: rankedAliases,
          evidence: [...new Set([...(existing.evidence || []), ...evidence])].slice(0, 5), // Keep top 5 unique
          detected_at: existing.detected_at // Keep original detection time
        })
      } else {
        // Add new archetype
        updatedArchetypes.push({
          archetype_id: archetypeDetails.id,
          archetype_name: archetypeName,
          confidence_score: confidence,
          impact_score: archetypeDetails.impact_score || 5,
          ranked_aliases: rankedAliases,
          evidence: evidence,
          detected_at: new Date().toISOString()
        })
      }
    }

    // Merge with existing archetypes that weren't updated
    for (const existing of existingArchetypes) {
      if (!updatedArchetypes.find((a: any) => a.archetype_name === existing.archetype_name)) {
        updatedArchetypes.push(existing)
      }
    }

    // Sort by confidence and keep top 5
    const sortedArchetypes = updatedArchetypes
      .sort((a: any, b: any) => b.confidence_score - a.confidence_score)
      .slice(0, 5)

    // Update conversation
    await supabase
      .from('conversations')
      .update({ emerging_archetypes: sortedArchetypes })
      .eq('id', conversationId)

  } catch (error) {
    console.error('Error updating emerging archetypes:', error)
  }
}

async function rankAliases(
  archetype: any,
  conversationHistory: any[],
  confidence: number
): Promise<Array<{ name: string, strength: 'strong' | 'moderate' | 'mild', confidence: number }>> {
  const aliases = archetype.alternative_names || []

  if (aliases.length === 0) {
    return []
  }

  // For now, use a simple ranking based on overall confidence
  // In the future, this could analyze which specific aliases match the user's language
  const rankedAliases = aliases.slice(0, 10).map((alias: string, index: number) => {
    // Distribute confidence scores based on position
    const aliasConfidence = Math.max(30, confidence - (index * 5))

    let strength: 'strong' | 'moderate' | 'mild'
    if (aliasConfidence >= 80) {
      strength = 'strong'
    } else if (aliasConfidence >= 60) {
      strength = 'moderate'
    } else {
      strength = 'mild'
    }

    return {
      name: alias,
      strength,
      confidence: aliasConfidence
    }
  })

  return rankedAliases
}

function extractEvidenceQuotes(
  conversationHistory: any[],
  archetypeName: string
): string[] {
  // Get user messages only
  const userMessages = conversationHistory
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content)
    .slice(-5) // Last 5 user messages

  // For now, return the most recent user messages as evidence
  // In the future, this could use AI to identify the most relevant quotes
  return userMessages.slice(0, 3)
}

/**
 * Perform detailed linguistic analysis on user message
 * Returns emotional tone, key phrases, language patterns, and archetype signals
 */
async function performDetailedLinguisticAnalysis(
  message: string,
  conversationHistory: any[],
  archetypes: any[]
): Promise<{
  emotionalTone: string[]
  keyPhrases: string[]
  languagePatterns: string[]
  archetypeSignals: Record<string, number>
  dominantThemes: string[]
  shadowIndicators: string[]
  linguisticStyle: string
}> {
  try {
    const conversationContext = conversationHistory
      .slice(-3)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')

    const analysisPrompt = `Perform a detailed linguistic analysis of this user message in the context of Jungian archetypes. Return ONLY a JSON object with the following structure:

{
  "emotionalTone": ["emotion1", "emotion2"],
  "keyPhrases": ["phrase1", "phrase2"],
  "languagePatterns": ["pattern1", "pattern2"],
  "archetypeSignals": {"Archetype Name": 0.75, "Another": 0.60},
  "dominantThemes": ["theme1", "theme2"],
  "shadowIndicators": ["shadow1", "shadow2"],
  "linguisticStyle": "description of communication style"
}

Available archetypes: ${archetypes.map(a => a.name).join(', ')}

Conversation context (last 3 messages):
${conversationContext}

Latest user message: ${message}

Analyze for:
- Emotional vocabulary and tone
- Key phrases that reveal values or patterns
- Language patterns (defensive, open, analytical, emotional, etc.)
- Which archetypes these patterns signal (0-1 scale)
- Dominant themes in their thinking
- Shadow work indicators (unconscious patterns)
- Overall linguistic style

Return ONLY valid JSON.`

    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.3,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || '{}'

    try {
      const parsed = JSON.parse(response)
      return {
        emotionalTone: Array.isArray(parsed.emotionalTone) ? parsed.emotionalTone : [],
        keyPhrases: Array.isArray(parsed.keyPhrases) ? parsed.keyPhrases : [],
        languagePatterns: Array.isArray(parsed.languagePatterns) ? parsed.languagePatterns : [],
        archetypeSignals: typeof parsed.archetypeSignals === 'object' ? parsed.archetypeSignals : {},
        dominantThemes: Array.isArray(parsed.dominantThemes) ? parsed.dominantThemes : [],
        shadowIndicators: Array.isArray(parsed.shadowIndicators) ? parsed.shadowIndicators : [],
        linguisticStyle: typeof parsed.linguisticStyle === 'string' ? parsed.linguisticStyle : ''
      }
    } catch {
      return {
        emotionalTone: [],
        keyPhrases: [],
        languagePatterns: [],
        archetypeSignals: {},
        dominantThemes: [],
        shadowIndicators: [],
        linguisticStyle: ''
      }
    }
  } catch (error) {
    console.error('Error performing linguistic analysis:', error)
    return {
      emotionalTone: [],
      keyPhrases: [],
      languagePatterns: [],
      archetypeSignals: {},
      dominantThemes: [],
      shadowIndicators: [],
      linguisticStyle: ''
    }
  }
}

async function analyzeArchetypePatterns(
  message: string,
  conversationHistory: any[],
  archetypes: any[]
): Promise<ArchetypeConfidence> {
  try {
    const analysisPrompt = `Analyze this conversation for Jungian archetype patterns. Return ONLY a JSON object with archetype names as keys and confidence percentages (0-100) as values.

Available archetypes: ${archetypes.map(a => a.name).join(', ')}

Conversation context:
${conversationHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Latest message: ${message}

Look for:
- Language patterns and vocabulary choices
- Values and motivations expressed
- Relationship and communication styles
- Approach to challenges and growth
- Emotional patterns and responses

Return only JSON like: {"Archetype Name": 75, "Another Archetype": 60}`

    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.3,
      max_tokens: 200,
    })

    const response = completion.choices[0]?.message?.content || '{}'

    try {
      const parsed = JSON.parse(response)
      // Filter out low confidence scores and limit to top 5
      const filtered = Object.entries(parsed)
        .filter(([_, confidence]) => (confidence as number) >= 30)
        .sort(([_, a], [__, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .reduce((acc, [name, confidence]) => {
          acc[name] = confidence as number
          return acc
        }, {} as ArchetypeConfidence)

      return filtered
    } catch {
      return {}
    }
  } catch (error) {
    console.error('Error analyzing archetype patterns:', error)
    return {}
  }
}

/**
 * Save detailed analysis to assessment_responses table for RAG and admin visibility
 */
async function saveAnalysisToDatabase(
  supabase: any,
  userId: string,
  conversationId: string,
  assessmentId: string | undefined,
  userMessage: string,
  linguisticAnalysis: any,
  archetypeConfidence: ArchetypeConfidence
): Promise<void> {
  try {
    // Save to assessment_responses table
    await supabase.from('assessment_responses').insert({
      user_id: userId,
      session_id: conversationId,
      template_id: assessmentId || 'main-assessment',
      question_id: `response_${Date.now()}`,
      response_value: userMessage,
      response_data: {
        linguistic_analysis: linguisticAnalysis,
        archetype_confidence: archetypeConfidence,
        timestamp: new Date().toISOString()
      }
    })

    // Update or create user_archetypes for each detected archetype
    for (const [archetypeName, confidence] of Object.entries(archetypeConfidence)) {
      if (confidence < 30) continue // Skip low confidence

      // Get archetype ID from name
      const { data: archetype } = await supabase
        .from('enhanced_archetypes')
        .select('id')
        .eq('name', archetypeName)
        .single()

      if (!archetype) continue

      // Check if user already has this archetype
      const { data: existingUserArchetype } = await supabase
        .from('user_archetypes')
        .select('id, current_confidence_score, peak_confidence_score, assessments_detected_in')
        .eq('user_id', userId)
        .eq('archetype_id', archetype.id)
        .single()

      const confidencePercent = Math.round(confidence)
      const keyEvidence = linguisticAnalysis.keyPhrases || []

      if (existingUserArchetype) {
        // Update existing archetype with new evidence
        const newPeakScore = Math.max(
          existingUserArchetype.peak_confidence_score || 0,
          confidencePercent
        )
        const assessmentsDetectedIn = existingUserArchetype.assessments_detected_in || []
        if (!assessmentsDetectedIn.includes(conversationId)) {
          assessmentsDetectedIn.push(conversationId)
        }

        await supabase
          .from('user_archetypes')
          .update({
            current_confidence_score: confidencePercent,
            peak_confidence_score: newPeakScore,
            key_evidence: keyEvidence,
            assessments_detected_in: assessmentsDetectedIn,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUserArchetype.id)
      } else {
        // Create new user archetype
        await supabase.from('user_archetypes').insert({
          user_id: userId,
          archetype_id: archetype.id,
          discovered_in_conversation_id: conversationId,
          current_confidence_score: confidencePercent,
          peak_confidence_score: confidencePercent,
          key_evidence: keyEvidence,
          assessments_detected_in: [conversationId],
          discovery_summary: `Discovered in Main Assessment conversation`,
          pattern_timeline: {
            [new Date().toISOString().split('T')[0]]: {
              confidence: confidencePercent,
              conversation_id: conversationId
            }
          }
        })
      }
    }
  } catch (error) {
    console.error('Error saving analysis to database:', error)
    // Don't throw - continue conversation even if save fails
  }
}

async function determineSuggestedActions(
  aiResponse: string,
  phase: string,
  archetypeConfidence: ArchetypeConfidence
): Promise<Array<{ type: 'homework' | 'calendar' | 'reminder', label: string, action: string }>> {
  const actions: Array<{ type: 'homework' | 'calendar' | 'reminder', label: string, action: string }> = []

  // Check if AI is suggesting homework or practices
  const homeworkKeywords = ['practice', 'homework', 'exercise', 'try', 'experiment', 'reflect on', 'journal about']
  const hasHomeworkSuggestion = homeworkKeywords.some(keyword =>
    aiResponse.toLowerCase().includes(keyword)
  )

  if (hasHomeworkSuggestion && phase === 'integration') {
    actions.push({
      type: 'homework',
      label: 'Add to Homework',
      action: 'add_homework'
    })
  }

  // Check if we should suggest scheduling
  const scheduleKeywords = ['daily', 'weekly', 'schedule', 'time', 'routine']
  const hasScheduleSuggestion = scheduleKeywords.some(keyword =>
    aiResponse.toLowerCase().includes(keyword)
  )

  if (hasScheduleSuggestion) {
    actions.push({
      type: 'calendar',
      label: 'Schedule Practice',
      action: 'schedule_practice'
    })
  }

  // If we have high confidence archetypes, suggest exploring them
  const highConfidenceArchetypes = Object.entries(archetypeConfidence)
    .filter(([_, confidence]) => confidence >= 70)

  if (highConfidenceArchetypes.length >= 3 && phase === 'assessment') {
    actions.push({
      type: 'reminder',
      label: 'Ready for Results',
      action: 'show_results'
    })
  }

  return actions
}

// Export the POST handler with middleware
export const POST = withAPIMiddleware(conversationChatSchema, handleConversationChat)
