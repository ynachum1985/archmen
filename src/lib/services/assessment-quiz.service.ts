import { createClient } from '@/lib/supabase/client'

export interface QuizAccessResult {
  access_granted: boolean
  reason: string
  message: string
  quiz_required?: boolean
  quiz_score?: number
  attempt_number?: number
  max_attempts?: number
  next_attempt_at?: string
  passing_score?: number
  previous_score?: number
}

export interface QuizAttempt {
  id: string
  user_id: string
  assessment_id: string
  attempt_number: number
  quiz_type: string
  readiness_score?: number
  emotional_maturity_score?: number
  specific_feedback?: string
  quiz_passed: boolean
  access_granted: boolean
  completed_at?: string
}

export interface QuizResponse {
  quiz_attempt_id?: string
  ai_response: string
  quiz_continues?: boolean
  quiz_completed?: boolean
  quiz_passed?: boolean
  score?: number
  passing_score?: number
  ai_assessment?: string
  access_granted?: boolean
  message?: string
  assessment_name?: string
  assessment_level?: number
  question_number?: number
}

export class AssessmentQuizService {
  private supabase = createClient()

  // Check if user can access assessment or needs to take quiz
  async checkAssessmentAccess(userId: string, assessmentId: string): Promise<QuizAccessResult> {
    try {
      const response = await fetch('/api/assessment-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check_access',
          user_id: userId,
          assessment_id: assessmentId
        })
      })

      if (!response.ok) throw new Error('Failed to check access')
      
      const data = await response.json()
      return data.access_result
    } catch (error) {
      console.error('Error checking assessment access:', error)
      return {
        access_granted: false,
        reason: 'error',
        message: 'Unable to check access. Please try again.'
      }
    }
  }

  // Start a new quiz attempt
  async startQuiz(userId: string, assessmentId: string, conversationId?: string): Promise<QuizResponse> {
    try {
      const response = await fetch('/api/assessment-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_quiz',
          user_id: userId,
          assessment_id: assessmentId,
          conversation_id: conversationId
        })
      })

      if (!response.ok) throw new Error('Failed to start quiz')
      
      return await response.json()
    } catch (error) {
      console.error('Error starting quiz:', error)
      throw error
    }
  }

  // Process user response in quiz
  async processQuizResponse(quizAttemptId: string, userMessage: string): Promise<QuizResponse> {
    try {
      const response = await fetch('/api/assessment-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'process_response',
          quiz_attempt_id: quizAttemptId,
          user_message: userMessage
        })
      })

      if (!response.ok) throw new Error('Failed to process response')
      
      return await response.json()
    } catch (error) {
      console.error('Error processing quiz response:', error)
      throw error
    }
  }

  // Get user's quiz history for an assessment
  async getQuizHistory(userId: string, assessmentId: string): Promise<QuizAttempt[]> {
    try {
      const { data, error } = await this.supabase
        .from('assessment_quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .eq('assessment_id', assessmentId)
        .order('attempt_number', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting quiz history:', error)
      return []
    }
  }

  // Get detailed quiz attempt with questions and responses
  async getQuizAttemptDetails(quizAttemptId: string): Promise<{
    attempt: QuizAttempt
    questions: any[]
  } | null> {
    try {
      const { data: attempt, error: attemptError } = await this.supabase
        .from('assessment_quiz_attempts')
        .select('*')
        .eq('id', quizAttemptId)
        .single()

      if (attemptError) throw attemptError

      const { data: questions, error: questionsError } = await this.supabase
        .from('quiz_question_responses')
        .select('*')
        .eq('quiz_attempt_id', quizAttemptId)
        .order('question_number')

      if (questionsError) throw questionsError

      return {
        attempt,
        questions: questions || []
      }
    } catch (error) {
      console.error('Error getting quiz attempt details:', error)
      return null
    }
  }

  // Check if assessment requires quiz
  async assessmentRequiresQuiz(assessmentId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('enhanced_assessments')
        .select('quiz_enabled')
        .eq('id', assessmentId)
        .single()

      if (error) throw error
      return data?.quiz_enabled ?? true
    } catch (error) {
      console.error('Error checking if assessment requires quiz:', error)
      return true // Default to requiring quiz for safety
    }
  }

  // Get assessment quiz configuration
  async getAssessmentQuizConfig(assessmentId: string): Promise<{
    quiz_enabled: boolean
    quiz_passing_score: number
    quiz_max_attempts: number
    assessment_level: number
    name: string
  } | null> {
    try {
      const { data, error } = await this.supabase
        .from('enhanced_assessments')
        .select('quiz_enabled, quiz_passing_score, quiz_max_attempts, assessment_level, name')
        .eq('id', assessmentId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting assessment quiz config:', error)
      return null
    }
  }

  // Helper method to format quiz results for display
  formatQuizResult(result: QuizResponse): {
    title: string
    message: string
    type: 'success' | 'warning' | 'error'
    actionRequired?: string
  } {
    if (result.quiz_completed) {
      if (result.quiz_passed) {
        return {
          title: 'Quiz Passed! 🎉',
          message: `Congratulations! You scored ${result.score}/${result.passing_score} and can now access this assessment.`,
          type: 'success'
        }
      } else {
        return {
          title: 'Quiz Not Passed',
          message: `You scored ${result.score}/${result.passing_score}. Please continue your growth work and try again later.`,
          type: 'warning',
          actionRequired: 'Continue your personal development work and retry in 24 hours.'
        }
      }
    }

    return {
      title: 'Quiz in Progress',
      message: 'Continue answering questions to complete your readiness assessment.',
      type: 'success'
    }
  }

  // Helper method to determine if user can retry quiz
  canRetryQuiz(accessResult: QuizAccessResult): boolean {
    return accessResult.reason === 'quiz_retry_required' || 
           (accessResult.reason === 'quiz_required' && !accessResult.quiz_required)
  }

  // Helper method to get next retry time
  getNextRetryTime(accessResult: QuizAccessResult): Date | null {
    if (accessResult.next_attempt_at) {
      return new Date(accessResult.next_attempt_at)
    }
    return null
  }

  // Helper method to check if user has reached max attempts
  hasReachedMaxAttempts(accessResult: QuizAccessResult): boolean {
    return accessResult.reason === 'max_attempts_reached'
  }

  // Helper method to get user-friendly reason for quiz requirement
  getQuizRequirementReason(accessResult: QuizAccessResult, assessmentLevel: number): string {
    switch (accessResult.reason) {
      case 'quiz_required':
        return `This Level ${assessmentLevel} assessment requires a readiness quiz to ensure you're prepared for the content.`
      
      case 'quiz_retry_required':
        return `Your previous quiz score (${accessResult.previous_score}/${accessResult.passing_score}) didn't meet the requirements. Please try again.`
      
      case 'max_attempts_reached':
        return `You've reached the maximum number of quiz attempts (${accessResult.max_attempts}). Please contact support for assistance.`
      
      case 'cooldown_period':
        const nextAttempt = this.getNextRetryTime(accessResult)
        return `Please wait until ${nextAttempt?.toLocaleString()} before attempting the quiz again.`
      
      default:
        return accessResult.message || 'A readiness quiz is required to access this assessment.'
    }
  }
}

export const assessmentQuizService = new AssessmentQuizService()
