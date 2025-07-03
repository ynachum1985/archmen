import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/client'

// Initialize OpenAI client
const openai = process.env.NEXT_PUBLIC_OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    })
  : null

interface LinguisticIndicators {
  emotionalTone: string[]
  keyPhrases: string[]
  languagePatterns: string[]
  archetypeSignals: Record<string, number>
}

interface AssessmentTheme {
  id: string
  name: string
  description: string
  focusAreas: string[]
  initialPrompt: string
  archetypeMapping: Record<string, string[]>
}

interface ConversationTurn {
  question: string
  response: string
  timestamp: string
  linguisticAnalysis: LinguisticIndicators
}

export class LinguisticAssessmentService {
  private supabase = createClient()

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

  async startAssessment(themeId: string): Promise<{ theme: AssessmentTheme; initialQuestion: string }> {
    const theme = this.themes.find(t => t.id === themeId)
    if (!theme) throw new Error('Theme not found')

    return {
      theme,
      initialQuestion: theme.initialPrompt
    }
  }

  async analyzeResponse(
    response: string, 
    conversationHistory: ConversationTurn[],
    theme: AssessmentTheme
  ): Promise<{
    linguisticAnalysis: LinguisticIndicators
    nextQuestion: string
    archetypeScores: Record<string, number>
    isComplete: boolean
  }> {
    if (!openai) {
      throw new Error('OpenAI not configured')
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
    const archetypeScores = this.calculateArchetypeScores(analysis, theme)

    // Determine if assessment is complete (after 5-8 exchanges or high confidence)
    const isComplete = conversationHistory.length >= 5 && this.hasHighConfidenceScores(archetypeScores)

    return {
      linguisticAnalysis: analysis,
      nextQuestion,
      archetypeScores,
      isComplete
    }
  }

  private buildAnalysisPrompt(response: string, history: ConversationTurn[], theme: AssessmentTheme): string {
    return `
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

  private buildNextQuestionPrompt(analysis: any, history: ConversationTurn[], theme: AssessmentTheme): string {
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

  private calculateArchetypeScores(analysis: any, theme: AssessmentTheme): Record<string, number> {
    const scores: Record<string, number> = {}
    
    // Initialize all archetypes with base score
    Object.keys(theme.archetypeMapping).forEach(archetype => {
      scores[archetype] = 0
    })

    // Score based on archetype signals from AI analysis
    if (analysis.archetypeSignals) {
      Object.entries(analysis.archetypeSignals).forEach(([archetype, score]) => {
        if (scores.hasOwnProperty(archetype)) {
          scores[archetype] = Math.max(scores[archetype], score as number)
        }
      })
    }

    // Boost scores based on key phrases matching archetype patterns
    if (analysis.keyPhrases) {
      Object.entries(theme.archetypeMapping).forEach(([archetype, patterns]) => {
        const matches = analysis.keyPhrases.filter((phrase: string) =>
          patterns.some(pattern => phrase.toLowerCase().includes(pattern.toLowerCase()))
        )
        scores[archetype] += matches.length * 0.1
      })
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
    theme: AssessmentTheme
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

    return completion.choices[0]?.message?.content || 'Unable to generate report'
  }

  getAvailableThemes(): AssessmentTheme[] {
    return this.themes
  }
}

export const linguisticAssessmentService = new LinguisticAssessmentService() 