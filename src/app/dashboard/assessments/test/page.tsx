'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Users, Target } from 'lucide-react'
import Link from 'next/link'

interface Assessment {
  id: string
  name: string
  description: string
  category: string
  purpose: string
  expected_duration: number
  status: string
  is_active: boolean
}

export default function TestAssessmentPage() {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get('id')
  const isPreview = searchParams.get('preview') === 'true'

  useEffect(() => {
    const loadAssessment = async () => {
      if (!assessmentId) {
        setError('No assessment ID provided')
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        const { data, error: fetchError } = await supabase
          .from('enhanced_assessments')
          .select('*')
          .eq('id', assessmentId)
          .single()

        if (fetchError) {
          console.error('Error fetching assessment:', fetchError)
          setError('Assessment not found')
          return
        }

        setAssessment(data)
      } catch (err) {
        console.error('Error loading assessment:', err)
        setError('Failed to load assessment')
      } finally {
        setLoading(false)
      }
    }

    loadAssessment()
  }, [assessmentId])

  const handleStartAssessment = () => {
    if (!assessment) return
    
    // In a real implementation, this would start the actual assessment flow
    // For now, we'll just show a message
    alert(`Starting assessment: ${assessment.name}\n\nThis would normally redirect to the assessment chat interface.`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
          <span className="text-gray-600">Loading assessment...</span>
        </div>
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error || 'Assessment not found'}</p>
            <Link href="/admin">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          {isPreview && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              👁️ Preview Mode
            </Badge>
          )}
        </div>

        {/* Assessment Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{assessment.name}</CardTitle>
                <CardDescription className="text-base">
                  {assessment.description}
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2">
                <Badge variant={assessment.status === 'live' ? 'default' : 'secondary'}>
                  {assessment.status === 'live' ? '🟢 Live' : 
                   assessment.status === 'archived' ? '🔴 Archived' : '🟡 Draft'}
                </Badge>
                <Badge variant="outline">{assessment.category}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{assessment.expected_duration} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Target className="h-4 w-4" />
                <span>Archetype Discovery</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>Personal Growth</span>
              </div>
            </div>

            {/* Purpose */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Assessment Purpose</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {assessment.purpose}
              </p>
            </div>

            {/* Status Information */}
            {isPreview && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Preview Information</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Status:</strong> {assessment.status}</p>
                  <p><strong>Active:</strong> {assessment.is_active ? 'Yes' : 'No'}</p>
                  <p><strong>Visibility:</strong> {
                    assessment.status === 'live' ? 'Visible to all users' :
                    assessment.status === 'draft' ? 'Only visible to admins' :
                    'Hidden from all users'
                  }</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                onClick={handleStartAssessment}
                className="flex-1"
                disabled={assessment.status === 'archived'}
              >
                {assessment.status === 'archived' ? 'Assessment Archived' : 'Start Assessment'}
              </Button>
              {isPreview && (
                <Button variant="outline" asChild>
                  <Link href={`/admin`}>
                    Edit Assessment
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What to Expect</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• This assessment uses AI-powered conversation to discover your archetypal patterns</p>
              <p>• You'll engage in a natural dialogue about your experiences and perspectives</p>
              <p>• The AI will adapt its questions based on your responses</p>
              <p>• At the end, you'll receive personalized insights about your dominant archetypes</p>
              <p>• Your responses are private and used only to generate your results</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
