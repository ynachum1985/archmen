import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'
import { archetypeService } from './archetype.service'
import { type HomepageAssessmentTheme } from './assessment-integration.service'

// Initialize OpenAI client
const openai = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    })
  : null

type AssessmentSession = Database['public']['Tables']['assessment_sessions']['Row']
type AssessmentSessionInsert = Database['public']['Tables']['assessment_sessions']['Insert']
type AssessmentResponse = Database['public']['Tables']['assessment_responses']['Row']
type AssessmentResponseInsert = Database['public']['Tables']['assessment_responses']['Insert']
type Conversation = Database['public']['Tables']['conversations']['Row']
type ConversationInsert = Database['public']['Tables']['conversations']['Insert']

interface LinguisticIndicators {
  emotionalTone: string[]
  keyPhrases: string[]
  languagePatterns: string[]
  archetypeSignals: Record<string, number>
  [key: string]: unknown
}

// Use the HomepageAssessmentTheme from integration service
type AssessmentTheme = HomepageAssessmentTheme

interface ConversationTurn {
  question: string
  response: string
  timestamp: string
  linguisticAnalysis: LinguisticIndicators
}

export class LinguisticAssessmentService {
  private supabase = createClient()
  private readonly FREE_QUESTION_LIMIT = 2

  // Assessment themes for different areas of life
  private themes: AssessmentTheme[] = [
    {
      id: 'relationships',
      name: 'Relationship Patterns',
      description: 'Explore your archetypal patterns in romantic relationships',
      focusAreas: ['attachment', 'communication', 'conflict', 'intimacy', 'boundaries'],
      initialPrompt: "I'd love to understand how you show up in relationships. Tell me about a recent relationship experience that felt significant to you - it could be a moment of connection, conflict, or anything that stood out.",
      archetypeMapping: {
        'The Lover': ['passion', 'intimacy', 'connection', 'romance', 'emotional depth'],
        'The King': ['leadership', 'protection', 'responsibility', 'decision-making', 'authority'],
        'The Warrior': ['boundaries', 'fighting for', 'defending', 'challenges', 'strength'],
        'The Magician': ['transformation', 'understanding', 'insight', 'healing', 'wisdom'],
        'The Innocent': ['trust', 'optimism', 'simplicity', 'faith', 'purity'],
        'The Hero': ['rescue', 'achievement', 'overcoming', 'proving', 'courage'],
        'The Caregiver': ['nurturing', 'supporting', 'helping', 'caring', 'sacrifice'],
        'The Explorer': ['freedom', 'adventure', 'independence', 'discovery', 'autonomy']
      }
    },
    {
      id: 'career',
      name: 'Professional Identity',
      description: 'Discover your archetypal patterns in work and career',
      focusAreas: ['leadership', 'collaboration', 'ambition', 'creativity', 'purpose'],
      initialPrompt: "Let's explore how you show up professionally. Describe a work situation where you felt most like yourself - whether it was leading a project, solving a problem, or working with others.",
      archetypeMapping: {
        'The King': ['leadership', 'vision', 'authority', 'responsibility', 'empire-building'],
        'The Magician': ['innovation', 'transformation', 'strategy', 'problem-solving', 'expertise'],
        'The Warrior': ['competition', 'goals', 'discipline', 'achievement', 'fighting'],
        'The Hero': ['challenges', 'proving', 'overcoming', 'recognition', 'success'],
        'The Sage': ['knowledge', 'teaching', 'wisdom', 'analysis', 'understanding'],
        'The Creator': ['innovation', 'building', 'imagination', 'artistic', 'vision'],
        'The Caregiver': ['service', 'helping', 'mentoring', 'supporting', 'nurturing'],
        'The Explorer': ['freedom', 'variety', 'adventure', 'independence', 'discovery']
      }
    }
  ]

  async startAssessment(themeId: string, userId?: string): Promise<{
    theme: AssessmentTheme;
    initialQuestion: string;
    sessionId?: string;
    isAuthenticated: boolean;
  }> {
    // First check if theme is in the hardcoded themes
    let theme = this.themes.find(t => t.id === themeId)

    // If not found in hardcoded themes, it might be from the database
    if (!theme) {
      // Try to get from database via assessment themes table
      const { data, error } = await this.supabase
        .from('assessment_themes')
        .select('*')
        .eq('id', themeId)
        .single()

      if (data && !error) {
        theme = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          focusAreas: data.focus_areas || [],
          initialPrompt: data.initial_prompt,
          archetypeMapping: data.archetype_mapping as Record<string, string[]> || {}
        }
      }
    }

    if (!theme) throw new Error('Theme not found')

    let sessionId: string | undefined
    let isAuthenticated = false

    // Check if user is authenticated
    const { data: { user } } = await this.supabase.auth.getUser()
    isAuthenticated = !!user

    // Create session if user is authenticated
    if (user) {
      const { data: session, error } = await this.supabase
        .from('assessment_sessions')
        .insert({
          user_id: user.id,
          template_id: themeId, // Using theme ID as template ID for now
          status: 'in_progress',
          current_question_index: 0,
          progress_percentage: 0,
          session_data: { theme: theme.name, started_at: new Date().toISOString() }
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating assessment session:', error)
      } else {
        sessionId = session.id
      }
    }

    return {
      theme,
      initialQuestion: theme.initialPrompt,
      sessionId,
      isAuthenticated
    }
  }

  async analyzeResponse(
    response: string,
    conversationHistory: ConversationTurn[],
    theme: AssessmentTheme,
    sessionId?: string
  ): Promise<{
    linguisticAnalysis: LinguisticIndicators
    nextQuestion: string
    archetypeScores: Record<string, number>
    isComplete: boolean
    requiresAuth: boolean
    freeQuestionsRemaining: number
  }> {
    if (!openai) {
      throw new Error('OpenAI not configured')
    }

    // Check authentication status
    const { data: { user } } = await this.supabase.auth.getUser()
    const isAuthenticated = !!user
    const currentQuestionCount = conversationHistory.length + 1
    const freeQuestionsRemaining = Math.max(0, this.FREE_QUESTION_LIMIT - currentQuestionCount)
    const requiresAuth = !isAuthenticated && currentQuestionCount >= this.FREE_QUESTION_LIMIT

    // If user has exceeded free limit and is not authenticated, return early
    if (requiresAuth) {
      return {
        linguisticAnalysis: {} as LinguisticIndicators,
        nextQuestion: "To continue your assessment and receive your personalized archetype analysis, please create a free account. This helps us save your progress and provide you with detailed insights.",
        archetypeScores: {},
        isComplete: false,
        requiresAuth: true,
        freeQuestionsRemaining: 0
      }
    }

    // Analyze the linguistic patterns in the response
    const analysisPrompt = this.buildAnalysisPrompt(response, conversationHistory, theme)

    const analysisCompletion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })

    const analysis = JSON.parse(analysisCompletion.choices[0]?.message?.content || '{}')

    // Save response to database if user is authenticated
    if (user && sessionId) {
      await this.saveAssessmentResponse(user.id, sessionId, response, analysis, theme.id)
    }

    // Generate next question based on analysis
    const nextQuestionPrompt = this.buildNextQuestionPrompt(analysis, conversationHistory, theme)

    const questionCompletion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: nextQuestionPrompt }],
      temperature: 0.7,
      max_tokens: 300
    })

    const nextQuestion = questionCompletion.choices[0]?.message?.content || ''

    // Calculate archetype scores based on linguistic patterns
    const archetypeScores = await this.calculateArchetypeScores(analysis, theme)

    // Determine if assessment is complete (after 5-8 exchanges or high confidence)
    const isComplete = conversationHistory.length >= 5 && this.hasHighConfidenceScores(archetypeScores)

    // Update session progress if authenticated
    if (user && sessionId) {
      await this.updateSessionProgress(sessionId, conversationHistory.length + 1, archetypeScores, isComplete)
    }

    return {
      linguisticAnalysis: analysis,
      nextQuestion,
      archetypeScores,
      isComplete,
      requiresAuth: false,
      freeQuestionsRemaining
    }
  }

  private buildAnalysisPrompt(response: string, history: ConversationTurn[], theme: AssessmentTheme): string {
    // Use enhanced system prompt if available
    const basePrompt = theme.systemPrompt || `
You are an expert archetypal analyst with deep knowledge of human psychology and behavioral patterns. Your role is to identify archetypal patterns through natural conversation.

ANALYSIS APPROACH:
- Draw from the complete database of 55+ archetypes
- Analyze language patterns, emotional vocabulary, responsibility patterns, and power dynamics
- Use adaptive questioning to gather sufficient evidence
- Remain curious, non-judgmental, and focused on helping the person understand themselves`

    return `
${basePrompt}

Analyze the following response for linguistic patterns that reveal archetypal tendencies in the context of ${theme.name}.

Response to analyze: "${response}"

Previous conversation context: ${JSON.stringify(history.slice(-2))}

Focus areas for this theme: ${theme.focusAreas.join(', ')}

Please analyze and return a JSON object with:
{
  "emotionalTone": ["array of emotional indicators detected"],
  "keyPhrases": ["significant phrases that reveal archetypal patterns"],
  "languagePatterns": ["linguistic patterns like word choice, sentence structure, metaphors"],
  "archetypeSignals": {
    "archetype_name": confidence_score_0_to_1
  },
  "dominantThemes": ["key themes emerging from the language"],
  "shadowIndicators": ["potential shadow aspects revealed through language"],
  "linguisticStyle": "description of communication style"
}

Look for:
- Word choice and metaphors
- Emotional language and tone
- Power dynamics in language
- Relationship to authority/control
- Problem-solving approach
- Values expressed through language
- Fear/desire patterns
- Communication style (direct, nurturing, analytical, etc.)
`
  }

  private buildNextQuestionPrompt(analysis: Record<string, unknown>, history: ConversationTurn[], theme: AssessmentTheme): string {
    return `
Based on this linguistic analysis of the user's response: ${JSON.stringify(analysis)}

Conversation history: ${JSON.stringify(history.slice(-2))}

Assessment theme: ${theme.name} - ${theme.description}

Generate the next question that will:
1. Dive deeper into emerging archetypal patterns
2. Explore shadow aspects that might be hidden
3. Use language that matches their communication style
4. Focus on areas where you need more clarity
5. Be conversational and engaging, not clinical

The question should feel like a natural continuation of the conversation and help reveal more about their archetypal patterns through their linguistic responses.

Return only the question, no additional text.
`
  }

  private async calculateArchetypeScores(analysis: Record<string, unknown>, theme: AssessmentTheme): Promise<Record<string, number>> {
    const scores: Record<string, number> = {}

    // Initialize all archetypes with base score
    Object.keys(theme.archetypeMapping).forEach(archetype => {
      scores[archetype] = 0
    })

    // Score based on archetype signals from AI analysis
    if (analysis.archetypeSignals && typeof analysis.archetypeSignals === 'object') {
      Object.entries(analysis.archetypeSignals as Record<string, number>).forEach(([archetype, score]) => {
        if (scores.hasOwnProperty(archetype)) {
          scores[archetype] = Math.max(scores[archetype], score)
        }
      })
    }

    // Boost scores based on key phrases matching archetype patterns
    if (Array.isArray(analysis.keyPhrases)) {
      Object.entries(theme.archetypeMapping).forEach(([archetype, patterns]) => {
        const matches = (analysis.keyPhrases as string[]).filter((phrase: string) =>
          patterns.some(pattern => phrase.toLowerCase().includes(pattern.toLowerCase()))
        )
        scores[archetype] += matches.length * 0.1
      })
    }

    // Use archetype service for additional pattern matching
    try {
      const responseText = Array.isArray(analysis.keyPhrases)
        ? (analysis.keyPhrases as string[]).join(' ')
        : ''

      if (responseText) {
        const archetypeScores = await archetypeService.analyzeTextForArchetypes(responseText)

        // Merge scores from archetype service
        Object.entries(archetypeScores).forEach(([archetype, score]) => {
          if (scores.hasOwnProperty(archetype)) {
            scores[archetype] = Math.max(scores[archetype], score * 0.5) // Weight database patterns at 50%
          }
        })
      }
    } catch (error) {
      console.error('Error using archetype service for scoring:', error)
    }

    // Normalize scores to 0-1 range
    Object.keys(scores).forEach(archetype => {
      scores[archetype] = Math.min(1, scores[archetype])
    })

    return scores
  }

  private hasHighConfidenceScores(scores: Record<string, number>): boolean {
    const sortedScores = Object.values(scores).sort((a, b) => b - a)
    return sortedScores[0] > 0.7 && sortedScores[1] > 0.5
  }

  async generateFinalReport(
    conversationHistory: ConversationTurn[],
    finalScores: Record<string, number>,
    theme: AssessmentTheme,
    sessionId?: string
  ): Promise<string> {
    if (!openai) {
      throw new Error('OpenAI not configured')
    }

    const reportPrompt = `
Generate a comprehensive archetypal assessment report based on this conversation analysis:

Theme: ${theme.name}
Conversation turns: ${conversationHistory.length}
Final archetype scores: ${JSON.stringify(finalScores)}

Conversation summary: ${JSON.stringify(conversationHistory)}

Create a personalized report that includes:
1. Primary and secondary archetypes with explanations
2. Key linguistic patterns that revealed these archetypes
3. Shadow aspects to be aware of
4. Specific recommendations for growth
5. How these patterns show up in ${theme.name.toLowerCase()}

Write in a warm, insightful tone that helps the person understand themselves better.
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: reportPrompt }],
      temperature: 0.7,
      max_tokens: 1500
    })

    const report = completion.choices[0]?.message?.content || 'Unable to generate report'

    // Save final results to database if user is authenticated
    const { data: { user } } = await this.supabase.auth.getUser()
    if (user && sessionId) {
      await this.saveFinalResults(user.id, sessionId, theme.id, finalScores, report, conversationHistory)
    }

    return report
  }

  // Save final assessment results
  private async saveFinalResults(
    userId: string,
    sessionId: string,
    themeId: string,
    archetypeScores: Record<string, number>,
    finalReport: string,
    conversationHistory: ConversationTurn[]
  ): Promise<void> {
    try {
      await this.supabase.from('assessment_results').insert({
        user_id: userId,
        session_id: sessionId,
        theme_id: themeId,
        archetype_scores: archetypeScores,
        final_report: finalReport,
        conversation_summary: {
          total_turns: conversationHistory.length,
          themes_discussed: conversationHistory.map(turn => turn.linguisticAnalysis.dominantThemes || []).flat(),
          linguistic_patterns: conversationHistory.map(turn => turn.linguisticAnalysis.languagePatterns || []).flat()
        }
      })
    } catch (error) {
      console.error('Error saving final results:', error)
      // Don't throw - assessment can complete without saving
    }
  }

  async getAvailableThemes(): Promise<AssessmentTheme[]> {
    try {
      const { data, error } = await this.supabase
        .from('assessment_themes')
        .select('*')
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching themes from database:', error)
        // Fallback to hardcoded themes
        return this.themes
      }

      // Convert database themes to AssessmentTheme format
      const dbThemes: AssessmentTheme[] = data?.map(theme => ({
        id: theme.id,
        name: theme.name,
        description: theme.description || '',
        focusAreas: theme.focus_areas || [],
        initialPrompt: theme.initial_prompt,
        archetypeMapping: theme.archetype_mapping as Record<string, string[]> || {}
      })) || []

      // Return database themes if available, otherwise fallback to hardcoded
      return dbThemes.length > 0 ? dbThemes : this.themes
    } catch (error) {
      console.error('Error in getAvailableThemes:', error)
      return this.themes
    }
  }

  // Keep the synchronous version for backward compatibility
  getAvailableThemesSync(): AssessmentTheme[] {
    return this.themes
  }

  // Helper method to save assessment response to database
  private async saveAssessmentResponse(
    userId: string,
    sessionId: string,
    response: string,
    analysis: LinguisticIndicators,
    templateId: string
  ): Promise<void> {
    try {
      // Save to assessment_responses table
      await this.supabase.from('assessment_responses').insert({
        user_id: userId,
        session_id: sessionId,
        template_id: templateId,
        question_id: `question_${Date.now()}`, // Generate unique question ID
        response_value: response,
        response_data: {
          linguistic_analysis: analysis,
          timestamp: new Date().toISOString()
        }
      })

      // Also save to conversations table for chat history
      await this.supabase.from('conversations').insert({
        user_id: userId,
        assessment_id: sessionId,
        messages: [{
          role: 'user',
          content: response,
          timestamp: new Date().toISOString(),
          analysis
        }],
        metadata: {
          type: 'linguistic_assessment',
          template_id: templateId
        }
      })
    } catch (error) {
      console.error('Error saving assessment response:', error)
      // Don't throw error - continue assessment even if save fails
    }
  }

  // Helper method to update session progress
  private async updateSessionProgress(
    sessionId: string,
    questionIndex: number,
    archetypeScores: Record<string, number>,
    isComplete: boolean
  ): Promise<void> {
    try {
      const progressPercentage = Math.min(100, (questionIndex / 8) * 100)

      const updateData: any = {
        current_question_index: questionIndex,
        progress_percentage: progressPercentage,
        discovered_archetypes: archetypeScores,
        updated_at: new Date().toISOString()
      }

      if (isComplete) {
        updateData.status = 'completed'
        updateData.completed_at = new Date().toISOString()
      }

      await this.supabase
        .from('assessment_sessions')
        .update(updateData)
        .eq('id', sessionId)
    } catch (error) {
      console.error('Error updating session progress:', error)
    }
  }

  // Method to get user's assessment history
  async getUserAssessmentHistory(userId: string): Promise<AssessmentSession[]> {
    try {
      const { data, error } = await this.supabase
        .from('assessment_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching assessment history:', error)
      return []
    }
  }

  // Method to resume an existing session
  async resumeSession(sessionId: string): Promise<{
    session: AssessmentSession | null;
    conversationHistory: ConversationTurn[];
  }> {
    try {
      // Get session details
      const { data: session, error: sessionError } = await this.supabase
        .from('assessment_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError

      // Get conversation history
      const { data: responses, error: responsesError } = await this.supabase
        .from('assessment_responses')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (responsesError) throw responsesError

      // Convert responses to conversation turns
      const conversationHistory: ConversationTurn[] = responses?.map(response => ({
        question: 'Previous question', // We'd need to store questions too
        response: response.response_value,
        timestamp: response.created_at || '',
        linguisticAnalysis: (response.response_data as any)?.linguistic_analysis || {}
      })) || []

      return { session, conversationHistory }
    } catch (error) {
      console.error('Error resuming session:', error)
      return { session: null, conversationHistory: [] }
    }
  }
}

export const linguisticAssessmentService = new LinguisticAssessmentService() 