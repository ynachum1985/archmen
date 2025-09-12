'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArchetypeReportCard } from './ArchetypeReportCard'
import { 
  Download, 
  Share2, 
  BookOpen, 
  Heart, 
  Target,
  Lightbulb,
  Users,
  TrendingUp
} from 'lucide-react'

interface AssessmentResult {
  id: string
  assessmentName: string
  completedAt: string
  totalQuestions: number
  duration: string
  discoveredArchetypes: DiscoveredArchetype[]
  overallInsights: {
    primaryPattern: string
    relationshipTheme: string
    growthAreas: string[]
    strengthAreas: string[]
  }
  reportAnswers: {
    theoreticalUnderstanding: string
    embodimentPractices: string
    integrationPractices: string
    resourceLinks: string[]
    archetypeCards: string[]
  }
}

interface DiscoveredArchetype {
  id: string
  name: string
  description: string
  confidenceScore: number
  assessmentContext: string
  archetype_images?: string[]
  impact_score?: number
  growth_potential_score?: number
  awareness_difficulty_score?: number
  trigger_intensity_score?: number
  integration_complexity_score?: number
  shadow_depth_score?: number
  insights: {
    currentInfluence: string
    growthOpportunity: string
    integrationTip: string
    shadowPattern?: string
  }
  resources: {
    theoreticalUnderstanding: string
    embodimentPractices: string[]
    integrationPractices: string[]
    articles?: string[]
    exercises?: string[]
    affirmations?: string[]
  }
  visualContent: {
    primaryImage?: string
    backgroundColor?: string
    accentColor?: string
  }
  mediaContent: {
    meditationAudio?: string
    integrationVideo?: string
    guidanceAudio?: string
  }
}

interface AssessmentReportProps {
  result: AssessmentResult
  onDownload?: () => void
  onShare?: () => void
}

export function AssessmentReport({ result, onDownload, onShare }: AssessmentReportProps) {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())

  const toggleCardFlip = (archetypeId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(archetypeId)) {
        newSet.delete(archetypeId)
      } else {
        newSet.add(archetypeId)
      }
      return newSet
    })
  }

  const primaryArchetype = result.discoveredArchetypes[0]
  const secondaryArchetypes = result.discoveredArchetypes.slice(1)

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Your Archetype Assessment Results</h1>
        <p className="text-gray-600">{result.assessmentName}</p>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <span>Completed: {new Date(result.completedAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>{result.totalQuestions} questions</span>
          <span>•</span>
          <span>{result.duration}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          {onDownload && (
            <Button variant="outline" onClick={onDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          )}
          {onShare && (
            <Button variant="outline" onClick={onShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
          )}
        </div>
      </div>

      {/* Overall Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-2" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Primary Pattern</h4>
            <p className="text-gray-600">{result.overallInsights.primaryPattern}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Relationship Theme</h4>
            <p className="text-gray-600">{result.overallInsights.relationshipTheme}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Growth Areas</h4>
              <ul className="space-y-1">
                {result.overallInsights.growthAreas.map((area, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <TrendingUp className="w-3 h-3 mr-2 mt-0.5 text-orange-500" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Strength Areas</h4>
              <ul className="space-y-1">
                {result.overallInsights.strengthAreas.map((area, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <Heart className="w-3 h-3 mr-2 mt-0.5 text-green-500" />
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary Archetype */}
      {primaryArchetype && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Primary Archetype
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <ArchetypeReportCard
                archetype={primaryArchetype}
                isFlipped={flippedCards.has(primaryArchetype.id)}
                onFlip={() => toggleCardFlip(primaryArchetype.id)}
                size="normal"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Secondary Archetypes */}
      {secondaryArchetypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Secondary Archetypes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {secondaryArchetypes.map((archetype) => (
                <ArchetypeReportCard
                  key={archetype.id}
                  archetype={archetype}
                  isFlipped={flippedCards.has(archetype.id)}
                  onFlip={() => toggleCardFlip(archetype.id)}
                  size="compact"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Detailed Analysis & Guidance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="understanding" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="understanding">Theoretical Understanding</TabsTrigger>
              <TabsTrigger value="embodiment">Embodiment Practices</TabsTrigger>
              <TabsTrigger value="integration">Integration Practices</TabsTrigger>
            </TabsList>
            
            <TabsContent value="understanding" className="mt-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {result.reportAnswers.theoreticalUnderstanding}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="embodiment" className="mt-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {result.reportAnswers.embodimentPractices}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="integration" className="mt-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700">
                  {result.reportAnswers.integrationPractices}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Resource Links */}
      {result.reportAnswers.resourceLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.reportAnswers.resourceLinks.map((link, index) => (
                <a
                  key={index}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Target className="w-3 h-3 mr-2" />
                  {link}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
