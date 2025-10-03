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

    // Analyze message for archetype patterns
    const archetypeConfidence = await analyzeArchetypePatterns(
      message,
      conversationHistory,
      archetypes || []
    )

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
