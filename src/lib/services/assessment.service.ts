import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type AssessmentTemplate = Database['public']['Tables']['assessment_templates']['Row']
type AssessmentQuestion = Database['public']['Tables']['assessment_questions']['Row']
type AssessmentTemplateInsert = Database['public']['Tables']['assessment_templates']['Insert']
type AssessmentQuestionInsert = Database['public']['Tables']['assessment_questions']['Insert']
type AssessmentTemplateUpdate = Database['public']['Tables']['assessment_templates']['Update']
type AssessmentQuestionUpdate = Database['public']['Tables']['assessment_questions']['Update']

export class AssessmentService {
  private supabase = createClient()

  // Assessment Templates
  async getAllTemplates(): Promise<AssessmentTemplate[]> {
    const { data, error } = await this.supabase
      .from('assessment_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching assessment templates:', error)
      throw error
    }

    return data || []
  }

  async getActiveTemplates(): Promise<AssessmentTemplate[]> {
    const { data, error } = await this.supabase
      .from('assessment_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching active assessment templates:', error)
      throw error
    }

    return data || []
  }

  async getTemplateById(id: string): Promise<AssessmentTemplate | null> {
    const { data, error } = await this.supabase
      .from('assessment_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching assessment template:', error)
      throw error
    }

    return data
  }

  async createTemplate(template: AssessmentTemplateInsert): Promise<AssessmentTemplate> {
    const { data, error } = await this.supabase
      .from('assessment_templates')
      .insert(template)
      .select()
      .single()

    if (error) {
      console.error('Error creating assessment template:', error)
      throw error
    }

    return data
  }

  async updateTemplate(id: string, updates: AssessmentTemplateUpdate): Promise<AssessmentTemplate> {
    const { data, error } = await this.supabase
      .from('assessment_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating assessment template:', error)
      throw error
    }

    return data
  }

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('assessment_templates')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting assessment template:', error)
      throw error
    }
  }

  // Assessment Questions
  async getQuestionsByTemplateId(templateId: string): Promise<AssessmentQuestion[]> {
    const { data, error } = await this.supabase
      .from('assessment_questions')
      .select('*')
      .eq('template_id', templateId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching assessment questions:', error)
      throw error
    }

    return data || []
  }

  async createQuestion(question: AssessmentQuestionInsert): Promise<AssessmentQuestion> {
    const { data, error } = await this.supabase
      .from('assessment_questions')
      .insert(question)
      .select()
      .single()

    if (error) {
      console.error('Error creating assessment question:', error)
      throw error
    }

    return data
  }

  async updateQuestion(id: string, updates: AssessmentQuestionUpdate): Promise<AssessmentQuestion> {
    const { data, error } = await this.supabase
      .from('assessment_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating assessment question:', error)
      throw error
    }

    return data
  }

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('assessment_questions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting assessment question:', error)
      throw error
    }
  }

  async reorderQuestions(questions: { id: string; order_index: number }[]): Promise<void> {
    // Update each question individually
    const updatePromises = questions.map(({ id, order_index }) => 
      this.supabase
        .from('assessment_questions')
        .update({ order_index })
        .eq('id', id)
    )

    const results = await Promise.all(updatePromises)
    
    // Check for any errors
    const errors = results.filter(result => result.error)
    if (errors.length > 0) {
      console.error('Error reordering assessment questions:', errors)
      throw errors[0].error
    }
  }

  // Utility methods
  async getTemplateWithQuestions(templateId: string) {
    const template = await this.getTemplateById(templateId)
    if (!template) return null

    const questions = await this.getQuestionsByTemplateId(templateId)
    
    return {
      ...template,
      questions
    }
  }

  async duplicateTemplate(templateId: string, newName: string): Promise<AssessmentTemplate> {
    const template = await this.getTemplateById(templateId)
    if (!template) throw new Error('Template not found')

    const questions = await this.getQuestionsByTemplateId(templateId)

    // Create new template
    const newTemplate = await this.createTemplate({
      name: newName,
      description: template.description,
      category: template.category,
      is_free: template.is_free,
      is_active: false, // Start as inactive
      estimated_duration_minutes: template.estimated_duration_minutes,
      intro_text: template.intro_text,
      completion_text: template.completion_text,
      archetype_focus: template.archetype_focus,
      metadata: template.metadata,
    })

    // Duplicate questions
    for (const question of questions) {
      await this.createQuestion({
        template_id: newTemplate.id,
        question_text: question.question_text,
        question_type: question.question_type,
        options: question.options,
        order_index: question.order_index,
        is_required: question.is_required,
        scoring_weights: question.scoring_weights,
        archetype_indicators: question.archetype_indicators,
        metadata: question.metadata,
      })
    }

    return newTemplate
  }

  async getTemplateStats(templateId: string) {
    const questions = await this.getQuestionsByTemplateId(templateId)
    
    // Get response count
    const { count: responseCount } = await this.supabase
      .from('assessment_responses')
      .select('*', { count: 'exact', head: true })
      .eq('template_id', templateId)

    // Get session count
    const { count: sessionCount } = await this.supabase
      .from('assessment_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('template_id', templateId)

    // Get completion rate
    const { count: completedCount } = await this.supabase
      .from('assessment_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('template_id', templateId)
      .eq('status', 'completed')

    const completionRate = sessionCount ? (completedCount || 0) / sessionCount * 100 : 0

    return {
      questionCount: questions.length,
      responseCount: responseCount || 0,
      sessionCount: sessionCount || 0,
      completionRate: Math.round(completionRate),
    }
  }
}

export const assessmentService = new AssessmentService() 