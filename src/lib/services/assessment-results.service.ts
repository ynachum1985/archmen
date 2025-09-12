import { createClient } from '@/lib/supabase/client'

export interface AssessmentResult {
  id: string
  name: string
  description: string
  confidenceScore: number
  isPrimary: boolean
  assessmentContext: string
  evidence?: string[]
  visualContent?: {
    primaryImage?: string
    backgroundColor?: string
    accentColor?: string
  }
  insights?: {
    currentInfluence?: string
    growthOpportunity?: string
    integrationTip?: string
    whyThisArchetype?: string
  }
  resources?: {
    theoreticalUnderstanding?: string
    embodimentPractices?: string[]
    integrationPractices?: string[]
    articles?: string[]
    videos?: string[]
    exercises?: string[]
  }
  mediaContent?: {
    meditationAudio?: string
    integrationVideo?: string
    guidanceAudio?: string
  }
}

export interface AssessmentSession {
  id: string
  template_id: string
  user_id: string
  status: 'in_progress' | 'completed' | 'abandoned'
  progress_percentage: number
  current_question_index: number
  session_data: unknown
  discovered_archetypes: unknown
  completed_at?: string
  created_at: string
  updated_at: string
}

export class AssessmentResultsService {
  private supabase = createClient()

  async saveAssessmentResults(
    sessionId: string,
    userId: string,
    discoveredArchetypes: AssessmentResult[],
    sessionData?: Record<string, unknown>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('assessment_sessions')
        .update({
          status: 'completed',
          progress_percentage: 100,
          discovered_archetypes: discoveredArchetypes as unknown,
          session_data: sessionData as unknown,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error saving assessment results:', error)
      throw new Error('Failed to save assessment results')
    }
  }

  async getAssessmentResults(sessionId: string, userId: string): Promise<AssessmentSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('assessment_sessions')
        .select(`
          *,
          assessment_templates (
            name,
            description,
            category
          )
        `)
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        throw error
      }

      return data as AssessmentSession
    } catch (error) {
      console.error('Error fetching assessment results:', error)
      throw new Error('Failed to fetch assessment results')
    }
  }

  async getUserAssessmentHistory(userId: string): Promise<AssessmentSession[]> {
    try {
      const { data, error } = await this.supabase
        .from('assessment_sessions')
        .select(`
          *,
          assessment_templates (
            name,
            description,
            category
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data as AssessmentSession[]
    } catch (error) {
      console.error('Error fetching user assessment history:', error)
      throw new Error('Failed to fetch assessment history')
    }
  }

  async updateAssessmentProgress(
    sessionId: string,
    userId: string,
    progressPercentage: number,
    currentQuestionIndex: number,
    sessionData?: Record<string, unknown>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('assessment_sessions')
        .update({
          progress_percentage: progressPercentage,
          current_question_index: currentQuestionIndex,
          session_data: sessionData as unknown,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating assessment progress:', error)
      throw new Error('Failed to update assessment progress')
    }
  }

  async createAssessmentSession(
    templateId: string,
    userId: string
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('assessment_sessions')
        .insert({
          template_id: templateId,
          user_id: userId,
          status: 'in_progress',
          progress_percentage: 0,
          current_question_index: 0,
          session_data: {} as unknown,
          discovered_archetypes: [] as unknown,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) throw error

      return data.id
    } catch (error) {
      console.error('Error creating assessment session:', error)
      throw new Error('Failed to create assessment session')
    }
  }

  async deleteAssessmentSession(sessionId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('assessment_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting assessment session:', error)
      throw new Error('Failed to delete assessment session')
    }
  }

  async getCompletedAssessmentsByArchetype(userId: string, archetypeId: string): Promise<AssessmentSession[]> {
    try {
      const { data, error } = await this.supabase
        .from('assessment_sessions')
        .select(`
          *,
          assessment_templates (
            name,
            description,
            category
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })

      if (error) throw error

      // Filter by archetype on the client side since we can't easily query JSON arrays in Supabase
      const filteredData = data.filter(session => {
        const archetypes = session.discovered_archetypes as AssessmentResult[]
        return archetypes?.some(archetype => 
          archetype.id === archetypeId || 
          archetype.name?.toLowerCase().includes(archetypeId.toLowerCase())
        )
      })

      return filteredData as AssessmentSession[]
    } catch (error) {
      console.error('Error fetching assessments by archetype:', error)
      throw new Error('Failed to fetch assessments by archetype')
    }
  }

  async exportAssessmentResults(sessionId: string, userId: string): Promise<Blob> {
    try {
      const session = await this.getAssessmentResults(sessionId, userId)
      if (!session) {
        throw new Error('Assessment not found')
      }

      const exportData = {
        assessment: session,
        exportedAt: new Date().toISOString(),
        format: 'JSON'
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })

      return blob
    } catch (error) {
      console.error('Error exporting assessment results:', error)
      throw new Error('Failed to export assessment results')
    }
  }
}
