'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Star, 
  Send, 
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Brain,
  Target
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UserFeedbackFormProps {
  assessmentId?: string
  questionId?: string
  conversationId?: string
  context: 'assessment' | 'question' | 'ai_response' | 'general'
  onSubmit?: (feedback: FeedbackData) => void
  className?: string
}

interface FeedbackData {
  type: 'rating' | 'comment' | 'bug_report' | 'suggestion'
  rating?: number
  comment: string
  context: string
  assessment_id?: string
  question_id?: string
  conversation_id?: string
  user_id: string
}

export default function UserFeedbackForm({ 
  assessmentId, 
  questionId, 
  conversationId, 
  context, 
  onSubmit,
  className = '' 
}: UserFeedbackFormProps) {
  const [feedbackType, setFeedbackType] = useState<'rating' | 'comment' | 'bug_report' | 'suggestion'>('comment')
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const feedbackData: FeedbackData = {
        type: feedbackType,
        rating: feedbackType === 'rating' ? rating : undefined,
        comment,
        context,
        assessment_id: assessmentId,
        question_id: questionId,
        conversation_id: conversationId,
        user_id: user.id
      }

      // Submit to database (you'll need to create this table)
      const { error } = await supabase
        .from('user_feedback')
        .insert([{
          feedback_type: feedbackData.type,
          rating: feedbackData.rating,
          comment: feedbackData.comment,
          context: feedbackData.context,
          assessment_id: feedbackData.assessment_id,
          question_id: feedbackData.question_id,
          conversation_id: feedbackData.conversation_id,
          user_id: feedbackData.user_id
        }])

      if (error) throw error

      // Call parent callback if provided
      if (onSubmit) {
        onSubmit(feedbackData)
      }

      setIsSubmitted(true)
      
      // Reset form after delay
      setTimeout(() => {
        setIsSubmitted(false)
        setComment('')
        setRating(0)
        setIsExpanded(false)
      }, 3000)

    } catch (error) {
      console.error('Error submitting feedback:', error)
      // You might want to show an error message to the user
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFeedbackIcon = () => {
    switch (feedbackType) {
      case 'rating': return <Star className="h-4 w-4" />
      case 'bug_report': return <AlertCircle className="h-4 w-4" />
      case 'suggestion': return <Target className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getContextLabel = () => {
    switch (context) {
      case 'assessment': return 'Assessment Experience'
      case 'question': return 'Question Quality'
      case 'ai_response': return 'AI Response'
      default: return 'General Feedback'
    }
  }

  if (isSubmitted) {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Thank you for your feedback!</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            Your input helps us improve the assessment experience.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!isExpanded) {
    return (
      <Card className={`border-gray-200 hover:border-blue-300 transition-colors cursor-pointer ${className}`}>
        <CardContent className="p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="w-full justify-start text-gray-600 hover:text-blue-600"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Share feedback about {getContextLabel().toLowerCase()}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-blue-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {getFeedbackIcon()}
          Feedback: {getContextLabel()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Feedback Type Selection */}
          <div>
            <Label className="text-sm font-medium">Feedback Type</Label>
            <RadioGroup 
              value={feedbackType} 
              onValueChange={(value) => setFeedbackType(value as any)}
              className="flex flex-wrap gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="comment" id="comment" />
                <Label htmlFor="comment" className="text-sm">General Comment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rating" id="rating" />
                <Label htmlFor="rating" className="text-sm">Rating</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="suggestion" id="suggestion" />
                <Label htmlFor="suggestion" className="text-sm">Suggestion</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bug_report" id="bug_report" />
                <Label htmlFor="bug_report" className="text-sm">Bug Report</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Rating Selection (if rating type) */}
          {feedbackType === 'rating' && (
            <div>
              <Label className="text-sm font-medium">Rating (1-5 stars)</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 rounded ${
                      star <= rating 
                        ? 'text-yellow-500' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="text-sm font-medium">
              {feedbackType === 'rating' ? 'Additional Comments (Optional)' : 'Your Feedback'}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                feedbackType === 'bug_report' 
                  ? "Please describe the issue you encountered..."
                  : feedbackType === 'suggestion'
                  ? "What would you like to see improved or added?"
                  : "Share your thoughts about this experience..."
              }
              className="mt-1"
              rows={3}
              required={feedbackType !== 'rating'}
            />
          </div>

          {/* Context Info */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              Context: {getContextLabel()}
            </Badge>
            {assessmentId && (
              <Badge variant="outline" className="text-xs">
                Assessment ID: {assessmentId.slice(-8)}
              </Badge>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || (feedbackType === 'rating' && rating === 0) || (feedbackType !== 'rating' && !comment.trim())}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
