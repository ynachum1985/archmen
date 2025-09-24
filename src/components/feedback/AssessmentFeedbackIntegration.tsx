'use client'

import React, { useState } from 'react'
import UserFeedbackForm from './UserFeedbackForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  ChevronDown, 
  ChevronUp,
  Star,
  AlertTriangle,
  Lightbulb,
  MessageCircle
} from 'lucide-react'

interface AssessmentFeedbackIntegrationProps {
  assessmentId: string
  questionId?: string
  conversationId?: string
  context: 'assessment' | 'question' | 'ai_response' | 'general'
  position?: 'inline' | 'floating' | 'sidebar'
  showQuickActions?: boolean
  className?: string
}

export default function AssessmentFeedbackIntegration({
  assessmentId,
  questionId,
  conversationId,
  context,
  position = 'inline',
  showQuickActions = true,
  className = ''
}: AssessmentFeedbackIntegrationProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [quickFeedbackSubmitted, setQuickFeedbackSubmitted] = useState<string | null>(null)

  const handleQuickFeedback = async (type: 'helpful' | 'confusing' | 'suggestion' | 'bug') => {
    // This would submit quick feedback without opening the full form
    setQuickFeedbackSubmitted(type)
    
    // Reset after 2 seconds
    setTimeout(() => {
      setQuickFeedbackSubmitted(null)
    }, 2000)
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'floating':
        return 'fixed bottom-4 right-4 z-50 max-w-sm'
      case 'sidebar':
        return 'sticky top-4'
      default:
        return ''
    }
  }

  const getContextDescription = () => {
    switch (context) {
      case 'assessment':
        return 'How is your overall assessment experience?'
      case 'question':
        return 'How was this question?'
      case 'ai_response':
        return 'How helpful was this AI response?'
      default:
        return 'Share your feedback'
    }
  }

  if (position === 'floating') {
    return (
      <div className={`${getPositionClasses()} ${className}`}>
        {!showFeedbackForm ? (
          <Card className="border-blue-200 shadow-lg">
            <CardContent className="p-3">
              <Button
                onClick={() => setShowFeedbackForm(true)}
                variant="outline"
                size="sm"
                className="w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            <UserFeedbackForm
              assessmentId={assessmentId}
              questionId={questionId}
              conversationId={conversationId}
              context={context}
              onSubmit={() => setShowFeedbackForm(false)}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`${getPositionClasses()} ${className}`}>
      {/* Quick Actions */}
      {showQuickActions && !showFeedbackForm && (
        <Card className="border-gray-200 mb-3">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{getContextDescription()}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                className="text-gray-500 hover:text-blue-600"
              >
                {showFeedbackForm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickFeedback('helpful')}
                disabled={quickFeedbackSubmitted === 'helpful'}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                {quickFeedbackSubmitted === 'helpful' ? (
                  <>✓ Thanks!</>
                ) : (
                  <>
                    <Star className="h-3 w-3 mr-1" />
                    Helpful
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickFeedback('confusing')}
                disabled={quickFeedbackSubmitted === 'confusing'}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                {quickFeedbackSubmitted === 'confusing' ? (
                  <>✓ Noted!</>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Confusing
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFeedbackForm(true)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Feedback Form */}
      {showFeedbackForm && (
        <UserFeedbackForm
          assessmentId={assessmentId}
          questionId={questionId}
          conversationId={conversationId}
          context={context}
          onSubmit={() => setShowFeedbackForm(false)}
        />
      )}
    </div>
  )
}

// Quick feedback hook for easy integration
export function useQuickFeedback() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submitQuickFeedback = async (
    type: 'helpful' | 'confusing' | 'suggestion' | 'bug',
    context: string,
    assessmentId?: string,
    questionId?: string
  ) => {
    setIsSubmitting(true)
    try {
      // Submit quick feedback to your API
      const response = await fetch('/api/feedback/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          context,
          assessment_id: assessmentId,
          question_id: questionId
        })
      })

      if (!response.ok) throw new Error('Failed to submit feedback')
      
      return { success: true }
    } catch (error) {
      console.error('Error submitting quick feedback:', error)
      return { success: false, error }
    } finally {
      setIsSubmitting(false)
    }
  }

  return { submitQuickFeedback, isSubmitting }
}

// Feedback analytics component for admin dashboard
export function FeedbackAnalytics({ assessmentId }: { assessmentId?: string }) {
  const [feedbackStats, setFeedbackStats] = useState({
    total: 0,
    helpful: 0,
    confusing: 0,
    suggestions: 0,
    bugs: 0,
    avgRating: 0
  })

  // This would load feedback analytics from your API
  // useEffect(() => {
  //   loadFeedbackStats(assessmentId)
  // }, [assessmentId])

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-3">Feedback Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="text-lg font-bold text-green-600">{feedbackStats.helpful}</div>
            <div className="text-xs text-green-700">Helpful</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded">
            <div className="text-lg font-bold text-orange-600">{feedbackStats.confusing}</div>
            <div className="text-xs text-orange-700">Confusing</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="text-lg font-bold text-blue-600">{feedbackStats.suggestions}</div>
            <div className="text-xs text-blue-700">Suggestions</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="text-lg font-bold text-red-600">{feedbackStats.bugs}</div>
            <div className="text-xs text-red-700">Bug Reports</div>
          </div>
        </div>
        {feedbackStats.avgRating > 0 && (
          <div className="mt-3 text-center">
            <Badge variant="outline">
              Avg Rating: {feedbackStats.avgRating.toFixed(1)}/5 ⭐
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
