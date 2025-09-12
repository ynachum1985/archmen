'use client'

import { useState } from 'react'
import { LiveReportTemplate } from '@/components/report/LiveReportTemplate'
import { generateSampleAssessmentData } from '@/lib/utils/sample-assessment-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function ReportPreviewPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const sampleData = generateSampleAssessmentData()
  
  const assessmentResults = {
    id: 'sample-assessment-' + refreshKey,
    assessmentName: 'Sample Archetypal Assessment',
    completedAt: new Date().toISOString(),
    discoveredArchetypes: sampleData.map(archetype => ({
      ...archetype,
      // Transform the data to match the LiveReportTemplate interface
      visualContent: {
        primaryImage: archetype.visualContent?.primaryImage,
        backgroundColor: archetype.visualContent?.backgroundColor || '#e2e8f0',
        accentColor: archetype.visualContent?.accentColor || '#3b82f6'
      },
      insights: {
        currentInfluence: archetype.insights?.currentInfluence || 'This archetype influences your current behavior patterns.',
        growthOpportunity: archetype.insights?.growthOpportunity || 'This archetype offers opportunities for growth.',
        integrationTip: archetype.insights?.integrationTip || 'Consider how to integrate this archetype into your life.',
        whyThisArchetype: archetype.insights?.whyThisArchetype || 'This archetype appeared based on your assessment responses.'
      },
      resources: {
        theoreticalUnderstanding: archetype.resources?.theoreticalUnderstanding || 'Theoretical background about this archetype.',
        embodimentPractices: archetype.resources?.embodimentPractices || [],
        integrationPractices: archetype.resources?.integrationPractices || [],
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
      primaryPattern: 'Your archetypal profile reveals a unique combination of leadership, wisdom, compassion, and exploration.',
      relationshipTheme: 'You tend to take on supportive and guiding roles in relationships while maintaining your independence.',
      growthAreas: ['Balance', 'Self-care', 'Delegation', 'Boundaries'],
      strengthAreas: ['Leadership', 'Wisdom', 'Compassion', 'Curiosity']
    }
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Report Template Preview</h1>
              <p className="text-slate-600 mt-1">Live preview of how assessment reports will appear to users</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Preview Information</CardTitle>
            <CardDescription>
              This preview demonstrates the live report template using sample assessment data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Layout Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Interactive archetype cards</li>
                  <li>• Detailed information panel</li>
                  <li>• Click to switch content</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Content Sections</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Why this archetype appeared</li>
                  <li>• Current influence</li>
                  <li>• Growth opportunities</li>
                  <li>• Integration tips</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Resources</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Theoretical understanding</li>
                  <li>• Embodiment practices</li>
                  <li>• Integration practices</li>
                  <li>• Media content</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Sample Data</h4>
                <div className="space-y-1">
                  <Badge variant="outline">4 Archetypes</Badge>
                  <Badge variant="outline">2 Primary</Badge>
                  <Badge variant="outline">2 Supporting</Badge>
                  <Badge variant="outline">Rich Content</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Report Template */}
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <LiveReportTemplate 
            assessmentResults={assessmentResults}
            isPreview={true}
          />
        </div>

        {/* Usage Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use This Template</CardTitle>
            <CardDescription>
              Instructions for implementing this report template in your assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">For Assessment Builders:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Configure report content in the "Report and Answers" tab</li>
                  <li>• Use the preview feature to see how your content will appear</li>
                  <li>• Customize theoretical understanding, practices, and resources</li>
                  <li>• Add resource links and archetype-specific content</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">For Users:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Click on archetype cards to view detailed information</li>
                  <li>• Primary archetypes appear at the top with higher confidence scores</li>
                  <li>• Related archetypes provide additional insights</li>
                  <li>• Access resources, practices, and media content for each archetype</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Customization Options:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Add custom images for each archetype</li>
                  <li>• Configure background and accent colors</li>
                  <li>• Include meditation audio and integration videos</li>
                  <li>• Customize insights and explanations for each archetype</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
