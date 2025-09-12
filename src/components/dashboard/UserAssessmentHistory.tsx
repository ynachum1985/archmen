'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, Calendar, Clock, TrendingUp, Eye, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface AssessmentSession {
  id: string
  template_id: string
  status: string
  progress_percentage: number
  completed_at: string | null
  created_at: string
  current_question_index: number | null
  session_data: unknown
  updated_at: string | null
  user_id: string
  discovered_archetypes: unknown
  assessment_templates: {
    name: string | null
    description: string | null
    category: string | null
  } | null
}

interface UserAssessmentHistoryProps {
  userId: string
}

export function UserAssessmentHistory({ userId }: UserAssessmentHistoryProps) {
  const [assessments, setAssessments] = useState<AssessmentSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const supabase = createClient()
        
        const { data, error } = await supabase
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

        setAssessments(data || [])
      } catch (err) {
        console.error('Error fetching assessments:', err)
        setError('Failed to load assessment history')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessments()
  }, [userId])

  const completedAssessments = assessments.filter(a => a.status === 'completed')
  const inProgressAssessments = assessments.filter(a => a.status === 'in_progress')

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
            <Brain className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessments.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedAssessments.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archetypes Discovered</CardTitle>
            <TrendingUp className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedAssessments.reduce((total, assessment) => {
                const archetypes = (assessment.discovered_archetypes as Record<string, unknown>[]) || []
                return total + archetypes.length
              }, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all assessments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Assessment</CardTitle>
            <Calendar className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assessments.length > 0 ? (
                new Date(assessments[0].created_at).toLocaleDateString()
              ) : (
                'None'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {assessments.length > 0 ? assessments[0].assessment_templates?.name : 'Take your first assessment'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assessment History */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment History</CardTitle>
          <CardDescription>
            View and manage your archetypal assessment journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="completed" className="space-y-4">
            <TabsList>
              <TabsTrigger value="completed">
                Completed ({completedAssessments.length})
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress ({inProgressAssessments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="completed" className="space-y-4">
              {completedAssessments.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No completed assessments yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Take your first assessment to discover your archetypal patterns
                  </p>
                  <Button asChild>
                    <Link href="/assessments">Start Assessment</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedAssessments.map((assessment) => (
                    <AssessmentCard key={assessment.id} assessment={assessment} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="in-progress" className="space-y-4">
              {inProgressAssessments.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No assessments in progress
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    All your assessments are either completed or not yet started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inProgressAssessments.map((assessment) => (
                    <AssessmentCard key={assessment.id} assessment={assessment} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface AssessmentCardProps {
  assessment: AssessmentSession
}

function AssessmentCard({ assessment }: AssessmentCardProps) {
  const isCompleted = assessment.status === 'completed'
  const archetypes = (assessment.discovered_archetypes as Record<string, unknown>[]) || []
  const primaryArchetype = archetypes.find(a => a.isPrimary) || archetypes[0]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">
                {assessment.assessment_templates?.name || 'Unknown Assessment'}
              </h3>
              <Badge variant={isCompleted ? 'default' : 'secondary'}>
                {isCompleted ? 'Completed' : `${assessment.progress_percentage}% Complete`}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {assessment.assessment_templates?.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Started {new Date(assessment.created_at).toLocaleDateString()}
              </div>
              {isCompleted && assessment.completed_at && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Completed {new Date(assessment.completed_at).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Primary Archetype Preview */}
            {isCompleted && primaryArchetype && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">Primary Archetype:</span>
                  <Badge variant="outline">{primaryArchetype.name}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {primaryArchetype.description?.substring(0, 100)}...
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 ml-4">
            {isCompleted ? (
              <>
                <Button size="sm" asChild>
                  <Link href={`/dashboard/assessments/${assessment.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </>
            ) : (
              <Button size="sm" asChild>
                <Link href={`/assessments/${assessment.template_id}?session=${assessment.id}`}>
                  Continue
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
