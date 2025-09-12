import { createClient } from '@/lib/supabase/client'

export interface AIPersonality {
  id: string
  name: string
  description: string
  open_ended_questions: string[]
  clarifying_questions: string[]
  goals: string[]
  behavior_traits: string[]
  system_prompt_template: string
  is_active: boolean
  created_at: string
  updated_at: string

  // Enhanced fields for RAG and UX
  personality_config?: {
    questioning_approach?: string
    behavioral_traits?: string
    goals_and_objectives?: string
  }
  parsed_questions?: string[]
  parsed_traits?: string[]
  parsed_goals?: string[]
  embedding?: number[]

  // Existing schema fields
  questioning_style?: string
  tone?: string
  challenge_level?: number
  emotional_attunement?: number
  sample_openers?: string[]
  sample_followups?: string[]
}

export interface NewAIPersonality {
  name: string
  description: string
  open_ended_questions: string[]
  clarifying_questions: string[]
  goals: string[]
  behavior_traits: string[]
  system_prompt_template: string
  is_active?: boolean

  // Enhanced fields for UX
  personality_config?: {
    questioning_approach?: string
    behavioral_traits?: string
    goals_and_objectives?: string
  }

  // Optional existing schema fields
  questioning_style?: string
  tone?: string
  challenge_level?: number
  emotional_attunement?: number
}

export class AIPersonalityService {
  private supabase = createClient()

  async getAllPersonalities(): Promise<AIPersonality[]> {
    const { data, error } = await this.supabase
      .from('ai_personalities')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching AI personalities:', error)
      throw error
    }

    // Ensure arrays are always defined
    return (data || []).map(personality => ({
      ...personality,
      open_ended_questions: personality.open_ended_questions || [],
      clarifying_questions: personality.clarifying_questions || [],
      goals: personality.goals || [],
      behavior_traits: personality.behavior_traits || []
    }))
  }

  async getActivePersonalities(): Promise<AIPersonality[]> {
    const { data, error } = await this.supabase
      .from('ai_personalities')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching active AI personalities:', error)
      throw error
    }

    // Ensure arrays are always defined
    return (data || []).map(personality => ({
      ...personality,
      open_ended_questions: personality.open_ended_questions || [],
      clarifying_questions: personality.clarifying_questions || [],
      goals: personality.goals || [],
      behavior_traits: personality.behavior_traits || []
    }))
  }

  async getPersonalityById(id: string): Promise<AIPersonality | null> {
    const { data, error } = await this.supabase
      .from('ai_personalities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching AI personality:', error)
      return null
    }

    if (!data) return null

    // Ensure arrays are always defined
    return {
      ...data,
      open_ended_questions: data.open_ended_questions || [],
      clarifying_questions: data.clarifying_questions || [],
      goals: data.goals || [],
      behavior_traits: data.behavior_traits || []
    }
  }

  async createPersonality(personality: NewAIPersonality): Promise<AIPersonality> {
    const { data, error } = await this.supabase
      .from('ai_personalities')
      .insert({
        ...personality,
        is_active: personality.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating AI personality:', error)
      throw error
    }

    // Ensure arrays are always defined
    return {
      ...data,
      open_ended_questions: data.open_ended_questions || [],
      clarifying_questions: data.clarifying_questions || [],
      goals: data.goals || [],
      behavior_traits: data.behavior_traits || []
    }
  }

  async updatePersonality(id: string, updates: Partial<NewAIPersonality>): Promise<AIPersonality> {
    const { data, error } = await this.supabase
      .from('ai_personalities')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating AI personality:', error)
      throw error
    }

    // Ensure arrays are always defined
    return {
      ...data,
      open_ended_questions: data.open_ended_questions || [],
      clarifying_questions: data.clarifying_questions || [],
      goals: data.goals || [],
      behavior_traits: data.behavior_traits || []
    }
  }

  async deletePersonality(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('ai_personalities')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting AI personality:', error)
      throw error
    }
  }

  async initializeDefaultPersonalities(): Promise<void> {
    // Check if personalities already exist
    const { data: existing } = await this.supabase
      .from('ai_personalities')
      .select('id')
      .limit(1)

    if (existing && existing.length > 0) {
      return // Already initialized
    }

    const defaultPersonalities: NewAIPersonality[] = [
      {
        name: 'Empathetic Guide',
        description: 'A warm, understanding personality that focuses on emotional connection and gentle exploration.',
        open_ended_questions: [
          "Tell me about a moment when you felt most authentic and true to yourself.",
          "Describe a relationship that has shaped who you are today.",
          "What does feeling 'at home' mean to you, and when do you experience that feeling?"
        ],
        clarifying_questions: [
          "When you say that, what feelings come up for you?",
          "Can you help me understand what that experience was like for you?",
          "What made that moment particularly meaningful?"
        ],
        goals: [
          'Create emotional safety and trust',
          'Encourage deep self-reflection',
          'Identify emotional patterns and responses',
          'Explore relationship dynamics'
        ],
        behavior_traits: [
          'Uses warm, inclusive language',
          'Validates emotions and experiences',
          'Asks follow-up questions about feelings',
          'Focuses on personal meaning and significance'
        ],
        system_prompt_template: `You are an empathetic guide with a warm, understanding presence. Your approach is gentle yet insightful, focusing on emotional connection and helping people explore their inner world with compassion.

PERSONALITY TRAITS:
- Warm and nurturing communication style
- Deep interest in emotional experiences
- Patient and non-judgmental
- Skilled at creating psychological safety

QUESTIONING APPROACH:
- Ask about feelings and emotional responses
- Explore the personal meaning of experiences
- Focus on relationships and connections
- Use gentle, open-ended questions

Remember to validate experiences and create space for vulnerability while maintaining professional boundaries.`
      },
      {
        name: 'Strategic Analyst',
        description: 'A logical, systematic personality that focuses on patterns, goals, and strategic thinking.',
        open_ended_questions: [
          "Describe a challenge you've overcome and the approach you took to solve it.",
          "What patterns do you notice in how you make important decisions?",
          "Tell me about a goal you've achieved and the strategy you used."
        ],
        clarifying_questions: [
          "What specific steps did you take in that situation?",
          "How did you evaluate your options before deciding?",
          "What criteria do you typically use to measure success?"
        ],
        goals: [
          'Identify decision-making patterns',
          'Explore strategic thinking approaches',
          'Understand goal-setting and achievement methods',
          'Analyze problem-solving styles'
        ],
        behavior_traits: [
          'Uses logical, structured language',
          'Focuses on processes and systems',
          'Asks about methods and approaches',
          'Explores cause-and-effect relationships'
        ],
        system_prompt_template: `You are a strategic analyst with a logical, systematic approach to understanding human behavior. You excel at identifying patterns and helping people understand their decision-making processes and strategic thinking.

PERSONALITY TRAITS:
- Analytical and methodical
- Focused on patterns and systems
- Clear and direct communication
- Goal-oriented perspective

QUESTIONING APPROACH:
- Ask about processes and methods
- Explore decision-making patterns
- Focus on strategies and outcomes
- Use structured, logical questions

Help people understand their cognitive patterns while maintaining a supportive and professional demeanor.`
      }
    ]

    for (const personality of defaultPersonalities) {
      await this.createPersonality(personality)
    }
  }
  // Phase 3: AI-powered parsing for UX optimization
  async parsePersonalityInput(combinedText: string): Promise<{
    questions: string[]
    traits: string[]
    goals: string[]
    approach: string
  }> {
    // This would use OpenAI to parse combined text
    // For now, return a simple split-based parsing
    const lines = combinedText.split('\n').filter(line => line.trim())

    return {
      questions: lines.filter(line => line.includes('?') || line.toLowerCase().includes('question')),
      traits: lines.filter(line => line.toLowerCase().includes('trait') || line.toLowerCase().includes('behavior')),
      goals: lines.filter(line => line.toLowerCase().includes('goal') || line.toLowerCase().includes('aim')),
      approach: lines.find(line => line.toLowerCase().includes('approach') || line.toLowerCase().includes('style')) || ''
    }
  }

  // Enhanced create method that handles both individual and combined input
  async createEnhancedPersonality(
    personality: NewAIPersonality,
    combinedInput?: string
  ): Promise<AIPersonality> {
    const finalPersonality = { ...personality }

    // If combined input is provided, parse it
    if (combinedInput) {
      const parsed = await this.parsePersonalityInput(combinedInput)

      // Store both the combined input and parsed results
      finalPersonality.personality_config = {
        questioning_approach: combinedInput,
        behavioral_traits: parsed.traits.join('\n'),
        goals_and_objectives: parsed.goals.join('\n')
      }

      // Update individual arrays if they're empty
      if (finalPersonality.open_ended_questions.length === 0) {
        finalPersonality.open_ended_questions = parsed.questions
      }
      if (finalPersonality.behavior_traits.length === 0) {
        finalPersonality.behavior_traits = parsed.traits
      }
      if (finalPersonality.goals.length === 0) {
        finalPersonality.goals = parsed.goals
      }
    }

    return this.createPersonality(finalPersonality)
  }
}

export const aiPersonalityService = new AIPersonalityService()
