import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/client'

// Initialize OpenAI client
const openai = process.env.NEXT_PUBLIC_OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    })
  : null

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
}

interface RelevantContext {
  archetypes: Array<{
    id: string
    name: string
    description: string
    category: string
    similarity: number
  }>
  patterns: Array<{
    id: string
    archetype_name: string
    keywords: string[]
    phrases: string[]
    emotional_indicators: string[]
    similarity: number
  }>
  personalities: Array<{
    id: string
    name: string
    description: string
    questioning_style: string
    tone: string
    similarity: number
  }>
}

interface EnhancedPersonality {
  id: string
  name: string
  description: string
  system_prompt_template: string
  questioning_style: string
  tone: string
  challenge_level: number
  emotional_attunement: number
  open_ended_questions: string[]
  clarifying_questions: string[]
  goals: string[]
  behavior_traits: string[]
  personality_config: any
}

export class EnhancedAIService {
  private supabase = createClient()

  async generateResponse(
    userMessage: string,
    conversationHistory: Message[],
    personalityId?: string
  ): Promise<{
    response: string
    context: RelevantContext
    personalityUsed?: EnhancedPersonality
  }> {
    if (!openai) {
      throw new Error('OpenAI not configured')
    }

    try {
      // 1. Get personality if specified
      const personality = personalityId 
        ? await this.getPersonality(personalityId)
        : null

      // 2. RAG: Find relevant context
      const relevantContext = await this.retrieveRelevantContext(
        userMessage,
        conversationHistory
      )

      // 3. Build enhanced prompt with context
      const enhancedPrompt = this.buildContextualPrompt(
        personality,
        relevantContext,
        conversationHistory,
        userMessage
      )

      // 4. Generate response
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: enhancedPrompt,
        temperature: 0.7,
        max_tokens: 2000,
      })

      const response = completion.choices[0]?.message?.content || 
        'I apologize, but I was unable to generate a response.'

      return {
        response,
        context: relevantContext,
        personalityUsed: personality || undefined
      }
    } catch (error) {
      console.error('Enhanced AI service error:', error)
      throw error
    }
  }

  async getPersonality(personalityId: string): Promise<EnhancedPersonality | null> {
    const { data, error } = await this.supabase
      .from('ai_personalities')
      .select('*')
      .eq('id', personalityId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching personality:', error)
      return null
    }

    return {
      ...data,
      open_ended_questions: data.open_ended_questions || [],
      clarifying_questions: data.clarifying_questions || [],
      goals: data.goals || [],
      behavior_traits: data.behavior_traits || [],
      personality_config: data.personality_config || {}
    }
  }

  async retrieveRelevantContext(
    message: string,
    history: Message[]
  ): Promise<RelevantContext> {
    // Combine recent messages for context
    const contextText = [
      ...history.slice(-3).map(m => m.content),
      message
    ].join(' ')

    // Get embedding for the context
    const embedding = await this.getEmbedding(contextText)

    // Parallel searches for different types of context
    const [archetypes, patterns, personalities] = await Promise.all([
      this.searchArchetypes(embedding),
      this.searchLinguisticPatterns(embedding),
      this.searchPersonalities(embedding)
    ])

    return {
      archetypes: archetypes || [],
      patterns: patterns || [],
      personalities: personalities || []
    }
  }

  private async getEmbedding(text: string): Promise<number[]> {
    if (!openai) throw new Error('OpenAI not configured')

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.substring(0, 8000) // Limit input length
    })

    return response.data[0].embedding
  }

  private async searchArchetypes(embedding: number[]) {
    const { data, error } = await this.supabase.rpc('match_archetypes', {
      query_embedding: embedding,
      match_threshold: 0.6,
      match_count: 5
    })

    if (error) {
      console.error('Error searching archetypes:', error)
      return []
    }

    return data
  }

  private async searchLinguisticPatterns(embedding: number[]) {
    const { data, error } = await this.supabase.rpc('match_linguistic_patterns', {
      query_embedding: embedding,
      match_threshold: 0.6,
      match_count: 5
    })

    if (error) {
      console.error('Error searching patterns:', error)
      return []
    }

    return data
  }

  private async searchPersonalities(embedding: number[]) {
    const { data, error } = await this.supabase.rpc('match_personalities', {
      query_embedding: embedding,
      match_threshold: 0.6,
      match_count: 3
    })

    if (error) {
      console.error('Error searching personalities:', error)
      return []
    }

    return data
  }

  private buildContextualPrompt(
    personality: EnhancedPersonality | null,
    context: RelevantContext,
    history: Message[],
    userMessage: string
  ): Message[] {
    // Build system prompt with personality and context
    let systemPrompt = personality?.system_prompt_template || 
      `You are an expert psychological assessor specializing in archetype identification through conversation.`

    // Add relevant archetype context
    if (context.archetypes.length > 0) {
      systemPrompt += `\n\nRELEVANT ARCHETYPES TO CONSIDER:\n`
      context.archetypes.forEach(archetype => {
        systemPrompt += `- ${archetype.name}: ${archetype.description}\n`
      })
    }

    // Add linguistic pattern context
    if (context.patterns.length > 0) {
      systemPrompt += `\n\nLINGUISTIC PATTERNS TO WATCH FOR:\n`
      context.patterns.forEach(pattern => {
        systemPrompt += `- ${pattern.archetype_name}: Keywords: ${pattern.keywords?.join(', ')}\n`
      })
    }

    // Add personality-specific guidance
    if (personality) {
      systemPrompt += `\n\nYOUR PERSONALITY APPROACH:\n`
      systemPrompt += `- Tone: ${personality.tone}\n`
      systemPrompt += `- Questioning Style: ${personality.questioning_style}\n`
      systemPrompt += `- Challenge Level: ${personality.challenge_level}/10\n`
      systemPrompt += `- Emotional Attunement: ${personality.emotional_attunement}/10\n`
      
      if (personality.goals.length > 0) {
        systemPrompt += `- Goals: ${personality.goals.join(', ')}\n`
      }
    }

    systemPrompt += `\n\nRespond naturally and conversationally while keeping these insights in mind.`

    // Build message array
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage }
    ]

    return messages
  }

  // Utility method for generating embeddings for existing data
  async generateEmbeddingsForExistingData() {
    if (!openai) throw new Error('OpenAI not configured')

    console.log('Generating embeddings for existing data...')

    // Generate embeddings for archetypes
    const { data: archetypes } = await this.supabase
      .from('enhanced_archetypes')
      .select('id, name, description')
      .is('description_embedding', null)

    if (archetypes) {
      for (const archetype of archetypes) {
        const text = `${archetype.name}: ${archetype.description}`
        const embedding = await this.getEmbedding(text)
        
        await this.supabase
          .from('enhanced_archetypes')
          .update({ description_embedding: embedding })
          .eq('id', archetype.id)
        
        console.log(`Generated embedding for archetype: ${archetype.name}`)
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Generate embeddings for linguistic patterns
    const { data: patterns } = await this.supabase
      .from('linguistic_patterns')
      .select('id, archetype_name, keywords, phrases, emotional_indicators')
      .is('pattern_embedding', null)

    if (patterns) {
      for (const pattern of patterns) {
        const text = `${pattern.archetype_name}: ${[
          ...(pattern.keywords || []),
          ...(pattern.phrases || []),
          ...(pattern.emotional_indicators || [])
        ].join(' ')}`
        
        const embedding = await this.getEmbedding(text)
        
        await this.supabase
          .from('linguistic_patterns')
          .update({ pattern_embedding: embedding })
          .eq('id', pattern.id)
        
        console.log(`Generated embedding for pattern: ${pattern.archetype_name}`)
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Generate embeddings for AI personalities
    const { data: personalities } = await this.supabase
      .from('ai_personalities')
      .select('id, name, description, questioning_style, tone')
      .is('embedding', null)

    if (personalities) {
      for (const personality of personalities) {
        const text = `${personality.name}: ${personality.description} ${personality.questioning_style} ${personality.tone}`
        const embedding = await this.getEmbedding(text)
        
        await this.supabase
          .from('ai_personalities')
          .update({ embedding })
          .eq('id', personality.id)
        
        console.log(`Generated embedding for personality: ${personality.name}`)
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log('Embedding generation complete!')
  }
}

export const enhancedAIService = new EnhancedAIService()
