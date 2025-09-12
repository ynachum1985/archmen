'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LiveReportTemplate } from '@/components/report/LiveReportTemplate'
import { Eye, EyeOff } from 'lucide-react'

interface ReportTemplatePreviewProps {
  reportAnswers?: {
    theoreticalUnderstanding: string
    embodimentPractices: string
    integrationPractices: string
    resourceLinks: string[]
    archetypeCards: string[]
  }
}

export function ReportTemplatePreview({ reportAnswers }: ReportTemplatePreviewProps) {
  const [showPreview, setShowPreview] = useState(false)

  // Sample data for preview
  const sampleAssessmentResults = {
    id: 'preview-assessment',
    assessmentName: 'Sample Assessment Preview',
    completedAt: new Date().toISOString(),
    discoveredArchetypes: [
      {
        id: 'hero',
        name: 'The Hero',
        description: 'The Hero archetype represents courage, determination, and the drive to overcome challenges and achieve great things.',
        confidenceScore: 85,
        isPrimary: true,
        assessmentContext: 'This archetype emerged strongly in your responses about facing challenges and taking initiative.',
        visualContent: {
          primaryImage: '/api/placeholder/400/300',
          backgroundColor: '#1e40af',
          accentColor: '#3b82f6'
        },
        insights: {
          currentInfluence: 'The Hero archetype is currently driving your desire to take on challenges and lead others through difficult situations.',
          growthOpportunity: 'You can develop this archetype by learning to balance your drive for achievement with self-care and collaboration.',
          integrationTip: 'Practice recognizing when your Hero energy is needed versus when it might be overwhelming others.',
          whyThisArchetype: 'Your responses showed a consistent pattern of taking responsibility, facing challenges head-on, and inspiring others to overcome obstacles. This indicates a strong Hero archetype presence.'
        },
        resources: {
          theoreticalUnderstanding: reportAnswers?.theoreticalUnderstanding || 'The Hero archetype represents the part of us that rises to meet challenges, takes responsibility, and inspires others through courage and determination.',
          embodimentPractices: reportAnswers?.embodimentPractices ? reportAnswers.embodimentPractices.split('\n').filter(p => p.trim()) : [
            'Practice taking on challenges that stretch your comfort zone',
            'Lead by example in difficult situations',
            'Inspire others through your actions and courage'
          ],
          integrationPractices: reportAnswers?.integrationPractices ? reportAnswers.integrationPractices.split('\n').filter(p => p.trim()) : [
            'Balance heroic action with rest and reflection',
            'Learn to accept help from others',
            'Recognize when to step back and let others lead'
          ],
          articles: reportAnswers?.resourceLinks || [
            'Understanding the Hero\'s Journey',
            'Leadership and Courage in Modern Times'
          ],
          videos: [],
          exercises: []
        },
        mediaContent: {
          meditationAudio: undefined,
          integrationVideo: undefined,
          guidanceAudio: undefined
        }
      },
      {
        id: 'sage',
        name: 'The Sage',
        description: 'The Sage archetype embodies wisdom, knowledge, and the pursuit of truth and understanding.',
        confidenceScore: 72,
        isPrimary: true,
        assessmentContext: 'Your thoughtful responses and desire for understanding revealed this archetype.',
        visualContent: {
          primaryImage: '/api/placeholder/400/300',
          backgroundColor: '#7c3aed',
          accentColor: '#8b5cf6'
        },
        insights: {
          currentInfluence: 'The Sage in you seeks to understand the deeper meaning behind experiences and share wisdom with others.',
          growthOpportunity: 'You can develop this archetype by balancing intellectual pursuits with practical application.',
          integrationTip: 'Share your insights in ways that others can easily understand and apply.',
          whyThisArchetype: 'Your responses demonstrated deep thinking, a desire to understand complex situations, and a natural inclination to seek wisdom and truth.'
        },
        resources: {
          theoreticalUnderstanding: 'The Sage archetype represents our inner wisdom, the part of us that seeks truth and understanding.',
          embodimentPractices: [
            'Engage in regular study and learning',
            'Practice deep listening and observation',
            'Share knowledge in accessible ways'
          ],
          integrationPractices: [
            'Balance thinking with action',
            'Apply wisdom to practical situations',
            'Teach others what you have learned'
          ],
          articles: [],
          videos: [],
          exercises: []
        },
        mediaContent: {
          meditationAudio: undefined,
          integrationVideo: undefined,
          guidanceAudio: undefined
        }
      },
      {
        id: 'caregiver',
        name: 'The Caregiver',
        description: 'The Caregiver archetype represents nurturing, compassion, and the desire to help and support others.',
        confidenceScore: 68,
        isPrimary: false,
        assessmentContext: 'Your caring responses and concern for others revealed this supporting archetype.',
        visualContent: {
          primaryImage: '/api/placeholder/400/300',
          backgroundColor: '#059669',
          accentColor: '#10b981'
        },
        insights: {
          currentInfluence: 'The Caregiver in you naturally wants to support and nurture those around you.',
          growthOpportunity: 'You can develop this archetype by learning to care for yourself as much as you care for others.',
          integrationTip: 'Set healthy boundaries while maintaining your compassionate nature.',
          whyThisArchetype: 'Your responses showed genuine concern for others\' wellbeing and a natural inclination to offer support and care.'
        },
        resources: {
          theoreticalUnderstanding: 'The Caregiver archetype represents our nurturing nature and desire to help others.',
          embodimentPractices: [
            'Practice active listening and empathy',
            'Offer support without expecting anything in return',
            'Create safe spaces for others to express themselves'
          ],
          integrationPractices: [
            'Set healthy boundaries in relationships',
            'Practice self-care and self-compassion',
            'Learn to receive care from others'
          ],
          articles: [],
          videos: [],
          exercises: []
        },
        mediaContent: {
          meditationAudio: undefined,
          integrationVideo: undefined,
          guidanceAudio: undefined
        }
      }
    ],
    overallInsights: {
      primaryPattern: 'Your archetypal profile shows a strong combination of leadership, wisdom, and compassion.',
      relationshipTheme: 'You tend to take on supportive and guiding roles in relationships.',
      growthAreas: ['Balance', 'Self-care', 'Delegation'],
      strengthAreas: ['Leadership', 'Wisdom', 'Compassion']
    }
  }

  if (!showPreview) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Report Template Preview</CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Show Preview
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click "Show Preview" to see how your assessment report will look to users.
              This preview uses sample data to demonstrate the layout and functionality.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Preview Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Interactive archetype cards</li>
                  <li>• Detailed archetype information</li>
                  <li>• Assessment context and insights</li>
                  <li>• Resources and practices</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Layout Structure:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Small archetype cards on the left</li>
                  <li>• Large information panel on the right</li>
                  <li>• Click cards to change content</li>
                  <li>• Primary and related archetypes</li>
                </ul>
              </div>
            </div>

            {reportAnswers && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Current Configuration:</h4>
                <div className="space-y-2 text-sm">
                  {reportAnswers.theoreticalUnderstanding && (
                    <div>
                      <span className="font-medium">Theoretical Understanding:</span>
                      <Badge variant="outline" className="ml-2">Configured</Badge>
                    </div>
                  )}
                  {reportAnswers.embodimentPractices && (
                    <div>
                      <span className="font-medium">Embodiment Practices:</span>
                      <Badge variant="outline" className="ml-2">Configured</Badge>
                    </div>
                  )}
                  {reportAnswers.integrationPractices && (
                    <div>
                      <span className="font-medium">Integration Practices:</span>
                      <Badge variant="outline" className="ml-2">Configured</Badge>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Resource Links:</span>
                    <Badge variant="outline" className="ml-2">
                      {reportAnswers.resourceLinks?.length || 0} configured
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Report Template Preview</CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-2"
            >
              <EyeOff className="h-4 w-4" />
              Hide Preview
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="border rounded-lg p-4 bg-white">
        <LiveReportTemplate 
          assessmentResults={sampleAssessmentResults} 
          isPreview={true}
        />
      </div>
    </div>
  )
}
