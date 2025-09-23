'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthService } from '@/lib/services/auth.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Play, Clock, CheckCircle, Brain, MessageCircle } from 'lucide-react'
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

        // First check if assessment exists
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('enhanced_assessments')
          .select('*')
          .eq('id', resolvedParams.id)
          .eq('is_active', true)
          .single()

        if (assessmentError || !assessmentData) {
          console.error('Error fetching assessment:', assessmentError)
          setError('Assessment not found')
          return
        }

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

        if (enrollmentData) {
          setEnrollment(enrollmentData)
        } else {
          // Auto-enroll user if not already enrolled
          const { data: newEnrollment, error: enrollError } = await supabase
            .from('assessment_enrollments')
            .insert({
              user_id: profile.user.id,
              assessment_id: resolvedParams.id,
              status: 'available'
            })
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
            .single()

          if (enrollError) {
            console.error('Error creating enrollment:', enrollError)
            setError('Failed to enroll in assessment')
            return
          }

          setEnrollment(newEnrollment)
        }
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

      // For now, simulate completion with mock data using real archetypes
      // Later this will redirect to the actual assessment flow
      setTimeout(async () => {
        // Fetch real archetypes from database
        const { data: archetypes, error } = await supabase
          .from('enhanced_archetypes')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (error) {
          console.error('Error fetching archetypes:', error)
          return
        }

        // Select 2 random archetypes from the database for mock results
        const shuffled = archetypes?.sort(() => 0.5 - Math.random()) || []
        const selectedArchetypes = shuffled.slice(0, 2)

        if (selectedArchetypes.length < 2) {
          console.error('Not enough archetypes in database')
          return
        }

        const mockResults = {
          archetypes: [
            {
              id: selectedArchetypes[0].id,
              name: selectedArchetypes[0].name,
              description: selectedArchetypes[0].description,
              confidenceScore: 85,
              isPrimary: true,
              insights: {
                currentInfluence: `You embody the ${selectedArchetypes[0].name} archetype in your relationships.`,
                growthOpportunity: `Learning to integrate the positive aspects of ${selectedArchetypes[0].name} while managing its shadow elements.`,
                integrationTip: `Channel your ${selectedArchetypes[0].name} energy into creating meaningful connections.`,
                whyThisArchetype: `Your language patterns and responses align strongly with ${selectedArchetypes[0].name} characteristics.`
              }
            },
            {
              id: selectedArchetypes[1].id,
              name: selectedArchetypes[1].name,
              description: selectedArchetypes[1].description,
              confidenceScore: 72,
              isPrimary: false,
              insights: {
                currentInfluence: `You also show strong ${selectedArchetypes[1].name} tendencies in your approach to relationships.`,
                growthOpportunity: `Finding ways to balance ${selectedArchetypes[1].name} qualities with your primary archetype.`,
                integrationTip: `Use your ${selectedArchetypes[1].name} strengths to complement your primary archetype.`,
                whyThisArchetype: `Your responses indicate secondary ${selectedArchetypes[1].name} patterns.`
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

  // Redirect to conversation dashboard for all assessment interactions
  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card className="bg-white/80 backdrop-blur-sm border border-gray-200/60">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2 text-gray-900">Assessment Interface Updated</h3>
            <p className="text-gray-600 mb-6">
              All assessments now happen through our new conversation interface.
              Redirecting you to the main dashboard...
            </p>
            <Link href="/dashboard">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )

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
