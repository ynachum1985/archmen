'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthService } from '@/lib/services/auth.service'
import { LiveReportTemplate } from '@/components/report/LiveReportTemplate'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Download, Share2 } from 'lucide-react'
import Link from 'next/link'

interface AssessmentSession {
  id: string
  template_id: string
  status: string
  completed_at: string | null
  created_at: string | null
  current_question_index: number | null
  progress_percentage: number | null
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

interface AssessmentReportPageProps {
  params: Promise<{
    id: string
  }>
}

const authService = new AuthService()

export default function AssessmentReportPage({ params }: AssessmentReportPageProps) {
  const [assessment, setAssessment] = useState<AssessmentSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        // Await the params promise
        const resolvedParams = await params

        // Check authentication
        const userProfile = await authService.getCurrentUser()
        if (!userProfile) {
          router.push('/login')
          return
        }

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
          .eq('id', resolvedParams.id)
          .eq('user_id', userProfile.user.id)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Assessment not found or you do not have permission to view it')
          } else {
            throw error
          }
          return
        }

        if (data.status !== 'completed') {
          setError('This assessment is not yet completed')
          return
        }

        setAssessment(data)
      } catch (err) {
        console.error('Error loading assessment:', err)
        setError('Failed to load assessment report')
      } finally {
        setIsLoading(false)
      }
    }

    loadAssessment()
  }, [params, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your assessment report...</p>
        </div>
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard" className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Assessment Report</h1>
          </div>
          
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button asChild>
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Transform assessment data to match LiveReportTemplate interface
  const reportData = {
    id: assessment.id,
    assessmentName: assessment.assessment_templates?.name || 'Unknown Assessment',
    completedAt: assessment.completed_at || new Date().toISOString(),
    discoveredArchetypes: ((assessment.discovered_archetypes as Record<string, unknown>[]) || []).map((archetype: Record<string, unknown>) => ({
      id: archetype.id || archetype.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
      name: archetype.name || 'Unknown Archetype',
      description: archetype.description || 'No description available',
      confidenceScore: archetype.confidenceScore || archetype.confidence || 0,
      isPrimary: archetype.isPrimary || archetype.primary || false,
      assessmentContext: archetype.assessmentContext || archetype.context || 'Discovered through assessment analysis',
      visualContent: {
        primaryImage: archetype.visualContent?.primaryImage || archetype.image,
        backgroundColor: archetype.visualContent?.backgroundColor || '#e2e8f0',
        accentColor: archetype.visualContent?.accentColor || '#3b82f6'
      },
      insights: {
        currentInfluence: archetype.insights?.currentInfluence || 'This archetype influences your current behavior and decision-making patterns.',
        growthOpportunity: archetype.insights?.growthOpportunity || 'Exploring this archetype offers opportunities for personal growth and self-understanding.',
        integrationTip: archetype.insights?.integrationTip || 'Consider how you can consciously work with this archetypal energy in your daily life.',
        whyThisArchetype: archetype.insights?.whyThisArchetype || archetype.evidence || 'This archetype emerged based on your responses and behavioral patterns identified during the assessment.'
      },
      resources: {
        theoreticalUnderstanding: archetype.resources?.theoreticalUnderstanding || 'This archetype represents fundamental patterns of human behavior and motivation.',
        embodimentPractices: archetype.resources?.embodimentPractices || [
          'Practice mindful awareness of when this archetype is active',
          'Journal about how this energy shows up in your life',
          'Explore creative expressions of this archetypal energy'
        ],
        integrationPractices: archetype.resources?.integrationPractices || [
          'Set intentions aligned with this archetype\'s positive qualities',
          'Notice and transform shadow expressions of this energy',
          'Seek balance with other archetypal energies in your life'
        ],
        articles: archetype.resources?.articles || [],
        videos: archetype.resources?.videos || [],
        exercises: archetype.resources?.exercises || []
      },
      mediaContent: {
        meditationAudio: archetype.mediaContent?.meditationAudio,
        integrationVideo: archetype.mediaContent?.integrationVideo,
        guidanceAudio: archetype.mediaContent?.guidanceAudio
      }
    })),
    overallInsights: {
      primaryPattern: 'Your archetypal profile reveals unique patterns of behavior and motivation.',
      relationshipTheme: 'These archetypes influence how you relate to others and navigate relationships.',
      growthAreas: ['Self-awareness', 'Integration', 'Balance'],
      strengthAreas: ['Natural talents', 'Core motivations', 'Authentic expression']
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Assessment Report</h1>
              <p className="text-muted-foreground">{assessment.assessment_templates?.name}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <LiveReportTemplate assessmentResults={reportData} />
      </div>
    </div>
  )
}
