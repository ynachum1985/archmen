import { createClient } from '@/lib/supabase/client'

export interface UserProgression {
  id: string
  user_id: string
  current_level: number
  emotional_maturity_score: number
  shadow_work_hours: number
  therapy_hours: number
  integration_scores: Record<string, number>
  completed_assessments: string[]
  blocked_until?: string
  progression_notes?: string
  last_integration_check?: string
}

export interface AssessmentGate {
  id: string
  user_id: string
  assessment_id: string
  gate_type: 'content_integration' | 'emotional_readiness' | 'prerequisite_completion' | 'time_based' | 'ai_verification'
  gate_criteria: Record<string, any>
  current_progress: Record<string, any>
  is_passed: boolean
  blocked_reason?: string
  estimated_unlock_date?: string
  ai_assessment_required: boolean
  ai_verification_prompt?: string
}

export interface ContentIntegration {
  id: string
  user_id: string
  archetype_id?: string
  media_id?: string
  integration_type: 'video_watched' | 'exercise_completed' | 'reflection_submitted' | 'homework_done' | 'shadow_work'
  completion_percentage: number
  integration_score?: number
  reflection_text?: string
  ai_verification_passed: boolean
  verification_attempts: number
  integration_data: Record<string, any>
  completed_at?: string
  verified_at?: string
}

export interface AssessmentAccess {
  access_granted: boolean
  reason?: string
  required_level?: number
  current_level?: number
  blocking_gates?: number
  message?: string
  level?: number
  level_name?: string
}

export class ProgressionService {
  private supabase = createClient()

  // Check if user can access a specific assessment
  async checkAssessmentAccess(userId: string, assessmentId: string): Promise<AssessmentAccess> {
    try {
      const { data, error } = await this.supabase
        .rpc('check_assessment_access', {
          p_user_id: userId,
          p_assessment_id: assessmentId
        })

      if (error) throw error
      return data as AssessmentAccess
    } catch (error) {
      console.error('Error checking assessment access:', error)
      return {
        access_granted: false,
        reason: 'error',
        message: 'Unable to verify access. Please try again.'
      }
    }
  }

  // Get user's current progression
  async getUserProgression(userId: string): Promise<UserProgression | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_progression')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error getting user progression:', error)
      return null
    }
  }

  // Initialize user progression
  async initializeUserProgression(userId: string): Promise<UserProgression> {
    try {
      const { data, error } = await this.supabase
        .from('user_progression')
        .insert({
          user_id: userId,
          current_level: 1,
          emotional_maturity_score: 1,
          shadow_work_hours: 0,
          therapy_hours: 0,
          integration_scores: {},
          completed_assessments: []
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error initializing user progression:', error)
      throw error
    }
  }

  // Update user progression after assessment completion
  async updateProgressionAfterAssessment(
    userId: string, 
    assessmentId: string, 
    emotionalMaturityScore?: number
  ): Promise<void> {
    try {
      await this.supabase.rpc('update_user_progression', {
        p_user_id: userId,
        p_assessment_completed: assessmentId,
        p_emotional_maturity_score: emotionalMaturityScore
      })
    } catch (error) {
      console.error('Error updating progression:', error)
      throw error
    }
  }

  // Get blocking gates for user
  async getBlockingGates(userId: string, assessmentId?: string): Promise<AssessmentGate[]> {
    try {
      let query = this.supabase
        .from('assessment_gates')
        .select('*')
        .eq('user_id', userId)
        .eq('is_passed', false)

      if (assessmentId) {
        query = query.eq('assessment_id', assessmentId)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting blocking gates:', error)
      return []
    }
  }

  // Create assessment gate
  async createAssessmentGate(
    userId: string,
    assessmentId: string,
    gateType: AssessmentGate['gate_type'],
    criteria: Record<string, any>,
    aiVerificationPrompt?: string
  ): Promise<AssessmentGate> {
    try {
      const { data, error } = await this.supabase
        .from('assessment_gates')
        .insert({
          user_id: userId,
          assessment_id: assessmentId,
          gate_type: gateType,
          gate_criteria: criteria,
          current_progress: {},
          ai_assessment_required: !!aiVerificationPrompt,
          ai_verification_prompt: aiVerificationPrompt
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating assessment gate:', error)
      throw error
    }
  }

  // Record content integration
  async recordContentIntegration(
    userId: string,
    integrationType: ContentIntegration['integration_type'],
    data: {
      archetypeId?: string
      mediaId?: string
      completionPercentage: number
      reflectionText?: string
      integrationData?: Record<string, any>
    }
  ): Promise<ContentIntegration> {
    try {
      const { data: integration, error } = await this.supabase
        .from('content_integrations')
        .insert({
          user_id: userId,
          archetype_id: data.archetypeId,
          media_id: data.mediaId,
          integration_type: integrationType,
          completion_percentage: data.completionPercentage,
          reflection_text: data.reflectionText,
          integration_data: data.integrationData || {},
          completed_at: data.completionPercentage === 100 ? new Date().toISOString() : null
        })
        .select()
        .single()

      if (error) throw error
      return integration
    } catch (error) {
      console.error('Error recording content integration:', error)
      throw error
    }
  }

  // Verify content integration with AI
  async verifyContentIntegration(
    integrationId: string,
    aiResponse: string
  ): Promise<{ passed: boolean; score: number; feedback: string }> {
    try {
      // Call AI verification API
      const response = await fetch('/api/verify-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integration_id: integrationId,
          ai_response: aiResponse
        })
      })

      if (!response.ok) throw new Error('AI verification failed')
      
      const result = await response.json()

      // Update integration record
      await this.supabase
        .from('content_integrations')
        .update({
          ai_verification_passed: result.passed,
          integration_score: result.score,
          verification_attempts: 1, // Simplified for now
          verified_at: result.passed ? new Date().toISOString() : null
        })
        .eq('id', integrationId)

      return result
    } catch (error) {
      console.error('Error verifying content integration:', error)
      throw error
    }
  }

  // Get content for AI to deliver based on user's archetype confidence
  async getRelevantContent(
    userId: string,
    archetypeConfidence: Record<string, number>,
    conversationContext: string
  ): Promise<{
    media: any[]
    exercises: any[]
    homework: any[]
    shouldBlock: boolean
    blockReason?: string
  }> {
    try {
      // Get user progression
      const progression = await this.getUserProgression(userId)
      if (!progression) {
        throw new Error('User progression not found')
      }

      // Get top archetypes
      const topArchetypes = Object.entries(archetypeConfidence)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([archetype]) => archetype)

      // Get relevant media for top archetypes
      const { data: media, error: mediaError } = await this.supabase
        .from('archetype_media')
        .select(`
          *,
          enhanced_archetypes!inner(name)
        `)
        .in('enhanced_archetypes.name', topArchetypes)
        .limit(5)

      if (mediaError) throw mediaError

      // Check if user needs to complete integration work before proceeding
      const blockingGates = await this.getBlockingGates(userId)
      const shouldBlock = blockingGates.length > 0

      // Log content delivery
      if (media && media.length > 0) {
        await this.logContentDelivery(userId, media[0], archetypeConfidence, conversationContext)
      }

      return {
        media: media || [],
        exercises: [], // TODO: Implement exercises
        homework: [], // TODO: Implement homework
        shouldBlock,
        blockReason: shouldBlock ? 'Complete integration work before proceeding' : undefined
      }
    } catch (error) {
      console.error('Error getting relevant content:', error)
      return {
        media: [],
        exercises: [],
        homework: [],
        shouldBlock: false
      }
    }
  }

  // Log content delivery for tracking
  private async logContentDelivery(
    userId: string,
    media: any,
    archetypeConfidence: Record<string, number>,
    context: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('content_delivery_log')
        .insert({
          user_id: userId,
          archetype_id: media.archetype_id,
          media_id: media.id,
          content_type: media.media_type,
          delivery_context: context,
          user_archetype_confidence: archetypeConfidence
        })
    } catch (error) {
      console.error('Error logging content delivery:', error)
    }
  }

  // Get assessment levels
  async getAssessmentLevels(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('assessment_levels')
        .select('*')
        .eq('is_active', true)
        .order('level_number')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting assessment levels:', error)
      return []
    }
  }

  // Check if user can advance to next level
  async checkLevelAdvancement(userId: string): Promise<{
    canAdvance: boolean
    nextLevel?: number
    requirements?: string[]
    missingRequirements?: string[]
  }> {
    try {
      const progression = await this.getUserProgression(userId)
      if (!progression) {
        return { canAdvance: false }
      }

      const levels = await this.getAssessmentLevels()
      const nextLevel = levels.find(l => l.level_number === progression.current_level + 1)
      
      if (!nextLevel) {
        return { canAdvance: false }
      }

      // Check requirements (simplified - would be more complex in practice)
      const requirements = nextLevel.integration_requirements
      const missingRequirements: string[] = []

      // Check each requirement
      for (const [key, value] of Object.entries(requirements)) {
        // Implementation would check specific requirements
        // For now, simplified check
        if (key === 'main_assessment_completed' && !progression.completed_assessments.includes('main')) {
          missingRequirements.push('Complete main assessment')
        }
      }

      return {
        canAdvance: missingRequirements.length === 0,
        nextLevel: nextLevel.level_number,
        requirements: Object.keys(requirements),
        missingRequirements
      }
    } catch (error) {
      console.error('Error checking level advancement:', error)
      return { canAdvance: false }
    }
  }
}
