import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

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
      // First try to get from assessment_templates table
      const { data: template, error: templateError } = await this.supabase
        .from('assessment_templates')
        .select('*')
        .eq('is_active', true)
        .eq('category', 'main') // Look for main assessment
        .single()

      if (template && !templateError) {
        console.log('Found main assessment from assessment_templates:', template.name)
        return this.convertTemplateToTheme(template)
      }

      // Try to get any assessment marked as main from assessment_templates
      const { data: anyMainTemplate, error: anyMainError } = await this.supabase
        .from('assessment_templates')
        .select('*')
        .eq('is_active', true)
        .ilike('name', '%main%') // Look for assessments with "main" in the name
        .limit(1)
        .single()

      if (anyMainTemplate && !anyMainError) {
        console.log('Found main-like assessment from assessment_templates:', anyMainTemplate.name)
        return this.convertTemplateToTheme(anyMainTemplate)
      }

      // Fallback to assessment_templates table
      const { data: fallbackTemplate, error: fallbackError } = await this.supabase
        .from('assessment_templates')
        .select('*')
        .eq('is_active', true)
        .eq('category', 'main')
        .single()

      if (fallbackTemplate && !fallbackError) {
        console.log('Found main assessment from assessment_templates:', fallbackTemplate.name)
        return this.convertTemplateToTheme(fallbackTemplate)
      }

      // If no main assessment found, return null (will use hardcoded themes)
      console.log('No main assessment found, will use hardcoded themes')
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

      // Get from assessment_templates (Assessment Builder created)
      try {
        const { data: templates, error: templateError } = await this.supabase
          .from('assessment_templates')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (templates && !templateError && templates.length > 0) {
          console.log(`Found ${templates.length} assessments from Assessment Builder`)
          const templateThemes = templates.map(template =>
            this.convertTemplateToTheme(template)
          )
          themes.push(...templateThemes)
        }
      } catch {
        console.log('Assessment templates table not available or empty')
      }

      // Get from assessment_templates as fallback
      try {
        const { data: templates, error: templateError } = await this.supabase
          .from('assessment_templates')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (templates && !templateError && templates.length > 0) {
          console.log(`Found ${templates.length} assessment templates`)
          const templateThemes = templates.map(template =>
            this.convertTemplateToTheme(template)
          )
          themes.push(...templateThemes)
        }
      } catch {
        console.log('Assessment templates table not available or empty')
      }

      // If we found assessments from either source, return them
      if (themes.length > 0) {
        console.log(`Returning ${themes.length} total assessments for homepage`)
        return themes
      }

      // If no assessments found, return empty array (will trigger fallback to hardcoded themes)
      console.log('No assessments found in database, homepage will use hardcoded themes')
      return []
    } catch (error) {
      console.error('Error fetching available assessments:', error)
      return []
    }
  }

  // Convert template to homepage theme format
  private convertTemplateToTheme(template: AssessmentTemplate): HomepageAssessmentTheme {
    // Extract archetype mapping from question examples or adaptive logic
    const archetypeMapping: Record<string, string[]> = {}
    
    // Try to extract from metadata or create default mapping
    if (template.metadata && typeof template.metadata === 'object') {
      const metadata = template.metadata as Record<string, unknown>
      if (metadata.archetypeMapping && typeof metadata.archetypeMapping === 'object') {
        Object.assign(archetypeMapping, metadata.archetypeMapping)
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

    // Extract focus areas from archetype_focus or use defaults
    const focusAreas: string[] = []
    if (template.archetype_focus && Array.isArray(template.archetype_focus)) {
      focusAreas.push(...template.archetype_focus)
    }

    // Default focus areas based on category
    if (focusAreas.length === 0) {
      if (template.category?.toLowerCase().includes('relationship')) {
        focusAreas.push('attachment', 'communication', 'conflict', 'intimacy', 'boundaries')
      } else {
        focusAreas.push('patterns', 'behavior', 'psychology', 'growth', 'awareness')
      }
    }

    // Create initial prompt from intro_text or generate one
    let initialPrompt = "Let's explore your archetypal patterns. Tell me about a recent experience that felt significant to you."

    if (template.intro_text) {
      // Use intro_text as initial prompt or extract from it
      initialPrompt = template.intro_text
    }

    return {
      id: template.id,
      name: template.name,
      description: template.description || '',
      focusAreas,
      initialPrompt,
      archetypeMapping,
      systemPrompt: undefined, // Not available in template
      questioningStrategy: undefined, // Not available in template
      questioningDepth: undefined, // Not available in template
      expectedDuration: template.estimated_duration_minutes || 15,
      isMainAssessment: template.category === 'main'
    }
  }

  // Create a main assessment from the Assessment Builder
  async createMainAssessment(assessmentConfig: Record<string, unknown>): Promise<string> {
    try {
      // Try to save to enhanced_assessments table first
      try {
        const { data: enhancedData, error: enhancedError } = await this.supabase
          .from('enhanced_assessments')
          .insert({
            name: assessmentConfig.name as string,
            description: assessmentConfig.description as string,
            category: assessmentConfig.category as string || 'main',
            purpose: assessmentConfig.purpose as string,
            expected_duration: assessmentConfig.expectedDuration as number,
            system_prompt: assessmentConfig.systemPrompt as string,
            min_questions: assessmentConfig.minQuestions as number,
            max_questions: assessmentConfig.maxQuestions as number,
            evidence_threshold: assessmentConfig.evidenceThreshold as number,
            adaptation_sensitivity: assessmentConfig.adaptationSensitivity as number,
            cycle_settings: assessmentConfig.cycleSettings as Record<string, unknown>,
            selected_personality_id: assessmentConfig.selectedPersonalityId as string || null,
            combined_prompt: assessmentConfig.combinedPrompt as string,
            question_examples: assessmentConfig.questionExamples as Record<string, unknown>,
            response_requirements: assessmentConfig.responseRequirements as Record<string, unknown>,
            report_generation: assessmentConfig.reportGeneration as string,
            is_active: true
          })
          .select()
          .single()

        if (enhancedData && !enhancedError) {
          console.log('Saved to enhanced_assessments table')
          return enhancedData.id
        }
      } catch (enhancedError) {
        console.log('Enhanced assessments table not available, falling back to assessment_templates')
      }

      // Fallback to assessment_templates table
      const { data, error } = await this.supabase
        .from('assessment_templates')
        .insert({
          name: assessmentConfig.name as string,
          description: assessmentConfig.description as string,
          category: 'main', // Mark as main assessment
          intro_text: assessmentConfig.systemPrompt as string,
          estimated_duration_minutes: assessmentConfig.expectedDuration as number,
          metadata: JSON.parse(JSON.stringify({
            purpose: assessmentConfig.purpose,
            questioningStrategy: assessmentConfig.questioningStrategy,
            questioningDepth: assessmentConfig.questioningDepth,
            questionExamples: assessmentConfig.questionExamples,
            responseRequirements: assessmentConfig.responseRequirements,
            adaptiveLogic: assessmentConfig.adaptiveLogic,
            reportGeneration: assessmentConfig.reportGeneration,
            archetypeMapping: this.extractArchetypeMapping(),
            // Enhanced fields
            minQuestions: assessmentConfig.minQuestions,
            maxQuestions: assessmentConfig.maxQuestions,
            evidenceThreshold: assessmentConfig.evidenceThreshold,
            adaptationSensitivity: assessmentConfig.adaptationSensitivity,
            cycleSettings: assessmentConfig.cycleSettings,
            selectedPersonalityId: assessmentConfig.selectedPersonalityId,
            combinedPrompt: assessmentConfig.combinedPrompt
          })),
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
  private extractArchetypeMapping(): Record<string, string[]> {
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

  // Check the status of Assessment Builder integration
  async checkIntegrationStatus(): Promise<{
    hasEnhancedAssessments: boolean
    hasTemplates: boolean
    hasMainAssessment: boolean
    totalAssessments: number
    recommendedAction: string
  }> {
    try {
      let hasTemplates = false
      let hasMainAssessment = false
      let totalAssessments = 0

      // Check assessment_templates table
      try {
        const { data: templates, error: templateError } = await this.supabase
          .from('assessment_templates')
          .select('id, name, category')
          .eq('is_active', true)

        if (templates && !templateError) {
          hasTemplates = templates.length > 0
          totalAssessments += templates.length
          if (!hasMainAssessment) {
            hasMainAssessment = templates.some(t => t.category === 'main')
          }
        }
      } catch {
        console.log('Assessment templates table not available')
      }

      // Determine recommended action
      let recommendedAction = ''
      if (!hasTemplates) {
        recommendedAction = 'Create your first assessment using the Assessment Builder in the admin panel'
      } else if (!hasMainAssessment) {
        recommendedAction = 'Create a main assessment for the homepage using the Assessment Builder'
      } else {
        recommendedAction = 'Integration is working! Your assessments are available on the homepage'
      }

      return {
        hasEnhancedAssessments: hasTemplates, // Use hasTemplates for backward compatibility
        hasTemplates,
        hasMainAssessment,
        totalAssessments,
        recommendedAction
      }
    } catch (error) {
      console.error('Error checking integration status:', error)
      return {
        hasEnhancedAssessments: false,
        hasTemplates: false,
        hasMainAssessment: false,
        totalAssessments: 0,
        recommendedAction: 'Error checking integration status. Please check database connection.'
      }
    }
  }
}

export const assessmentIntegrationService = new AssessmentIntegrationService()
