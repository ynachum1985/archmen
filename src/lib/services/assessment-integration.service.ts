import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type EnhancedAssessment = Database['public']['Tables']['enhanced_assessments']['Row']
type AssessmentTemplate = Database['public']['Tables']['assessment_templates']['Row']

// Interface for homepage assessment themes (converted from admin assessments)
export interface HomepageAssessmentTheme {
  id: string
  name: string
  description: string
  focusAreas: string[]
  initialPrompt: string
  archetypeMapping: Record<string, string[]>
  systemPrompt?: string
  questioningStrategy?: string
  questioningDepth?: string
  expectedDuration?: number
  isMainAssessment?: boolean
}

export class AssessmentIntegrationService {
  private supabase = createClient()

  // Get the main assessment for the homepage
  async getMainAssessment(): Promise<HomepageAssessmentTheme | null> {
    try {
      // First try to get from enhanced_assessments table
      const { data: enhancedAssessment, error: enhancedError } = await this.supabase
        .from('enhanced_assessments')
        .select('*')
        .eq('is_active', true)
        .eq('category', 'main') // Look for main assessment
        .single()

      if (enhancedAssessment && !enhancedError) {
        return this.convertEnhancedAssessmentToTheme(enhancedAssessment)
      }

      // Fallback to assessment_templates table
      const { data: template, error: templateError } = await this.supabase
        .from('assessment_templates')
        .select('*')
        .eq('is_active', true)
        .eq('category', 'main')
        .single()

      if (template && !templateError) {
        return this.convertTemplateToTheme(template)
      }

      // If no main assessment found, return null (will use hardcoded themes)
      return null
    } catch (error) {
      console.error('Error fetching main assessment:', error)
      return null
    }
  }

  // Get all available assessments for homepage selection
  async getAvailableAssessments(): Promise<HomepageAssessmentTheme[]> {
    try {
      const themes: HomepageAssessmentTheme[] = []

      // Get from enhanced_assessments
      const { data: enhancedAssessments, error: enhancedError } = await this.supabase
        .from('enhanced_assessments')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (enhancedAssessments && !enhancedError) {
        const enhancedThemes = enhancedAssessments.map(assessment => 
          this.convertEnhancedAssessmentToTheme(assessment)
        )
        themes.push(...enhancedThemes)
      }

      // Get from assessment_templates as fallback
      const { data: templates, error: templateError } = await this.supabase
        .from('assessment_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (templates && !templateError) {
        const templateThemes = templates.map(template => 
          this.convertTemplateToTheme(template)
        )
        themes.push(...templateThemes)
      }

      return themes
    } catch (error) {
      console.error('Error fetching available assessments:', error)
      return []
    }
  }

  // Convert enhanced assessment to homepage theme format
  private convertEnhancedAssessmentToTheme(assessment: EnhancedAssessment): HomepageAssessmentTheme {
    // Extract archetype mapping from question examples or adaptive logic
    const archetypeMapping: Record<string, string[]> = {}
    
    // Try to extract from adaptive logic or create default mapping
    if (assessment.adaptive_logic && typeof assessment.adaptive_logic === 'object') {
      const adaptiveLogic = assessment.adaptive_logic as Record<string, unknown>
      if (adaptiveLogic.archetypeMapping && typeof adaptiveLogic.archetypeMapping === 'object') {
        Object.assign(archetypeMapping, adaptiveLogic.archetypeMapping)
      }
    }

    // Default archetype mapping if none found
    if (Object.keys(archetypeMapping).length === 0) {
      Object.assign(archetypeMapping, {
        'The Lover': ['passion', 'intimacy', 'connection', 'romance', 'emotional depth'],
        'The King': ['leadership', 'protection', 'responsibility', 'decision-making', 'authority'],
        'The Warrior': ['boundaries', 'fighting for', 'defending', 'challenges', 'strength'],
        'The Magician': ['transformation', 'understanding', 'insight', 'healing', 'wisdom'],
        'The Hero': ['rescue', 'achievement', 'overcoming', 'proving', 'courage'],
        'The Caregiver': ['nurturing', 'supporting', 'helping', 'caring', 'sacrifice'],
        'The Explorer': ['freedom', 'adventure', 'independence', 'discovery', 'autonomy']
      })
    }

    // Extract focus areas from question examples or use defaults
    const focusAreas: string[] = []
    if (assessment.question_examples && typeof assessment.question_examples === 'object') {
      const questionExamples = assessment.question_examples as Record<string, unknown>
      if (questionExamples.focusAreas && Array.isArray(questionExamples.focusAreas)) {
        focusAreas.push(...questionExamples.focusAreas)
      }
    }

    // Default focus areas based on category
    if (focusAreas.length === 0) {
      if (assessment.category?.toLowerCase().includes('relationship')) {
        focusAreas.push('attachment', 'communication', 'conflict', 'intimacy', 'boundaries')
      } else {
        focusAreas.push('patterns', 'behavior', 'psychology', 'growth', 'awareness')
      }
    }

    // Create initial prompt from system prompt or generate one
    let initialPrompt = "Let's explore your archetypal patterns. Tell me about a recent experience that felt significant to you."
    
    if (assessment.system_prompt) {
      // Extract or generate initial prompt from system prompt
      const systemPrompt = assessment.system_prompt
      if (systemPrompt.includes('initial') || systemPrompt.includes('first') || systemPrompt.includes('start')) {
        // Try to extract initial prompt from system prompt
        const lines = systemPrompt.split('\n')
        const promptLine = lines.find(line => 
          line.toLowerCase().includes('ask') || 
          line.toLowerCase().includes('start') ||
          line.toLowerCase().includes('begin')
        )
        if (promptLine) {
          initialPrompt = promptLine.replace(/^[^a-zA-Z]*/, '').trim()
        }
      }
    }

    return {
      id: assessment.id,
      name: assessment.name,
      description: assessment.description || '',
      focusAreas,
      initialPrompt,
      archetypeMapping,
      systemPrompt: assessment.system_prompt || undefined,
      questioningStrategy: assessment.questioning_strategy || undefined,
      questioningDepth: assessment.questioning_depth || undefined,
      expectedDuration: assessment.expected_duration || 15,
      isMainAssessment: assessment.category === 'main'
    }
  }

  // Convert assessment template to homepage theme format
  private convertTemplateToTheme(template: AssessmentTemplate): HomepageAssessmentTheme {
    // Extract archetype mapping from metadata
    const archetypeMapping: Record<string, string[]> = {}
    
    if (template.metadata && typeof template.metadata === 'object') {
      const metadata = template.metadata as Record<string, unknown>
      if (metadata.archetypeMapping && typeof metadata.archetypeMapping === 'object') {
        Object.assign(archetypeMapping, metadata.archetypeMapping)
      }
    }

    // Default mapping if none found
    if (Object.keys(archetypeMapping).length === 0) {
      Object.assign(archetypeMapping, {
        'The Lover': ['passion', 'intimacy', 'connection'],
        'The King': ['leadership', 'authority', 'responsibility'],
        'The Warrior': ['strength', 'courage', 'discipline'],
        'The Magician': ['wisdom', 'transformation', 'insight']
      })
    }

    // Extract focus areas from archetype focus or category
    const focusAreas = template.archetype_focus || ['psychology', 'behavior', 'patterns']

    return {
      id: template.id,
      name: template.name,
      description: template.description || '',
      focusAreas,
      initialPrompt: template.intro_text || "Let's begin your assessment. Tell me about yourself.",
      archetypeMapping,
      expectedDuration: template.estimated_duration_minutes || 15,
      isMainAssessment: template.category === 'main'
    }
  }

  // Create a main assessment from the Assessment Builder
  async createMainAssessment(assessmentConfig: Record<string, unknown>): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('enhanced_assessments')
        .insert({
          name: assessmentConfig.name,
          description: assessmentConfig.description,
          category: 'main', // Mark as main assessment
          purpose: assessmentConfig.purpose,
          expected_duration: assessmentConfig.expectedDuration,
          system_prompt: assessmentConfig.systemPrompt,
          questioning_strategy: assessmentConfig.questioningStrategy,
          questioning_depth: assessmentConfig.questioningDepth,
          question_examples: assessmentConfig.questionExamples,
          response_requirements: assessmentConfig.responseRequirements,
          adaptive_logic: {
            ...assessmentConfig.adaptiveLogic,
            archetypeMapping: this.extractArchetypeMapping(assessmentConfig)
          },
          report_generation: assessmentConfig.reportGeneration,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error creating main assessment:', error)
      throw error
    }
  }

  // Extract archetype mapping from assessment config
  private extractArchetypeMapping(_config: Record<string, unknown>): Record<string, string[]> {
    // This would extract archetype mapping from the assessment builder config
    // For now, return a default mapping
    return {
      'The Lover': ['passion', 'intimacy', 'connection', 'romance', 'emotional depth'],
      'The King': ['leadership', 'protection', 'responsibility', 'decision-making', 'authority'],
      'The Warrior': ['boundaries', 'fighting for', 'defending', 'challenges', 'strength'],
      'The Magician': ['transformation', 'understanding', 'insight', 'healing', 'wisdom'],
      'The Hero': ['rescue', 'achievement', 'overcoming', 'proving', 'courage'],
      'The Caregiver': ['nurturing', 'supporting', 'helping', 'caring', 'sacrifice'],
      'The Explorer': ['freedom', 'adventure', 'independence', 'discovery', 'autonomy']
    }
  }
}

export const assessmentIntegrationService = new AssessmentIntegrationService()
