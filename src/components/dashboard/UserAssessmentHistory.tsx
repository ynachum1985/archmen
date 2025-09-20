'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Brain, Calendar, Clock, TrendingUp, Eye, Download, Play, CheckCircle, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface AssessmentEnrollment {
  id: string
  assessment_id: string
  status: 'available' | 'in_progress' | 'completed'
  enrolled_at: string
  started_at?: string
  completed_at?: string
  progress: any
  results: any
  enhanced_assessments: {
    id: string
    name: string
    description: string
    category: string
    expected_duration: number
  }
}

interface UserAssessmentHistoryProps {
  userId: string
}

export function UserAssessmentHistory({ userId }: UserAssessmentHistoryProps) {
  const [enrollments, setEnrollments] = useState<AssessmentEnrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const supabase = createClient()

        const { data, error } = await supabase
          .from('assessment_enrollments')
          .select(`
            *,
            enhanced_assessments (
              id,
              name,
              description,
              category,
              expected_duration
            )
          `)
          .eq('user_id', userId)
          .order('enrolled_at', { ascending: false })

        if (error) throw error

        setEnrollments(data || [])
      } catch (err) {
        console.error('Error fetching enrollments:', err)
        setError('Failed to load assessment history')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnrollments()
  }, [userId])

  const availableAssessments = enrollments.filter(e => e.status === 'available')
  const completedAssessments = enrollments.filter(e => e.status === 'completed')
  const inProgressAssessments = enrollments.filter(e => e.status === 'in_progress')

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
              {assessments.length > 0 && assessments[0].created_at ? (
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
          <CardTitle>Your Assessments</CardTitle>
          <CardDescription>
            Explore your archetypal patterns through specialized assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="available" className="space-y-4">
            <TabsList>
              <TabsTrigger value="available">
                Available ({availableAssessments.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedAssessments.length})
              </TabsTrigger>
              <TabsTrigger value="in-progress">
                In Progress ({inProgressAssessments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4">
              {availableAssessments.length === 0 ? (
                <div className="text-center py-8">
                  <Circle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No available assessments
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    All assessments have been completed or are in progress
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableAssessments.map((enrollment) => (
                    <AssessmentEnrollmentCard key={enrollment.id} enrollment={enrollment} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedAssessments.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No completed assessments yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Take your first assessment to discover your archetypal patterns
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedAssessments.map((enrollment) => (
                    <AssessmentEnrollmentCard key={enrollment.id} enrollment={enrollment} />
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
                  {inProgressAssessments.map((enrollment) => (
                    <AssessmentEnrollmentCard key={enrollment.id} enrollment={enrollment} />
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
                {isCompleted ? 'Completed' : `${assessment.progress_percentage || 0}% Complete`}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {assessment.assessment_templates?.description}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Started {assessment.created_at ? new Date(assessment.created_at).toLocaleDateString() : 'Unknown'}
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
                  <Badge variant="outline">{(primaryArchetype.name as string) || 'Unknown'}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {((primaryArchetype.description as string) || '')?.substring(0, 100)}...
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

function AssessmentEnrollmentCard({ enrollment }: { enrollment: AssessmentEnrollment }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>
      case 'available':
        return <Badge variant="outline">Available</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'available':
        return <Play className="h-4 w-4 text-gray-600" />
      default:
        return <Brain className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionButton = () => {
    switch (enrollment.status) {
      case 'available':
        return (
          <Button variant="default" size="sm" asChild>
            <Link href={`/dashboard/assessments/${enrollment.assessment_id}`}>
              <Play className="h-4 w-4 mr-2" />
              Start Assessment
            </Link>
          </Button>
        )
      case 'in_progress':
        return (
          <Button variant="default" size="sm" asChild>
            <Link href={`/dashboard/assessments/${enrollment.assessment_id}`}>
              <Clock className="h-4 w-4 mr-2" />
              Continue
            </Link>
          </Button>
        )
      case 'completed':
        return (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/assessments/${enrollment.assessment_id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Results
            </Link>
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(enrollment.status)}
              <h3 className="font-semibold text-lg">
                {enrollment.enhanced_assessments?.name || 'Unnamed Assessment'}
              </h3>
              {getStatusBadge(enrollment.status)}
            </div>

            <p className="text-muted-foreground mb-4">
              {enrollment.enhanced_assessments?.description || 'No description available'}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{enrollment.enhanced_assessments?.expected_duration || 15} minutes</span>
              </div>

              {enrollment.enhanced_assessments?.category && (
                <Badge variant="outline" className="text-xs">
                  {enrollment.enhanced_assessments.category}
                </Badge>
              )}

              {enrollment.completed_at && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    Completed {new Date(enrollment.completed_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {getActionButton()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
