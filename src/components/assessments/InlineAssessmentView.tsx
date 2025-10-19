'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Brain, Clock, Users, Star, Lock } from 'lucide-react'

interface Assessment {
  id: string
  name: string
  description: string
  category: string
  expected_duration: number
  assessment_level: number
  status: string
  is_active: boolean
}

interface InlineAssessmentViewProps {
  userId: string
  onStartAssessment?: (assessment: Assessment) => void
}

export function InlineAssessmentView({ userId, onStartAssessment }: InlineAssessmentViewProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [mainAssessmentCompleted, setMainAssessmentCompleted] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    loadAssessments()
    checkMainAssessmentCompleted()
    checkAdminStatus()
  }, [userId])

  const loadAssessments = async () => {
    try {
      const supabase = createClient()
      let query = supabase
        .from('enhanced_assessments')
        .select('id, name, description, category, expected_duration, assessment_level, status, is_active')

      // Admin users see all assessments, regular users only see live ones
      if (!isAdmin) {
        query = query.eq('status', 'live').eq('is_active', true)
      }

      query = query.order('assessment_level', { ascending: true })
        .order('name', { ascending: true })

      const { data, error } = await query

      if (error) throw error
      setAssessments(data || [])
    } catch (error) {
      console.error('Error loading assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkMainAssessmentCompleted = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('conversations')
        .select('metadata')
        .eq('user_id', userId)
        .not('metadata->>assessmentId', 'is', null)

      if (error) throw error

      const mainAssessmentId = '550e8400-e29b-41d4-a716-446655440001'
      const hasCompletedMain = data?.some(conv =>
        conv.metadata?.assessmentId === mainAssessmentId &&
        conv.metadata?.status === 'completed'
      )

      setMainAssessmentCompleted(hasCompletedMain || false)
    } catch (error) {
      console.error('Error checking main assessment:', error)
    }
  }

  const checkAdminStatus = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (!error && data) {
          setIsAdmin(data.is_admin || false)
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
    }
  }

  const createNewConversation = async (assessment: Assessment) => {
    try {
      const supabase = createClient()

      const welcomeMessage = `Hello! I'm here to guide you through the "${assessment.name}" assessment. This will take approximately ${assessment.expected_duration} minutes. ${assessment.description} Let's begin - what brings you to explore this topic today?`

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          messages: [{
            role: 'assistant',
            content: welcomeMessage,
            timestamp: new Date().toISOString()
          }],
          metadata: {
            assessmentId: assessment.id,
            assessmentName: assessment.name,
            description: assessment.description,
            category: assessment.category,
            assessmentLevel: assessment.assessment_level,
            status: 'active',
            title: assessment.name
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Redirect to the assessment
      window.location.href = `/dashboard/assessments/${assessment.id}`
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const getAssessmentsByLevel = (level: number) => {
    return assessments.filter(assessment => assessment.assessment_level === level)
  }

  const getLevelTitle = (level: number) => {
    switch (level) {
      case 1: return 'Foundation Level'
      case 2: return 'Intermediate Level'
      case 3: return 'Advanced Level'
      default: return `Level ${level}`
    }
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'text-blue-600'
      case 2: return 'text-purple-600'
      case 3: return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading assessments...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-gray-900 mb-2">Assessments</h1>
        <p className="text-gray-600">Discover your archetypal patterns through guided conversations</p>
      </div>

      {/* Assessment Levels */}
      <div className="space-y-6">
        <>
          {[1, 2, 3].map(level => {
            const levelAssessments = getAssessmentsByLevel(level)
            if (levelAssessments.length === 0) return null

            return (
              <div key={level} className="space-y-3">
                <h2 className={`text-lg font-medium ${getLevelColor(level)}`}>
                  {getLevelTitle(level)}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {levelAssessments.map((assessment) => {
                    const isMainAssessment = assessment.id === '550e8400-e29b-41d4-a716-446655440001'
                    const isAccessible = isAdmin || isMainAssessment || mainAssessmentCompleted

                    return (
                      <Card
                        key={assessment.id}
                        className={`transition-all duration-200 ${
                          isAccessible
                            ? 'hover:shadow-md cursor-pointer border-gray-200'
                            : 'opacity-60 cursor-not-allowed border-gray-100'
                        }`}
                        onClick={() => isAccessible ? createNewConversation(assessment) : null}
                      >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Brain className={`h-5 w-5 ${getLevelColor(level)}`} />
                            <CardTitle className="text-base">
                              {assessment.name}
                              {isMainAssessment && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  Start Here
                                </Badge>
                              )}
                            </CardTitle>
                          </div>
                          {!isAccessible && <Lock className="h-4 w-4 text-gray-400" />}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {assessment.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {assessment.expected_duration} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {assessment.category}
                          </div>
                        </div>
                        {!isAccessible && (
                          <div className="mt-2 text-xs text-amber-600">
                            Complete the main assessment to unlock
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
          })}
        </>
      </div>

      {assessments.length === 0 && (
        <div className="text-center py-12">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments available</h3>
          <p className="text-gray-500">Check back later for new assessments.</p>
        </div>
      )}
    </div>
  )
}
