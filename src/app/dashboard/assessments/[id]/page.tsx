'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthService } from '@/lib/services/auth.service'
import { AssessmentResultsWithCourse } from '@/components/dashboard/AssessmentResultsWithCourse'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Play, Clock, CheckCircle, Brain } from 'lucide-react'
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

interface AssessmentPageProps {
  params: Promise<{
    id: string
  }>
}

const authService = new AuthService()

export default function AssessmentPage({ params }: AssessmentPageProps) {
  const [enrollment, setEnrollment] = useState<AssessmentEnrollment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        // Await the params promise
        const resolvedParams = await params

        // Check authentication
        const profile = await authService.getCurrentUser()
        if (!profile) {
          router.push('/login')
          return
        }
        setUserProfile(profile)

        const supabase = createClient()

        // Get enrollment data
        const { data: enrollmentData, error: enrollmentError } = await supabase
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
          .eq('assessment_id', resolvedParams.id)
          .eq('user_id', profile.user.id)
          .single()

        if (enrollmentError) {
          console.error('Error fetching enrollment:', enrollmentError)
          setError('Assessment not found or access denied')
          return
        }

        setEnrollment(enrollmentData)
      } catch (err) {
        console.error('Error loading assessment:', err)
        setError('Failed to load assessment')
      } finally {
        setIsLoading(false)
      }
    }

    loadAssessment()
  }, [params, router])

  const handleStartAssessment = async () => {
    if (!enrollment || !userProfile) return

    try {
      const supabase = createClient()
      
      // Update enrollment status to in_progress
      const { error } = await supabase
        .from('assessment_enrollments')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', enrollment.id)

      if (error) {
        console.error('Error starting assessment:', error)
        return
      }

      // For now, simulate completion with mock data
      // Later this will redirect to the actual assessment flow
      setTimeout(async () => {
        const mockResults = {
          archetypes: [
            {
              id: '1',
              name: 'The Lover',
              description: 'Driven by passion, connection, and emotional intimacy',
              confidenceScore: 85,
              isPrimary: true,
              insights: {
                currentInfluence: 'You seek deep emotional connections and value intimacy above all else.',
                growthOpportunity: 'Learning to balance emotional intensity with practical considerations.',
                integrationTip: 'Practice expressing love through both words and actions.',
                whyThisArchetype: 'Your responses show a strong pattern of prioritizing emotional connection and romantic fulfillment.'
              }
            },
            {
              id: '2', 
              name: 'The Explorer',
              description: 'Seeks freedom, adventure, and new experiences',
              confidenceScore: 72,
              isPrimary: false,
              insights: {
                currentInfluence: 'You value independence and the freedom to explore new possibilities.',
                growthOpportunity: 'Finding ways to maintain autonomy while building committed relationships.',
                integrationTip: 'Share your adventures with your partner to deepen your bond.',
                whyThisArchetype: 'Your desire for variety and new experiences shows strong Explorer tendencies.'
              }
            }
          ]
        }

        // Update enrollment with completion
        await supabase
          .from('assessment_enrollments')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            results: mockResults
          })
          .eq('id', enrollment.id)

        // Refresh the page
        window.location.reload()
      }, 3000)

      // Update local state
      setEnrollment(prev => prev ? { ...prev, status: 'in_progress' } : null)
    } catch (err) {
      console.error('Error starting assessment:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    )
  }

  if (error || !enrollment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard" className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">Assessment</h1>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">{error || 'Assessment not found'}</p>
              <Button asChild className="mt-4">
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If assessment is completed, show results with chatbot and course
  if (enrollment.status === 'completed' && enrollment.results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard" className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">{enrollment.enhanced_assessments.name}</h1>
          </div>
          
          <AssessmentResultsWithCourse
            assessmentId={enrollment.assessment_id}
            assessmentName={enrollment.enhanced_assessments.name}
            userId={userProfile.user.id}
            discoveredArchetypes={enrollment.results.archetypes || []}
            chatMessages={[]}
          />
        </div>
      </div>
    )
  }

  // Show assessment start page or in-progress state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">{enrollment.enhanced_assessments.name}</h1>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {enrollment.status === 'available' ? (
                  <Play className="h-5 w-5 text-primary" />
                ) : (
                  <Clock className="h-5 w-5 text-blue-500" />
                )}
                {enrollment.status === 'available' ? 'Ready to Start' : 'Assessment in Progress'}
              </CardTitle>
              <CardDescription>
                {enrollment.enhanced_assessments.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{enrollment.enhanced_assessments.expected_duration} minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Brain className="h-4 w-4" />
                  <span>{enrollment.enhanced_assessments.category}</span>
                </div>
              </div>
              
              {enrollment.status === 'available' ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This assessment will help you discover your archetypal patterns in relationships. 
                    You'll engage in a conversational assessment that adapts to your responses.
                  </p>
                  <Button onClick={handleStartAssessment} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Start Assessment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Your assessment is currently being processed. This may take a few moments...
                  </p>
                  <div className="flex items-center justify-center py-8">
                    <Clock className="h-8 w-8 text-blue-500 animate-pulse" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
